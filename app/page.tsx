"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/ui/animated-shader-hero";
import { ChatPanelPlaceholder } from "@/components/ui/chat-panel-placeholder";
import { ExperienceSwap } from "@/components/ui/experience-swap";
import { HeroHeader } from "@/components/ui/hero-section-1";
import { ProjectShowcase } from "@/components/ui/project-showcase";
import SkillClusters from "@/components/ui/skill-clusters";
import { WavyBackground } from "@/components/ui/wavy-background";
import { profile } from "@/lib/profile";
import { skillClusters } from "@/lib/skills";

// WebGPU renderer + three/webgpu must never touch the server render. Only the
// canvas is deferred: `HeroFuturistic` is now chrome-only and the experience
// copy stays server-rendered, which matters for a portfolio's job history.
const ExperienceBackdrop = dynamic(
  () =>
    import("@/components/ui/experience-backdrop").then(
      (m) => m.ExperienceBackdrop,
    ),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 z-0 bg-black" />,
  },
);

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Home() {
  const [, whatIBuild, whatExcitesMe] = profile.aboutFull;

  // `overflow-x-clip`, not `overflow-x-hidden`: `hidden` computes `overflow-y`
  // to `auto`, which makes this element a scroll container and breaks the
  // sticky canvas in the experience section. `clip` clips identically without
  // establishing one.
  return (
    <>
      {/* One wave field for the whole site. It is `fixed`, so the canvas is
          only ever viewport-sized — measuring the full page instead would mean
          a backing store several thousand pixels tall. It sits at `-z-10`, and
          is a sibling of the root rather than a child because the root carries
          `overflow-x-clip`, which in some engines clips fixed descendants.

          Every section below that used to paint `--background` is now
          transparent so this shows through; the two that keep an opaque
          background (hero, experience) each have their own artwork. */}
      <WavyBackground
        containerClassName="fixed inset-0 -z-10"
        colors={["#4a1f57", "#28215c", "#7d2f6b"]}
        backgroundFill="var(--background)"
        waveWidth={80}
        waveOpacity={0.5}
        blur={14}
        amplitude={120}
        spread={0.9}
        speed="slow"
      />

      <div className="w-full overflow-x-clip select-none text-[var(--foreground)]">
        {/* ================= HERO ================= */}
        <div className="relative">
          {/* Top Navigation overlay */}
          <HeroHeader />

          <Hero
            eyebrow={{ role: profile.title, status: "Open to work" }}
            name={profile.name}
            specialties={profile.specialties}
            bio={profile.about}
            location={{ place: profile.location, note: profile.locationNote }}
            socials={profile.socials}
            aside={<ChatPanelPlaceholder />}
            buttons={{
              primary: {
                text: "View Work",
                onClick: () => scrollTo("projects"),
              },
              secondary: {
                text: "Get In Touch",
                onClick: () => scrollTo("contact"),
              },
            }}
          />
        </div>

        {/* ================= EDITORIAL TEXT BLOCK ================= */}
        {/* Paragraphs 2 and 3 of the About in mydata/contact.md, side by side:
            the slab statement on the left, the quieter coda on the right. They
            used to stack, which left a screen-and-a-half of empty black between
            the hero and the band. On mobile they fall back to stacked. */}
        <section className="relative py-20 px-6 scanlines">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <p className="text-[15px] tracking-wide">
              <span className="highlight-box">{whatIBuild}</span>
            </p>

            {/* The rule turns with the layout: a hairline above the coda when
                stacked, a full-height divider beside it once side by side. */}
            <div className="relative lg:pl-16">
              <span
                aria-hidden
                className="block h-px w-16 bg-gradient-to-r from-[var(--color-pink)] to-transparent lg:absolute lg:left-0 lg:top-0 lg:h-full lg:w-px lg:bg-gradient-to-b lg:from-transparent lg:via-[var(--color-pink)]/50 lg:to-transparent"
              />
              <p className="mt-6 text-[15px] leading-[1.9] font-light tracking-wide text-white/60 lg:mt-0">
                {whatExcitesMe}
              </p>
            </div>
          </div>
        </section>

        {/* ================= DIAGONAL BAND ================= */}
        {/* Pure divider. The blurb that used to sit under it ("a collection of
            selected works spanning product design…") was invented filler, not
            anything from mydata/, so it is gone rather than rewritten. */}
        <section className="relative py-12 overflow-hidden">
          <div className="diagonal-band h-16 flex items-center overflow-hidden whitespace-nowrap">
            {/* `w-full justify-between`, not spacing alone: the band is 110vw, so a
                fixed count at a fixed gap ran out partway across and left the red
                half of the gradient bare. `gap-10` is now the *minimum* — the
                icons spread to both edges on a wide screen, and on a narrow one
                the gap holds and the overflow is clipped. */}
            <div className="flex w-full justify-between gap-10 px-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <span
                  key={i}
                  className="text-black/85 font-black text-2xl"
                >
                  ✦
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ================= EXPERIENCE ================= */}
        {/* The depth-scan visual is this section's background rather than the
            separate full-screen interlude it used to be: one WebGPU canvas,
            sticky, running the whole height while the glass cards scroll over
            it. The old "Build Your Dreams" title screen was cut with it —
            `HeroFuturistic` still exists as a standalone component but nothing
            renders it now.

            `select-text` opts out of the root's `select-none` — this is the one
            place on the page where the copy is worth copying. `isolate` keeps
            the canvas's stacking context from leaking into the rest of the page. */}
        <section id="work" className="relative isolate bg-black select-text">
          <ExperienceBackdrop />

          <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-32 lg:pt-40">
            <p className="text-center text-white/55 text-xs tracking-[0.2em] uppercase mb-4">
              Experience
            </p>
            <h2 className="section-title text-center text-[clamp(1.75rem,4vw,3rem)] uppercase text-white mb-14 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
              Where I&apos;ve Built
            </h2>
            <ExperienceSwap />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-28 z-20 edge-fade-top"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-20 edge-fade-bottom"
          />
        </section>

        {/* ================= FEATURED PROJECT ================= */}
        {/* The radial gradient survives as a translucent *tint* over the shared
            wave field rather than an opaque background — it still deepens the
            middle of the section, but the waves read through it. */}
        <section
          id="projects"
          className="relative pt-28 pb-12 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(42,18,48,0.6) 0%, rgba(18,11,34,0.5) 50%, rgba(5,6,12,0.72) 100%)",
          }}
        >
          {/* Glass has to have something behind it to refract. The wave field
              is too soft on its own to survive a 10px blur, so these two orbs
              sit under the ring and give the card panels real colour to bend
              as they pass over. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-[14%] top-[42%] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-[var(--color-pink)]/15 blur-[130px]" />
            <div className="absolute right-[10%] top-[64%] h-[30rem] w-[30rem] translate-x-1/2 rounded-full bg-[var(--color-lime)]/10 blur-[140px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6">
            <p className="text-center text-white/55 text-xs tracking-[0.2em] uppercase mb-4">
              Featured Work
            </p>
            <h2 className="section-title text-center text-[clamp(1.75rem,4vw,3rem)] uppercase text-white">
              Selected Builds
            </h2>
            <p className="mt-4 text-center text-[13px] tracking-wide text-white/45">
              Twelve builds, dealt as a hand — hover a card to turn it over,
              click it to read the hand.
            </p>
          </div>

          {/* Full-bleed on purpose: the ring sizes itself from its track, so
              it sits outside the `max-w-5xl` heading wrapper to get the whole
              width. Card faces come from `mydata/pictures` via `/public/cards`.
              `ProjectShowcase` is the ring plus the detail panel a click opens;
              the ring's own tuning props live in there with it. */}
          <ProjectShowcase />
        </section>

        {/* ================= SKILLSET ================= */}
        {/* Replaced the decorative "PICK YOUR CLAN" block, which was filler
            carried over from the reference design and held the `#about` anchor
            without ever having any About content behind it. */}
        <section
          id="skills"
          className="relative pt-28 pb-24 overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(18,24,52,0.55) 0%, rgba(10,12,28,0.45) 55%, rgba(5,6,12,0.7) 100%)",
          }}
        >
          {/* Same reason as the Featured Work orbs: the readout below the field
              is a glass panel, and `backdrop-filter` over a smooth gradient
              refracts nothing at all. These give it colour to bend. */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-[18%] top-[30%] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[var(--color-lime)]/10 blur-[130px]" />
            <div className="absolute right-[12%] top-[62%] h-[32rem] w-[32rem] translate-x-1/2 rounded-full bg-[var(--color-pink)]/12 blur-[140px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6">
            <p className="text-center text-white/55 text-xs tracking-[0.2em] uppercase mb-4">
              Skillset
            </p>
            <h2 className="section-title text-center text-[clamp(1.75rem,4vw,3rem)] uppercase text-white">
              The Stack
            </h2>
            <p className="mt-4 text-center text-[13px] tracking-wide text-white/45">
              Nine clusters, drifting — hover one to read the techniques behind
              it.
            </p>
          </div>

          {/* Full-bleed for the same reason the orbit is: the field measures its
              own track to lay itself out, so it sits outside the heading's
              `max-w-5xl` wrapper. */}
          <SkillClusters className="relative z-10 mt-14" clusters={skillClusters} />
        </section>

        {/* ================= FINAL CTA ================= */}
        <section
          id="contact"
          className="relative py-32 flex flex-col items-center justify-center gap-8 px-6 text-center"
        >
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full bg-[var(--color-lime)] shadow-[0_0_14px_var(--color-lime)]"
              />
            ))}
          </div>
          <h2 className="section-title text-[clamp(1.75rem,4vw,3rem)] uppercase text-white">
            Let&apos;s Build Something
          </h2>
          <a
            href={profile.socials[0].href}
            className="section-title px-8 py-2 tracking-widest text-sm border-2 border-[var(--color-lime)] text-[var(--color-lime)] transition-colors hover:bg-[var(--color-lime)] hover:text-black"
          >
            Say Hello
          </a>
        </section>
      </div>
    </>
  );
}
