<div align="center">

# SwarmScope

**Multi-Agent Simulation Engine**

*Upload seed data. Simulate reality. Make better decisions.*

[![GitHub Stars](https://img.shields.io/github/stars/gkganesh12/SwarmScope?style=flat-square&color=10B981)](https://github.com/gkganesh12/SwarmScope/stargazers)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/)

</div>

---

## Overview

**SwarmScope** is an affordable, high-fidelity multi-agent simulation engine. Feed it any unstructured data — a paragraph of text, a PDF, a markdown doc — and it auto-generates a parallel digital world with up to **5,000+ autonomous agents**.

Each agent has its own personality, memory, goals, and social dynamics. Inject variables, tweak parameters, and watch thousands of agents interact to reveal emergent outcomes. Simulate before you decide.

## Key Features

- **Any Data In** — PDF, TXT, MD. Even a single paragraph is enough to seed a simulation.
- **5,000+ Concurrent Agents** — Scale from a handful to thousands of autonomous agents.
- **High Fidelity** — Agents with independent personalities, dynamic memory, and realistic social behaviors.
- **Dual-Platform Execution** — Parallel simulation across multiple engines for speed and reliability.
- **Deep Analytics** — Post-simulation reports with actionable insights via ReportAgent.
- **Interactive** — Converse with any agent or the ReportAgent after simulation completes.
- **Affordable** — Average cost of ~$5 per simulation run.

## How It Works

```
01 → Graph Construction      Seed extraction & entity-relation graph via GraphRAG
02 → Environment Setup       Agent profile generation & simulation parameter injection
03 → Run Simulation          Dual-platform parallel simulation with dynamic memory
04 → Report Generation       ReportAgent deep-dives into post-simulation environment
05 → Deep Interaction        Converse with any agent or the ReportAgent directly
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (optional)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Docker

```bash
docker-compose up
```

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 19, TypeScript, Vite, Framer Motion, Tailwind CSS |
| Backend  | Python, FastAPI |
| Infra    | Docker, Docker Compose |

## Project Structure

```
SwarmScope/
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── views/     # Page components
│   │   ├── components/# Reusable UI components
│   │   └── index.css  # Global styles
│   └── package.json
├── backend/           # Python backend API
├── docker-compose.yml
└── README.md
```

## Use Cases

- **Market Research** — Simulate consumer reactions to product launches, pricing changes, or competitor moves.
- **Policy Testing** — Model the impact of new regulations or organizational policies before rollout.
- **Social Dynamics** — Study information spread, opinion formation, and group behavior patterns.
- **Strategic Planning** — Test business strategies against thousands of simulated stakeholders.
- **Risk Analysis** — Identify failure modes and edge cases through large-scale agent simulations.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">
  <sub>Built with purpose. Simulate before you decide.</sub>
</div>
