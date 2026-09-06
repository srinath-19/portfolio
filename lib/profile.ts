/**
 * Single source of truth for the identity block in the hero.
 * Mirrors `mydata/contact.md` — update both together.
 */

export type SocialKind = "email" | "linkedin" | "github" | "phone";

export interface SocialLink {
  kind: SocialKind;
  /** Screen-reader + tooltip label. */
  label: string;
  /** What the tooltip shows on hover (the actual handle / address). */
  detail: string;
  href: string;
  external?: boolean;
}

export const profile = {
  name: "Srinath Muppala",
  /**
   * `contact.md` now lists three roles ("AI Software Engineer / ML Engineer /
   * Backend Engineer"). The hero eyebrow carries the first; the other two are
   * covered by the specialty rail, so this is a deliberate trim, not drift.
   */
  title: "AI Software Engineer",
  location: "San Francisco Bay Area",
  locationNote: "Open to relocation",
  availability: "Open to full-time AI / ML and software engineering roles",

  /** Typewriter lines under the name — what I actually build. */
  specialties: [
    "Agentic AI Systems",
    "RAG & LLM Fine-Tuning",
    "Production Backends",
    "Cloud Infrastructure",
    "ML / DL / CV / NLP",
  ],

  /**
   * Hero excerpt — the opening hook and the closing line of `aboutFull`,
   * verbatim. The full text is too long for the hero column.
   */
  about:
    "I’m the kind of engineer who sees someone doing the same boring thing twice and immediately thinks, “There has to be a way to automate this.” Basically, I like making computers do the boring stuff so humans can work on the interesting stuff.",

  /** Complete About from `mydata/contact.md`, for the About section. */
  aboutFull: [
    "I’m the kind of engineer who sees someone doing the same boring thing twice and immediately thinks, “There has to be a way to automate this.”",
    "I love building AI systems that actually do something—not just another chatbot wrapped around an API. I’ve built everything from an AI platform that turns architectural floor plans from a two-day manual process into minutes, to GymBuddy, a voice-first AI workout companion I built because I was tired of manually logging workouts at the gym.",
    "What excites me most is taking a messy real-world problem, figuring out where AI actually helps, and then owning the whole thing: agents, models, APIs, databases, infrastructure, deployment, and the user experience.",
    "Give me a repetitive workflow, an ugly process, or a problem everyone has accepted as “that’s just how we do it,” and I’ll probably spend my weekend trying to automate it.",
    "Basically, I like making computers do the boring stuff so humans can work on the interesting stuff.",
  ],

  socials: [
    {
      kind: "email",
      label: "Email",
      detail: "srinath.muppala@gmail.com",
      href: "mailto:srinath.muppala@gmail.com",
    },
    {
      kind: "linkedin",
      label: "LinkedIn",
      detail: "/in/srinath-muppala",
      href: "https://www.linkedin.com/in/srinath-muppala",
      external: true,
    },
    {
      kind: "github",
      label: "GitHub",
      detail: "@srinath-19",
      href: "https://github.com/srinath-19",
      external: true,
    },
    {
      kind: "phone",
      label: "Phone",
      detail: "+1 720-813-3485",
      href: "tel:+17208133485",
    },
  ] satisfies SocialLink[],
} as const;
