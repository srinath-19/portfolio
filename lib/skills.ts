/**
 * Mirrors `mydata/myskills.md` — that file stays the source of truth, this is
 * the shape the UI consumes. Same rule as `lib/projects.ts`: structural data
 * only, no imports from a `"use client"` module. Nodes name their icon with a
 * plain string `key`, which `components/ui/tech-icons.tsx` resolves; that keeps
 * `lib/` free of React components.
 *
 * Two deliberate choices worth knowing before editing:
 *
 * 1. `nodes` holds only technologies that have a real brand mark. Everything
 *    else from the md file — RAG techniques, fine-tuning methods, API patterns
 *    — lives in `concepts` and renders as text. Inventing a logo for
 *    "Reciprocal Rank Fusion" would look like a logo and mean nothing.
 *
 * 2. Duplicates across clusters are intentional. PostgreSQL, Redis, Hugging
 *    Face, Modal, Pydantic and TypeScript each genuinely serve two roles here,
 *    and seeing a mark twice reads as range rather than as a bug.
 *
 * Cluster sizes are uneven on purpose (3 → 17); the field scales each cluster's
 * radius from its own node count so the imbalance looks composed.
 */

// Type-only, so nothing from the client module reaches the runtime bundle —
// but a typo in any `key` below is now a build error rather than a blank node.
import type { TechKey } from "@/components/ui/tech-icons";

export interface SkillNode {
  key: TechKey;
  name: string;
}

export interface SkillCluster {
  id: string;
  label: string;
  /** Drawn inside the cluster, where only a short single line fits. The full
   *  `label` still carries the aria-label and the readout heading. */
  short: string;
  /** Colour of the cluster's core glow and its active-state accents. */
  accent: string;
  nodes: SkillNode[];
  /** The un-brandable half of the category: shown as text in the readout. */
  concepts: string[];
}

export const skillClusters: SkillCluster[] = [
  {
    id: "languages",
    label: "Languages",
    short: "Languages",
    accent: "#cdfb52",
    nodes: [
      { key: "python", name: "Python" },
      { key: "typescript", name: "TypeScript" },
      { key: "javascript", name: "JavaScript" },
      { key: "cpp", name: "C++" },
      { key: "java", name: "Java" },
      { key: "bash", name: "Bash" },
      { key: "html", name: "HTML" },
      { key: "css", name: "CSS" },
    ],
    concepts: ["SQL"],
  },
  {
    id: "llm",
    label: "LLM & Agentic AI",
    short: "LLM & Agents",
    accent: "#f756a3",
    nodes: [
      { key: "openai", name: "OpenAI" },
      { key: "mcp", name: "MCP" },
      { key: "langchain", name: "LangChain" },
      { key: "langgraph", name: "LangGraph" },
      { key: "huggingface", name: "Hugging Face" },
      { key: "vllm", name: "vLLM" },
      { key: "modal", name: "Modal" },
      { key: "meta", name: "Meta LLaMA 3.2" },
      { key: "pydantic", name: "Pydantic" },
    ],
    concepts: [
      "Agentic AI",
      "OpenAI Agents SDK",
      "function & tool calling",
      "multi-agent orchestration",
      "intent classification & routing",
      "LiteLLM",
      "streaming responses",
      "prompt caching",
      "structured outputs",
      "GPT-4o Vision",
      "prompt-injection detection",
      "PII redaction",
      "LoRA / PEFT",
      "QLoRA (4-bit NF4)",
      "bitsandbytes",
      "TRL / SFTTrainer",
    ],
  },
  {
    id: "retrieval",
    label: "Retrieval & RAG",
    short: "RAG",
    accent: "#a855f7",
    nodes: [
      { key: "postgresql", name: "pgvector" },
      { key: "chroma", name: "ChromaDB" },
      { key: "openai", name: "OpenAI Embeddings" },
    ],
    concepts: [
      "hybrid retrieval",
      "Postgres full-text search",
      "Reciprocal Rank Fusion",
      "LLM reranking",
      "query rewriting",
      "knowledge-graph traversal / GraphRAG",
      "multi-hop Q&A",
      "hierarchical chunking",
      "idempotent batch embedding upserts",
      "citation verification & self-correction",
      "text-embedding-3-large",
    ],
  },
  {
    id: "dl",
    label: "Deep Learning, CV & NLP",
    short: "Deep Learning",
    accent: "#22d3ee",
    nodes: [
      { key: "pytorch", name: "PyTorch" },
      { key: "tensorflow", name: "TensorFlow" },
      { key: "scikitlearn", name: "scikit-learn" },
      { key: "numpy", name: "NumPy" },
      { key: "pandas", name: "pandas" },
      { key: "opencv", name: "OpenCV" },
      { key: "cuda", name: "CUDA" },
      { key: "huggingface", name: "Transformers" },
    ],
    concepts: [
      "YOLO (v5x / v8 / v12, OBB)",
      "ResNet-50",
      "ViT",
      "BERT",
      "DeBERTa-v3",
      "LSTM decoders",
      "attention fusion",
      "multi-task learning",
      "warm-start / transfer learning",
      "tiled sliding-window inference",
      "homography-based spatial filtering",
      "Shapely geometry",
      "OR-Tools CP-SAT",
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    short: "Backend",
    accent: "#cdfb52",
    nodes: [
      { key: "fastapi", name: "FastAPI" },
      { key: "django", name: "Django" },
      { key: "flask", name: "Flask" },
      { key: "nodejs", name: "Node.js" },
      { key: "express", name: "Express.js" },
      { key: "springboot", name: "Spring Boot" },
      { key: "socketio", name: "Socket.IO" },
      { key: "celery", name: "Celery" },
      { key: "redis", name: "Redis Streams" },
      { key: "kafka", name: "Kafka" },
      { key: "swagger", name: "Swagger" },
      { key: "openapi", name: "OpenAPI" },
      { key: "pydantic", name: "Pydantic" },
      { key: "sqlalchemy", name: "SQLAlchemy" },
      { key: "prisma", name: "Prisma ORM" },
      { key: "pytest", name: "pytest" },
      { key: "openid", name: "OAuth2 / OIDC" },
      { key: "jwt", name: "JWT & JWKS" },
    ],
    concepts: [
      "REST",
      "Alembic",
      "asyncio",
      "BCrypt",
      "keyset pagination",
      "connection pooling",
      "response caching with TTL",
      "outbox pattern",
    ],
  },
  {
    id: "data",
    label: "Data & Storage",
    short: "Data",
    accent: "#60a5fa",
    nodes: [
      { key: "postgresql", name: "PostgreSQL" },
      { key: "mysql", name: "MySQL" },
      { key: "mongodb", name: "MongoDB" },
      { key: "redis", name: "Redis" },
      { key: "upstash", name: "Upstash Redis" },
      { key: "supabase", name: "Supabase" },
      { key: "minio", name: "MinIO" },
      { key: "chroma", name: "ChromaDB" },
    ],
    concepts: ["pgvector", "Supabase Auth & RLS", "Cloud SQL", "Cloud Redis"],
  },
  {
    id: "cloud",
    label: "Cloud & DevOps",
    short: "Cloud & DevOps",
    accent: "#fb923c",
    nodes: [
      { key: "googlecloud", name: "Google Cloud" },
      { key: "aws", name: "AWS" },
      { key: "docker", name: "Docker" },
      { key: "kubernetes", name: "Kubernetes" },
      { key: "terraform", name: "Terraform" },
      { key: "githubactions", name: "GitHub Actions" },
      { key: "railway", name: "Railway" },
      { key: "modal", name: "Modal" },
      { key: "git", name: "Git" },
      { key: "maven", name: "Apache Maven" },
    ],
    concepts: [
      "Cloud Run",
      "App Engine",
      "Compute Engine",
      "ALB",
      "CloudFront",
      "CloudWatch",
    ],
  },
  {
    id: "mlops",
    label: "Evals, Monitoring & MLOps",
    short: "Evals & MLOps",
    accent: "#f756a3",
    nodes: [
      { key: "wandb", name: "Weights & Biases" },
      { key: "mlflow", name: "MLflow" },
      { key: "k6", name: "k6 load testing" },
      { key: "langchain", name: "LangSmith" },
    ],
    concepts: [
      "LangSmith tracing",
      "LLM-as-a-judge pipelines",
      "MRR / nDCG / keyword coverage",
      "structured JSON logging",
      "latency, error-rate & token-usage metrics",
      "CloudWatch",
      "UptimeRobot",
      "model checkpointing",
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    short: "Frontend",
    accent: "#06b6d4",
    nodes: [
      { key: "nextjs", name: "Next.js" },
      { key: "react", name: "React" },
      { key: "typescript", name: "TypeScript" },
      { key: "tailwind", name: "Tailwind CSS" },
      { key: "gradio", name: "Gradio" },
    ],
    concepts: ["Web Speech API (wake word, TTS)"],
  },
];
