import type { Application } from "./types";

export const initialMasterResume = `# Alexander Sotnikov
alex@example.com · github.com/alex · linkedin.com/in/alex

## Experience

### Research Engineering Intern — OpenAI *Jun 2025 – Sep 2025*
- Built a distributed evaluation harness that cut model regression-test turnaround from 9 hours to 40 minutes across 12k prompts.
- Designed a reward-model data pipeline adopted by three research teams, processing 2.4B tokens per week.

### Software Engineering Intern — Stripe *Jan 2025 – Apr 2025*
- Shipped an idempotency-key cache in Go that removed 1.1M redundant ledger writes per day.
- Instrumented the payouts service with distributed tracing, cutting median incident triage time by 35%.

### Undergraduate Researcher — Systems & Networking Lab *Sep 2024 – Dec 2024*
- Co-authored a workshop paper on scheduling GPU inference under bursty load, accepted at MLSys workshops.
- Benchmarked 6 serving frameworks and published a reproducible harness now used by the lab's grad students.

## Projects

### Resume Assembler — Next.js, Flask, LaTeX *2026*
- Tailors a master resume to any job posting and compiles the result to a typeset LaTeX PDF.
- Ranks bullets by a blend of posting relevance and standalone impressiveness rather than keyword overlap alone.

### Raft in Rust — Rust, Tokio *2025*
- Implemented leader election, log replication, and snapshotting; passes a 200-case fault-injection suite.
- Sustains 48k writes/sec on a 5-node cluster with linearizable reads.

## Skills

- Python, TypeScript, Go, Rust, C++, SQL
- PyTorch, React, Next.js, Flask, Postgres, Kubernetes, AWS
`;

export const applications: Application[] = [
  {
    id: "amzn",
    company: "AMZN",
    role: "SDE Intern, AWS Lambda",
    jobPosting: `Amazon Web Services — Software Development Engineer Intern

Requirements
- Currently enrolled in a Bachelor's or Master's program in Computer Science or a related field.
- Experience with at least one modern language: Java, Python, Go, C++, or Rust.
- Familiarity with distributed systems concepts: consensus, replication, and fault tolerance.
- Comfortable owning a project end to end, from design document through launch.

Responsibilities
- Design and ship services that operate at millions of requests per second.
- Write design documents and participate in operational reviews.
- Build tooling that improves the team's deployment and observability story.
- Collaborate with senior engineers on performance and reliability work.

Preferred
- Prior internship experience at a product or research organization.
- Exposure to infrastructure as code and container orchestration.`,
    generated: null,
  },
  {
    id: "msft",
    company: "MSFT",
    role: "SWE Intern, Azure AI",
    jobPosting: `Microsoft — Software Engineer Intern, Azure AI

Requirements
- Pursuing a degree in Computer Science, Software Engineering, or equivalent.
- Strong fundamentals in data structures, algorithms, and systems design.
- Experience building and evaluating machine learning systems is a plus.

Responsibilities
- Contribute to inference serving infrastructure used across Azure AI.
- Improve model evaluation tooling and benchmarking pipelines.
- Partner with researchers to move prototypes into production.`,
    generated: null,
  },
];
