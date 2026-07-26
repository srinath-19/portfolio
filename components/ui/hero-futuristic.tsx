'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

const WIDTH = 300;
const HEIGHT = 300;

// three/webgpu re-exports the whole three namespace, but its module type isn't
// assignable to r3f's Catalogue, so cast through the overload's own parameter.
extend(THREE as unknown as Parameters<typeof extend>[0]);

type RGB = [number, number, number];

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
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
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
    progressRef.current = uScanProgress;

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

    return postProcessing;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl, scene, strength, threshold, fullScreenEffect, scanColor.join()]);

  useFrame(({ clock }) => {
    progressRef.current.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only start the fade once both textures have resolved.
    if (rawMap && depthMap) setVisible(true);
  }, [rawMap, depthMap]);

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
  }, [rawMap, depthMap, tint.join()]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock, pointer }) => {
    uniforms.uProgress.value = Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5;
    uniforms.uPointer.value = pointer;

    const mat = meshRef.current?.material as THREE.MeshBasicNodeMaterial | undefined;
    if (mat) mat.opacity = THREE.MathUtils.lerp(mat.opacity, visible ? 1 : 0, 0.07);
  });

  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export interface HeroFuturisticProps {
  /** Words animate in one at a time. */
  title?: string;
  subtitle?: string;
  /** Colour texture and its matching depth map. */
  textureSrc?: string;
  depthSrc?: string;
  /** Colour of the dot-grid sweep and the full-screen scan glow. */
  tint?: RGB;
  scanColor?: RGB;
  /** Label + click target for the bottom button; omit `onExplore` to hide it. */
  exploreLabel?: string;
  onExplore?: () => void;
  className?: string;
}

export const HeroFuturistic = ({
  title = 'Build Your Dreams',
  subtitle = 'AI-powered creativity for the next generation.',
  textureSrc = TEXTUREMAP.src,
  depthSrc = DEPTHMAP.src,
  tint = [10, 0, 0],
  scanColor = [1, 0, 0],
  exploreLabel = 'Scroll to explore',
  onExplore,
  className = '',
}: HeroFuturisticProps) => {
  const titleWords = useMemo(() => title.split(' '), [title]);
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [delays, setDelays] = useState<number[]>([]);
  const [subtitleDelay, setSubtitleDelay] = useState(0);

  useEffect(() => {
    // Client-only so the random glitch offsets don't trip hydration.
    setDelays(titleWords.map(() => Math.random() * 0.07));
    setSubtitleDelay(Math.random() * 0.1);
  }, [titleWords]);

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setSubtitleVisible(true), 800);
    return () => clearTimeout(timeout);
  }, [visibleWords, titleWords.length]);

  return (
    <div className={`relative h-svh w-full bg-black ${className}`}>
      <div className="absolute inset-0 z-20 flex w-full flex-col items-center justify-center px-10 uppercase pointer-events-none">
        <div className="text-3xl font-extrabold md:text-5xl xl:text-6xl 2xl:text-7xl">
          <div className="flex space-x-2 overflow-hidden text-white lg:space-x-6">
            {titleWords.map((word, index) => (
              <div
                key={index}
                className={index < visibleWords ? 'fade-in' : ''}
                style={{
                  animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                  opacity: index < visibleWords ? undefined : 0,
                }}
              >
                {word}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 overflow-hidden text-xs font-bold text-white md:text-xl xl:text-2xl 2xl:text-3xl">
          <div
            className={subtitleVisible ? 'fade-in-subtitle' : ''}
            style={{
              animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
              opacity: subtitleVisible ? undefined : 0,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      {onExplore && (
        <button
          type="button"
          onClick={onExplore}
          className="explore-btn"
          style={{ animationDelay: '2.2s' }}
        >
          {exploreLabel}
          <span className="explore-arrow">
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="arrow-svg"
              aria-hidden
            >
              <path d="M11 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path
                d="M6 12L11 17L16 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>
      )}

      <Canvas
        flat
        className="absolute inset-0"
        gl={async (props) => {
          const renderer = new THREE.WebGPURenderer(
            props as unknown as ConstructorParameters<typeof THREE.WebGPURenderer>[0],
          );
          await renderer.init();
          // r3f types `gl` against the WebGL renderer; WebGPURenderer is a
          // drop-in at runtime (and falls back to WebGL2 where unsupported).
          return renderer as unknown as WebGLRenderer;
        }}
      >
        <PostProcessing fullScreenEffect scanColor={scanColor} />
        <Suspense fallback={null}>
          <Scene
            textureSrc={textureSrc}
            depthSrc={depthSrc}
            tint={tint}
            scaleFactor={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroFuturistic;
