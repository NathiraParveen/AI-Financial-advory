# Investment Advisor — AI-Powered Financial Planning Platform

An AI-powered financial planning platform designed for the Indian retail investor — combining portfolio management, tax optimization, and goal-based planning with a conversational AI advisor, ARIMA-based forecasting, anomaly detection, and behavioural finance insights.

## Problem statement

India's retail investment market is growing rapidly, but tools sit at two extremes: basic SIP calculators that ignore the user's full picture, or human wealth advisors beyond most people's reach. Robo-advisors like Groww, Coin, and INDmoney solve portfolio tracking well but leave gaps:

- No proactive risk alerts before anomalies hurt you
- No forward-looking forecasts — only historical charts
- No tax-efficient rebalancing tuned to Indian tax law
- No conversational interface for "what should I do about this?"

## What this project delivers

| Feature | Description |
|---|---|
| Savings Analysis | Current position, savings rate, income/expense tracking |
| Goal-Based Planning | Multi-goal planning with priority weighting and target-date tracking |
| Portfolio Tracking | Real-time valuation, historical performance, cost-basis tracking |
| Tax Optimization | Tax-loss harvesting, long/short-term gain tracking, rebalancing suggestions |
| Portfolio Rebalancing | Drift detection, configurable threshold alerts |
| Risk Assessment | Portfolio risk scoring, volatility and drawdown analysis |
| AI Chat Advisor | Conversational advisor with user's portfolio and goals loaded as context |
| AI Forecasting | ARIMA-based 1-month / 3-month / 12-month portfolio projections |
| Anomaly Detection | Real-time risk monitoring and proactive alerts |
| Behavioural Insights | AI-generated insights grounded in behavioural finance principles |

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18 + Express + TypeScript |
| Database | PostgreSQL 15 via Prisma ORM |
| Frontend | React 18 + Material-UI + Recharts + Zustand |
| AI / Forecasting | OpenAI GPT-4 (chat, insights), ARIMA (forecasting) |
| Auth | JWT + bcrypt |
| Deployment | Docker + Docker Compose |

## Repository structure

This project uses the **BMAD** (Behaviour-driven Multi-Agent Development) methodology. All planning, design, and implementation artifacts live inside `bmm/`.

```
Wealth advisor/
├── bmm/
│   ├── .agents/skills/                    BMAD AI workflow skills library
│   └── _bmad/bmm/
│       ├── 1-analysis/                    User stories, personas, acceptance criteria, journey maps
│       ├── 2-plan-workflows/              Architecture, API contracts, AI design, sprint plans
│       ├── 3-solutioning/                 DB schema, UI specifications, solutioning docs
│       └── 4-implementation/
│           └── investment-advisor/        Live application
│               ├── backend/               Node.js + Express + Prisma API (port 5000)
│               └── frontend/              React SPA (port 3000)
├── README.md                              This file
└── REQUIREMENTS.md                        Requirements summary and links to planning docs
```

## Quick start

```bash
# Start all services with Docker (recommended)
cd bmm/_bmad/bmm/4-implementation/investment-advisor
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api/v1 |
| Health check | http://localhost:5000/health |

For local development without Docker, see [GETTING_STARTED.md](bmm/_bmad/bmm/4-implementation/investment-advisor/GETTING_STARTED.md).

## Planning documents

| Document | Location |
|---|---|
| User Stories — Sprint 1 (Core Platform) | [1-analysis/user_stories_sprint_1.md](bmm/_bmad/bmm/1-analysis/user_stories_sprint_1.md) |
| User Stories — Sprint 2 (AI Layer) | [1-analysis/user_stories_sprint_2.md](bmm/_bmad/bmm/1-analysis/user_stories_sprint_2.md) |
| Architecture Design | [2-plan-workflows/architecture_design.md](bmm/_bmad/bmm/2-plan-workflows/architecture_design.md) |
| API Contracts | [2-plan-workflows/api_contracts.md](bmm/_bmad/bmm/2-plan-workflows/api_contracts.md) |
| AI Features Design | [2-plan-workflows/ai_features_design.md](bmm/_bmad/bmm/2-plan-workflows/ai_features_design.md) |
| Database Schema | [3-solutioning/database_schema_design.md](bmm/_bmad/bmm/3-solutioning/database_schema_design.md) |
| UI Specifications | [3-solutioning/ui_design_specifications.md](bmm/_bmad/bmm/3-solutioning/ui_design_specifications.md) |
| Implementation README | [4-implementation/investment-advisor/README.md](bmm/_bmad/bmm/4-implementation/investment-advisor/README.md) |

## Roadmap

- [ ] Live market data integration (NSE API / Alpha Vantage)
- [ ] Banking API integration (Account Aggregator framework)
- [ ] Advanced PDF reporting
- [ ] Mobile app (React Native)
- [ ] Multi-user collaboration for advisors

---

**Product Manager:** NathiraParveen
