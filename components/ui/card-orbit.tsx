// Derived from the Hyperiux Vault "orbit flip slider"
// (https://vault.hyperiux.com), reduced to the one framing this site uses.
//
// Upstream shipped four camera modes (flat / tilt / ring / gallery) behind a
// row of buttons, and used the GSAP **Flip** plugin purely to tween between
// them. With only the flat framing kept, Flip had nothing left to animate, so
// the plugin, the mode state, the button row, the coverflow projection and the
// per-mode `AxisTransform` props are all gone. What remains is a single
// elliptical ring of billboarded cards that turns continuously.
"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

// Note: this component deliberately does NOT honour `prefers-reduced-motion`.
// Upstream did, and an earlier revision here did too. It was removed on an
// explicit call by the site's owner: the orbit is the Featured Work section's
// entire visual identity, and stopping it leaves twelve cards sitting inert.
// The tradeoff is real and was made knowingly — a perpetual carousel is close
// to the canonical case that media query exists for, so if this component is
// ever reused somewhere less central, put the check back.

export interface CardOrbitItem {
  id?: string | number;
  /** Front face — the card art. */
  image: string;
  alt?: string;
  /** Back face, revealed on hover. */
  title?: string;
  subtitle?: string;
  meta?: string;
}

export interface CardOrbitProps {
  items: CardOrbitItem[];
  /** Card size at the *near* point of the ring; far cards shrink to `depthScale` of it. */
  cardWidth?: number;
  cardHeight?: number;
  /** Fraction of the track's usable half-width / half-height the ring spans. */
  fillX?: number;
  fillY?: number;
  /**
   * A card can never be wider than this fraction of the track. This is the
   * whole mobile story: on a narrow viewport the cards shrink, the ellipse
   * turns tall and narrow, and the ring overlaps into a fanned hand rather
   * than overflowing. There are no breakpoints anywhere in this component.
   */
  maxCardWidthRatio?: number;
  /** Size of the farthest card relative to the nearest. 1 = a perfectly flat ring. */
  depthScale?: number;
  /**
   * Degrees of travel per second, 360 being one full lap. Because cards are
   * spaced by arc length, this is a constant *screen* speed rather than a
   * constant angular one. The ring only stops when scrolled out of view.
   */
  rotateSpeed?: number;
  /** Inset kept clear between the ring's outer edge and the track edge. */
  padding?: number;
  /**
   * Freezes the ring in place without unmounting it. The detail modal holds
   * this on while it is open: the card's on-screen box, captured by
   * `onSelect` at click time, then stays valid for the whole life of the
   * modal, so the closing animation can fly the card home to a slot that has
   * not drifted underneath it.
   */
  paused?: boolean;
  /**
   * A card was activated. Receives its index into `items` and its bounding
   * box at that instant, which is the origin the modal's open animation
   * measures its FLIP from.
   */
  onSelect?: (index: number, rect: DOMRect) => void;
  className?: string;
}

interface CardBox {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

interface RingParams {
  cardWidth: number;
  cardHeight: number;
  fillX: number;
  fillY: number;
  maxCardWidthRatio: number;
  depthScale: number;
  padding: number;
}

const HOVER_Z_INDEX = 2000;
const ARC_SAMPLES = 720;

interface RingGeometry {
  key: string;
  cx: number;
  cy: number;
  cardW: number;
  cardH: number;
  rx: number;
  ry: number;
  /** Cumulative arc length from the top of the ellipse at each sample. */
  arc: Float64Array;
  perimeter: number;
}

/** Everything the layout depends on, so a frame can tell if it must rebuild. */
const geometryKey = (containerW: number, containerH: number, p: RingParams) =>
  `${containerW}x${containerH}|${p.cardWidth}|${p.cardHeight}|${p.fillX}|${p.fillY}|${p.maxCardWidthRatio}|${p.depthScale}|${p.padding}`;

/**
 * The ring is sized *from* the track rather than from a fixed base radius that
 * per-breakpoint constants then multiply back down. Upstream did the latter,
 * which meant the mobile scale factors and the radius props had to be tuned as
 * a pair or cards clipped at the track edges. Deriving both radii from the
 * measured box removes the coupling: it fits at every width, and on a narrow
 * viewport the ellipse simply becomes tall and narrow instead of overflowing.
 *
 * The arc table exists because the cards are spaced by distance, not angle —
 * see `angleAtArc`. It only depends on the box and the props, so it is built
 * once per resize and reused by every frame.
 */
const buildGeometry = (
  containerW: number,
  containerH: number,
  p: RingParams,
): RingGeometry => {
  const aspect = p.cardHeight / p.cardWidth;
  const cardW = Math.min(p.cardWidth, containerW * p.maxCardWidthRatio);
  const cardH = cardW * aspect;

  // Cards at the left/right extremes sit at mid-depth, so that — not the
  // full-size near card — is what sets the horizontal envelope.
  const midScale = (p.depthScale + 1) / 2;
  const rx =
    Math.max(1, containerW / 2 - (cardW * midScale) / 2 - p.padding) * p.fillX;
  const ry = Math.max(1, containerH / 2 - cardH / 2 - p.padding) * p.fillY;

  const arc = new Float64Array(ARC_SAMPLES + 1);
  let acc = 0;
  let px = 0;
  let py = -ry;
  for (let s = 1; s <= ARC_SAMPLES; s++) {
    const u = -Math.PI / 2 + (s / ARC_SAMPLES) * Math.PI * 2;
    const x = rx * Math.cos(u);
    const y = ry * Math.sin(u);
    acc += Math.hypot(x - px, y - py);
    arc[s] = acc;
    px = x;
    py = y;
  }

  return {
    key: geometryKey(containerW, containerH, p),
    cx: containerW / 2,
    cy: containerH / 2,
    cardW,
    cardH,
    rx,
    ry,
    arc,
    perimeter: acc,
  };
};

/**
 * Inverts the arc table: given a distance travelled along the perimeter,
 * returns the ellipse angle that lands there, measured from the top.
 *
 * Spacing the cards at equal *angles* is what the upstream ring did, and it
 * bunches them at the two ends of the major axis — on a wide ellipse that
 * stacks three or four cards into a pile on each side. Equal arc length
 * spreads them evenly around the perimeter instead, which is what makes room
 * for cards this large, and it also gives the rotation a constant screen
 * speed rather than one that races through the ends.
 */
const angleAtArc = (g: RingGeometry, distance: number) => {
  const d = ((distance % g.perimeter) + g.perimeter) % g.perimeter;

  let lo = 0;
  let hi = ARC_SAMPLES;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (g.arc[mid] < d) lo = mid + 1;
    else hi = mid;
  }

  const i = Math.max(1, lo);
  const a0 = g.arc[i - 1];
  const a1 = g.arc[i];
  const frac = a1 > a0 ? (d - a0) / (a1 - a0) : 0;

  return -Math.PI / 2 + ((i - 1 + frac) / ARC_SAMPLES) * Math.PI * 2;
};

const buildRing = (
  count: number,
  g: RingGeometry,
  p: RingParams,
  offsetDeg: number,
): CardBox[] => {
  const offsetTurns = offsetDeg / 360;

  return Array.from({ length: count }, (_, i) => {
    const angle = angleAtArc(g, (i / count + offsetTurns) * g.perimeter);

    // 0 at the top of the ellipse (farthest), 1 at the bottom (nearest).
    const depth = (Math.sin(angle) + 1) / 2;
    const scale = p.depthScale + (1 - p.depthScale) * depth;

    return {
      x: g.cx + g.rx * Math.cos(angle),
      y: g.cy + g.ry * Math.sin(angle),
      width: g.cardW * scale,
      height: g.cardH * scale,
      // Stacking has to follow depth, not source order. A fixed `i + 1`
      // z-index survives a static ring but pops visibly once it turns, because
      // the wrap between the last and first card crosses the overlap zone.
      zIndex: Math.round(depth * 1000) + 1,
    };
  });
};

const CardOrbit = ({
  items,
  cardWidth = 150,
  cardHeight = 213,
  fillX = 0.98,
  fillY = 0.92,
  maxCardWidthRatio = 0.27,
  depthScale = 0.82,
  rotateSpeed = 6,
  padding = 24,
  paused = false,
  onSelect,
  className = "",
}: CardOrbitProps) => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const geometryRef = useRef<RingGeometry | undefined>(undefined);
  const rotationOffsetRef = useRef(0);
  const hoveredCardRef = useRef<HTMLElement | undefined>(undefined);
  const inViewRef = useRef(true);
  const pausedRef = useRef(paused);

  const applyLayout = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = gsap.utils.toArray<HTMLElement>(".card-orbit-card", track);
    if (!cards.length) return;

    const { width, height } = track.getBoundingClientRect();
    if (!width || !height) return;

    const params: RingParams = {
      cardWidth,
      cardHeight,
      fillX,
      fillY,
      maxCardWidthRatio,
      depthScale,
      padding,
    };

    // Rebuilding the arc table costs 720 hypots. The box and the props are
    // unchanged on every frame but the first after a resize, so key on both
    // and only rebuild when one actually moves.
    const key = geometryKey(width, height, params);
    let geometry = geometryRef.current;
    if (!geometry || geometry.key !== key) {
      geometry = buildGeometry(width, height, params);
      geometryRef.current = geometry;
    }

    const layout = buildRing(
      cards.length,
      geometry,
      params,
      rotationOffsetRef.current,
    );

    cards.forEach((card, i) => {
      const box = layout[i];
      gsap.set(card, {
        x: box.x,
        y: box.y,
        xPercent: -50,
        yPercent: -50,
        width: box.width,
        height: box.height,
        // The hovered card has to be lifted here rather than written once
        // on mouseenter: the ring keeps turning while it is hovered, so this
        // same loop would overwrite a one-off z-index on the very next frame.
        zIndex: card === hoveredCardRef.current ? HOVER_Z_INDEX : box.zIndex,
      });
    });
  }, [
    cardWidth,
    cardHeight,
    fillX,
    fillY,
    maxCardWidthRatio,
    depthScale,
    padding,
  ]);

  // Initial commit plus a re-layout whenever the track's own box changes.
  // A ResizeObserver on the track catches container-driven reflows a window
  // resize listener would miss, and fires once on observe, so it doubles as
  // the mount layout.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ctx = gsap.context(() => {
      const observer = new ResizeObserver(() => applyLayout());
      observer.observe(track);
      return () => observer.disconnect();
    }, trackRef);

    return () => ctx.revert();
  }, [applyLayout, items.length]);

  // Pause the loop while the ring is scrolled out of view. This is one section
  // of a long page and the rotation never ends, so without this the rAF and 12
  // `gsap.set` calls per frame keep running the whole time the visitor is
  // reading somewhere else.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  // Mirrored into a ref rather than read straight off the prop: `paused` in
  // the rAF effect's dependency list would tear the loop down and rebuild it
  // on every open and close, resetting `lastTime` in the process.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (rotateSpeed === 0) return;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);

      // Browsers stop servicing rAF in a hidden tab, so the first frame after
      // the visitor comes back carries the entire away-time as its delta.
      // Unclamped, that lands as a single multi-turn jump of the ring.
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Leaving the viewport and opening the detail modal are the only two
      // things that stop the ring; hovering a card flips it in place while
      // the orbit carries on underneath.
      if (!inViewRef.current || pausedRef.current) return;

      // Wrapped rather than accumulated: the offset feeds sin/cos, so only its
      // value mod 360 matters, and an unbounded counter would slowly bleed
      // float precision on a page left open for days.
      rotationOffsetRef.current = (rotationOffsetRef.current + rotateSpeed * dt) % 360;
      applyLayout();
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [rotateSpeed, applyLayout]);

  const activate = useCallback(
    (card: HTMLElement, index: number) => {
      onSelect?.(index, card.getBoundingClientRect());
    },
    [onSelect],
  );

  const flipIn = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      const card = e.currentTarget;
      hoveredCardRef.current = card;

      const inner = card.querySelector<HTMLElement>(".card-orbit-inner");
      if (!inner) return;

      gsap.killTweensOf(inner);
      gsap.to(inner, {
        rotateY: 180,
        scale: 1.18,
        duration: 0.75,
        ease: "back.out(1.7)",
      });
    },
    [],
  );

  const flipOut = useCallback(
    (e: React.SyntheticEvent<HTMLElement>) => {
      if (hoveredCardRef.current === e.currentTarget) {
        hoveredCardRef.current = undefined;
      }

      const inner = e.currentTarget.querySelector<HTMLElement>(
        ".card-orbit-inner",
      );
      if (!inner) return;

      gsap.killTweensOf(inner);
      gsap.to(inner, {
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      });
    },
    [],
  );

  return (
    <div
      ref={trackRef}
      className={`card-orbit-track relative w-full ${className}`}
    >
      {items.map((item, i) => (
        <div
          key={item.id ?? i}
          className="card-orbit-card absolute left-0 top-0"
          // Focus mirrors hover because the back face carries the only copy of
          // the project's name and description — without this it is reachable
          // by pointer only.
          tabIndex={0}
          // Deliberately a div with `role="button"` rather than a real
          // <button>: GSAP rewrites this element's width and height every
          // frame, and a button's UA box model fights `.card-orbit-card`.
          role="button"
          aria-label={
            item.title
              ? `${item.title}${item.subtitle ? ` — ${item.subtitle}` : ""}`
              : (item.alt ?? `Card ${i + 1}`)
          }
          onMouseEnter={flipIn}
          onMouseLeave={flipOut}
          onFocus={flipIn}
          onBlur={flipOut}
          onClick={(e) => activate(e.currentTarget, i)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" && e.key !== " ") return;
            // Space would otherwise scroll the page out from under the ring.
            e.preventDefault();
            activate(e.currentTarget, i);
          }}
        >
          <div className="card-orbit-inner">
            <div className="card-orbit-face glass-panel glass-card">
              {/* Deliberately a plain <img>, not next/image: GSAP rewrites this
                  element's parent width/height every frame, which next/image's
                  own sizing fights. The art is a fixed 360px-wide WebP in
                  /public/cards, already about the size it renders at. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image}
                alt={item.alt ?? item.title ?? `Card ${i + 1}`}
                className="card-orbit-art"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </div>

            <div className="card-orbit-face card-orbit-face--back glass-panel glass-card">
              <div className="card-orbit-back">
                {item.meta ? (
                  <p className="card-orbit-meta">{item.meta}</p>
                ) : null}
                {item.title ? (
                  <h3 className="card-orbit-title section-title">
                    {item.title}
                  </h3>
                ) : null}
                {item.subtitle ? (
                  <p className="card-orbit-subtitle">{item.subtitle}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardOrbit;
