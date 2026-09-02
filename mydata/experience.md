# Experience

## Inovonics — AI Engineer
**Boulder, CO** · Sept 2025 – Apr 2026
**Focus:** AI-assisted floor plan vectorization

- Reduced the time taken to map and plot an architectural floor plan from 2 days to a matter of minutes.
- Developed a full-stack AI-powered floor plan vectorization platform using YOLOv12-OBB for structure detection, with a FastAPI backend, Celery workers, a Redis task queue, a PostgreSQL database, and a Next.js frontend deployed on GCP.
- Overcame small-object detection limits in high-resolution engineering schematics with tiled sliding-window inference and overlap-based deduplication, plus a 9-stage OpenCV preprocessing pipeline that cleans and normalizes noisy architectural drawings before ML inference.
- Designed Shapely-based room boundary extraction (wall polygon union, Minkowski gap closing, free-space set-difference) and optimized receiver placement as a set-cover problem using OR-Tools CP-SAT with 180-ray coverage analysis.

**Tech:** YOLOv12-OBB, FastAPI, Celery, Redis, PostgreSQL, Next.js, OpenCV, Shapely, OR-Tools CP-SAT, Google Cloud

---

## SRM Institute of Science and Technology — Undergraduate Researcher
**Chennai, India** · Aug 2023 – May 2024

- Developed and deployed a real-time tomato-harvest detection pipeline on AWS, validating 97% accuracy on a held-out set.
- Delivered a working demo with concise documentation so agricultural teams could monitor harvests live.

**Publication:** *Identification of Harvestable Tomato using YOLOv8* — 2024 3rd International Conference on Applied Artificial Intelligence and Computing, June 2024. IEEE Xplore, Scopus indexed (Scopus ID 59222142100).

**Tech:** YOLOv8, PyTorch, OpenCV, AWS

---

## Aaruush, SRM — Software Developer
**Chennai, India** · Jun 2022 – May 2023
**Focus:** University events platform

- Owned platform observability and performance validation using CloudWatch, UptimeRobot, and k6, helping maintain 99.9% uptime while validating support for 5k concurrent users at 380 ms p95 latency and under 0.5% errors.
- Analyzed CloudWatch logs and latency metrics to locate bottlenecks in registration and scheduling endpoints, then optimized the Node.js/PostgreSQL backend with connection pooling and a 40% reduction in API payload size — cutting p95 response time from 800 ms to 450 ms for a platform serving 10k users.

**Tech:** Node.js, PostgreSQL, AWS (CloudWatch, ALB, CloudFront), UptimeRobot, k6, Terraform, Git

---

# Education

## University of Colorado Boulder
**Aug 2024 – May 2026**
Master of Science in Computer Science — Artificial Intelligence · GPA 3.87 / 4.0

## SRM Institute of Science and Technology
**Sept 2020 – May 2024**
Bachelor of Technology in Computer Science and Engineering · GPA 3.98 / 4.0
