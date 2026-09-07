/**
 * Single source of truth for the Featured Work orbit in `app/page.tsx`.
 * Mirrors `mydata/projects.md` — update both together.
 */

export type ProjectCategory = "ai" | "backend" | "vision";

/** Shown on the flipped card face and in the detail modal. */
export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  ai: "AI & LLM",
  backend: "Backend",
  vision: "Vision & NLP",
};

export interface Project {
  name: string;
  tagline: string;
  category: ProjectCategory;
  /**
   * Basename of a card in `/public/cards`. Those are the originals from
   * `mydata/pictures`, resampled to 360px wide WebP — the source PNGs are
   * ~1.8MB each and render at roughly a sixth of their pixel size.
   */
  card: string;
  /** Public GitHub URL, taken from the `**Repo:**` line in `mydata/projects.md`. */
  repo: string;
  /**
   * One or two sentences written *for the modal*. Deliberately not a resume
   * bullet — those run two to three lines each and turn the panel into a
   * scrolling reader rather than a card you glance at.
   */
  summary: string;
  /**
   * Chips under the summary. Curated by hand rather than split out of the
   * markdown's `**Stack:**` line: entries there like
   * `OpenAI Agents SDK (function calling, GPT-4o Vision)` carry commas inside
   * parentheses, so splitting on `,` shreds them.
   */
  stack: string[];
  /** Three short lines, condensed from the bullets in `mydata/projects.md`. */
  highlights: string[];
}

/**
 * Ranked, not arbitrary: the deck runs Ace → 3 in the order the projects
 * appear in `mydata/projects.md`, so the flagship work carries the face
 * cards. `joker` and `2` are unused spares — a thirteenth project takes `2`.
 */
const entries: Project[] = [
  // AI & LLM Systems
  {
    card: "ace",
    name: "GymBuddy",
    tagline: "Voice-first AI workout companion",
    category: "ai",
    repo: "https://github.com/srinath-19/GymBuddy",
    summary:
      "A voice-first workout companion with three surfaces: a natural-language logger with automatic PR detection, a GPT-4o Vision coach that reads equipment from the camera, and a real-time set pacer that logs to the database on completion.",
    stack: [
      "Next.js",
      "FastAPI",
      "OpenAI Agents SDK",
      "GPT-4o Vision",
      "Supabase",
      "Upstash Redis",
      "Web Speech API",
      "Cloud Run",
    ],
    highlights: [
      "4-agent orchestration — an intent classifier routing to 3 specialists across 23 function-calling tools.",
      "Streaming responses with inline TTS and “GymBuddy” wake-word detection over a continuous Speech API session.",
      "Google OAuth with JWKS validation, a cache-first Redis layer with DB fallback, and CI/CD to Cloud Run.",
    ],
  },
  {
    card: "king",
    name: "PricePilot",
    tagline: "LLM fine-tuning and high-throughput serving",
    category: "ai",
    repo: "https://github.com/srinath-19/PricePilot_Fine-Tune_LLaMA-3.2",
    summary:
      "An end-to-end pricing pipeline: curate an 820K-item supervised dataset through the OpenAI Batch API, fine-tune LLaMA 3.2 3B on it, and serve the result at production throughput.",
    stack: [
      "QLoRA",
      "PEFT",
      "bitsandbytes",
      "Hugging Face TRL",
      "vLLM",
      "LiteLLM",
      "Weights & Biases",
      "Google Cloud",
    ],
    highlights: [
      "820K-item dataset preprocessed in 1000-item OpenAI batches, splits published to the Hugging Face Hub.",
      "4-bit NF4 QLoRA over attention and MLP projections, trained on an A100 with checkpointing to the Hub.",
      "vLLM on GCP serving the base model with 3 LoRA adapters — 18 req/s at p95 0.9s, 55 output tok/s.",
    ],
  },
  {
    card: "queen",
    name: "DealHunter AI",
    tagline: "Multi-agent deal discovery engine",
    category: "ai",
    repo:
      "https://github.com/srinath-19/DealHunter_AI-Autonomous-Multi-Agent-Deal-Discovery-Engine",
    summary:
      "Five agents under a planning agent that decides on its own when to scan, price and notify — a self-directed loop that runs without human intervention.",
    stack: [
      "OpenAI function calling",
      "LiteLLM",
      "ChromaDB",
      "Modal",
      "QLoRA",
      "Pydantic",
      "Gradio",
    ],
    highlights: [
      "Planning agent orchestrates 5 specialists via function calling, choosing its own next action each cycle.",
      "A fine-tuned LLaMA 3.2-3B on Modal's serverless GPUs powers real-time pricing at 60+ output tok/s.",
      "ScannerAgent scrapes live RSS with persistent dedup memory; MessagingAgent pushes via the Pushover API.",
    ],
  },
  {
    card: "jack",
    name: "Document Copilot",
    tagline: "Financial document RAG platform",
    category: "ai",
    repo: "https://github.com/srinath-19/Full_Stack_RAG",
    summary:
      "An enterprise RAG platform for complex financial filings, delivering streaming, citable Q&A over hybrid retrieval that fuses vector similarity with full-text search.",
    stack: [
      "FastAPI",
      "React",
      "TypeScript",
      "Supabase Postgres",
      "pgvector",
      "SQLAlchemy",
      "Alembic",
      "Railway",
    ],
    highlights: [
      "Hybrid retrieval — pgvector cosine over OpenAI embeddings fused with Postgres FTS by Reciprocal Rank Fusion.",
      "Ingestion pipeline handling HTML-to-Markdown, table preservation, hierarchical chunking and idempotent upserts.",
      "An agentic self-correction layer validates citations with Pydantic schemas to eliminate hallucinations.",
    ],
  },
  {
    card: "10",
    name: "GraphFusion RAG",
    tagline: "Hybrid graph + vector retrieval",
    category: "ai",
    repo: "https://github.com/srinath-19/GraphFusion_RAG",
    summary:
      "A GraphRAG platform that combines vector search with knowledge-graph traversal, so multi-hop questions can be answered from internal Markdown docs.",
    stack: [
      "text-embedding-3-large",
      "ChromaDB",
      "LiteLLM",
      "Pydantic",
      "pytest",
      "Gradio",
    ],
    highlights: [
      "Query rewriting, dual semantic retrieval and LLM reranking over the top-k candidates.",
      "Knowledge-graph traversal layered on ChromaDB vector search to reach multi-hop answers.",
      "Evaluation harness on MRR, nDCG, keyword coverage and LLM-as-a-judge, plus unit tests for hop limits and dedup.",
    ],
  },
  {
    card: "9",
    name: "Production LLM API",
    tagline: "FastAPI + LangGraph endpoint",
    category: "ai",
    repo: "https://github.com/srinath-19/Production_LLM_API_Endpoint",
    summary:
      "A production-shaped LLM endpoint built around the parts that are usually an afterthought: a security pipeline in front, caching in the middle, and real observability around all of it.",
    stack: [
      "FastAPI",
      "LangGraph",
      "LangChain",
      "LangSmith",
      "Redis",
      "Postgres",
      "Pydantic",
      "Docker",
    ],
    highlights: [
      "Prompt-injection detection across 9 attack classes, bidirectional PII redaction and output filtering.",
      "Redis response caching with TTL expiry, shared across horizontally scaled instances.",
      "Structured JSON logging, latency/error/token metrics, LangSmith tracing and automatic model failover.",
    ],
  },
  {
    card: "8",
    name: "Autonomous Traders",
    tagline: "Multi-agent AI stock trading system",
    category: "ai",
    repo: "https://github.com/srinath-19/Autonomous_Traders_MCP-AGENTS-TOOLS",
    summary:
      "Four AI trader agents running concurrent trade and rebalance cycles against live market data — each reads its portfolio, researches through a sub-agent, executes, and reports.",
    stack: [
      "OpenAI Agents SDK",
      "Model Context Protocol",
      "SQLite",
      "LibSQL",
      "Polygon.io",
      "Asyncio",
      "Pydantic",
      "Gradio",
    ],
    highlights: [
      "Traders alternate between seeking new opportunities and rebalancing, running concurrent cycles under asyncio.",
      "A Researcher Agent keeps per-trader knowledge graphs in LibSQL; 3 MCP servers expose portfolio, price and notification tools.",
      "Live Gradio dashboard with activity logs, portfolio value charts, holdings and transaction history.",
    ],
  },

  // Distributed Systems & Backend
  {
    card: "7",
    name: "BuffRelay",
    tagline: "Distributed WebSocket messaging",
    category: "backend",
    repo: "https://github.com/srinath-19/backend_buzzbuddy",
    summary:
      "A room-based collaboration platform that holds concurrent users end-to-end on Cloud Run, with shareable rooms behind short-lived scoped invites.",
    stack: [
      "Next.js",
      "Node.js",
      "Socket.IO",
      "Redis adapter",
      "Postgres",
      "Prisma",
      "Kafka",
      "Cloud Run",
    ],
    highlights: [
      "Scoped JWT room invites on a 15-minute TTL make links shareable without opening the room up.",
      "Socket.IO Redis adapter for cross-node broadcast — p95 68ms across 1,500 active rooms.",
      "Keyset pagination over Prisma/Postgres and a Kafka outbox at ~20k msgs/s produce, ~19k consume.",
    ],
  },
  {
    card: "6",
    name: "Music-Separation K8s",
    tagline: "Kubernetes audio stem pipeline",
    category: "backend",
    repo: "https://github.com/srinath-19/Music-seperation-Kubernetes",
    summary:
      "Splits a song into stems — vocals, bass, drums and more — with every stage of the pipeline running in its own Kubernetes pod.",
    stack: ["Kubernetes", "Docker", "Redis Streams", "MinIO", "REST", "Python"],
    highlights: [
      "Median job time down ~30% against a single-VM Python baseline: 92s → 64s across 100 runs.",
      "Redis Streams for async scheduling, back-pressure and reliable multi-stage delivery between workers.",
      "MinIO object storage for all audio I/O — 5.4s cold cross-pod retrieval, 1.8s warm.",
    ],
  },

  // Computer Vision & NLP
  {
    card: "5",
    name: "ARGONAUT",
    tagline: "Vision-language QA on VizWiz",
    category: "vision",
    repo: "https://github.com/srinath-19/ARGONAUT-Vision-Language-QA-on-VizWiz",
    summary:
      "Given an image and a question, the model first predicts whether the question is answerable at all — and if it is, generates a concise answer.",
    stack: [
      "PyTorch",
      "ViT",
      "Hugging Face BERT",
      "LSTM decoder",
      "CUDA",
      "NumPy",
    ],
    highlights: [
      "ViT image encoder fused with a BERT text encoder through attention, into an MLP head.",
      "60% validation accuracy on answers and 94% on answerability, at 45ms/image on CUDA.",
      "Full pipeline: padding-aware collate and loss, parallel I/O, and a 2-layer LSTM decoder with top-k sampling.",
    ],
  },
  {
    card: "4",
    name: "Clarity",
    tagline: "Unmasking political question evasions",
    category: "vision",
    repo:
      "https://github.com/srinath-19/Clarity-Unmasking_Political_Question_Evasions",
    summary:
      "A multi-task model that reads a political Q&A exchange and predicts, in one forward pass, both how clear the response was and which evasion strategy it used.",
    stack: [
      "PyTorch",
      "DeBERTa-v3",
      "Hugging Face Transformers",
      "scikit-learn",
      "pandas",
      "NumPy",
    ],
    highlights: [
      "Dual classification heads over a shared encoder — 3 clarity classes and 9 evasion strategies at once.",
      "Warm-start training: fine-tune the encoder on clarity alone first, then converge the joint model faster.",
      "0.70 macro-F1 on clarity prediction, with one forward pass serving both tasks for sample efficiency.",
    ],
  },
  {
    card: "3",
    name: "CourtVision",
    tagline: "Player, ball and court tracking",
    category: "vision",
    repo: "https://github.com/srinath-19/Tennis_analysis_ball-player-court",
    summary:
      "Automated tennis analysis that detects and tracks the players, the ball and 14 court keypoints, then filters detections against the court itself.",
    stack: [
      "PyTorch",
      "YOLOv12",
      "YOLOv5x",
      "ResNet-50",
      "OpenCV",
      "CUDA",
      "NumPy",
    ],
    highlights: [
      "YOLOv12 for players at AP50 > 95%, and a fine-tuned YOLOv5x lifting ball recall from 60% to 90%.",
      "ResNet-50 court keypoints feeding homography-based spatial filtering and ID tracking.",
      "Court-aware filtering projects detections onto the court plane, cutting non-player false positives by 100%.",
    ],
  },
];

export const projects: Project[] = entries;

/**
 * `CardOrbit`'s item shape, so `page.tsx` stays declarative. Kept structural
 * rather than importing the component's type — `lib/` should not depend on a
 * `"use client"` module.
 *
 * Index-aligned with `projects` by construction, and the detail modal relies
 * on that: the orbit reports the index of the card that was clicked, and the
 * modal looks the full project up at the same index.
 */
export const projectCards = projects.map((project) => ({
  id: project.name,
  image: `/cards/${project.card}.webp`,
  alt: `${project.name} — ${project.tagline}`,
  title: project.name,
  subtitle: project.tagline,
  meta: CATEGORY_LABEL[project.category],
}));
