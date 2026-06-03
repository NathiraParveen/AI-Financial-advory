# Investment Advisor - Technical Architecture

## System Overview

Investment Advisor is a full-stack web application designed following the BMM module structure, providing comprehensive investment analysis and planning capabilities.

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  - Dashboard, Analysis, Portfolio, Recommendations, Goals   │
│  - Material-UI Components, Recharts Visualizations          │
└────────────────────────────┬────────────────────────────────┘
                             │
                      HTTP/REST API
                             │
┌────────────────────────────┴────────────────────────────────┐
│                     BACKEND (Express.js)                    │
│  - Auth Routes, API Endpoints, Business Logic Services     │
│  - Data Validation, Error Handling, Logging                │
└────────────────────────────┬────────────────────────────────┘
                             │
                        SQL Queries
                             │
┌────────────────────────────┴────────────────────────────────┐
│          DATABASE (SQLite dev / PostgreSQL prod + Prisma)  │
│  - Users, Portfolios, Holdings, Recommendations, Analysis  │
│  - Chat, Forecasts, AnomalyAlerts, PersonalisedInsights    │
└─────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### Service Layer

#### 1. **SavingsAnalysisService**
Location: `backend/src/services/analysis/SavingsAnalysisService.ts`

**Responsibilities:**
- Analyze current savings position
- Calculate savings rate
- Project future savings
- Determine emergency fund needs
- Assess financial health

**Key Methods:**
```typescript
calculateSavingsRate(data: SavingsData): number
calculateMonthsOfExpenses(data: SavingsData): number
calculateRecommendedEmergencyFund(monthlyExpenses: number): number
projectSavingsGrowth(currentSavings, annualSavings, years, annualReturn): ProjectedSavings[]
analyze(data: SavingsData, monthlyExpenses): SavingsAnalysis
```

#### 2. **PortfolioAnalysisService**
Location: `backend/src/services/portfolio/PortfolioAnalysisService.ts`

**Responsibilities:**
- Analyze portfolio composition
- Calculate asset class allocation
- Assess portfolio risk
- Generate rebalancing recommendations
- Monitor allocation drift

**Key Methods:**
```typescript
calculateComposition(holdings: Holding[]): PortfolioComposition
assessRisk(composition: PortfolioComposition): RiskMetrics
getRecommendedAllocation(riskTolerance): PortfolioComposition
shouldRebalance(currentComposition, riskTolerance, threshold): boolean
getRebalancingRecommendations(current, riskTolerance): AllocationRecommendation[]
```

#### 3. **TaxOptimizationService**
Location: `backend/src/services/portfolio/TaxOptimizationService.ts`

**Responsibilities:**
- Identify tax-loss harvesting opportunities
- Calculate capital gains taxes
- Analyze tax-efficient rebalancing
- Determine holding periods
- Estimate tax savings

**Key Methods:**
```typescript
identifyTaxLossOpportunities(securities: TaxableSecurity[]): TaxLossOpportunity[]
calculateTotalTaxSavings(opportunities): number
determineHoldingPeriod(purchaseDate): 'short' | 'long'
calculateCapitalGainsTax(gainAmount, holdingPeriod): number
analyzeRebalancingForTaxes(securities, targetAllocation, current): RebalancingImpact[]
```

#### 4. **RecommendationEngineService**
Location: `backend/src/services/recommendations/RecommendationEngineService.ts`

**Responsibilities:**
- Generate personalized recommendations
- Consider user profile and goals
- Prioritize recommendations
- Score recommendations by impact
- Provide actionable insights

**Key Methods:**
```typescript
generateRecommendations(profile: UserProfile, goals: Goal[]): Recommendation[]
scoreRecommendation(rec: Recommendation): number
calculateMonetaryImpact(portfolioValue, expectedReturn): number
```

### Utility Services

#### **CSV Parser**
Location: `backend/src/utils/csvParser.ts`

**Functions:**
- `parseSavingsCSV(csvData)` - Parse savings upload
- `parsePortfolioCSV(csvData)` - Parse holdings data
- `validateSavingsData(data)` - Validate data integrity
- `validateHoldingsData(holdings)` - Validate holdings

#### **Calculation Engine**
Location: `backend/src/utils/calculations.ts`

**Financial Functions:**
- `calculateFutureValue()` - Compound interest calculations
- `calculatePresentValue()` - Discounted cash flow
- `calculateRequiredReturn()` - Needed return for goal
- `calculateAnnualizedReturn()` - CAGR calculations
- `calculateMonthlyPayment()` - Payments needed
- `calculateTimeToGoal()` - Timeline calculations
- `calculateStandardDeviation()` - Volatility
- `calculateSharpeRatio()` - Risk-adjusted returns
- `calculateRebalancingAmounts()` - Rebalancing calculations

### AI Services

#### **ChatService**
Location: `backend/src/services/ai/chatService.ts`

OpenAI GPT-4 conversational advisor. Injects portfolio and goals context into every conversation. Persists messages to `ChatConversation` / `ChatMessage` models and tracks token costs via `AIMetrics`.

#### **PredictiveAnalyticsService**
Location: `backend/src/services/ai/predictiveAnalyticsService.ts`

ARIMA-based portfolio forecasting for 1-month, 3-month, and 12-month horizons. Results are cached for 24 hours in `PortfolioForecast` model. Returns `expectedReturn`, `volatility`, `sharpeRatio`, `maxDrawdown`, `confidence`, and per-asset forecasts.

#### **AnomalyDetectionService**
Location: `backend/src/services/ai/anomalyDetectionService.ts`

Runs asynchronously on demand. Detects concentration risk, volatility spikes, and sector imbalances. Saves findings to `AnomalyAlert` with `high` / `medium` / `low` severity. Alerts remain until explicitly acknowledged.

#### **InsightGenerationService**
Location: `backend/src/services/ai/insightGenerationService.ts`

AI-generated personalised insights across four types: `performance`, `tax`, `goal`, `risk`. Uses GPT-4 with behavioural finance prompts. Persisted in `PersonalizedInsight` model; marked read once the user views them.

### API Routes

**Base URL:** `http://localhost:5000/api/v1`

#### Authentication
```
POST   /auth/register          - Register new user
POST   /auth/login             - User login
POST   /auth/refresh           - Refresh JWT token
```

#### Savings
```
GET    /savings                - Get user's savings
POST   /savings                - Create/update savings
POST   /savings/upload-csv     - Import CSV data
```

#### Portfolio
```
GET    /portfolio              - Get all portfolios
POST   /portfolio              - Create portfolio
GET    /portfolio/:id          - Get portfolio details
POST   /portfolio/:id/holdings - Add holding
POST   /portfolio/:id/upload-csv - Import holdings
```

#### Analysis
```
GET    /portfolio/:id/risk         - Risk assessment
GET    /portfolio/:id/tax          - Tax analysis
GET    /portfolio/:id/rebalancing  - Rebalancing analysis
```

#### AI Features
```
POST   /ai/chat                    - Send message to AI advisor
GET    /ai/chat                    - List conversations
GET    /ai/chat/:id                - Get conversation history
DELETE /ai/chat/:id                - Delete conversation
GET    /ai/forecast                - Portfolio forecast (ARIMA)
GET    /ai/anomalies               - Active anomaly alerts
POST   /ai/anomalies/:id/acknowledge - Acknowledge alert
POST   /ai/analyze                 - Trigger anomaly detection
GET    /ai/insights                - Get personalised insights
POST   /ai/insights/generate       - Generate new insights
PUT    /ai/insights/:id/read       - Mark insight as read
GET    /ai/metrics                 - AI usage and cost metrics
```

#### Recommendations
```
GET    /recommendations              - Get all recommendations
POST   /recommendations/:id/implement - Mark as implemented
POST   /recommendations/:id/dismiss   - Dismiss recommendation
```

## Database Schema

### Core Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  savings       Savings[]
  portfolios    Portfolio[]
  recommendations Recommendation[]
}
```

#### Savings
```prisma
model Savings {
  id              String    @id @default(cuid())
  userId          String
  user            User      @relation(...)
  
  currentSavings  Float
  monthlyIncome   Float
  monthlySavings  Float
  savingStartDate DateTime  @default(now())
  goals           SavingsGoal[]
}
```

#### Portfolio & Holdings
```prisma
model Portfolio {
  id          String    @id @default(cuid())
  userId      String
  name        String
  totalValue  Float
  
  holdings    Holding[]
  history     PortfolioHistory[]
  rebalancingAlerts RebalancingAlert[]
}

model Holding {
  id              String    @id @default(cuid())
  portfolioId     String
  ticker          String
  assetClass      String
  quantity        Float
  costBasis       Float
  currentValue    Float
  purchaseDate    DateTime
}
```

#### Recommendations
```prisma
model Recommendation {
  id              String    @id @default(cuid())
  userId          String
  type            String    // investment, rebalance, tax_harvest, etc.
  title           String
  description     String
  rationale       String
  estimatedImpact Float
  priority        String    // high, medium, low
  action          String
  status          String    @default("active")
}
```

## Frontend Architecture

### Page Structure

#### Dashboard (`src/pages/Dashboard.tsx`)
- Overview cards (Total Savings, Portfolio Value, Monthly Savings, Goals)
- Recent recommendations display
- Key metrics summary

#### Savings Analysis (`src/pages/SavingsAnalysis.tsx`)
- Upload savings data
- Analyze current position
- View historical trends
- Savings rate metrics

#### Portfolio (`src/pages/Portfolio.tsx`)
- View all holdings
- Asset allocation pie chart
- Performance tracking
- Rebalancing alerts

#### Recommendations (`src/pages/Recommendations.tsx`)
- View all active recommendations
- Implement or dismiss actions
- Filter by type/priority
- Impact estimation

#### Goal Planning (`src/pages/GoalPlanning.tsx`)
- Create financial goals
- Set priorities
- Track progress
- Timeline visualization

#### Tax Optimization (`src/pages/TaxOptimization.tsx`)
- Tax-loss harvesting opportunities
- Capital gains analysis
- Tax-efficient rebalancing
- Estimated tax savings

### Component Structure

#### Layout Components (`src/components/`)
- `Layout.tsx` - Main app layout with navigation
- Sidebar navigation
- AppBar with branding

#### Analysis Components (`src/components/analysis/`)
- Placeholder directory — sub-components to be built out

#### Portfolio Components (`src/components/portfolio/`)
- Placeholder directory — sub-components to be built out

#### Recommendation Components (`src/components/recommendations/`)
- Placeholder directory — sub-components to be built out

### State Management

**Tool:** Zustand

```typescript
// Example store structure
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  portfolios: [],
  setPortfolios: (portfolios) => set({ portfolios }),
  
  recommendations: [],
  setRecommendations: (recommendations) => set({ recommendations }),
}))
```

### API Client (`src/services/api.ts`)

**Methods:**
- Authentication: `register()`, `login()`, `logout()`
- Savings: `getSavings()`, `createSavings()`, `uploadSavingsCSV()`
- Portfolio: `getPortfolios()`, `createPortfolio()`, `addHolding()`
- Analysis: `getRiskAssessment()`, `getTaxOptimization()`, `getRebalancingAnalysis()`
- Recommendations: `getRecommendations()`, `implementRecommendation()`, `dismissRecommendation()`

## Shared Types (`shared/types.ts`)

All frontend and backend services share common TypeScript interfaces:
- `User`, `Savings`, `SavingsGoal`
- `Portfolio`, `Holding`, `PortfolioHistory`
- `Recommendation`, `RiskAssessment`
- `TaxOptimizationResult`, `RebalancingAlert`

## Data Flow Example

### User Uploads Portfolio CSV

1. **Frontend:** User selects CSV file
2. **Frontend:** Calls `api.uploadPortfolioCSV(portfolioId, file)`
3. **Axios:** Sends multipart request to backend
4. **Backend:** Receives at `POST /portfolio/:id/upload-csv`
5. **Backend:** Calls `csvParser.parsePortfolioCSV()`
6. **Backend:** Validates data with `validateHoldingsData()`
7. **Backend:** Saves holdings to database via Prisma
8. **Backend:** Returns updated portfolio
9. **Frontend:** Updates portfolio state in Zustand
10. **Frontend:** Re-renders portfolio page with new holdings

### System Generates Recommendations

1. **Backend:** Scheduled job or user triggers analysis
2. **Backend:** Loads user profile and portfolio
3. **Backend:** Calls `RecommendationEngineService.generateRecommendations()`
4. **Service:** Analyzes savings rate, goals, risk tolerance
5. **Service:** Generates array of recommendations
6. **Backend:** Saves recommendations to database
7. **Frontend:** Fetches via `api.getRecommendations()`
8. **Frontend:** Displays with priorities and actions
9. **User:** Can implement, dismiss, or review each

## Security Features

### Authentication
- JWT tokens with 7-day expiration
- Bcrypt password hashing (cost factor 10)
- Refresh token mechanism

### Authorization
- Middleware validates JWT on protected routes
- Users can only access their own data
- Database relations prevent cross-user access

### Data Validation
- Zod schema validation on all inputs
- CSV file validation before processing
- SQL injection prevention via Prisma

### CORS
- Configured for frontend origin only
- Credentials enabled for auth

## Performance Considerations

### Caching
- Frontend caches auth token in localStorage
- API responses cached at component level with Zustand

### Database Indexes
- Indexes on userId for faster queries
- Indexes on foreign keys
- Full-text search capabilities for future

### API Optimization
- Paginated endpoints for large datasets
- Selective field returns
- Compression with gzip

## Deployment Architecture

### Docker Setup
- Backend Node.js container (SQLite file persisted via volume mount)
- Frontend Nginx container
- Both connected via Docker Compose network
- No separate database container needed in dev (SQLite is file-based)

### Environment Configuration
- `.env.example` shows all required variables
- Development, staging, production configs
- Secrets management via environment

### Build Pipeline
- Backend: TypeScript → JavaScript
- Frontend: React → Static bundle (Vite)
- Both optimized for production

## Future Enhancements

1. **Real Market Data Integration**
   - Alpha Vantage API for stock prices
   - Yahoo Finance for historical data
   - Real-time portfolio valuations

2. **Banking Integration**
   - Plaid for account aggregation
   - Automatic transaction import
   - Multi-account management

3. **Advanced Analytics**
   - Machine learning for recommendations
   - Predictive modeling
   - Correlation analysis

4. **Reporting**
   - PDF report generation
   - Custom reports
   - Tax document exports

5. **Collaboration**
   - Family account management
   - Financial advisor tools
   - Portfolio sharing

---

**Architecture designed for scalability, maintainability, and user-focused financial planning.**
