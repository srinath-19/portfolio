"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/ui/animated-shader-hero";
import { ChatPanelPlaceholder } from "@/components/ui/chat-panel-placeholder";
import { ExperienceSwap } from "@/components/ui/experience-swap";
import { HeroHeader } from "@/components/ui/hero-section-1";
import { profile } from "@/lib/profile";

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
    <div className="w-full overflow-x-clip select-none bg-[var(--background)] text-[var(--foreground)]">
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
      <section className="relative bg-[var(--background)] py-20 px-6 scanlines">
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
      <section className="relative bg-[var(--background)] py-12 overflow-hidden">
        <div className="diagonal-band h-16 flex items-center overflow-hidden whitespace-nowrap">
          <div className="flex gap-10 px-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="text-black/85 font-black text-2xl tracking-widest"
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
      <section
        id="projects"
        className="relative py-28 px-6 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #2a1230 0%, #120b22 50%, #05060c 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/55 text-xs tracking-[0.2em] uppercase mb-14">
            Featured Work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="group relative w-full aspect-[3/4] rounded-md border border-white/10 bg-gradient-to-b from-[var(--surface-3)] to-[var(--surface-1)] shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] transition-colors duration-300 hover:border-[color:var(--color-pink)]/60"
              >
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest text-white/60">
                    PROJECT_0{n}
                  </span>
                  <span className="w-3 h-3 rounded-full bg-[var(--color-red)] shadow-[0_0_12px_var(--color-red)]" />
                </div>
                <div className="absolute inset-x-4 top-14 bottom-14 rounded-sm border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-white/40">v1.0</span>
                  <span className="text-[9px] font-mono text-white/40">2025</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PICK YOUR CLAN ================= */}
      <section id="about" className="relative w-full">
        <div className="clan-grid w-full">
          <div className="relative bg-[#0d3634] min-h-[520px] flex items-end justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(58,166,160,0.35)_0%,transparent_65%)]" />
            <div className="relative w-40 h-72 bg-gradient-to-b from-[#3aa6a0]/60 to-transparent rounded-t-[50%]" />
            <div className="absolute bottom-6 left-6 text-white text-xs font-black tracking-widest uppercase">
              Design
            </div>
          </div>
          <div className="relative bg-[#38112a] min-h-[520px] flex items-end justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(247,86,163,0.35)_0%,transparent_65%)]" />
            <div className="relative w-44 h-72 bg-gradient-to-b from-[var(--color-pink)]/55 to-transparent rounded-t-[50%]" />
            <div className="absolute bottom-6 right-6 text-white text-xs font-black tracking-widest uppercase">
              Engineering
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--color-red)] px-10 py-6 shadow-[0_0_80px_rgba(212,66,59,0.55)]">
            <h2 className="section-title text-white text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.9] uppercase text-center">
              PICK
              <br />
              YOUR CLAN
            </h2>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section
        id="contact"
        className="relative bg-[var(--background)] py-32 flex flex-col items-center justify-center gap-8 px-6 text-center"
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
  );
}
