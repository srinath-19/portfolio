"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import {
  education,
  experience,
  type ExperienceRole,
} from "@/lib/experience";

/** Matches the spring feel of the hero's social chips. */
const SPRING = { type: "spring", stiffness: 260, damping: 30 } as const;

/**
 * Frosted surface for one card. This is a separate inert layer rather than a
 * class on the animated wrapper: `backdrop-filter` samples its backdrop in the
 * element's own transformed space, so putting it on the box framer is
 * springing between slots makes the blur visibly smear and snap mid-swap.
 * Here the wrapper only transforms and this layer only resizes.
 *
 * The tint/edge variants are classes (`.glass-featured` / `.glass-idle`, see
 * globals.css) rather than inline custom properties, because an inline
 * `--glass-edge` would outrank the `:hover` rule and freeze the hover state.
 */
const GlassSurface = ({ active }: { active: boolean }) => (
  <div
    aria-hidden
    className={`glass-panel absolute inset-0 rounded-2xl ${
      active ? "glass-featured" : "glass-idle"
    }`}
  />
);

/**
 * Grid placement per slot. Every class here is a literal so Tailwind can see
 * it at build time — a runtime-assembled class name would never be generated.
 *
 * The featured card spans all three rows of the right-hand column; the third
 * row is the `1fr` spacer that soaks up its extra height, which keeps the two
 * side cards snug at the top instead of being spread down the column.
 */
const SLOT_CLASS = [
  "order-1 lg:col-start-1 lg:row-start-1 lg:row-span-3",
  "order-2 lg:col-start-2 lg:row-start-1",
  "order-3 lg:col-start-2 lg:row-start-2",
];

const FeaturedBody = ({ role }: { role: ExperienceRole }) => (
  <div
    role="region"
    aria-live="polite"
    aria-label={`${role.role} at ${role.company}`}
    className="p-7 sm:p-9"
  >
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h3 className="text-[clamp(1.15rem,2.2vw,1.6rem)] font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        {role.role}
      </h3>
      <span className="text-[color:var(--color-pink)] text-sm font-semibold">
        {role.company}
      </span>
    </div>

    <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
      <span>{role.location}</span>
      <span aria-hidden className="text-[color:var(--color-pink)]/70">
        ·
      </span>
      <span>{role.period}</span>
    </p>

    {role.focus && (
      <p className="mt-5 text-[13px] font-medium tracking-wide text-[var(--color-lime)]">
        {role.focus}
      </p>
    )}

    <ul className="mt-5 space-y-3.5">
      {role.bullets.map((bullet) => (
        <li key={bullet} className="flex gap-3 text-[13px] leading-[1.8] text-white/80">
          <span
            aria-hidden
            className="mt-[0.55em] h-1.5 w-1.5 shrink-0 bg-[var(--color-lime)]"
          />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>

    {role.publication && (
      <div className="mt-6 border-l-2 border-[color:var(--color-pink)]/50 pl-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
          Publication
        </p>
        <p className="mt-1.5 text-[13px] italic leading-[1.7] text-white/75">
          {role.publication.title}
        </p>
        <p className="mt-1 text-[12px] leading-[1.7] text-white/50">
          {role.publication.venue}
        </p>
        <p className="mt-1 text-[12px] leading-[1.7] text-white/40">
          {role.publication.note}
        </p>
      </div>
    )}

    <ul className="mt-7 flex flex-wrap gap-2">
      {role.tech.map((item) => (
        <li
          key={item}
          className="rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[10px] tracking-wide text-white/70 backdrop-blur-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const CompactBody = ({
  role,
  onSelect,
}: {
  role: ExperienceRole;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-label={`Show details for ${role.role} at ${role.company}`}
    // No `group` of its own: the card wrapper is the group, and hovering the
    // button hovers the wrapper, so a nested one would only be ambiguous.
    className="w-full cursor-pointer rounded-2xl p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]"
  >
    <h3 className="text-[15px] font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
      {role.role}
    </h3>
    <span className="mt-1 block text-[13px] font-semibold text-[color:var(--color-pink)]">
      {role.company}
    </span>
    <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
      <span>{role.location}</span>
      <span aria-hidden className="text-[color:var(--color-pink)]/70">
        ·
      </span>
      <span>{role.period}</span>
    </p>
    <span
      aria-hidden
      className="mt-6 block text-[10px] font-black uppercase tracking-[0.18em] text-white/45 transition-colors duration-300 group-hover:text-[var(--color-lime)]"
    >
      View →
    </span>
  </button>
);

/**
 * Work history as a promote/demote pair: one role held open, the rest waiting
 * as compact cards. Clicking a compact card trades the two positions.
 *
 * All three roles render as one flat list in a stable order, so React keeps
 * each card's instance alive and only its grid placement changes — framer's
 * `layout` then animates each box from its old slot to its new one. An earlier
 * pass used `layoutId` to match a big card against a small one; framer treats
 * such a pair as lead/follow and left the promoted card stranded at opacity 0,
 * so the shared-id approach is deliberately avoided here.
 */
export const ExperienceSwap = () => {
  const [activeId, setActiveId] = useState(experience[0].id);
  const reduce = useReducedMotion();
  const active = experience.find((role) => role.id === activeId) ?? experience[0];

  // Slot 0 is the featured column; the remaining roles fill slots 1 and 2 in
  // their original reverse-chronological order.
  let sideCount = 0;
  const slots = experience.map((role) =>
    role.id === active.id ? 0 : ++sideCount,
  );

  return (
    <>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.6fr_1fr] lg:grid-rows-[auto_auto_1fr] lg:items-start">
        {experience.map((role, i) => {
          const isActive = role.id === active.id;

          return (
            <motion.div
              key={role.id}
              layout={reduce ? undefined : true}
              transition={reduce ? { duration: 0 } : SPRING}
              className={`group relative rounded-2xl ${SLOT_CLASS[slots[i]]}`}
            >
              {/* Pink bloom behind the promoted card only — the same halo
                  idiom as the hero's chat panel. */}
              {isActive && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-60 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at 50% 35%, rgba(247,86,163,0.22) 0%, transparent 70%)",
                  }}
                />
              )}

              <GlassSurface active={isActive} />
              {/* Keyed so the body remounts on promote/demote and fades in.
                  `animate` is unconditional: gating it on reduced motion is
                  what previously left the body permanently invisible.

                  `initial` must not branch on `reduce` either — it is the one
                  prop here that reaches the SSR markup as an inline style, and
                  `useReducedMotion()` is false on the server but true on a
                  reduced-motion client, so the branch hydrated `opacity:0`
                  against `opacity:1`. Reduced motion is honoured by the
                  zero-duration transition below instead. */}
              <motion.div
                key={isActive ? "full" : "compact"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={reduce ? { duration: 0 } : { duration: 0.25, delay: 0.1 }}
                className="relative"
              >
                {isActive ? (
                  <FeaturedBody role={role} />
                ) : (
                  <CompactBody role={role} onSelect={() => setActiveId(role.id)} />
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 flex flex-col items-center">
        <span
          aria-hidden
          className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--color-pink)] to-transparent"
        />
        <p className="mt-8 text-[11px] uppercase tracking-[0.2em] text-white/45">
          Education
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {education.map((entry) => (
          <div
            key={entry.school}
            className="glass-panel glass-quiet rounded-2xl p-6"
          >
            <h3 className="text-[14px] font-black tracking-tight text-white/90">
              {entry.school}
            </h3>
            <p className="mt-2 text-[12px] leading-[1.7] text-white/65">
              {entry.degree}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
              <span>{entry.period}</span>
              <span aria-hidden className="text-[color:var(--color-pink)]/70">
                ·
              </span>
              <span>{entry.gpa}</span>
            </p>
          </div>
        ))}
      </div>
    </>
  );
};

export default ExperienceSwap;
