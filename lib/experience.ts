/**
 * Single source of truth for the work-history section.
 * Mirrors `mydata/experience.md` — update both together.
 *
 * `id` doubles as the framer-motion `layoutId` in `experience-swap.tsx`, so
 * the values must stay unique and stable: a collision silently breaks the
 * promote/demote animation rather than throwing.
 */

export interface Publication {
  title: string;
  venue: string;
  /** Indexing / identifier line shown under the venue. */
  note: string;
}

export interface ExperienceRole {
  id: string;
  company: string;
  role: string;
  location: string;
  period: string;
  /** One-line framing of the work. Not every role has one. */
  focus?: string;
  bullets: string[];
  tech: string[];
  publication?: Publication;
}

export interface EducationEntry {
  school: string;
  degree: string;
  period: string;
  gpa: string;
}

/** Reverse-chronological. The first entry is the one featured on load. */
export const experience: ExperienceRole[] = [
  {
    id: "inovonics",
    company: "Inovonics",
    role: "AI Engineer",
    location: "Boulder, CO",
    period: "Sept 2025 – Apr 2026",
    focus: "AI-assisted floor plan vectorization",
    bullets: [
      "Reduced the time taken to map and plot an architectural floor plan from 2 days to a matter of minutes.",
      "Developed a full-stack AI-powered floor plan vectorization platform using YOLOv12-OBB for structure detection, with a FastAPI backend, Celery workers, a Redis task queue, a PostgreSQL database, and a Next.js frontend deployed on GCP.",
      "Overcame small-object detection limits in high-resolution engineering schematics with tiled sliding-window inference and overlap-based deduplication, plus a 9-stage OpenCV preprocessing pipeline that cleans and normalizes noisy architectural drawings before ML inference.",
      "Designed Shapely-based room boundary extraction (wall polygon union, Minkowski gap closing, free-space set-difference) and optimized receiver placement as a set-cover problem using OR-Tools CP-SAT with 180-ray coverage analysis.",
    ],
    tech: [
      "YOLOv12-OBB",
      "FastAPI",
      "Celery",
      "Redis",
      "PostgreSQL",
      "Next.js",
      "OpenCV",
      "Shapely",
      "OR-Tools CP-SAT",
      "Google Cloud",
    ],
  },
  {
    id: "srm-research",
    company: "SRM Institute of Science and Technology",
    role: "Undergraduate Researcher",
    location: "Chennai, India",
    period: "Aug 2023 – May 2024",
    bullets: [
      "Developed and deployed a real-time tomato-harvest detection pipeline on AWS, validating 97% accuracy on a held-out set.",
      "Delivered a working demo with concise documentation so agricultural teams could monitor harvests live.",
    ],
    tech: ["YOLOv8", "PyTorch", "OpenCV", "AWS"],
    publication: {
      title: "Identification of Harvestable Tomato using YOLOv8",
      venue:
        "2024 3rd International Conference on Applied Artificial Intelligence and Computing, June 2024",
      note: "IEEE Xplore, Scopus indexed (Scopus ID 59222142100).",
    },
  },
  {
    id: "aaruush",
    company: "Aaruush, SRM",
    role: "Software Developer",
    location: "Chennai, India",
    period: "Jun 2022 – May 2023",
    focus: "University events platform",
    bullets: [
      "Owned platform observability and performance validation using CloudWatch, UptimeRobot, and k6, helping maintain 99.9% uptime while validating support for 5k concurrent users at 380 ms p95 latency and under 0.5% errors.",
      "Analyzed CloudWatch logs and latency metrics to locate bottlenecks in registration and scheduling endpoints, then optimized the Node.js/PostgreSQL backend with connection pooling and a 40% reduction in API payload size — cutting p95 response time from 800 ms to 450 ms for a platform serving 10k users.",
    ],
    tech: [
      "Node.js",
      "PostgreSQL",
      "AWS (CloudWatch, ALB, CloudFront)",
      "UptimeRobot",
      "k6",
      "Terraform",
      "Git",
    ],
  },
];

export const education: EducationEntry[] = [
  {
    school: "University of Colorado Boulder",
    degree: "Master of Science in Computer Science — Artificial Intelligence",
    period: "Aug 2024 – May 2026",
    gpa: "GPA 3.87 / 4.0",
  },
  {
    school: "SRM Institute of Science and Technology",
    degree: "Bachelor of Technology in Computer Science and Engineering",
    period: "Sept 2020 – May 2024",
    gpa: "GPA 3.98 / 4.0",
  },
];
