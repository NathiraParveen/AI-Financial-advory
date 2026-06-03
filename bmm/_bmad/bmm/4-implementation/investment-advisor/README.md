# Investment Advisor — AI-Powered Financial Planning Platform

> A full-stack financial planning app built for the Indian retail investor — combining portfolio management, tax optimization, and goal-based planning with an AI chat advisor, ARIMA-based forecasting, anomaly detection, and behavioural finance insights.

## The problem

India's retail investment market is growing rapidly, but the tools available to everyday investors sit at two extremes: basic SIP calculators that don't account for a user's full financial picture, or human wealth advisors that are out of reach for most people. The robo-advisors in between — Groww, Coin, INDmoney — solve portfolio tracking well but leave significant gaps:

- No proactive risk alerts — you find out about anomalies after they've hurt you
- No forward-looking forecasts — only historical charts
- No tax-efficient rebalancing recommendations tuned to Indian tax law
- No conversational interface for the "what should I do about this?" question

## What I built

A comprehensive financial planning platform that closes those gaps — the core portfolio layer plus an AI layer on top of it.

**Core platform:** Savings analysis, multi-goal planning, portfolio tracking with cost-basis, tax-loss harvesting identification, rebalancing alerts, and risk assessment.

**AI layer:**
- Conversational financial advisor (GPT-4) with portfolio and goals loaded as context
- ARIMA-based portfolio forecasting at 1-month, 3-month, and 12-month horizons
- Real-time anomaly detection for proactive risk monitoring
- Personalised insights grounded in behavioural finance principles

## My role

I drove this as AI Product Manager: defined the problem and scope, wrote and prioritised the user stories, designed the AI integration strategy, and coordinated the full-stack delivery. The project was built using AI-assisted multi-agent development workflows — an intentional experiment in what a single PM can ship with modern AI tooling.

Key artefacts: user stories, sprint plan, architecture design, API contracts, and acceptance criteria.

## Key product decisions

### Why conversational AI for financial advice?

Static dashboards surface information. A conversational interface lets users act on it. A user who skips a risk-score widget will ask "should I shift more into debt funds given the current market?" A GPT-4 advisor with the user's portfolio and goals loaded as context can answer that question in a way a chart cannot — and do it at 11pm without an advisor's calendar.

### Why ARIMA for forecasting, not a neural network?

Trust is everything in financial products. ARIMA produces explainable forecasts: the model surfaces the trend and seasonality components it identified, and the user can see why the forecast moves. A neural net might backtest better, but if the user can't understand the output, they won't act on it. Explainability over raw accuracy was a deliberate call.

### Why anomaly detection as a first-class feature?

Most portfolio apps tell you what happened. Anomaly detection tells you when something unusual is happening — before it becomes a loss you read about after market close. Shipping this as a core feature (not an add-on) shifts the product from reactive to proactive, which is the clearest differentiator against incumbents.

### What v1 deliberately excludes

- **Live market data** (NSE API, Alpha Vantage) — adds integration complexity without changing the core user loop; in the roadmap
- **Banking API** (Account Aggregator framework) — significant regulatory surface area; future phase
- **Mobile app** — web-first to validate the core UX before investing in native development

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18 + Express + TypeScript |
| Database | PostgreSQL 15 via Prisma ORM |
| Frontend | React 18 + Material-UI + Recharts + Zustand |
| AI / Forecasting | OpenAI GPT-4 (chat, insights), ARIMA (forecasting) |
| Auth | JWT + bcrypt |
| Deployment | Docker + Docker Compose |

## Quick start

```bash
# Start all services (recommended)
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api/v1 |
| Health check | http://localhost:5000/health |

For local development without Docker, see [GETTING_STARTED.md](GETTING_STARTED.md).

## Feature overview

| Feature | What it does |
|---|---|
| Savings Analysis | Current financial position, savings rate, income/expense tracking |
| Goal-Based Planning | Multi-goal planning with priority weighting and target-date tracking |
| Portfolio Tracking | Real-time valuation, historical performance, cost-basis tracking |
| Tax Optimization | Tax-loss harvesting, long/short-term gain tracking, rebalancing suggestions |
| Portfolio Rebalancing | Drift detection, customisable threshold alerts |
| Risk Assessment | Portfolio risk scoring, volatility analysis, drawdown analysis |
| AI Chat Advisor | Conversational GPT-4 advisor with portfolio and goals as context |
| AI Forecasting | ARIMA-based 1-month / 3-month / 12-month portfolio projections |
| Anomaly Detection | Real-time risk monitoring and proactive alerts |
| Behavioural Insights | AI-generated insights grounded in behavioural finance principles |

## API surface

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh

GET    /api/v1/savings
POST   /api/v1/savings
POST   /api/v1/savings/upload-csv

GET    /api/v1/portfolio
POST   /api/v1/portfolio
POST   /api/v1/portfolio/:id/holdings
GET    /api/v1/portfolio/:id/analysis

GET    /api/v1/recommendations
POST   /api/v1/recommendations/:id/implement

GET    /api/v1/analysis/risk
GET    /api/v1/analysis/tax-optimization
GET    /api/v1/analysis/rebalancing
```

## Environment setup

Create `backend/.env.local`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/investment_advisor
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Roadmap

- [ ] Live market data integration (NSE API / Alpha Vantage)
- [ ] Banking API integration (Account Aggregator framework)
- [ ] Advanced PDF reporting
- [ ] Mobile app (React Native)
- [ ] Multi-user collaboration for advisors

---

**Designed and built by [NathiraParveen](https://github.com/NathiraParveen) — AI Product Manager**
