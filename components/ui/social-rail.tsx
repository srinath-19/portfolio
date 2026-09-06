"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { MouseEvent } from "react";

import { brandMarks } from "@/components/ui/social-icons";
import type { SocialLink } from "@/lib/profile";

/** How far the glyph drifts toward the cursor, in px. */
const MAGNET = 5;

const Chip = ({ link, index }: { link: SocialLink; index: number }) => {
  const { Icon, color } = brandMarks[link.kind];

  // Glyph-only magnetism: the chip itself stays put, so the expand-on-hover
  // label can't fight the pointer for position.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 14, mass: 0.15 });
  const y = useSpring(my, { stiffness: 180, damping: 14, mass: 0.15 });

  const track = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * MAGNET);
    my.set(((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * MAGNET);
  };

  const release = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 + index * 0.09, duration: 0.5, ease: "easeOut" }}
    >
      <a
        href={link.href}
        {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-label={`${link.label} — ${link.detail}`}
        className="social-chip"
        style={{ "--brand": color } as React.CSSProperties}
        onMouseMove={track}
        onMouseLeave={release}
        onBlur={release}
      >
        <span className="social-ring" aria-hidden>
          <span className="social-core">
            <motion.span style={{ x, y }} className="social-glyph">
              <Icon className="h-[18px] w-[18px]" />
            </motion.span>
          </span>
        </span>
        <span className="social-label" aria-hidden>
          {link.detail}
        </span>
      </a>
    </motion.li>
  );
};

/**
 * Contact row for the hero. Each chip reveals its handle by widening on hover,
 * spins a gradient ring, and lets the mark bloom into its own brand colour.
 */
export const SocialRail = ({
  links,
  className = "",
}: {
  links: readonly SocialLink[];
  className?: string;
}) => (
  <ul className={`flex flex-wrap items-center gap-2.5 ${className}`}>
    {links.map((link, i) => (
      <Chip key={link.kind} link={link} index={i} />
    ))}
  </ul>
);

export default SocialRail;
