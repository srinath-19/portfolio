// Detail panel for the Featured Work orbit. Opening one "deals" the clicked
// card out of the ring: the card art flies from its orbit slot into the
// panel's art column, and flies back into the same slot on close.
//
// That round trip only works because `CardOrbit` freezes while this is open
// (its `paused` prop). The ring never moves, so the bounding box captured at
// click time is still accurate when the panel closes.
"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { CATEGORY_LABEL, type Project } from "@/lib/projects";

export interface ProjectModalProps {
  /** `null` closes the panel. The exiting copy keeps its old props. */
  project: Project | null;
  /** The clicked card's viewport box, and the FLIP origin. */
  originRect: DOMRect | null;
  index: number;
  total: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

/** Playing-card index printed in the panel's corners. */
const RANK_LABEL: Record<string, string> = {
  ace: "A",
  king: "K",
  queen: "Q",
  jack: "J",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The deal-out. Springy enough to overshoot a little as the card lands. */
const SPRING = { type: "spring" as const, stiffness: 260, damping: 30 };

/** The flight home, and the panel's fade, on the same clock. */
const CLOSE_DURATION = 0.34;

/**
 * Under `prefers-reduced-motion` the deal-out is scaled down rather than
 * switched off: the card still travels, but a short hop instead of a spring
 * across the viewport.
 *
 * Switching it off outright was the first version, and it made the animation
 * dead on the site owner's own machine — Windows reports `reduce` for anyone
 * who has turned off *Accessibility → Visual effects → Animation effects*,
 * which `card-orbit.tsx` already documents. A fraction this small stays well
 * under what the query exists to protect against, while leaving the
 * interaction legible. Same reasoning as the skill-cluster drift.
 */
const REDUCED_FLIGHT = 0.18;

/**
 * ...but a bare fraction is not enough on its own. The distance from a card's
 * slot to the panel varies about 6.7x around the ring — 133px to 890px,
 * measured across all twelve slots at 1440x900 — so 18% is a clear 160px hop
 * for a card at the far side and a 24px twitch for one that happens to sit
 * near the panel. Clamping the *absolute* travel keeps the gesture both
 * perceptible and consistent whichever card was clicked, and absolute
 * displacement is the right measure here anyway: what the query guards
 * against is large movement on screen, not a large fraction of some journey.
 */
const REDUCED_MIN_TRAVEL = 70;
const REDUCED_MAX_TRAVEL = 150;

/** No spring under reduced motion — a spring's overshoot is the problem. */
const REDUCED_TRANSITION = { duration: 0.55, ease: "easeOut" as const };

/** Rotation on the paging swap, likewise trimmed rather than removed. */
const SWAP_ROTATION = 40;
const REDUCED_SWAP_ROTATION = 8;

const damp = (flight: Flight): Flight => {
  const x = flight.x * REDUCED_FLIGHT;
  const y = flight.y * REDUCED_FLIGHT;

  const length = Math.hypot(x, y);
  const clamped = Math.min(
    Math.max(length, REDUCED_MIN_TRAVEL),
    REDUCED_MAX_TRAVEL,
  );
  const ratio = length > 0 ? clamped / length : 0;

  return {
    x: x * ratio,
    y: y * ratio,
    scale: 1 + (flight.scale - 1) * REDUCED_FLIGHT,
  };
};

/**
 * `.card-orbit-art` insets the art by 5% on every side inside its glass frame,
 * so the visible card in the ring is 90% of the box `getBoundingClientRect`
 * reports. The panel's copy has no such inset. Without this the card would
 * jump about a tenth larger the instant it leaves the ring.
 */
const ORBIT_ART_INSET = 0.9;

interface DialogProps extends Omit<ProjectModalProps, "project"> {
  project: Project;
}

interface Flight {
  x: number;
  y: number;
  scale: number;
}

const Dialog = ({
  project,
  originRect,
  index,
  total,
  onClose,
  onNext,
  onPrev,
}: DialogProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const artSlotRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  // The deal-out is driven by motion values rather than framer's `initial`.
  // The FLIP delta is only knowable after layout, and by the time it has been
  // measured the element is already mounted — `initial` has had its one
  // chance to run and would leave the card sitting at its resting position.
  const flightX = useMotionValue(0);
  const flightY = useMotionValue(0);
  const flightScale = useMotionValue(1);

  // The same delta kept as state, for the exit. `exit` is read at close time,
  // long after it has been measured, so a plain object works there.
  const [homeward, setHomeward] = useState<Flight | undefined>(undefined);

  // How far, and how much larger, the card sits at its orbit slot relative to
  // where it comes to rest here.
  const measureDelta = useCallback((): Flight | undefined => {
    const slot = artSlotRef.current;
    if (!slot || !originRect) return undefined;

    const rest = slot.getBoundingClientRect();
    if (!rest.width || !rest.height) return undefined;

    return {
      x: originRect.left + originRect.width / 2 - (rest.left + rest.width / 2),
      y: originRect.top + originRect.height / 2 - (rest.top + rest.height / 2),
      scale: (originRect.width * ORBIT_ART_INSET) / rest.width,
    };
  }, [originRect]);

  // Re-measured on every page, so the card always flies home to the slot of
  // the project currently showing rather than to the one the panel was opened
  // from. Measurement only — the deal-out is the effect below.
  useLayoutEffect(() => {
    const delta = measureDelta();
    // Measure-then-render is what `useLayoutEffect` exists for, and the state
    // is genuinely needed rather than a ref: `exit` is read off the last
    // committed render, so a panel opened and closed without paging would
    // never re-render and would keep the placeholder exit target it was first
    // given. The commit happens before paint, so nothing flickers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (delta) setHomeward(delta);
  }, [measureDelta]);

  // The deal-out, and it must stay mount-only.
  //
  // This deliberately has no dependency array entries and no "already dealt"
  // ref guard. An earlier version had both, and the guard made the animation
  // silently dead in dev: Strict Mode double-invokes layout effects, so the
  // cleanup stopped the tweens and the second run hit the guard and returned
  // without restarting them, leaving the card parked at its orbit slot. With
  // an empty dep list the second run simply re-deals, which is correct.
  useLayoutEffect(() => {
    const measured = measureDelta();
    if (!measured) return;

    const delta = reduceMotion ? damp(measured) : measured;
    const options = reduceMotion ? REDUCED_TRANSITION : SPRING;

    flightX.set(delta.x);
    flightY.set(delta.y);
    flightScale.set(delta.scale);

    const runs = [
      animate(flightX, 0, options),
      animate(flightY, 0, options),
      animate(flightScale, 1, options),
    ];

    return () => runs.forEach((run) => run.stop());
    // Mount only, on purpose: paging swaps the art inside the flight wrapper
    // and must not re-throw the card across the viewport. `measureDelta` is
    // intentionally read from the mount render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes, arrows page. Bound to the document rather than the panel so
  // it works no matter which child holds focus.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        onNext();
      } else if (e.key === "ArrowLeft") {
        onPrev();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrev]);

  // Scroll lock. The padding compensates for the scrollbar the lock removes —
  // without it the whole page jumps sideways as the panel opens.
  useEffect(() => {
    const { body, documentElement } = document;
    const gap = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, []);

  // Focus moves in on open and back to the orbit card on close. The card
  // regaining focus flips it over, which is a pleasant landing rather than
  // something to suppress.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  const trapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const items = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter((el) => el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // A press that starts inside the panel and releases on the backdrop — a
  // drag off the end of a text selection — otherwise fires click on the
  // backdrop and closes it. Only a press that both starts and ends there counts.
  const pressOnBackdrop = useRef(false);

  const swapRotation = reduceMotion ? REDUCED_SWAP_ROTATION : SWAP_ROTATION;
  const rank = RANK_LABEL[project.card] ?? project.card.toUpperCase();
  const titleId = "project-modal-title";

  return (
    <motion.div
      className="project-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.2, ease: "easeOut" } }}
      exit={{ opacity: 0, transition: { duration: CLOSE_DURATION } }}
      onPointerDown={(e) => {
        pressOnBackdrop.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pressOnBackdrop.current) onClose();
      }}
    >
      {/* Opacity-only entrance, deliberately. A transform here would move the
          art slot that the flying card measures itself against. */}
      <motion.div
        ref={panelRef}
        className="project-modal-panel select-text"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        // Split in two on purpose: the panel fades its whole subtree, the
        // flying card included, so the way in is quick enough that the card is
        // opaque for nearly all of the deal-out, while the way out is held to
        // CLOSE_DURATION so the fade and the flight home land together.
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.18, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: CLOSE_DURATION } }}
        onKeyDown={trapFocus}
      >
        {/* The glass lives on an inert layer of its own. A backdrop-filtered
            box samples its backdrop in its own compositing context, so putting
            it on the animated wrapper smears the blur while that wrapper
            fades — the same rule `.glass-panel` documents in globals.css. */}
        <div
          aria-hidden
          className="project-modal-surface glass-panel glass-modal"
        />

        <span aria-hidden className="project-modal-rank project-modal-rank--tl">
          {rank}
        </span>
        <span aria-hidden className="project-modal-rank project-modal-rank--br">
          {rank}
        </span>

        <button
          type="button"
          className="project-modal-close"
          onClick={onClose}
          aria-label="Close project details"
        >
          &times;
        </button>

        <div className="project-modal-body">
          <div ref={artSlotRef} className="project-modal-art">
            {/* The outer element owns the flight, the inner image owns the
                swap between projects, so paging never disturbs the FLIP
                transform sitting above it. */}
            {/* The panel fades on the same clock as this flight, so the
                card dissolves just as it arrives back in the ring rather than
                snapping out of existence mid-air. */}
            <motion.div
              className="project-modal-art-flight"
              style={{ x: flightX, y: flightY, scale: flightScale }}
              exit={
                homeward
                  ? (({ x, y, scale }) => ({ x, y, scale }))(
                      reduceMotion ? damp(homeward) : homeward,
                    )
                  : { opacity: 0 }
              }
              transition={{ duration: CLOSE_DURATION, ease: "easeInOut" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={project.card}
                  src={`/cards/${project.card}.webp`}
                  alt={`${project.name} — ${project.tagline}`}
                  className="project-modal-card"
                  draggable={false}
                  initial={{ opacity: 0, rotateY: -swapRotation }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: swapRotation }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                />
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="project-modal-content">
            <p className="project-modal-meta">
              {CATEGORY_LABEL[project.category]}
            </p>
            <h3 id={titleId} className="project-modal-title section-title">
              {project.name}
            </h3>
            <p className="project-modal-tagline">{project.tagline}</p>

            <p className="project-modal-summary">{project.summary}</p>

            <ul className="project-modal-stack">
              {project.stack.map((tool) => (
                <li key={tool} className="project-modal-chip">
                  {tool}
                </li>
              ))}
            </ul>

            <ul className="project-modal-highlights">
              {project.highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="project-modal-footer">
          <a
            className="project-modal-repo"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>

          <div className="project-modal-pager">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous project"
              className="project-modal-arrow"
            >
              &lsaquo;
            </button>
            <span className="project-modal-count">
              {index + 1} / {total}
            </span>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next project"
              className="project-modal-arrow"
            >
              &rsaquo;
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const ProjectModal = ({ project, ...rest }: ProjectModalProps) => {
  // A portal is required, not cosmetic: `.card-orbit-track` sets
  // `overflow: clip`, so a panel rendered in place is clipped by the ring's
  // own box long before it reaches the viewport edges.
  //
  // Probing for `document` rather than flipping a mounted flag in an effect:
  // the flag costs a second render on every page load to reach the same
  // answer, and there is no hydration mismatch to avoid here — the portal
  // occupies no space in this position on either side, and `project` is
  // always null on the first render anyway.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {project ? (
        <Dialog key="project-modal" project={project} {...rest} />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default ProjectModal;
