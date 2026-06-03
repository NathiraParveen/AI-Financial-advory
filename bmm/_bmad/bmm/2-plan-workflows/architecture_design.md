# Architecture Design - Investment Advisor MVP

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                  (Chrome, Safari, Firefox)                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    HTTP/HTTPS (Port 3000)
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
┌───────▼──────────────┐              ┌──────────▼────────────────┐
│   REACT FRONTEND     │              │   VITE BUILD TOOL        │
│   (SPA - Port 3000)  │              │   - Dev Server           │
│                      │              │   - HMR (Hot Reload)     │
│  Pages:              │              │   - Production Bundling  │
│  ├─ Dashboard        │              └──────────────────────────┘
│  ├─ Savings          │
│  ├─ Portfolio        │
│  ├─ Tax Optimization │
│  ├─ Goals            │
│  ├─ Recommendations  │
│  ├─ AI Chat (NEW)    │  ◄── AI FEATURES
│  └─ Insights (NEW)   │
│                      │
│  Components:         │
│  ├─ Charts (Recharts)│
│  ├─ ChatPanel (NEW)  │  ◄── AI COMPONENTS
│  ├─ ForecastChart    │
│  ├─ Tables           │
│  ├─ Forms            │
│  └─ Cards (Material) │
│                      │
│  State:              │
│  └─ Zustand Store    │
└──────────────────────┘
        │
        │ REST API Calls (JSON)
        │ JWT Auth Header
        │ CORS Enabled
        │ API Proxy: localhost:5000
        │ WebSocket (Chat)
        │
┌───────▼──────────────────────────────────────────────────────────┐
│              EXPRESS.JS API BACKEND (Port 5000)                 │
│                       Node.js 18+                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  API Layer (Routes)                                             │
│  ├─ /auth/*          (Register, Login, Refresh, Logout)        │
│  ├─ /api/v1/savings  (CRUD operations)                         │
│  ├─ /api/v1/portfolio (Portfolio + Holdings CRUD)             │
│  ├─ /api/v1/goals    (Goal CRUD)                              │
│  ├─ /api/v1/analysis (Risk, Tax, Rebalancing)                │
│  ├─ /api/v1/recommendations (Recommendations CRUD)            │
│  └─ /api/v1/ai/*     (NEW - AI Features)                      │
│    ├─ POST   /chat           (Send chat message)               │
│    ├─ GET    /chat/:id       (Get conversation history)       │
│    ├─ GET    /forecast       (Portfolio forecasts)            │
│    ├─ GET    /anomalies      (Risk anomalies)                 │
│    ├─ GET    /insights       (Personalized insights)          │
│    └─ DELETE /chat/:id       (Clear conversation)             │
│                                                                   │
│  Business Logic Layer (Services)                               │
│  ├─ SavingsAnalysisService                                    │
│  ├─ PortfolioAnalysisService                                 │
│  ├─ TaxOptimizationService                                   │
│  ├─ GoalPlanningService                                      │
│  ├─ RecommendationEngineService                             │
│  ├─ AuthService                                              │
│  └─ AI SERVICES (NEW)                                        │
│    ├─ ChatService (LLM integration)                          │
│    ├─ PredictiveAnalyticsService (Forecasting)              │
│    ├─ AnomalyDetectionService (Risk monitoring)             │
│    ├─ InsightGenerationService (Personalized insights)      │
│    ├─ RecommendationEngineAI (ML ranking)                   │
│    └─ SentimentAnalysisService (Market sentiment)           │
│                                                                   │
│  Utilities Layer                                               │
│  ├─ calculations.ts (Math: Sharpe, volatility, etc.)        │
│  ├─ csvParser.ts (CSV import with validation)              │
│  ├─ aiMetrics.ts (AI usage tracking)                        │
│  ├─ logger.ts (Logging & monitoring)                        │
│  └─ middleware/ (Auth, Error handling, Validation, Rate Limit)│
│                                                                   │
└───────┬──────────────────────────────────────────────────────────┘
        │
        │ SQL Queries (Prisma ORM)
        │
        │                    ┌──────────────────────────┐
        │                    │  EXTERNAL AI SERVICES    │
        │                    │  (NEW)                   │
        │                    ├──────────────────────────┤
        │                    │  OpenAI GPT-4 API        │
        │                    │  Pinecone (Vector DB)    │
        │                    │  Redis (Caching)         │
        │                    │  Market Data APIs        │
        │                    │  NLP Services (Sentiment)│
        │                    └──────────────────────────┘
        │
┌───────▼──────────────────────────────────────────────────────────┐
│           DATABASE LAYER (SQLite - File-based)                  │
│                                                                   │
│  Prisma ORM                                                      │
│  ├─ Type-safe queries                                          │
│  ├─ Schema: 11 + 6 AI models (NEW)                             │
│  ├─ Migrations                                                 │
│  └─ File: backend/dev.db                                       │
│                                                                   │
│  Database Models (Core)                                         │
│  ├─ User                                                        │
│  ├─ Savings                                                     │
│  ├─ SavingsGoal                                                 │
│  ├─ Portfolio                                                   │
│  ├─ Holding                                                     │
│  ├─ Recommendation                                              │
│  ├─ TaxOptimization                                            │
│  ├─ RebalancingAlert                                           │
│  ├─ PortfolioHistory                                           │
│  └─ ... (+ support models)                                      │
│                                                                   │
│  Database Models (AI Features - NEW)                            │
│  ├─ ChatConversation      (Chat history storage)              │
│  ├─ ChatMessage           (Individual messages)               │
│  ├─ PortfolioForecast     (AI predictions)                    │
│  ├─ AnomalyAlert          (Risk alerts)                       │
│  ├─ PersonalizedInsight   (User insights)                     │
│  ├─ MarketSentiment       (Sentiment data)                    │
│  └─ AIUsageLog            (Cost & usage tracking)             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Architecture Layers

### 1. Presentation Layer (React Frontend)
**Components:**
- Material-UI (MUI) for UI components
- Recharts for data visualizations
- React Router for navigation
- Zustand for state management

**Responsibilities:**
- Display data to users
- Collect user input
- Format for API submission
- Handle loading/error states

**Technology Stack:**
- React 18.2.0
- TypeScript 5.2.2
- Vite 4.4.11
- Material-UI 5.14.4
- Recharts 2.10.1

---

### 2. API Layer (Express Backend)
**Components:**
- REST endpoints (JSON over HTTP)
- JWT authentication middleware
- CORS configuration
- Error handling middleware
- Request validation (Zod)

**Endpoints Structure:**
```
/auth
  POST /register         - Create new user
  POST /login            - Authenticate & get JWT
  POST /refresh          - Get new JWT token
  POST /logout           - Invalidate token

/api/v1/savings
  POST /                 - Create savings record
  GET /                  - Get user's savings
  PUT /                  - Update savings
  POST /upload-csv       - Bulk import

/api/v1/portfolio
  POST /                 - Create portfolio
  GET /:id               - Get portfolio
  PUT /:id               - Update portfolio
  DELETE /:id            - Delete portfolio
  POST /:id/holdings     - Add holding
  GET /:id/holdings      - List holdings
  PUT /:id/holdings/:hid - Update holding
  DELETE /:id/holdings/:hid - Delete holding
  POST /:id/upload-csv   - Bulk import holdings

/api/v1/analysis
  GET /risk/:portfolioId - Analyze risk
  GET /tax-optimization/:portfolioId - Tax opportunities
  GET /rebalancing/:portfolioId - Rebalancing suggestions

/api/v1/goals
  POST /                 - Create goal
  GET /                  - List goals
  PUT /:id               - Update goal
  DELETE /:id            - Delete goal

/api/v1/recommendations
  GET /                  - List recommendations
  GET /:id               - Get recommendation detail
  PUT /:id               - Accept/dismiss recommendation

/api/v1/ai (NEW - AI FEATURES)
  POST /chat             - Send chat message to AI advisor
  GET /chat/:id          - Get chat conversation history
  DELETE /chat/:id       - Clear conversation
  GET /forecast          - Get portfolio forecast (1m/3m/12m)
  GET /anomalies         - Get current portfolio anomalies
  POST /anomalies/:id/acknowledge - Mark anomaly as acknowledged
  GET /insights          - Get personalized financial insights
  GET /insights/:type    - Get specific insight type

/api/v1/dashboard
  GET /summary           - Aggregated metrics
```
```

**Responsibilities:**
- Validate incoming requests
- Route to appropriate service
- Handle authentication
- Format responses
- Log errors

**Technology Stack:**
- Express.js 4.18.2
- TypeScript 5.2.2
- JWT for auth
- Bcrypt for password hashing
- Zod for validation

---

### 3. Business Logic Layer (Services)
**Components:**
- SavingsAnalysisService
- PortfolioAnalysisService
- TaxOptimizationService
- GoalPlanningService
- RecommendationEngineService
- AuthService

**Responsibilities:**
- Core financial calculations
- Data transformation
- Business rule enforcement
- Algorithm implementation

**Key Services:**
```
SavingsAnalysisService
├─ calculateSavingsRate()
├─ calculateMonthsOfExpenses()
├─ projectSavingsGrowth()
└─ analyze()

PortfolioAnalysisService
├─ calculateComposition()
├─ assessRisk()
├─ getRebalancingRecommendations()
└─ shouldRebalance()

TaxOptimizationService
├─ identifyTaxLossOpportunities()
├─ calculateCapitalGainsTax()
├─ getTaxHarvestingRecommendations()
└─ analyzeRebalancingForTaxes()

GoalPlanningService
├─ calculateRequiredSavings()
├─ calculateRequiredReturn()
├─ calculateProgress()
└─ getRecommendedAllocation()

RecommendationEngineService
├─ generateRecommendations()
├─ scoreRecommendation()
└─ calculateMonetaryImpact()

AuthService
├─ register()
├─ login()
├─ validateToken()
└─ refreshToken()

AI SERVICES (NEW)
├─ ChatService
│  ├─ processMessage()         - Handle user messages
│  ├─ getChatHistory()         - Retrieve conversations
│  ├─ buildSystemPrompt()      - Create AI context
│  └─ storeMessage()           - Persist to database
│
├─ PredictiveAnalyticsService
│  ├─ forecastPortfolio()      - Generate forecasts
│  ├─ forecastAsset()          - Individual asset forecast
│  ├─ simpleARIMAForecast()    - Time series prediction
│  └─ calculateConfidence()    - Forecast reliability
│
├─ AnomalyDetectionService
│  ├─ detectAnomalies()        - Scan portfolio for issues
│  ├─ checkConcentrationRisk() - Sector concentration
│  ├─ checkCorrelationBreakdown() - Diversification loss
│  └─ checkVolatilitySpike()   - Market stress detection
│
├─ InsightGenerationService
│  ├─ generateInsights()       - Create personalized insights
│  ├─ performanceInsight()     - Compare to benchmarks
│  ├─ taxInsight()             - Tax optimization ideas
│  ├─ goalInsight()            - Goal progress updates
│  └─ riskInsight()            - Risk-related insights
│
├─ RecommendationEngineAI (ML-powered)
│  ├─ scoreRecommendations()   - ML ranking model
│  ├─ filterByContext()        - User-specific filtering
│  ├─ explainRecommendation()  - Generate explanation
│  └─ calculateImpact()        - Expected portfolio impact
│
└─ SentimentAnalysisService
   ├─ analyzeSentiment()       - Extract market sentiment
   ├─ getSectorSentiment()     - Sector-level sentiment
   ├─ getTickerSentiment()     - Individual stock sentiment
   └─ generateAlert()          - Alert on sentiment shifts
```
```

---

### 4. Data Access Layer (Prisma ORM)
**Components:**
- Prisma Client
- Database schema
- Type-safe queries
- Migration system

**Responsibilities:**
- Execute database operations
- Ensure data consistency
- Handle transactions
- Provide TypeScript types

**Database Design:**
- SQLite file-based (no server)
- 11 models
- Relationships with foreign keys
- Cascade deletes where appropriate

---

## Data Flow Example: User Analyzes Savings

```
1. USER ACTION (Frontend)
   └─ User fills savings form & clicks "Analyze"
   
2. API CALL (React)
   ├─ Form validation (Zod)
   ├─ POST /api/v1/savings
   └─ Include JWT token in header
   
3. EXPRESS MIDDLEWARE
   ├─ JWT validation ✓
   ├─ CORS check ✓
   └─ Body parsing ✓
   
4. API ENDPOINT
   ├─ POST /api/v1/savings handler
   ├─ Request validation
   ├─ Extract userId from JWT
   └─ Call SavingsAnalysisService
   
5. BUSINESS LOGIC
   ├─ SavingsAnalysisService.analyze()
   ├─ Calculate 5 metrics:
   │  ├─ savingsRate
   │  ├─ monthsOfExpenses
   │  ├─ recommendedEmergencyFund
   │  └─ projectedSavings (1/5/10 yr)
   └─ Return analysis object
   
6. DATA PERSISTENCE
   ├─ Prisma saves to SQLite
   ├─ CREATE: Savings record
   ├─ RETURN: Saved data with ID
   └─ Time: <100ms
   
7. RESPONSE (API)
   ├─ HTTP 201 Created
   ├─ JSON response:
   │  {
   │    "id": "123",
   │    "userId": "user-456",
   │    "currentSavings": 50000,
   │    "monthlyIncome": 8000,
   │    "monthlySavings": 2000,
   │    "savingStartDate": "2023-01-01",
   │    "analysis": {
   │      "savingsRate": 0.25,
   │      "monthsOfExpenses": 5,
   │      "recommendedEmergencyFund": 25000,
   │      "projection": {...}
   │    }
   │  }
   └─ Time: <500ms
   
8. FRONTEND UPDATE
   ├─ Receive response
   ├─ Update Zustand store
   ├─ Re-render components
   ├─ Display analysis results
   └─ Time: <1s (perceived instant)
   
9. VISUALIZATION
   ├─ Charts rendered (Recharts)
   ├─ Metrics displayed
   ├─ Recommendations shown
   └─ User sees results
```

---

## Security Architecture

### Authentication
- JWT tokens (24h expiry)
- Refresh token flow
- Password hashing (bcrypt, 10+ rounds)
- Secure token storage (localStorage)

### Data Protection
- HTTPS only in production
- CORS validation (origin: localhost:3000)
- SQL injection prevention (Prisma)
- Input validation (Zod)
- Rate limiting (future sprint)

### Authorization
- JWT middleware on protected routes
- User isolation (can only see own data)
- Role-based access (future sprint)

---

## Performance Considerations

### Frontend
- Code splitting by route
- Lazy loading components
- Image optimization
- Caching strategies

### Backend
- Efficient database queries
- Connection pooling (future)
- Response caching (future)
- Pagination for large datasets

### Database
- Indexes on frequently queried columns
- Query optimization
- No N+1 queries (Prisma prevents)

---

## Scalability Path (Future Sprints)

```
Current (Sprint 1)
├─ Single Node.js server
├─ SQLite local database
└─ Horizontal scaling not needed

Sprint 5+
├─ Docker containerization
├─ Load balancing (Nginx)
├─ PostgreSQL (for production)
├─ Redis caching layer
├─ Message queue (for async jobs)
└─ Microservices (if needed)
```

---

## Error Handling Strategy

```
Level 1: Input Validation (Frontend)
└─ Form validation, type checking

Level 2: Request Validation (Backend Middleware)
└─ Schema validation (Zod), auth checks

Level 3: Business Logic Validation
└─ Business rule checks, data consistency

Level 4: Database Constraints
└─ Unique constraints, foreign keys

Level 5: Error Response to Frontend
└─ HTTP status codes, error messages
```

**Example Flow:**
```
User uploads invalid CSV
  ↓
Frontend shows file picker error
  ↓
Backend csvParser validates each row
  ↓
Returns detailed error: "Row 5: Invalid date format"
  ↓
Frontend displays error with line number
  ↓
User can fix and retry
```

---

## Technology Rationale

| Technology | Why Selected | Alternative Considered |
|-----------|-------------|--------|
| React | Component-based, large ecosystem, fast | Vue, Angular |
| Express.js | Lightweight, flexible, Node.js standard | FastAPI, Spring |
| TypeScript | Type safety, catches errors early | JavaScript |
| SQLite | No infrastructure, perfect for MVP | PostgreSQL (overkill) |
| Prisma | Type-safe ORM, great DX | Sequelize, TypeORM |
| Material-UI | Complete component library, accessible | Tailwind (more manual) |
| Recharts | Simple charting library | D3.js (too complex) |
| Zod | Runtime validation, TypeScript integration | Joi, Yup |
| JWT | Stateless auth, scalable | Session cookies |

---

*Created: 2026-05-08*  
*For: Investment Advisor MVP - Sprint 1*
