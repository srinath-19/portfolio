"use client";

import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";

import { cn } from "@/lib/utils";

type WavyBackgroundProps = {
  children?: React.ReactNode;
  /** Applied to the content layer that sits above the canvas. */
  className?: string;
  /** Applied to the positioned wrapper that the canvas is measured against. */
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  /** Painted under every frame — keep it the section's dominant tone. */
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  waveCount?: number;
  /** Peak displacement, in CSS px, from a wave's own baseline. */
  amplitude?: number;
  /**
   * How far the wave baselines fan out vertically. 0 stacks every wave on the
   * centre line (upstream's behaviour — a band across the middle); 1 spaces
   * them evenly over the full height, which is what a full-viewport backdrop
   * needs so the top and bottom of the screen aren't flat fill.
   */
  spread?: number;
};

/**
 * Simplex-noise wave field, adapted from the Aceternity component.
 *
 * Two departures from upstream, both because this runs as a *section*
 * background rather than a full-screen hero:
 *   - the canvas is sized from its own container via ResizeObserver, not from
 *     `window.innerWidth/innerHeight`, and not through a global
 *     `window.onresize` assignment (which would clobber any other handler)
 *   - the noise generator, the wave loop and the DPR-scaled backing store are
 *     all created once per mount instead of on every render
 *
 * The rAF pauses when the section scrolls out of view, and `dt` is not
 * integrated at all — phase advances a fixed step per frame — so a hidden tab
 * resumes exactly where it left off rather than jumping.
 */
export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth = 50,
  backgroundFill = "black",
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  waveCount = 5,
  amplitude = 100,
  spread = 0,
}: WavyBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Props are read through a ref so a colour tweak never tears down the rAF
  // loop and restarts the noise field from zero.
  const optionsRef = useRef({
    colors,
    waveWidth,
    backgroundFill,
    blur,
    speed,
    waveOpacity,
    waveCount,
    amplitude,
    spread,
  });
  // Synced in an effect rather than during render — writing a ref in the render
  // body is what `react-hooks/refs` flags, and the draw loop only reads it on
  // the next frame anyway.
  useEffect(() => {
    optionsRef.current = {
      colors,
      waveWidth,
      backgroundFill,
      blur,
      speed,
      waveOpacity,
      waveCount,
      amplitude,
      spread,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas takes no `var()` — an invalid `fillStyle`/`strokeStyle` is
    // silently ignored and the previous value stays, which floods the frame
    // with the last stroke colour. So design tokens are resolved against the
    // container first, and cached, since this runs every frame.
    const resolved = new Map<string, string>();
    const resolveColor = (value: string) => {
      const hit = resolved.get(value);
      if (hit !== undefined) return hit;
      const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]*?)\s*)?\)$/.exec(
        value.trim(),
      );
      const out = match
        ? getComputedStyle(container).getPropertyValue(match[1]).trim() ||
          match[2] ||
          "black"
        : value;
      resolved.set(value, out);
      return out;
    };

    const noise = createNoise3D();
    let frame: number | undefined;
    let visible = true;
    let phase = 0;
    let width = 0;
    let height = 0;

    // Safari only shipped `ctx.filter` in 17. Older builds silently ignore it,
    // so those fall back to blurring the whole canvas element in CSS.
    const supportsCanvasFilter = "filter" in ctx;
    if (!supportsCanvasFilter) canvas.style.filter = `blur(${blur}px)`;

    const resize = () => {
      resolved.clear();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (supportsCanvasFilter) ctx.filter = `blur(${optionsRef.current.blur}px)`;
    };

    const draw = () => {
      const o = optionsRef.current;
      const palette = o.colors ?? ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"];

      ctx.globalAlpha = o.waveOpacity;
      ctx.fillStyle = resolveColor(o.backgroundFill);
      ctx.fillRect(0, 0, width, height);

      phase += o.speed === "slow" ? 0.001 : 0.002;

      for (let i = 0; i < o.waveCount; i++) {
        // Baselines fan out from the centre line by `spread`; at 0 they all
        // collapse back onto it, which is upstream's single mid-screen band.
        const offset = (i + 0.5) / o.waveCount - 0.5;
        const baseline = height * (0.5 + o.spread * offset);

        ctx.beginPath();
        ctx.lineWidth = o.waveWidth;
        ctx.strokeStyle = resolveColor(palette[i % palette.length]);
        for (let x = 0; x <= width; x += 5) {
          const y = noise(x / 800, 0.3 * i, phase) * o.amplitude;
          ctx.lineTo(x, y + baseline);
        }
        ctx.stroke();
        ctx.closePath();
      }

      frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (frame === undefined) frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) start();
        else stop();
      },
      { rootMargin: "200px" },
    );
    intersectionObserver.observe(container);

    if (visible) start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
    // `blur` is read once for the Safari fallback; every other option is live
    // through `optionsRef`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("relative isolate overflow-hidden", containerClassName)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};

export default WavyBackground;
