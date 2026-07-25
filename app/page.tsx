"use client";

import Hero from "@/components/ui/animated-shader-hero";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden select-none">
      {/* ================= HERO ================= */}
      <div className="relative">
        {/* Top Navigation overlay */}
        <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-center gap-4 sm:gap-8 pt-6 text-[11px] tracking-[0.2em] uppercase font-semibold text-white">
          <a href="#work" className="hidden sm:inline hover:opacity-70">Work</a>
          <a href="#about" className="hidden sm:inline hover:opacity-70">About</a>
          <span className="font-black tracking-widest mx-4 text-sm">
            ◆ PORTFOLIO ◆
          </span>
          <a href="#projects" className="hidden sm:inline hover:opacity-70">Projects</a>
          <a href="#contact" className="hidden sm:inline hover:opacity-70">Contact</a>
        </nav>

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
              onClick: () => {
                document
                  .getElementById("projects")
                  ?.scrollIntoView({ behavior: "smooth" });
              },
            },
            secondary: {
              text: "Get In Touch",
              onClick: () => {
                document
                  .getElementById("contact")
                  ?.scrollIntoView({ behavior: "smooth" });
              },
            },
          }}
        />
      </div>

      {/* ================= EDITORIAL TEXT BLOCK ================= */}
      <section className="bg-white py-28 px-6 flex justify-center">
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
      <section className="relative bg-white py-20 overflow-hidden">
        <div className="diagonal-band h-16 flex items-center overflow-hidden whitespace-nowrap">
          <div className="flex gap-10 px-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="text-white font-black text-2xl tracking-widest"
              >
                ✦
              </span>
            ))}
          </div>
        </div>

        <div className="mt-16 max-w-md mx-auto text-center text-[12px] leading-[1.9] text-black/70 px-6">
          A collection of selected works spanning product design, creative
          development, and experimental builds. Each piece reflects a
          specific moment, constraint, and collaboration.
        </div>
      </section>

      {/* ================= FEATURED PROJECT ================= */}
      <section
        id="projects"
        className="relative py-28 px-6 overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, #3b2860 0%, #1a1030 50%, #0b0718 100%)",
        }}
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-white/80 text-xs tracking-[0.2em] uppercase mb-14">
            Featured Work
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="relative w-full aspect-[3/4] bg-gradient-to-b from-[#e8e8ea] to-[#b8b8bd] rounded-md shadow-2xl border-2 border-[#8a8a90]"
              >
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest text-black/70">
                    PROJECT_0{n}
                  </span>
                  <span className="w-3 h-3 rounded-full bg-[var(--color-red)]" />
                </div>
                <div className="absolute inset-x-4 top-14 bottom-14 bg-gradient-to-b from-[#d0d0d4] to-[#9a9aa0] rounded-sm border border-[#7a7a80]" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-black/60">v1.0</span>
                  <span className="text-[9px] font-mono text-black/60">2025</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PICK YOUR CLAN ================= */}
      <section id="about" className="relative w-full">
        <div className="clan-grid w-full">
          <div className="relative bg-[#3aa6a0] min-h-[520px] flex items-end justify-center p-8 overflow-hidden">
            <div className="relative w-40 h-72 bg-gradient-to-b from-[#1a4a47] to-[#0a2a28] rounded-t-[50%]" />
            <div className="absolute bottom-6 left-6 text-white text-xs font-black tracking-widest uppercase">
              Design
            </div>
          </div>
          <div className="relative bg-[var(--color-pink)] min-h-[520px] flex items-end justify-center p-8 overflow-hidden">
            <div className="relative w-44 h-72 bg-gradient-to-b from-[#4a1a3a] to-[#1a0a1a] rounded-t-[50%]" />
            <div className="absolute bottom-6 right-6 text-white text-xs font-black tracking-widest uppercase">
              Engineering
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[var(--color-red)] px-10 py-6 shadow-2xl">
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
        className="bg-white py-32 flex flex-col items-center justify-center gap-8 px-6 text-center"
      >
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
          <span className="w-3 h-3 rounded-full bg-[var(--color-accent)]" />
        </div>
        <h2 className="section-title text-[clamp(1.75rem,4vw,3rem)] uppercase text-black">
          Let&apos;s Build Something
        </h2>
        <a
          href="mailto:hello@example.com"
          className="px-8 py-2 text-black font-black tracking-widest text-sm border-2 border-black hover:bg-black hover:text-white transition-colors"
          style={{ fontFamily: "Impact, sans-serif" }}
        >
          Say Hello
        </a>
      </section>
    </div>
  );
}
