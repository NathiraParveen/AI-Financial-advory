# Investment Advisor — Requirements

## Project context

This document provides a high-level requirements summary for the Investment Advisor platform. Detailed requirements, user stories, and acceptance criteria live in the BMM planning artifacts under `bmm/_bmad/bmm/`.

**Target users:** Indian retail investors managing personal savings, portfolios, and financial goals without access to a human wealth advisor.

**Platform:** Web application (mobile-first responsive design; native mobile app is a future phase).

---

## Functional requirements

### FR-1: Savings Analysis
- Users can input current savings, monthly income, and monthly savings amount
- System calculates savings rate, months of runway, and emergency fund status
- System projects savings growth over 1, 5, and 10 years with compound interest
- Users can upload savings history via CSV (validated, 1000+ records in <5 seconds)

### FR-2: Portfolio Tracking
- Users can add holdings (ticker, quantity, cost basis, current value)
- System calculates total portfolio value, allocation percentages, and individual performance
- Users can upload portfolio data via CSV with duplicate and negative-value validation
- Holdings display in sortable table; users can edit or delete entries

### FR-3: Risk Assessment
- System calculates portfolio volatility, Sharpe ratio, and maximum drawdown
- System classifies risk level (Low / Medium / High) based on equity allocation
- System compares portfolio risk profile to user's stated risk tolerance
- Risk score (1–10) is displayed with a plain-language explanation

### FR-4: Tax Optimization
- System identifies holdings with unrealized losses eligible for tax-loss harvesting
- System calculates potential tax savings and flags short-term vs long-term positions
- System enforces the 30-day wash sale rule and suggests replacement assets
- Users can model different capital gains realization scenarios

### FR-5: Portfolio Rebalancing
- Users define target allocation by asset class
- System detects drift and alerts when any class exceeds a configurable threshold (default 5%)
- System recommends buy/sell trades to restore target allocation
- System shows the tax impact of proposed rebalancing trades and tracks rebalancing history

### FR-6: Goal-Based Planning
- Users create multiple financial goals (emergency fund, down payment, retirement, etc.)
- Each goal has target amount, target date, priority, and per-goal risk tolerance
- System calculates required monthly savings and required return to meet each goal on time
- System recommends asset allocation per goal based on time horizon

### FR-7: Investment Recommendations
- System generates 5–10 prioritized, actionable recommendations per portfolio
- Recommendations cover rebalancing, diversification, tax harvesting, and goal adjustments
- Each recommendation shows estimated financial impact (₹) and rationale
- Users can accept or dismiss recommendations; history is tracked

### FR-8: Authentication & Access Control
- Users register and log in with email and password (bcrypt-hashed, JWT sessions)
- All financial data is user-scoped; no user can access another user's data
- JWT tokens valid for 24 hours with refresh capability

### FR-9: CSV Data Import
- System accepts `.csv` format for both savings and portfolio data imports
- Validation reports line-level errors with actionable guidance
- Users preview data before confirming import; partial import allowed on row-level failures

### FR-10: Dashboard Overview
- Dashboard surfaces total savings, portfolio value, savings rate, active goals, and top 3 recommendations
- Portfolio allocation pie chart and performance (today / 1-month / YTD) shown at a glance
- All dashboard cards link through to their respective detail pages
- Dashboard loads all data in under 2 seconds

### FR-11: AI Chat Advisor
- Conversational advisor answers financial questions with the user's portfolio and goals as context
- Advisor handles natural language questions about allocation, market conditions, and goal progress

### FR-12: AI Portfolio Forecasting
- ARIMA model generates 1-month, 3-month, and 12-month portfolio projections
- Forecast surfaces the trend and seasonality components (explainable output)

### FR-13: Anomaly Detection
- System monitors for unusual movements in portfolio holdings in real time
- Proactive alerts surface risk signals before they become realized losses

### FR-14: Behavioural Insights
- AI generates personalized insights grounded in behavioural finance principles (loss aversion, recency bias, etc.)

---

## Non-functional requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard loads in <2 seconds; CSV import of 1000+ records in <5 seconds |
| Security | Passwords hashed with bcrypt (10+ rounds); JWT auth on all protected endpoints; user data strictly scoped |
| Accessibility | WCAG AA compliant on all pages |
| Responsiveness | Fully functional on mobile and desktop |
| Test coverage | Unit tests targeting 90%+ coverage on all service-layer logic |
| Reliability | API endpoints return appropriate error codes with user-actionable messages |

---

## Detailed planning documents

| Artifact | Path |
|---|---|
| User Stories — Sprint 1 (10 stories, 68 points) | `bmm/_bmad/bmm/1-analysis/user_stories_sprint_1.md` |
| User Stories — Sprint 2 (7 AI stories, 48 points) | `bmm/_bmad/bmm/1-analysis/user_stories_sprint_2.md` |
| User Personas | `bmm/_bmad/bmm/1-analysis/user_personas.md` |
| User Journey Maps | `bmm/_bmad/bmm/1-analysis/user_journey_map.md` |
| Acceptance Criteria Checklist | `bmm/_bmad/bmm/1-analysis/acceptance_criteria_checklist.md` |
| System Architecture | `bmm/_bmad/bmm/2-plan-workflows/architecture_design.md` |
| API Contracts | `bmm/_bmad/bmm/2-plan-workflows/api_contracts.md` |
| AI Features Design | `bmm/_bmad/bmm/2-plan-workflows/ai_features_design.md` |
| AI Implementation Guide | `bmm/_bmad/bmm/2-plan-workflows/ai_implementation_guide.md` |
| Database Schema Design | `bmm/_bmad/bmm/3-solutioning/database_schema_design.md` |
| UI Design Specifications | `bmm/_bmad/bmm/3-solutioning/ui_design_specifications.md` |

---

## Sprint status summary

### Sprint 1 — Core Platform

| Story | Title | Points | Status |
|---|---|---|---|
| 1.1 | Savings Analysis & Projections | 8 | Completed ✅ |
| 1.2 | Portfolio Tracking & Asset Allocation | 8 | Completed ✅ |
| 1.3 | Risk Assessment & Portfolio Analysis | 5 | Completed ✅ |
| 1.4 | Tax Optimization Opportunities | 8 | Completed ✅ |
| 1.5 | Portfolio Rebalancing Recommendations | 8 | Completed ✅ |
| 1.6 | Goal-Based Planning & Tracking | 8 | In Progress 🔄 |
| 1.7 | Investment Recommendations Engine | 8 | Completed ✅ |
| 1.8 | Authentication & User Management | 5 | Completed ✅ |
| 1.9 | CSV Data Import with Validation | 5 | In Progress 🔄 |
| 1.10 | Dashboard Overview & Analytics | 5 | In Progress 🔄 |
| **Total** | | **68** | |

### Sprint 2 — AI Layer

| Story | Title | Points | Backend | Frontend |
|---|---|---|---|---|
| 2.1 | AI Financial Chat Advisor | 8 | Completed ✅ | Basic ✅ |
| 2.2 | Conversation History Management | 5 | Completed ✅ | In Progress 🔄 |
| 2.3 | Anomaly Detection & Risk Alerts | 8 | Completed ✅ | Basic ✅ |
| 2.4 | Portfolio Forecasting | 8 | Completed ✅ | Basic ✅ |
| 2.5 | AI-Enhanced Recommendations | 8 | Completed ✅ | Completed ✅ |
| 2.6 | Personalised Financial Insights | 8 | Completed ✅ | Basic ✅ |
| 2.7 | AI Usage Metrics | 3 | Completed ✅ | — |
| **Total** | | **48** | | |
