"use client";

import { motion } from "framer-motion";

/**
 * Right-hand column of the hero. Non-functional on purpose — it reserves the
 * layout for the RAG chatbot that will answer questions about my work, and
 * says so plainly rather than pretending to be live.
 */
const SUGGESTIONS = [
  "What has he shipped with LLMs?",
  "Show me the computer-vision work",
  "Is he open to relocating?",
];

export const ChatPanelPlaceholder = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
    className="relative ml-auto w-full max-w-md"
  >
    <div
      aria-hidden
      className="absolute -inset-6 rounded-[2rem] opacity-70 blur-3xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(247,86,163,0.28) 0%, transparent 70%)",
      }}
    />

    <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.035] backdrop-blur-xl">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{
              background: "var(--color-lime)",
              boxShadow: "0 0 10px var(--color-lime)",
            }}
          />
          <span className="text-[10px] font-black tracking-[0.22em] text-white/80 uppercase">
            Ask About My Work
          </span>
        </div>
        <span className="rounded-full border border-white/15 px-2.5 py-1 text-[9px] tracking-[0.18em] text-white/45 uppercase">
          Coming soon
        </span>
      </div>

      {/* preview transcript */}
      <div className="space-y-3 px-5 py-6">
        <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm border border-[color:var(--color-pink)]/35 bg-[color:var(--color-pink)]/12 px-4 py-2.5 text-[13px] text-white/85">
          What does Srinath build?
        </div>
        <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-4 py-2.5 text-[13px] leading-relaxed text-white/70">
          Agentic AI systems, fine-tuned LLMs, and the retrieval pipelines and
          backends that serve them
          <span className="ml-1 inline-flex gap-1 align-middle">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-white/50"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.18,
                  ease: "easeInOut",
                }}
              />
            ))}
          </span>
        </div>
      </div>

      {/* suggestion chips */}
      <div className="flex flex-wrap gap-2 px-5 pb-5">
        {SUGGESTIONS.map((s) => (
          <span
            key={s}
            className="rounded-full border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/45"
          >
            {s}
          </span>
        ))}
      </div>

      {/* inert composer */}
      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <div className="flex-1 text-[13px] text-white/30">
          Chat with my portfolio&hellip;
        </div>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white/30"
          aria-hidden
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </div>
  </motion.div>
);

export default ChatPanelPlaceholder;
