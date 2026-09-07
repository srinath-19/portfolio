# Projects

> Repo links marked `TBD` need real URLs before they get wired into the site — the resume showed a link label but no address.

## AI & LLM Systems

### GymBuddy — Voice-First AI Workout Companion
**Stack:** Next.js, FastAPI, Python, OpenAI Agents SDK (function calling, GPT-4o Vision), Supabase (Postgres, Auth), SQLAlchemy async, Upstash Redis, Web Speech API, Docker, Google Cloud Run, GitHub Actions
**Repo:** https://github.com/srinath-19/GymBuddy

- Built a voice-first workout companion with three surfaces: a natural-language workout logger with automatic PR detection and AI-inferred muscle-group mapping, a GPT-4o Vision exercise coach that identifies equipment from camera images and delivers form guidance with YouTube tutorials, and a real-time workout pacer with set tracking, plan modification (add/remove/swap), and automatic DB logging on completion.
- Designed a 4-agent orchestration system on the OpenAI Agents SDK — an intent classifier routing to 3 specialist agents with 23 combined function-calling tools — delivering streaming responses with inline TTS for hands-free use.
- Engineered production infrastructure with Google OAuth (JWKS JWT validation), a cache-first layer via Upstash Redis with DB fallback, "GymBuddy" wake-word detection over a continuous Web Speech API session, and CI/CD to Google Cloud Run.

### PricePilot — LLM Fine-Tuning and High-Throughput Serving for Price Prediction
**Stack:** OpenAI API (Batch API, Fine-Tuning API), Hugging Face, QLoRA, bitsandbytes, LiteLLM, vLLM, Google Cloud
**Repo:** https://github.com/srinath-19/PricePilot_Fine-Tune_LLaMA-3.2

- Built an end-to-end LLM pricing pipeline, curating an 820K-item supervised dataset preprocessed via OpenAI batch processing (1000-item batches) to produce structured training signals, and uploaded the splits to the Hugging Face Hub.
- Fine-tuned Meta LLaMA 3.2 3B using QLoRA (4-bit NF4 quantization) with PEFT/LoRA targeting attention and MLP projection layers; trained on an A100 GPU using HF TRL's SFTTrainer with bitsandbytes, tracking experiments in Weights & Biases with periodic checkpointing to the Hugging Face Hub.
- Deployed vLLM on a GCP VM to serve LLaMA 3.2-3B as the base model with 3 LoRA adapters (request-level routing), sustaining 18 req/s at p95 0.9s for short prompts (200 input tokens) with 55 output tok/s throughput.

### DealHunter AI — Multi-Agent Deal Discovery Engine
**Stack:** Python, OpenAI API (function calling, Batch API, Fine-Tuning API), LiteLLM, ChromaDB, Modal (serverless GPU), Pydantic, Gradio
**Repo:** https://github.com/srinath-19/DealHunter_AI-Autonomous-Multi-Agent-Deal-Discovery-Engine

- Built an autonomous 5-agent framework orchestrated by a planning agent using OpenAI function-calling that independently decides when to scan, price, and notify in a self-directed loop without human intervention.
- Fine-tuned LLaMA 3.2-3B (QLoRA) on an 820K-item dataset curated via the OpenAI Batch API to power the agent's real-time pricing intelligence, deployed on Modal's serverless GPUs and auto-scaling to sustain 60+ output tokens/s.
- Engineered a ScannerAgent that scrapes live RSS feeds with persistent memory deduplication using Pydantic structured outputs for validation, while a MessagingAgent crafts push notifications delivered via the Pushover API.

### Document Copilot — Enterprise Financial Document RAG Platform
**Stack:** Python, FastAPI, React, TypeScript, Supabase Postgres, pgvector, SQLAlchemy, OpenAI API, Pydantic, Alembic, Railway
**Repo:** https://github.com/srinath-19/Full_Stack_RAG

- Built an enterprise RAG platform on Supabase Postgres (pgvector) and FastAPI, integrating hybrid retrieval — pgvector cosine similarity over OpenAI embeddings fused with Postgres full-text search via Reciprocal Rank Fusion — to deliver streaming, citable Q&A over complex financial documents.
- Engineered an automated document ingestion pipeline that dynamically updates the cloud vector database, handling HTML-to-Markdown normalization, table structure preservation, hierarchical chunking, and idempotent batch embedding upserts for incoming SEC filings.
- Implemented an agentic self-correction layer using Pydantic schema validation to verify citation accuracy and eliminate hallucinations, backed by Alembic schema migrations, Supabase RLS policies, and Railway cloud hosting.

### GraphFusion RAG — Hybrid Graph + Vector Retrieval Engine
**Stack:** Python, OpenAI API, LiteLLM, Pydantic (structured outputs), embeddings, ChromaDB, pytest, Gradio
**Repo:** https://github.com/srinath-19/GraphFusion_RAG

- Built a hybrid GraphRAG platform that embeds internal Markdown docs with OpenAI text-embedding-3-large, indexes them in ChromaDB, and combines vector search with knowledge-graph traversal to enable multi-hop Q&A — with query rewriting, dual semantic retrieval, and LLM reranking over top-k candidates.
- Developed an evaluation framework using MRR, nDCG, keyword coverage, and LLM-as-a-judge metrics to benchmark and improve answer accuracy, plus unit tests for graph traversal logic, deduplication, hop limits, and edge-case handling.

### Production LLM API — Production-Ready FastAPI + LangGraph Endpoint
**Stack:** Python, FastAPI, LangGraph, LangChain, OpenAI API, LangSmith, Pydantic, Docker, Redis, Postgres
**Repo:** https://github.com/srinath-19/Production_LLM_API_Endpoint

- Built a security pipeline with prompt-injection detection across 9 attack classes, bidirectional PII redaction, and output filtering, designed for deployment behind an API Gateway with JWT authentication.
- Implemented response caching with Redis and TTL expiration to deduplicate LLM calls and reduce inference costs, with shared state across horizontally scaled instances.
- Instrumented observability with structured JSON logging, real-time metrics for latency, error rate, and token usage, LangSmith tracing, and a LangGraph state machine with automatic model failover.

### Autonomous Traders — Multi-Agent AI Stock Trading System
**Stack:** Python, OpenAI Agents SDK, Model Context Protocol (MCP), SQLite, LibSQL, Polygon.io (Market Data), Pushover (Notifications), Gradio (Dashboard), Asyncio (Concurrency), Pydantic (Data Models)
**Repo:** https://github.com/srinath-19/Autonomous_Traders_MCP-AGENTS-TOOLS

- Built a fully autonomous stock trading simulation with four AI trader agents running concurrent trade/rebalance cycles—each agent reads portfolio state, researches markets via a sub-agent, executes buy/sell operations against live market data, and sends notifications with alternating modes for seeking new opportunities vs. rebalancing.
- Engineered a dual-agent orchestration system using OpenAI Agents SDK with configurable multi-model LLM routing—the Researcher Agent maintains per-trader persistent knowledge graphs (LibSQL) for cross-trader learning, while three MCP servers expose function-calling tools for portfolio management, price lookups, and notifications.
- Deployed a production-ready platform with SQLite backend, real-time Gradio dashboard featuring live activity logs, portfolio value charts, holdings tables, and transaction history—supports configurable run frequency and Docker-ready deployment.

---

## Distributed Systems & Backend

### BuffRelay — Distributed WebSocket Messaging Platform
**Stack:** Next.js, Node.js, Socket.IO, Redis adapter, Postgres, Prisma ORM, Kafka, OAuth, Google Cloud Run
**Repo:** https://github.com/srinath-19/backend_buzzbuddy

- Built a room-based collaboration platform that sustained concurrent users end-to-end on Google Cloud Run, with shareable, secure room links via scoped JWT invites (15-minute TTL).
- Scaled cross-node broadcast using the Socket.IO Redis adapter, holding broadcast p95 at 68 ms across 1,500 active rooms.
- Used Prisma and Postgres with keyset pagination and emitted message events through a Kafka outbox, achieving ~20k msgs/s produce and ~19k msgs/s consume on a fully cloud-managed stack.

### Music-Separation Kubernetes
**Stack:** Kubernetes, Docker, Redis, MinIO, REST, Python
**Repo:** https://github.com/srinath-19/Music-seperation-Kubernetes

- Built a pipeline that separates songs into stems (vocals, bass, drums, and more), with each stage running in its own Kubernetes pod — reducing median job time by ~30% against a single-VM Python baseline (92s → 64s across 100 runs).
- Used Redis Streams for async scheduling, back-pressure, and reliable multi-stage delivery between workers, and MinIO for distributed object storage managing all audio I/O, enabling fast cross-pod retrieval (5.4s cold, 1.8s warm).

---

## Computer Vision & NLP

### ARGONAUT — Vision-Language QA on VizWiz
**Stack:** PyTorch, ViT, Hugging Face BERT, CUDA, NLP, deep learning
**Repo:** https://github.com/srinath-19/ARGONAUT-Vision-Language-QA-on-VizWiz

- Given an image and a question, the system first predicts answerability; if answerable, it generates a concise answer.
- Combined a ViT image encoder with a BERT text encoder via attention fusion and an MLP head — 60% validation accuracy on answers and 94% on answerability, processing 45 ms/image at 224x224, batch 1, on CUDA.
- Built the full pipeline: 224x224 transforms and normalization, BERT tokenization and attention masks, padding-aware collate and loss, parallel I/O, a 2-layer LSTM decoder with teacher forcing and top-k sampling, and a reproducible train/validation harness.

### Clarity — Unmasking Political Question Evasions
**Stack:** PyTorch, Hugging Face Transformers, scikit-learn, pandas, NumPy, Python
**Repo:** https://github.com/srinath-19/Clarity-Unmasking_Political_Question_Evasions

- Developed a multi-task NLP architecture on DeBERTa-v3-base with dual classification heads to simultaneously predict response clarity (3 classes) and specific evasion strategies (9 classes) from political Q&A interactions.
- Implemented a warm-start training methodology, first fine-tuning the shared Transformer encoder on the clarity-only task, which preserved strong baseline performance and accelerated convergence for the joint multi-task model.
- Built an end-to-end training and evaluation pipeline in Python, PyTorch, and Hugging Face Transformers, achieving a 0.70 macro-F1 on clarity prediction while optimizing sample efficiency through a single forward pass.

### CourtVision — Automated Player, Ball & Court Tracking
**Stack:** PyTorch, YOLO, ResNet-50, OpenCV, CUDA, Python, NumPy, computer vision
**Repo:** https://github.com/srinath-19/Tennis_analysis_ball-player-court

- Automates tennis analysis by detecting and tracking players, the ball, and 14 court keypoints with court-aware filtering.
- Used YOLOv12 for players (AP50 > 95%), a fine-tuned YOLOv5x for the ball (recall improved from 60% to 90%), and ResNet-50 for court keypoints — integrated in PyTorch and OpenCV with homography-based spatial filtering and ID tracking.
- Added court-aware player filtering: project person detections onto the court plane and keep the two centroids closest to the baseline keypoints, suppressing spectators and officials and cutting non-player false positives by 100%.
