# CLAUDE.md — Investment Advisor Project

## Project overview

AI-powered financial planning platform for the Indian retail investor. Full-stack web application combining portfolio management, goal-based planning, tax optimization, and an AI advisor layer.

**Product Manager:** NathiraParveen  
**Methodology:** BMAD (Behaviour-driven Multi-Agent Development)

---

## Repository structure

```
Wealth advisor/
├── bmm/
│   ├── .agents/skills/                    BMAD AI workflow skills (don't modify — framework files)
│   └── _bmad/
│       ├── _config/                       BMAD configuration files
│       └── bmm/                           Project artifacts (this is where all work lives)
│           ├── 1-analysis/                Phase 1: Analysis artifacts
│           ├── 2-plan-workflows/          Phase 2: Planning and workflow docs
│           ├── 3-solutioning/             Phase 3: Solutioning and design specs
│           └── 4-implementation/          Phase 4: Live application code
│               └── investment-advisor/
│                   ├── backend/           Node.js 18 + Express + TypeScript (port 5000)
│                   └── frontend/          React 18 + Vite + Material-UI (port 3000)
├── CLAUDE.md                              This file
├── README.md                              Project overview and quick start
└── REQUIREMENTS.md                        Requirements summary with links to planning docs
```

---

## Key planning documents

| What | Where |
|---|---|
| User stories — Sprint 1 (10 stories, core platform) | `bmm/_bmad/bmm/1-analysis/user_stories_sprint_1.md` |
| User stories — Sprint 2 (7 stories, AI layer) | `bmm/_bmad/bmm/1-analysis/user_stories_sprint_2.md` |
| User personas | `bmm/_bmad/bmm/1-analysis/user_personas.md` |
| System architecture | `bmm/_bmad/bmm/2-plan-workflows/architecture_design.md` |
| API contracts | `bmm/_bmad/bmm/2-plan-workflows/api_contracts.md` |
| AI features design | `bmm/_bmad/bmm/2-plan-workflows/ai_features_design.md` |
| Database schema | `bmm/_bmad/bmm/3-solutioning/database_schema_design.md` |
| UI specifications | `bmm/_bmad/bmm/3-solutioning/ui_design_specifications.md` |

---

## Application entry points

All commands run from inside `bmm/_bmad/bmm/4-implementation/investment-advisor/`.

```bash
# Docker (recommended)
docker-compose up --build

# Local development — backend
cd backend && npm install && npm run dev

# Local development — frontend
cd frontend && npm install && npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API | http://localhost:5000/api/v1 |
| Health | http://localhost:5000/health |

---

## Tech stack

| Layer | Tech |
|---|---|
| Backend | Node.js 18, Express, TypeScript, Prisma ORM |
| Database | SQLite (dev) / PostgreSQL 15 (prod) |
| Frontend | React 18, Vite, Material-UI, Recharts, Zustand |
| AI | OpenAI GPT-4 (chat + insights), ARIMA (forecasting) |
| Auth | JWT + bcrypt |
| Deployment | Docker + Docker Compose |

---

## Environment setup

**Backend** — create `backend/.env.local`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/investment_advisor
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
OPENAI_API_KEY=your-openai-key
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
```

---

## Sprint 1 status

Stories 1.1–1.7 are complete (backend services, routes, Prisma schema all in place).  
Stories 1.8 (Auth), 1.9 (CSV Import), and 1.10 (Dashboard) are in progress.  
Frontend AI components (ChatPanel, ForecastChart, AnomalyAlerts, InsightCards) are Phase 2.

---

## Files to not commit

The following should never be committed (already in `.gitignore`):
- `backend/.env.local` — contains secrets
- `backend/dist/` — compiled TypeScript output
- `frontend/dist/` — production build
- `backend/logs/` — runtime log files
- `backend/prisma/dev.db` — local dev database
