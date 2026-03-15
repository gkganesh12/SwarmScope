<div align="center">

# SwarmScope

### Multi-Agent Simulation Engine

*Upload seed data. Simulate reality. Make better decisions.*

[![GitHub Stars](https://img.shields.io/github/stars/gkganesh12/SwarmScope?style=flat-square&color=10B981)](https://github.com/gkganesh12/SwarmScope/stargazers)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://hub.docker.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)

</div>

---

## What is SwarmScope?

**SwarmScope** is an affordable, high-fidelity multi-agent simulation engine. Feed it any unstructured data — a paragraph of text, a PDF, a markdown doc — and it auto-generates a parallel digital world with up to **5,000+ autonomous agents**.

Each agent has its own personality, memory, goals, and social dynamics. Inject variables from a God's-eye view, tweak parameters, and watch thousands of agents interact to reveal emergent outcomes you'd never predict on paper.

> **Simulate before you decide** — test every outcome before committing to one.

---

## Why SwarmScope?

Traditional forecasting relies on averages and assumptions. SwarmScope takes a fundamentally different approach:

- **No surveys needed** — generate thousands of realistic personas from a single paragraph of context
- **No guesswork** — observe emergent behaviors instead of predicting them
- **No expensive pilots** — test strategies in a digital sandbox before deploying in the real world
- **~$5 per run** — orders of magnitude cheaper than traditional market research or focus groups

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Any Data In** | PDF, TXT, MD — even a single paragraph is enough to seed a full simulation |
| **5,000+ Agents** | Scale from a handful to thousands of concurrent autonomous agents |
| **High Fidelity** | Independent personalities, dynamic memory, evolving relationships, and realistic social behaviors |
| **Dual-Platform** | Parallel simulation across multiple engines for speed and reliability |
| **Deep Analytics** | Post-simulation reports with actionable insights via ReportAgent |
| **Interactive** | Converse with any agent or the ReportAgent after simulation completes |
| **GraphRAG Pipeline** | Entity-relation graph construction for rich world-building from raw text |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        SwarmScope                           │
├──────────────────────────┬──────────────────────────────────┤
│       Frontend           │            Backend               │
│                          │                                  │
│  React 19 + TypeScript   │   FastAPI + Python 3.10+         │
│  Vite + Tailwind CSS     │                                  │
│  Framer Motion           │   ┌──────────────────────┐       │
│  Canvas Animations       │   │   GraphRAG Engine    │       │
│                          │   │   Agent Generator    │       │
│  ┌──────────────────┐    │   │   Simulation Core    │       │
│  │  Upload Console  │────│───│   ReportAgent        │       │
│  │  Live Dashboard  │    │   └──────────────────────┘       │
│  │  Agent Chat      │    │                                  │
│  └──────────────────┘    │   Dual-Platform Execution        │
├──────────────────────────┴──────────────────────────────────┤
│                    Docker Compose                           │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

```
Step 01 → Graph Construction     Extract entities & relationships via GraphRAG
Step 02 → Environment Setup      Generate agent profiles & inject simulation parameters
Step 03 → Run Simulation         Dual-platform parallel execution with dynamic memory
Step 04 → Report Generation      ReportAgent analyzes the post-simulation environment
Step 05 → Deep Interaction       Converse with any agent or the ReportAgent directly
```

**Step 1: Graph Construction** — Your unstructured data (a product brief, a market report, a policy document) is parsed into an entity-relation graph using GraphRAG. This becomes the skeleton of the simulated world.

**Step 2: Environment Setup** — SwarmScope generates thousands of agent profiles, each with unique personalities, goals, knowledge levels, and social tendencies. Simulation parameters are injected based on your scenario directive.

**Step 3: Run Simulation** — Agents interact autonomously across dual execution platforms. They form opinions, spread information, make decisions, and influence each other — all with dynamic memory that evolves over time.

**Step 4: Report Generation** — ReportAgent performs a deep post-mortem analysis, surfacing key trends, outlier behaviors, consensus points, and actionable recommendations.

**Step 5: Deep Interaction** — Chat directly with any individual agent to understand their reasoning, or query the ReportAgent for targeted analysis.

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **Docker** (optional, for containerized deployment)

### Option 1: Run Locally

```bash
# Clone the repository
git clone https://github.com/gkganesh12/SwarmScope.git
cd SwarmScope
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Option 2: Docker

```bash
docker-compose up
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:8000`.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Vite | Core UI framework |
| **Styling** | Tailwind CSS, Framer Motion | Design system & animations |
| **Visualization** | HTML5 Canvas, Three.js | Real-time agent visualizations |
| **Backend** | Python 3.10+, FastAPI | API server & simulation orchestration |
| **AI/ML** | GraphRAG, LLM-powered agents | World-building & agent intelligence |
| **Infra** | Docker, Docker Compose | Containerized deployment |

---

## Project Structure

```
SwarmScope/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── views/              # Page components (Home, Dashboard)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── SwarmCanvas.tsx  # Animated character grid hero
│   │   │   └── MercuryBlob.tsx  # 3D shader blob visualization
│   │   ├── App.tsx             # Router & layout
│   │   └── index.css           # Global styles & design tokens
│   ├── index.html
│   └── package.json
├── backend/                    # Python backend API
│   ├── main.py                 # FastAPI entry point
│   └── requirements.txt
├── docker-compose.yml
└── README.md
```

---

## Use Cases

### Market Research
Simulate consumer reactions to product launches, pricing changes, or competitor moves. See how word-of-mouth spreads across thousands of realistic consumer personas.

### Policy Testing
Model the impact of new regulations, organizational policies, or incentive structures before rollout. Identify unintended consequences in a safe sandbox.

### Social Dynamics
Study information spread, opinion formation, polarization, and group behavior patterns. Understand how ideas go viral or fizzle out.

### Strategic Planning
Test business strategies against thousands of simulated stakeholders. Compare outcomes across different scenarios before committing resources.

### Risk Analysis
Identify failure modes, edge cases, and black swan scenarios through large-scale agent simulations. Stress-test your assumptions.

---

## Roadmap

- [ ] Real-time simulation dashboard with live agent metrics
- [ ] Agent relationship graph visualization
- [ ] Custom agent archetype templates
- [ ] Multi-scenario comparison mode
- [ ] Export simulation data (CSV, JSON)
- [ ] API access for programmatic simulation runs
- [ ] Plugin system for custom agent behaviors

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

---

<div align="center">
  <strong>SwarmScope</strong> — Simulate before you decide.
  <br /><br />
  <a href="https://github.com/gkganesh12/SwarmScope">GitHub</a>
</div>
