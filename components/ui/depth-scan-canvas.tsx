'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import type { GLProps } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import type { WebGLRenderer } from 'three';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';

import {
  abs,
  add,
  blendScreen,
  float,
  mix,
  mod,
  mx_cell_noise_float,
  oneMinus,
  pass,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
} from 'three/tsl';

export const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
export const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

const WIDTH = 300;
const HEIGHT = 300;

// three/webgpu re-exports the whole three namespace, but its module type isn't
// assignable to r3f's Catalogue, so cast through the overload's own parameter.
extend(THREE as unknown as Parameters<typeof extend>[0]);

export type RGB = [number, number, number];

/**
 * r3f doesn't re-export `DefaultGLProps`, and restating it doesn't type-check:
 * its `OffscreenCanvas` resolves to a different ambient declaration than ours.
 * Recover it from the exported `GLProps` union instead.
 */
type DefaultGLProps =
  GLProps extends infer Member
    ? Member extends (defaultProps: infer P) => unknown
      ? P
      : never
    : never;

/**
 * r3f's `<Canvas>` runs its setup layout effect with *no* dependency array, so
 * `configure()` re-enters on every render — and React StrictMode invokes that
 * effect twice on mount. `configure()` reads `state.gl` before its first
 * `await`, so two concurrent calls both see "no renderer yet" and each build
 * one. r3f keeps whichever resolves last, but only calls `setSize` when the
 * store's size actually *changes* — which it no longer does by then. The
 * surviving renderer is therefore stuck at the canvas default (300x150) while
 * the swap chain is full-size, and WebGPU rejects every frame with
 * "resolve target ... does not match the size of the other attachments".
 * (The losing renderer is never disposed either — it leaks a GPU device.)
 *
 * Sharing the in-flight promise per canvas collapses those concurrent calls
 * onto a single renderer, so the instance r3f sizes is the instance that
 * renders. The entry is dropped once it settles: by then `state.gl` is set and
 * `configure()` short-circuits on its own, and a later mount that recycles the
 * canvas element still gets a fresh renderer instead of a disposed one.
 */
const pendingRenderers = new WeakMap<DefaultGLProps['canvas'], Promise<WebGLRenderer>>();

const createRenderer = (props: DefaultGLProps): Promise<WebGLRenderer> => {
  const existing = pendingRenderers.get(props.canvas);
  if (existing) return existing;

  const pending = (async () => {
    const renderer = new THREE.WebGPURenderer(
      props as unknown as ConstructorParameters<typeof THREE.WebGPURenderer>[0],
    );
    await renderer.init();
    // r3f types `gl` against the WebGL renderer; WebGPURenderer is a drop-in at
    // runtime (and falls back to WebGL2 where unsupported).
    return renderer as unknown as WebGLRenderer;
  })().finally(() => pendingRenderers.delete(props.canvas));

  pendingRenderers.set(props.canvas, pending);
  return pending;
};

/** Bloom + a travelling scan line, composited over the rendered scene. */
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
  scanColor = [1, 0, 0] as RGB,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
  scanColor?: RGB;
}) => {
  const { gl, scene, camera } = useThree();
  // Hoisted out of the dependency array: the lint rules reject call
  // expressions there, and this keeps the tuple compared by value.
  const scanKey = scanColor.join();

  const { render, scanProgress } = useMemo(() => {
    const renderer = gl as unknown as THREE.WebGPURenderer;

    // three r183 renamed PostProcessing -> RenderPipeline. The runtime has the
    // new name, but @types/three still only re-exports the deprecated alias
    // from `three/webgpu`, so pick it up off the namespace with a fallback.
    const Pipeline =
      (THREE as unknown as { RenderPipeline?: typeof THREE.PostProcessing })
        .RenderPipeline ?? THREE.PostProcessing;

    const postProcessing = new Pipeline(renderer);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');
    const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);

    // Driven every frame from useFrame below.
    const uScanProgress = uniform(0);

    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(uScanProgress)));
    const glow = vec3(...scanColor).mul(oneMinus(scanLine)).mul(0.4);

    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, glow),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0,
    );

    postProcessing.outputNode = withScanEffect.add(bloomPass);

    return { render: postProcessing, scanProgress: uScanProgress };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene, strength, threshold, fullScreenEffect, scanKey]);

  useFrame(({ clock }) => {
    // TSL uniforms are mutable by contract — writing `.value` per frame is how
    // three feeds the GPU, which the compiler's frozen-memo rule can't model.
    // eslint-disable-next-line react-hooks/immutability
    scanProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    // Sync render is safe: the gl factory awaits renderer.init() before mount.
    render.render();
  }, 1);

  return null;
};

const Scene = ({
  textureSrc,
  depthSrc,
  tint,
  scaleFactor,
}: {
  textureSrc: string;
  depthSrc: string;
  tint: RGB;
  scaleFactor: number;
}) => {
  const [rawMap, depthMap] = useTexture([textureSrc, depthSrc]);

  const meshRef = useRef<THREE.Mesh>(null);
  // Read only from the frame loop, so a ref beats state: flipping it must not
  // cost a render, and setState inside an effect is what the hooks rules flag.
  const visibleRef = useRef(false);

  useEffect(() => {
    // Only start the fade once both textures have resolved.
    visibleRef.current = Boolean(rawMap && depthMap);
  }, [rawMap, depthMap]);

  const tintKey = tint.join();

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    // Parallax: displace the colour lookup by the depth channel * pointer.
    const tMap = texture(rawMap, uv().add(tDepthMap.r.mul(uPointer).mul(strength)));

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    // Dot grid only lights up where the depth matches the sweep position.
    const flow = oneMinus(smoothstep(0, 0.02, abs(tDepthMap.sub(uProgress))));
    const mask = dot.mul(flow).mul(vec3(...tint));

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: blendScreen(tMap, mask),
      transparent: true,
      opacity: 0,
    });

    return { material, uniforms: { uPointer, uProgress } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawMap, depthMap, tintKey]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  /* eslint-disable react-hooks/immutability -- Per-frame uniform and material
     mutation is the three.js contract; there is no immutable equivalent. */
  useFrame(({ clock, pointer }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    uniforms.uPointer.value = pointer;

    const mat = meshRef.current?.material as THREE.MeshBasicNodeMaterial | undefined;
    if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, visibleRef.current ? 1 : 0, 0.07);
  });
  /* eslint-enable react-hooks/immutability */

  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export interface DepthScanCanvasProps {
  /** Colour texture and its matching depth map. */
  textureSrc?: string;
  depthSrc?: string;
  /** Colour of the dot-grid sweep and the full-screen scan glow. */
  tint?: RGB;
  scanColor?: RGB;
  /**
   * Mesh scale multiplier. `0.4` is the hero framing (subject floating in the
   * middle of the frame); the experience backdrop pushes it near `1` so the
   * subject fills the viewport edge to edge.
   */
  scaleFactor?: number;
  className?: string;
}

/**
 * The WebGPU depth-scan visual on its own — no title, no chrome, no layout
 * opinions beyond filling its positioned parent.
 *
 * Split out of `hero-futuristic.tsx` so the same scene can be used both as a
 * hero (with type over it) and as a section background. Anything importing
 * this must be behind `next/dynamic({ ssr: false })`: `three/webgpu` touches
 * browser-only globals at module scope and cannot be server-rendered.
 */
export const DepthScanCanvas = ({
  textureSrc = TEXTUREMAP.src,
  depthSrc = DEPTHMAP.src,
  tint = [10, 0, 0],
  scanColor = [1, 0, 0],
  scaleFactor = 0.4,
  className = 'absolute inset-0',
}: DepthScanCanvasProps) => (
  <Canvas flat className={className} gl={createRenderer}>
    <PostProcessing fullScreenEffect scanColor={scanColor} />
    <Suspense fallback={null}>
      <Scene
        textureSrc={textureSrc}
        depthSrc={depthSrc}
        tint={tint}
        scaleFactor={scaleFactor}
      />
    </Suspense>
  </Canvas>
);

export default DepthScanCanvas;
