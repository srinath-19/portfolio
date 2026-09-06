import { SiGithub, SiGmail } from "@icons-pack/react-simple-icons";
import { Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import type { SocialKind } from "@/lib/profile";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Simple Icons removed the LinkedIn mark after a trademark request, so unlike
 * Gmail and GitHub it can't come from the package — this is the official
 * glyph, drawn as a single path.
 * https://github.com/simple-icons/simple-icons
 */
export const LinkedInIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z" />
  </svg>
);

export const LocationIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

export interface BrandMark {
  Icon: ComponentType<IconProps>;
  /** Revealed on hover; the rest of the time the glyph inherits the chip colour. */
  color: string;
}

export const brandMarks: Record<SocialKind, BrandMark> = {
  // Official Simple Icons marks + their official brand hex.
  email: { Icon: SiGmail, color: "#EA4335" },
  // GitHub's own hex is #181717 — invisible on a near-black page, so the mark
  // reveals in white instead of its trademark black.
  github: { Icon: SiGithub, color: "#FFFFFF" },
  linkedin: { Icon: LinkedInIcon, color: "#0A66C2" },
  // Not a brand — the phone leans on the site's own accent.
  phone: { Icon: Phone, color: "#cdfb52" },
};
