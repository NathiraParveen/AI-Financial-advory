# Sprint 1 - Acceptance Criteria Checklist

## Story 1.1: Savings Analysis & Projections

### Functional Requirements
- [x] Input form for: current savings, monthly income, monthly savings
- [x] Calculate savings rate percentage
- [x] Calculate months of expenses covered
- [x] Recommend emergency fund (3-6 months)
- [x] Project savings growth (1/5/10 year scenarios)
- [x] Display projection with chart visualization

### CSV Upload
- [x] Accept .csv file format
- [x] Parse: date, amount columns
- [x] Validate required fields
- [x] Show error for invalid data
- [x] Handle 1000+ records in <5s

### Data Validation
- [x] Reject negative amounts
- [x] Reject invalid dates
- [x] Show line number for errors
- [x] Allow partial import

### UI/UX
- [x] Drag-drop area for CSV
- [x] Success/error messages clear
- [x] Preview before confirming
- [x] Mobile responsive

---

## Story 1.2: Portfolio Tracking & Asset Allocation

### Portfolio Management
- [x] Add holdings (ticker, quantity, cost basis, current value)
- [x] Edit holdings
- [x] Delete holdings
- [x] Calculate total portfolio value

### Asset Allocation
- [x] Show allocation % by asset class
- [x] Display pie chart of allocation
- [x] Calculate individual gains/losses (% and $)
- [x] Sortable holdings table

### CSV Import
- [x] Parse: ticker, quantity, cost_basis, current_value
- [x] Check for duplicates
- [x] Reject negative quantities

### API Contracts
- [x] POST /api/v1/portfolio (create)
- [x] GET /api/v1/portfolio/:id (read)
- [x] GET /api/v1/portfolio/:id/holdings (list)
- [x] PUT /api/v1/portfolio/:id/holdings/:holdingId (update)
- [x] DELETE /api/v1/portfolio/:id/holdings/:holdingId (delete)

---

## Story 1.3: Risk Assessment & Portfolio Analysis

### Risk Metrics
- [x] Calculate volatility (standard deviation)
- [x] Calculate Sharpe ratio
- [x] Calculate max drawdown
- [x] Classify risk level (Low/Medium/High)

### Risk Classification
- [x] Low: <40% stocks
- [x] Medium: 40-70% stocks
- [x] High: >70% stocks

### Risk Score & Recommendations
- [x] Generate 1-10 risk score
- [x] Compare to user's risk tolerance
- [x] Show mismatch alert if needed
- [x] Explain reasoning

### API
- [x] GET /api/v1/analysis/risk/:portfolioId

---

## Story 1.4: Tax Optimization Opportunities

### Tax Loss Harvesting
- [x] Identify unrealized losses
- [x] Calculate tax savings amount
- [x] Show holding period (ST vs LT)
- [x] Recommend alternative holdings
- [x] Enforce 30-day wash sale rule

### Tax Calculations
- [x] Short-term: 37% rate (configurable)
- [x] Long-term: 20% rate (configurable)
- [x] Show estimated capital gains tax

### Tax Modeling
- [x] Scenario calculator
- [x] Show impact of different trades
- [x] Model realization timing

### Prioritization
- [x] Rank opportunities by tax benefit
- [x] Highlight most impactful first

### API
- [x] GET /api/v1/analysis/tax-optimization/:portfolioId

---

## Story 1.5: Portfolio Rebalancing Recommendations

### Rebalancing Triggers
- [x] Calculate drift from target allocation
- [x] Default threshold: 5%
- [x] Configurable threshold

### Rebalancing Recommendations
- [x] Specify which holdings to buy
- [x] Specify which holdings to sell
- [x] Show quantities/amounts

### Tax-Aware Rebalancing
- [x] Calculate tax impact of trades
- [x] Show before/after allocation
- [x] Consider tax harvesting opportunities

### Rebalancing Types
- [x] Dry-run (preview only)
- [x] Actual execution
- [x] Track rebalancing history

### Frequency Suggestions
- [x] Quarterly, semi-annual, annual options
- [x] Last rebalance date shown

### API
- [x] GET /api/v1/analysis/rebalancing/:portfolioId

---

## Story 1.6: Goal-Based Planning & Tracking

### Goal Creation
- [x] Create multiple goals
- [x] Goal name, target amount, target date
- [x] Priority (high/medium/low)
- [x] Risk tolerance per goal

### Goal Analysis
- [x] Calculate required monthly savings
- [x] Calculate required return %
- [x] Calculate progress % complete
- [x] Recommend asset allocation

### Goal Tracking
- [x] Link goals to portfolio
- [x] Track progress over time
- [x] Show if on track or behind

### Goal Alerts
- [x] Alert when progress falls behind
- [x] Alert when goal date approaching
- [x] Suggestion to increase savings or adjust date

### Goal Management
- [x] Edit goal parameters
- [x] Mark goal as completed
- [x] Delete goal

### API
- [x] POST /api/v1/goals (create)
- [x] GET /api/v1/goals (list)
- [x] PUT /api/v1/goals/:id (update)
- [x] DELETE /api/v1/goals/:id (delete)

---

## Story 1.7: Investment Recommendations Engine

### Recommendation Generation
- [x] Analyze user profile (risk, timeline, income)
- [x] Generate 5-10 recommendations per portfolio
- [x] Score recommendations by priority

### Recommendation Types
- [x] Rebalancing recommendations
- [x] Diversification suggestions
- [x] Tax optimization tips
- [x] Goal adjustments

### Recommendation Display
- [x] Show recommendation card
- [x] Display estimated impact ($)
- [x] Show priority (high/medium/low)
- [x] Explain rationale

### Recommendation Tracking
- [x] Users can accept/dismiss
- [x] Track history of recommendations
- [x] Update when profile changes

### API
- [x] GET /api/v1/recommendations
- [x] GET /api/v1/recommendations/:id
- [x] PUT /api/v1/recommendations/:id (accept/dismiss)

---

## Story 1.8: Authentication & User Management

### Registration
- [x] Email validation
- [x] Password requirements (8+ chars, complexity)
- [x] Bcrypt hashing (10+ rounds)
- [x] User creation in database

### Login
- [x] Email/password validation
- [x] JWT token generation (24h expiry)
- [x] Session management

### Authentication
- [x] JWT validation middleware
- [x] Protected route enforcement
- [x] Token refresh endpoint

### Session Management
- [x] Logout clears session
- [x] Expired tokens handled
- [x] User data isolation

### API
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/refresh
- [x] POST /auth/logout

---

## Story 1.9: CSV Data Import with Validation

### CSV Processing
- [x] Accept .csv files only
- [x] Parse with header detection
- [x] Validate column headers
- [x] Type conversion (numbers, dates)

### Validation Rules
- [x] Required columns present
- [x] No negative values
- [x] No null/empty critical fields
- [x] Valid date formats

### Error Handling
- [x] Line-by-line error reporting
- [x] Specific error messages
- [x] Partial import allowed
- [x] Detailed error report download

### User Experience
- [x] Preview before import
- [x] Confirm dialog
- [x] Success summary
- [x] Undo/rollback option

### Performance
- [x] Handle 1000+ rows in <5s
- [x] Progress indicator for large files
- [x] No UI freezing

---

## Story 1.10: Dashboard Overview & Analytics

### Dashboard Metrics
- [x] Total savings amount
- [x] Portfolio total value
- [x] Monthly savings rate %
- [x] Number of active goals
- [x] Top 3 recommendations

### Dashboard Visualizations
- [x] Portfolio allocation pie chart
- [x] Performance chart (today/1m/YTD)
- [x] Savings trend line chart

### Dashboard Interactivity
- [x] Metric cards clickable
- [x] Navigate to detail pages
- [x] Filter options (date range)

### Dashboard Performance
- [x] Load all data <2 seconds
- [x] Lazy load if needed
- [x] Cache data appropriately

### Responsive Design
- [x] Desktop (1920px+)
- [x] Tablet (768px+)
- [x] Mobile (375px+)
- [x] All charts responsive

---

## Cross-Cutting Requirements

### Security
- [x] All passwords hashed
- [x] JWT tokens secure
- [x] Input validation on all endpoints
- [x] SQL injection prevention (Prisma)
- [x] CORS configured
- [x] No sensitive data in logs

### Performance
- [x] API response time <500ms
- [x] Frontend loads <2s
- [x] Charts render <1s
- [x] CSV import handles large files

### Testing
- [x] 90%+ code coverage
- [x] Unit tests for services
- [x] Integration tests for APIs
- [x] Component tests for UI
- [x] E2E tests for workflows

### Documentation
- [x] API docs (OpenAPI/Swagger)
- [x] Component storybook
- [x] Setup guide
- [x] User guide
- [x] Architecture docs

### Accessibility
- [x] WCAG AA compliance
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Color contrast >4.5:1
- [x] Form labels

### Code Quality
- [x] TypeScript strict mode
- [x] No 'any' types (except error handlers)
- [x] ESLint rules enforced
- [x] Consistent naming conventions
- [x] DRY principles followed
