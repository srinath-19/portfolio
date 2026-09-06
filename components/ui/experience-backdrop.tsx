"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { DepthScanCanvas } from "@/components/ui/depth-scan-canvas";

/**
 * The depth-scan visual as a full-section background.
 *
 * The experience section is taller than the viewport and grows with the
 * content. Stretching one canvas over all of it would render proportionally
 * more pixels every frame and squash the subject to an ever-taller aspect, so
 * instead the canvas is sticky: it stays viewport-sized and correctly
 * proportioned while the glass cards scroll over it, and drifts slowly so the
 * section doesn't feel like a static wallpaper.
 *
 * The root spans the whole section (`absolute inset-0`), which is what the
 * sticky child pins inside and what scroll progress is measured against.
 *
 * NOTE: `position: sticky` resolves against the nearest *scroll container*.
 * The page root must therefore use `overflow-x: clip`, not `overflow-x:
 * hidden` — the latter computes `overflow-y` to `auto` and turns that element
 * into a scroll container, which would strand this layer at the top of the
 * section instead of tracking the viewport. See `app/page.tsx`.
 */
export const ExperienceBackdrop = () => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Slow drift + a gentle push in as the cards take over the frame.
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 z-0">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-black">
        <motion.div
          className="absolute inset-0"
          style={reduce ? undefined : { y, scale }}
        >
          <DepthScanCanvas
            scaleFactor={1}
            tint={[10, 1.2, 5]}
            scanColor={[1, 0.34, 0.64]}
          />
        </motion.div>

        {/* Vignette: keeps the subject's centre bright while darkening the
            edges, which is where the cards actually sit. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(5,6,12,0.5)_58%,rgba(5,6,12,0.92)_100%)]" />

        {/* Flat legibility scrim, deliberately a constant rather than a
            scroll-driven ramp: the cards sit over the subject from this
            section's first pixel, so there is no bright intro moment left to
            protect and a ramp would only make the text contrast move around
            under the reader. */}
        <div className="absolute inset-0 bg-[#05060c]/55" />
      </div>
    </div>
  );
};

export default ExperienceBackdrop;
