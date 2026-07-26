"use client";

import dynamic from "next/dynamic";
import Hero from "@/components/ui/animated-shader-hero";
import { HeroHeader } from "@/components/ui/hero-section-1";

// WebGPU renderer + three/webgpu must never touch the server render.
const HeroFuturistic = dynamic(
  () => import("@/components/ui/hero-futuristic").then((m) => m.HeroFuturistic),
  {
    ssr: false,
    loading: () => <div className="h-svh w-full bg-black" />,
  },
);

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden select-none bg-[var(--background)] text-[var(--foreground)]">
      {/* ================= HERO ================= */}
      <div className="relative">
        {/* Top Navigation overlay */}
        <HeroHeader />

        <Hero
          trustBadge={{
            text: "Designer · AI Developer · Creator",
            icons: ["✦"],
          }}
          headline={{
            line1: "Your Name",
            line2: [
              "Builds The Web",
              "Ships Bold Ideas",
              "Crafts Playful UX",
              "Designs With Joy",
            ],
          }}
          subtitle="Crafting digital experiences that blend bold visual storytelling with precise engineering. Selected works in product design, creative development, and experimental builds."
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
      <section className="relative bg-[var(--background)] py-28 px-6 flex justify-center scanlines">
        <div className="max-w-xl text-center text-[15px] leading-[2] tracking-wide">
          <p>
            <span className="highlight-box">
              I design and build digital experiences that blend bold
            </span>{" "}
            <span className="highlight-box">
              visual storytelling with precise engineering. Every project
            </span>{" "}
            <span className="highlight-box">
              starts with curiosity and ends with something worth shipping.
            </span>{" "}
            <span className="highlight-box">
              From brand identity to interactive web, this is the work.
            </span>
          </p>
        </div>
      </section>

      {/* ================= DIAGONAL BAND ================= */}
      <section className="relative bg-[var(--background)] py-20 overflow-hidden">
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

        <div className="mt-16 max-w-md mx-auto text-center text-[12px] leading-[1.9] text-white/45 px-6">
          A collection of selected works spanning product design, creative
          development, and experimental builds. Each piece reflects a
          specific moment, constraint, and collaboration.
        </div>
      </section>

      {/* ================= DEPTH-SCAN INTERLUDE ================= */}
      <section id="work" className="relative w-full bg-black">
        <HeroFuturistic
          title="Build Your Dreams"
          subtitle="Design, code, and machine learning — welded together."
          tint={[10, 1.2, 5]}
          scanColor={[1, 0.34, 0.64]}
          exploreLabel="Scroll to explore"
          onExplore={() => scrollTo("projects")}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 z-10 edge-fade-top"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 z-10 edge-fade-bottom"
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
          href="mailto:hello@example.com"
          className="px-8 py-2 font-black tracking-widest text-sm border-2 border-[var(--color-lime)] text-[var(--color-lime)] transition-colors hover:bg-[var(--color-lime)] hover:text-black"
          style={{ fontFamily: "Impact, sans-serif" }}
        >
          Say Hello
        </a>
      </section>
    </div>
  );
}
