# Investment Advisor - Sprint 1 User Stories & Acceptance Criteria

## Story 1.1: Savings Analysis & Projections
**Epic:** Financial Analysis
**Priority:** High
**Story Points:** 8

### User Story
**As a** user with savings goals
**I want** to analyze my current savings and see projections
**So that** I can understand my financial trajectory and plan accordingly

### Acceptance Criteria
- [ ] Users can input current savings, monthly income, and monthly savings amount
- [ ] System calculates monthly savings rate and displays as percentage
- [ ] System calculates months of living expenses based on current savings
- [ ] System recommends emergency fund target (3-6 months of expenses)
- [ ] System projects savings growth over 1, 5, 10 years with 6% annual return
- [ ] Projection shows compound growth visualization with chart
- [ ] Users can upload CSV with savings history
- [ ] CSV parser validates required fields (date, amount)
- [ ] System handles 1000+ records in <5 seconds
- [ ] Error messages guide users to fix invalid data

### Technical Tasks
- [ ] Create SavingsAnalysisService with calculation methods
- [ ] Create csvParser utility for savings data
- [ ] Build SavingsAnalysis.tsx component with form inputs
- [ ] Integrate Recharts for growth visualization
- [ ] Create API endpoints POST /api/v1/savings, GET /api/v1/savings

### Definition of Done
- [ ] Unit tests: 90%+ coverage
- [ ] Integration tests pass
- [ ] API documentation complete
- [ ] Component tested with Material-UI
- [ ] CSV import tested with edge cases

---

## Story 1.2: Portfolio Tracking & Asset Allocation
**Epic:** Portfolio Management
**Priority:** High
**Story Points:** 8

### User Story
**As a** investor
**I want** to see my complete portfolio breakdown by asset class
**So that** I can understand my diversification and adjust if needed

### Acceptance Criteria
- [ ] Users can add holdings (ticker, quantity, cost basis, current value)
- [ ] System calculates total portfolio value
- [ ] System calculates allocation percentages by asset class (stocks, bonds, real estate, crypto, etc.)
- [ ] System displays pie chart of allocation
- [ ] Users can upload portfolio CSV with holding details
- [ ] CSV validation checks for duplicate tickers and negative quantities
- [ ] System shows individual holding performance (gain/loss %)
- [ ] Holdings display in sortable table (by ticker, value, gain %)
- [ ] Users can edit or delete holdings
- [ ] System calculates total gain/loss in dollars and percent

### Technical Tasks
- [ ] Create Portfolio model in Prisma with Holding relations
- [ ] Create PortfolioAnalysisService for composition calculations
- [ ] Build Portfolio.tsx page with holdings table
- [ ] Create RebalancingAlert model for tracking drift
- [ ] API endpoints: POST /api/v1/portfolio, GET /api/v1/portfolio/:id/holdings

### Definition of Done
- [ ] Unit tests: 90%+ coverage
- [ ] CSV import tested
- [ ] Performance calculations verified manually
- [ ] UI responsive on mobile & desktop
- [ ] Accessibility: WCAG AA compliant

---

## Story 1.3: Risk Assessment & Portfolio Analysis
**Epic:** Portfolio Analysis
**Priority:** High
**Story Points:** 5

### User Story
**As a** risk-conscious investor
**I want** to understand my portfolio's risk level and volatility
**So that** I can decide if my allocation matches my risk tolerance

### Acceptance Criteria
- [ ] System calculates portfolio volatility (standard deviation)
- [ ] System calculates Sharpe ratio based on asset mix
- [ ] System calculates maximum drawdown in portfolio
- [ ] System classifies risk level as Low / Medium / High based on stock %
- [ ] Low-risk threshold: <40% stocks
- [ ] Medium-risk threshold: 40-70% stocks
- [ ] High-risk threshold: >70% stocks
- [ ] System displays risk score (1-10) with explanation
- [ ] Risk assessment compares to user's stated risk tolerance
- [ ] System shows recommendation if allocation mismatches tolerance

### Technical Tasks
- [ ] Create calculations.ts utility for volatility, Sharpe, max drawdown
- [ ] Create RiskAssessmentService
- [ ] Build risk display component with gauge chart
- [ ] API endpoint: GET /api/v1/analysis/risk/:portfolioId

### Definition of Done
- [ ] Mathematical calculations verified with financial formulas
- [ ] Unit tests cover edge cases (single holding, all bonds, etc.)
- [ ] Risk recommendation shown clearly
- [ ] Component displays on Portfolio page

---

## Story 1.4: Tax Optimization Opportunities
**Epic:** Tax Efficiency
**Priority:** Medium
**Story Points:** 8

### User Story
**As a** taxpayer
**I want** to identify tax loss harvesting opportunities
**So that** I can reduce my tax liability strategically

### Acceptance Criteria
- [ ] System identifies holdings with unrealized losses
- [ ] System calculates potential tax savings from harvesting
- [ ] System shows holding period (short-term vs long-term)
- [ ] Short-term losses taxed at marginal rate (37% default, configurable)
- [ ] Long-term gains taxed at 20% (configurable)
- [ ] System recommends similar assets to swap to avoid wash sale
- [ ] System enforces 30-day wash sale rule
- [ ] System shows estimated capital gains tax on portfolio
- [ ] Users can model different capital gains scenarios
- [ ] System prioritizes harvesting by tax benefit amount

### Technical Tasks
- [ ] Create TaxOptimizationService with harvesting calculations
- [ ] Create TaxOptimization model in Prisma
- [ ] Build TaxOptimization.tsx page with recommendations
- [ ] Create tax scenario calculator component
- [ ] API endpoints: GET /api/v1/analysis/tax-optimization/:portfolioId

### Definition of Done
- [ ] Tax calculations verified by financial advisor or CPA
- [ ] Unit tests: 90%+ coverage
- [ ] Recommendation explanations clear for non-tax professionals
- [ ] UI shows both immediate and long-term opportunities

---

## Story 1.5: Portfolio Rebalancing Recommendations
**Epic:** Portfolio Optimization
**Priority:** Medium
**Story Points:** 8

### User Story
**As a** long-term investor
**I want** to know when my portfolio drifts from my target allocation
**So that** I can rebalance and maintain my investment strategy

### Acceptance Criteria
- [ ] Users can define target allocation by asset class
- [ ] System calculates current allocation vs target
- [ ] System shows drift percentage by asset class
- [ ] System triggers alert when drift exceeds threshold (default 5%)
- [ ] System recommends which holdings to buy/sell to rebalance
- [ ] System calculates tax impact of proposed trades
- [ ] System shows before/after allocation after rebalancing
- [ ] System can perform dry-run (preview) of rebalancing
- [ ] System tracks rebalancing history with dates
- [ ] System suggests rebalancing triggers (quarterly, semi-annual, etc.)

### Technical Tasks
- [ ] Create RebalancingService with drift calculation
- [ ] Create RebalancingAlert model
- [ ] Create PortfolioHistory model for tracking changes
- [ ] Build rebalancing recommendation UI component
- [ ] API endpoint: GET /api/v1/analysis/rebalancing/:portfolioId

### Definition of Done
- [ ] Drift calculations verified mathematically
- [ ] Tax impact shown accurately
- [ ] Rebalancing preview component tested
- [ ] Alert system working with configurable thresholds

---

## Story 1.6: Goal-Based Planning & Tracking
**Epic:** Financial Goals
**Priority:** High
**Story Points:** 8

### User Story
**As a** financial planner
**I want** to set and track multiple financial goals with priorities
**So that** I can allocate resources strategically toward what matters most

### Acceptance Criteria
- [ ] Users can create multiple goals (emergency fund, down payment, retirement, etc.)
- [ ] Each goal has target amount, target date, priority level
- [ ] Users set risk tolerance per goal (conservative/moderate/aggressive)
- [ ] System calculates required monthly savings to reach goal
- [ ] System calculates required return % to reach goal on time
- [ ] System shows progress toward each goal (% complete)
- [ ] System recommends asset allocation per goal based on timeline
- [ ] Goals can be linked to portfolio for tracking
- [ ] System sends alerts when goal progress falls behind
- [ ] Users can edit goals or mark as completed

### Technical Tasks
- [ ] Create SavingsGoal model in Prisma
- [ ] Create GoalPlanningService with calculations
- [ ] Build GoalPlanning.tsx page with goal CRUD
- [ ] Create goal progress visualization
- [ ] API endpoints: POST /api/v1/goals, GET /api/v1/goals, PUT /api/v1/goals/:id

### Definition of Done
- [ ] Goal calculations mathematically verified
- [ ] UI shows clear progress indicators
- [ ] Goal recommendations tested with various scenarios
- [ ] Alerts trigger appropriately

---

## Story 1.7: Investment Recommendations Engine
**Epic:** Personalized Advice
**Priority:** Medium
**Story Points:** 8

### User Story
**As a** individual investor
**I want** to receive personalized investment recommendations
**So that** I can improve my portfolio based on my profile and goals

### Acceptance Criteria
- [ ] System analyzes user profile (risk tolerance, time horizon, income)
- [ ] System scores each recommendation by impact and priority
- [ ] System generates 5-10 actionable recommendations per portfolio
- [ ] Recommendations include: rebalancing, diversification, tax harvesting, goal adjustments
- [ ] Each recommendation shows estimated financial impact ($)
- [ ] Recommendations ranked by priority (high/medium/low)
- [ ] Users can view, accept, or dismiss recommendations
- [ ] System tracks recommendation history
- [ ] Recommendations updated when portfolio or goals change
- [ ] System explains rationale for each recommendation

### Technical Tasks
- [ ] Create Recommendation model in Prisma
- [ ] Create RecommendationEngineService with scoring logic
- [ ] Build Recommendations.tsx page with card layout
- [ ] Create recommendation detail modal
- [ ] API endpoints: GET /api/v1/recommendations, PUT /api/v1/recommendations/:id

### Definition of Done
- [ ] Recommendation scoring algorithm tested
- [ ] UI displays recommendations clearly
- [ ] Impact calculations verified
- [ ] Recommendation history persisted correctly

---

## Story 1.8: Authentication & User Management
**Epic:** Security & Users
**Priority:** High
**Story Points:** 5

### User Story
**As a** user
**I want** to securely register, login, and manage my account
**So that** my financial data is protected and only I can access it

### Acceptance Criteria
- [ ] Users can register with email and password
- [ ] System hashes passwords with bcrypt (10+ rounds)
- [ ] Users can login with email/password
- [ ] System issues JWT token valid for 24 hours
- [ ] Users can refresh token to extend session
- [ ] Users can logout and clear session
- [ ] All protected endpoints require valid JWT
- [ ] System validates email format
- [ ] Passwords must be 8+ characters with complexity
- [ ] Users cannot view other users' data

### Technical Tasks
- [ ] Create User model in Prisma
- [ ] Create auth middleware for JWT validation
- [ ] Build authentication service (register/login/logout)
- [ ] Create login form component
- [ ] API endpoints: POST /auth/register, POST /auth/login, POST /auth/logout

### Definition of Done
- [ ] JWT tokens tested and validated
- [ ] Password hashing verified
- [ ] Protected routes tested
- [ ] Login/register UI works

---

## Story 1.9: CSV Data Import with Validation
**Epic:** Data Management
**Priority:** Medium
**Story Points:** 5

### User Story
**As a** user
**I want** to bulk import my savings and portfolio data via CSV
**So that** I don't have to manually enter each data point

### Acceptance Criteria
- [ ] System accepts CSV format files (.csv only)
- [ ] Supports savings import: date, amount (minimum 2 columns)
- [ ] Supports portfolio import: ticker, quantity, cost_basis, current_value
- [ ] System validates all required columns present
- [ ] System checks for negative quantities/values
- [ ] System detects duplicate tickers in upload
- [ ] Error report shows line numbers and reasons
- [ ] Success report shows X records imported
- [ ] Users can preview data before confirming import
- [ ] System performs partial import if some rows fail

### Technical Tasks
- [ ] Create csvParser utility with validation
- [ ] Build CSV upload component with drag-drop
- [ ] Create preview/confirmation dialog
- [ ] Create error report display
- [ ] API endpoint: POST /api/v1/*/upload-csv

### Definition of Done
- [ ] CSV parsing tested with edge cases
- [ ] Validation rules enforced
- [ ] Error messages guide user to fix issues
- [ ] Upload UI intuitive

---

## Story 1.10: Dashboard Overview & Analytics
**Epic:** User Interface
**Priority:** Medium
**Story Points:** 5

### User Story
**As a** investor
**I want** to see a dashboard with my key financial metrics at a glance
**So that** I can quickly assess my financial health

### Acceptance Criteria
- [ ] Dashboard displays total savings amount
- [ ] Dashboard shows portfolio total value
- [ ] Dashboard displays monthly savings rate
- [ ] Dashboard shows number of active goals
- [ ] Dashboard shows top 3 recommendations
- [ ] Dashboard displays portfolio allocation pie chart
- [ ] Dashboard shows portfolio performance (today, 1m, YTD)
- [ ] Dashboard cards are clickable to detail pages
- [ ] Dashboard refreshes data on load
- [ ] Dashboard is responsive on mobile

### Technical Tasks
- [ ] Create Dashboard.tsx component
- [ ] Design dashboard layout with Material-UI Grid
- [ ] Fetch and display all key metrics
- [ ] Create API aggregation endpoint
- [ ] Integrate Recharts for visualizations

### Definition of Done
- [ ] Dashboard loads all data <2 seconds
- [ ] All charts render correctly
- [ ] Mobile responsive tested
- [ ] Metrics accuracy verified

---

## Dependencies & Sequencing

```
Order of Implementation:
1. Story 1.8 (Auth) - Foundation for all others
2. Story 1.1 (Savings) - Core data entry
3. Story 1.2 (Portfolio) - Core data entry
4. Story 1.3 (Risk) - Analysis on portfolio data
5. Story 1.4 (Tax) - Analysis on portfolio data
6. Story 1.5 (Rebalancing) - Depends on portfolio + risk
7. Story 1.6 (Goals) - Depends on savings + portfolio
8. Story 1.7 (Recommendations) - Depends on all analysis
9. Story 1.9 (CSV Import) - Enhancement for data entry
10. Story 1.10 (Dashboard) - Final UI layer
```

---

## Estimation Summary

| Story | Points | Status |
|-------|--------|--------|
| 1.1 | 8 | Completed ✅ |
| 1.2 | 8 | Completed ✅ |
| 1.3 | 5 | Completed ✅ |
| 1.4 | 8 | Completed ✅ |
| 1.5 | 8 | Completed ✅ |
| 1.6 | 8 | In Progress 🔄 |
| 1.7 | 8 | Completed ✅ |
| 1.8 | 5 | Completed ✅ |
| 1.9 | 5 | In Progress 🔄 |
| 1.10 | 5 | In Progress 🔄 |
| **TOTAL** | **68** | |

**Sprint Velocity:** 68 points in Sprint 1

---

## Implementation Notes

| Story | Backend | Frontend | Notes |
|---|---|---|---|
| 1.1 | `SavingsAnalysisService.ts` + `savingsRoutes.ts` | `SavingsAnalysis.tsx` | Complete |
| 1.2 | `PortfolioAnalysisService.ts` + `portfolioRoutes.ts` | `Portfolio.tsx` | Complete |
| 1.3 | `calculations.ts` + `portfolioRoutes.ts` | `RiskAlerts.tsx` | Complete |
| 1.4 | `TaxOptimizationService.ts` + `portfolioRoutes.ts` | `TaxOptimization.tsx` | Complete |
| 1.5 | `PortfolioAnalysisService.ts` + `portfolioRoutes.ts` | `Portfolio.tsx` | Complete |
| 1.6 | No backend route registered | `GoalPlanning.tsx` | Frontend complete; `goalsRoutes.ts` not yet wired in `index.ts` |
| 1.7 | `RecommendationEngineService.ts` + `recommendationsRoutes.ts` | `Recommendations.tsx` | Complete |
| 1.8 | `authRoutes.ts` + `middleware/auth.ts` | `Login.tsx` | Complete |
| 1.9 | `csvParser.ts` + upload endpoints in routes | — | Backend utility complete; frontend upload UI not yet a standalone component |
| 1.10 | No `/api/v1/dashboard` aggregation route | `Dashboard.tsx` | Frontend page complete; backend summary endpoint not yet implemented |
