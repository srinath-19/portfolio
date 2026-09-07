"use client";

import { DepthScanCanvas } from "@/components/ui/depth-scan-canvas";

/**
 * The depth-scan visual as a full-section background.
 *
 * The experience section is taller than the viewport and grows with the
 * content. Stretching one canvas over all of it would render proportionally
 * more pixels every frame and squash the subject to an ever-taller aspect, so
 * instead the canvas is sticky: it stays viewport-sized and correctly
 * proportioned while the glass cards scroll over it.
 *
 * The root spans the whole section (`absolute inset-0`), which is what the
 * sticky child pins inside.
 *
 * NOTE: the canvas is deliberately *not* scroll-transformed. An earlier version
 * drifted and scaled it up to 1.18 with scroll progress; the growing subject
 * pulled attention off the job history, which is the point of the section. The
 * shader is already in motion on its own — the frame it sits in stays put.
 *
 * NOTE: `position: sticky` resolves against the nearest *scroll container*.
 * The page root must therefore use `overflow-x: clip`, not `overflow-x:
 * hidden` — the latter computes `overflow-y` to `auto` and turns that element
 * into a scroll container, which would strand this layer at the top of the
 * section instead of tracking the viewport. See `app/page.tsx`.
 */
export const ExperienceBackdrop = () => {
  return (
    <div aria-hidden className="absolute inset-0 z-0">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-black">
        <div className="absolute inset-0">
          <DepthScanCanvas
            scaleFactor={1}
            tint={[10, 1.2, 5]}
            scanColor={[1, 0.34, 0.64]}
          />
        </div>

        {/* Vignette: keeps the subject's centre bright while darkening the
            edges, which is where the cards actually sit. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,transparent_0%,rgba(5,6,12,0.34)_58%,rgba(5,6,12,0.86)_100%)]" />

        {/* Flat legibility scrim, deliberately a constant rather than a
            scroll-driven ramp: the cards sit over the subject from this
            section's first pixel, so there is no bright intro moment left to
            protect and a ramp would only make the text contrast move around
            under the reader.

            Held at 0.38 — light enough that the subject reads through, dark
            enough that the copy still wins. The centre of the frame is the
            brightest part of the artwork *and* where the cards sit, so this is
            the number to touch if legibility slips, not the vignette. */}
        <div className="absolute inset-0 bg-[#05060c]/38" />
      </div>
    </div>
  );
};

export default ExperienceBackdrop;
