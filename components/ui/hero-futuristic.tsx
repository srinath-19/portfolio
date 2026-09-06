'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  DepthScanCanvas,
  DEPTHMAP,
  TEXTUREMAP,
  type RGB,
} from '@/components/ui/depth-scan-canvas';

/**
 * Deterministic 0..1 hash. The word/subtitle animation offsets want to look
 * random but must match between the server and client render, so this replaces
 * `Math.random()` instead of deferring the values into a post-mount effect.
 */
const jitter = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
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
  /**
   * Render the depth-scan canvas behind the type. Set `false` to layer this
   * chrome over a canvas owned by something else — the experience section
   * shares one sticky canvas across its whole height, so its intro screen
   * must not spin up a second GPU device of its own.
   */
  withCanvas?: boolean;
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
  withCanvas = true,
  className = '',
}: HeroFuturisticProps) => {
  const titleWords = useMemo(() => title.split(' '), [title]);
  const [visibleWords, setVisibleWords] = useState(0);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const delays = useMemo(() => titleWords.map((_, i) => jitter(i + 1) * 0.07), [titleWords]);
  const subtitleDelay = jitter(titleWords.length + 1) * 0.1;

  useEffect(() => {
    if (visibleWords < titleWords.length) {
      const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setSubtitleVisible(true), 800);
    return () => clearTimeout(timeout);
  }, [visibleWords, titleWords.length]);

  return (
    // `bg-black` is applied here rather than left to `className`: two
    // background utilities on one element resolve by stylesheet order, not by
    // their order in the class attribute, so a caller passing `bg-transparent`
    // could not reliably win.
    <div className={`relative h-svh w-full ${withCanvas ? 'bg-black' : ''} ${className}`}>
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

      {withCanvas && (
        <DepthScanCanvas
          textureSrc={textureSrc}
          depthSrc={depthSrc}
          tint={tint}
          scanColor={scanColor}
          scaleFactor={0.4}
        />
      )}
    </div>
  );
};

export default HeroFuturistic;
