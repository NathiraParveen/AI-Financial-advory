# Investment Advisor - Project Index & File Reference

## 📄 Documentation Files

### Main Documentation
- **[README.md](README.md)** - Complete project overview, features, and quick start
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Step-by-step setup and usage guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and system design
- **[config.yaml](config.yaml)** - Module configuration and feature settings
- **[module-help.csv](module-help.csv)** - BMM module metadata

## 🔧 Backend Services

### Core Services
- **[SavingsAnalysisService.ts](backend/src/services/analysis/SavingsAnalysisService.ts)**
  - Savings rate calculation
  - Emergency fund sizing
  - Future savings projection
  - Financial health analysis

- **[PortfolioAnalysisService.ts](backend/src/services/portfolio/PortfolioAnalysisService.ts)**
  - Portfolio composition analysis
  - Risk assessment
  - Asset allocation recommendations
  - Rebalancing detection

- **[TaxOptimizationService.ts](backend/src/services/portfolio/TaxOptimizationService.ts)**
  - Tax-loss harvesting identification
  - Capital gains calculation
  - Tax-efficient rebalancing
  - Holding period analysis

- **[RecommendationEngineService.ts](backend/src/services/recommendations/RecommendationEngineService.ts)**
  - Personalized recommendations
  - Goal-based suggestions
  - Risk adjustments
  - Priority scoring

### AI Services
- **[chatService.ts](backend/src/services/ai/chatService.ts)**
  - GPT-4 conversational advisor
  - Portfolio/goals context injection
  - Conversation persistence and history

- **[predictiveAnalyticsService.ts](backend/src/services/ai/predictiveAnalyticsService.ts)**
  - ARIMA-based portfolio forecasting (1m, 3m, 12m)
  - Confidence scoring and 24-hour caching

- **[anomalyDetectionService.ts](backend/src/services/ai/anomalyDetectionService.ts)**
  - Concentration, volatility, and correlation anomaly detection
  - Proactive risk alerts with severity classification

- **[insightGenerationService.ts](backend/src/services/ai/insightGenerationService.ts)**
  - AI-generated personalised financial insights
  - Behavioural finance pattern recognition

### Utility Services
- **[csvParser.ts](backend/src/utils/csvParser.ts)**
  - CSV parsing for savings and portfolios
  - Data validation
  - Error handling

- **[calculations.ts](backend/src/utils/calculations.ts)**
  - Financial calculations
  - Compound interest
  - Future value projections
  - Volatility and Sharpe ratio

### Utility Services (continued)
- **[aiMetrics.ts](backend/src/utils/aiMetrics.ts)** - AI usage tracking and cost limits
- **[logger.ts](backend/src/utils/logger.ts)** - Winston logger (app.log, ai.log, error.log)

### Backend Entry Points
- **[index.ts](backend/src/index.ts)** - Express server setup and middleware
- **[package.json](backend/package.json)** - Dependencies and scripts
- **[tsconfig.json](backend/tsconfig.json)** - TypeScript configuration
- **[.env.example](backend/.env.example)** - Complete environment variable template (core + AI)

### Database
- **[schema.prisma](backend/prisma/schema.prisma)** - Complete database schema
  - User, Savings, SavingsGoal
  - Portfolio, Holding, PortfolioHistory
  - Recommendation, RebalancingAlert, TaxOptimization
  - ChatConversation, ChatMessage
  - PortfolioForecast, AnomalyAlert, PersonalizedInsight, AIUsageLog
- **[migrations/](backend/prisma/migrations/)** - Prisma migration files

## 🎨 Frontend Components & Pages

### Main App Structure
- **[App.tsx](frontend/src/App.tsx)** - Main application component with routes
- **[main.tsx](frontend/src/main.tsx)** - React entry point with theme setup

### Layout
- **[Layout.tsx](frontend/src/components/Layout.tsx)** - Navigation drawer and app bar

### Pages
- **[Dashboard.tsx](frontend/src/pages/Dashboard.tsx)** - Overview and metrics
- **[SavingsAnalysis.tsx](frontend/src/pages/SavingsAnalysis.tsx)** - Savings tracking
- **[Portfolio.tsx](frontend/src/pages/Portfolio.tsx)** - Portfolio management
- **[Recommendations.tsx](frontend/src/pages/Recommendations.tsx)** - Recommendations view
- **[GoalPlanning.tsx](frontend/src/pages/GoalPlanning.tsx)** - Goal management
- **[TaxOptimization.tsx](frontend/src/pages/TaxOptimization.tsx)** - Tax tools
- **[AiChat.tsx](frontend/src/pages/AiChat.tsx)** - AI financial chat advisor
- **[Insights.tsx](frontend/src/pages/Insights.tsx)** - Personalised financial insights
- **[PortfolioForecast.tsx](frontend/src/pages/PortfolioForecast.tsx)** - ARIMA portfolio forecasting
- **[RiskAlerts.tsx](frontend/src/pages/RiskAlerts.tsx)** - Anomaly detection & risk alerts

### Services & Utilities
- **[api.ts](frontend/src/services/api.ts)** - API client with all endpoints
- **[index.css](frontend/src/index.css)** - Global styles

### Frontend Configuration
- **[package.json](frontend/package.json)** - Dependencies and scripts
- **[tsconfig.json](frontend/tsconfig.json)** - TypeScript configuration
- **[vite.config.ts](frontend/vite.config.ts)** - Vite build configuration
- **[index.html](frontend/index.html)** - HTML template

## 📦 Shared Code

- **[types.ts](shared/types.ts)** - Shared TypeScript interfaces
  - User, Auth, Savings, Portfolio
  - Recommendation, Analysis types
  - All API request/response types

## 🐳 DevOps & Configuration

- **[docker-compose.yml](docker-compose.yml)** - Multi-container orchestration
  - PostgreSQL database
  - Backend service
  - Frontend service

- **[Dockerfile (Backend)](backend/Dockerfile)** - Backend image
  - Node 18 Alpine base
  - Multi-stage build

- **[Dockerfile (Frontend)](frontend/Dockerfile)** - Frontend image
  - Node 18 Alpine build stage
  - Nginx serve stage

- **[.gitignore](.gitignore)** - Git ignore rules

## 📊 Directory Structure

```
investment-advisor/
│
├── 📄 Documentation
│   ├── README.md
│   ├── GETTING_STARTED.md
│   ├── ARCHITECTURE.md
│   ├── config.yaml
│   └── module-help.csv
│
├── 🔧 Backend
│   ├── src/
│   │   ├── api/routes/          (API handlers)
│   │   ├── services/
│   │   │   ├── analysis/        (SavingsAnalysisService)
│   │   │   ├── recommendations/ (RecommendationEngineService)
│   │   │   ├── portfolio/       (PortfolioAnalysisService, TaxOptimizationService)
│   │   │   └── ai/              (chatService, predictiveAnalyticsService,
│   │   │                         anomalyDetectionService, insightGenerationService)
│   │   ├── utils/
│   │   │   ├── csvParser.ts
│   │   │   ├── calculations.ts
│   │   │   ├── aiMetrics.ts
│   │   │   └── logger.ts
│   │   └── index.ts             (Server entry)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── 🎨 Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── analysis/
│   │   │   ├── recommendations/
│   │   │   └── portfolio/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SavingsAnalysis.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   ├── Recommendations.tsx
│   │   │   ├── GoalPlanning.tsx
│   │   │   └── TaxOptimization.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── hooks/               (Custom hooks - placeholder)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── index.html
│
├── 📦 Shared
│   └── types.ts
│
├── 🐳 DevOps
│   ├── docker-compose.yml
│   └── .gitignore
│
└── 📁 Docs (empty - for additional documentation)
```

## 🚀 Quick Start Commands

```bash
# Start everything with Docker
docker-compose up --build

# Or manual setup:
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## 📝 Key Features & Where They're Implemented

| Feature | Backend Service | Frontend Component | API Endpoint |
|---------|-----------------|-------------------|--------------|
| Savings Analysis | `SavingsAnalysisService` | `SavingsAnalysis.tsx` | `POST /savings/upload-csv` |
| Investment Recommendations | `RecommendationEngineService` | `Recommendations.tsx` | `GET /recommendations` |
| Portfolio Tracking | `PortfolioAnalysisService` | `Portfolio.tsx` | `GET /portfolio` |
| Tax Optimization | `TaxOptimizationService` | `TaxOptimization.tsx` | `GET /portfolio/:id/tax` |
| Risk Assessment | `PortfolioAnalysisService` | `Dashboard.tsx` | `GET /portfolio/:id/risk` |
| Goal Planning | `RecommendationEngineService` | `GoalPlanning.tsx` | `POST /savings/goals` |
| Rebalancing Alerts | `PortfolioAnalysisService` | `Portfolio.tsx` | `GET /portfolio/:id/rebalancing` |
| AI Chat Advisor | `chatService` | `AiChat.tsx` | `POST /ai/chat` |
| Portfolio Forecasting | `predictiveAnalyticsService` | `PortfolioForecast.tsx` | `GET /ai/forecast` |
| Anomaly / Risk Alerts | `anomalyDetectionService` | `RiskAlerts.tsx` | `GET /ai/anomalies` |
| Personalised Insights | `insightGenerationService` | `Insights.tsx` | `GET /ai/insights` |

## 📚 Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js 18, Express.js, TypeScript |
| **Frontend** | React 18, TypeScript, Material-UI, Vite |
| **Database** | SQLite (dev) / PostgreSQL (prod), Prisma ORM |
| **DevOps** | Docker, Docker Compose |
| **Build** | TypeScript Compiler, Vite |
| **Validation** | Zod |
| **HTTP Client** | Axios |
| **State Management** | Zustand |
| **Charting** | Recharts |

## 🔐 Security Implementation

- JWT-based authentication in `api.ts` and backend auth routes
- Bcrypt password hashing configured in `.env`
- CORS configuration in `index.ts`
- Zod validation in utility functions
- CSV validation before data processing

## 📈 Remaining Implementation Steps

1. Add nav items for AI pages in `frontend/src/components/Layout.tsx`
2. Build out sub-components in `frontend/src/components/analysis/`, `portfolio/`, `recommendations/`
3. Add custom hooks in `frontend/src/hooks/`
4. Integrate market data APIs (Alpha Vantage / Yahoo Finance)
5. Implement real-time portfolio calculations
6. Register goal routes in `backend/src/index.ts` (GoalPlanning backend is incomplete)

## 📞 Integration Points

- **CSV Upload**: `/savings/upload-csv` → `csvParser.ts` → Database
- **Recommendations**: Triggered by `/recommendations` → `RecommendationEngineService`
- **Portfolio Analysis**: `/portfolio/:id` → `PortfolioAnalysisService`
- **Tax Analysis**: `/portfolio/:id/tax` → `TaxOptimizationService`

---

**All files follow TypeScript best practices with full type safety and comprehensive error handling.**
