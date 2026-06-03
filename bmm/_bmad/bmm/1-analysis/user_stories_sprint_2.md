# Investment Advisor - Sprint 2 User Stories & Acceptance Criteria

## Sprint Overview

**Sprint:** 2 | **Name:** AI Layer — Conversational Advisor & Intelligent Analytics  
**Epic:** AI-Powered Financial Intelligence  
**Scope:** AI chat advisor, anomaly detection, portfolio forecasting, personalised insights, and AI-enhanced recommendations

All AI services are implemented in the backend (`backend/src/services/ai/`). Frontend pages are in place; specialist UI components (ForecastChart, AnomalyAlerts, InsightCards) are in the next sprint.

---

## Story 2.1: AI Financial Chat Advisor
**Epic:** Conversational AI  
**Priority:** High  
**Story Points:** 8

### User Story
**As a** retail investor  
**I want** to ask financial questions to an AI advisor in plain language  
**So that** I can get contextual guidance without needing to book a human advisor

### Acceptance Criteria
- [ ] User can open a chat interface and send a free-text message
- [ ] AI responds within 5 seconds (95th percentile)
- [ ] Response is contextual to the user's portfolio and goals
- [ ] Each AI response includes a risk disclaimer
- [ ] Rate limiting enforced (30 requests per minute per user)
- [ ] Monthly usage cost limit per user enforced
- [ ] Error messages are user-friendly with suggested alternatives

### Technical Tasks
- [x] `chatService.ts` — message processing with user context injection
- [x] `POST /api/v1/ai/chat` — send message endpoint (auth required)
- [x] `aiMetrics.ts` — cost tracking and rate limit enforcement
- [x] `AiChat.tsx` — chat page with message input and response display
- [x] `AiChatPanel.tsx` — chat panel component

### Definition of Done
- [x] Backend service implemented and connected
- [x] API endpoint returns structured response with tokens and timestamp
- [x] Rate limiting and cost tracking active
- [ ] Frontend specialist chat component with streaming UX
- [ ] Response time logged and monitored

---

## Story 2.2: Conversation History Management
**Epic:** Conversational AI  
**Priority:** Medium  
**Story Points:** 5

### User Story
**As a** returning user  
**I want** to browse and resume previous AI conversations  
**So that** I can reference past advice and continue where I left off

### Acceptance Criteria
- [ ] Conversations list shows up to 20 most recent conversations
- [ ] Each entry shows last message preview and date
- [ ] Clicking a conversation loads its full message history
- [ ] User can delete any conversation
- [ ] Conversation history is user-scoped (no cross-user access)

### Technical Tasks
- [x] `chatService.listUserConversations(userId, limit)` — paginated list
- [x] `chatService.getConversationHistory(conversationId)` — full history
- [x] `chatService.deleteConversation(conversationId)` — soft delete
- [x] `GET /api/v1/ai/chat` — list conversations endpoint
- [x] `GET /api/v1/ai/chat/:id` — get conversation history endpoint
- [x] `DELETE /api/v1/ai/chat/:id` — delete conversation endpoint
- [ ] `AiChat.tsx` — sidebar showing conversation list with resume support

### Definition of Done
- [x] All three backend endpoints functional
- [x] Conversations scoped to authenticated user
- [ ] Frontend conversation list UI with load and delete actions
- [ ] Pagination working for users with 50+ conversations

---

## Story 2.3: Anomaly Detection & Risk Alerts
**Epic:** Proactive Risk Monitoring  
**Priority:** High  
**Story Points:** 8

### User Story
**As a** investor  
**I want** to be proactively alerted when unusual risks appear in my portfolio  
**So that** I can act before anomalies become realised losses

### Acceptance Criteria
- [ ] System detects anomalies: concentration spikes, correlation breakdowns, volatility surges
- [ ] Anomalies classified by severity — High / Medium / Low
- [ ] Each alert includes a plain-language explanation and recommended action
- [ ] User can acknowledge and dismiss an alert
- [ ] Detection can be triggered manually for any portfolio
- [ ] Alerts summary shows counts by severity level

### Technical Tasks
- [x] `anomalyDetectionService.ts` — detection logic (concentration, correlation, volatility)
- [x] `anomalyDetectionService.detectAnomalies(userId, portfolioId)` — run analysis
- [x] `anomalyDetectionService.getCurrentAnomalies(userId)` — retrieve active alerts
- [x] `anomalyDetectionService.acknowledgeAnomaly(id)` — dismiss alert
- [x] `GET /api/v1/ai/anomalies` — fetch current anomalies with severity counts
- [x] `POST /api/v1/ai/anomalies/:id/acknowledge` — acknowledge alert
- [x] `POST /api/v1/ai/analyze` — trigger detection asynchronously
- [x] `RiskAlerts.tsx` — page displaying active risk alerts

### Definition of Done
- [x] Backend detection service complete
- [x] All three API endpoints functional
- [x] Frontend page renders alert list
- [ ] Specialist AnomalyAlerts component with severity colour coding
- [ ] Detection runs automatically on portfolio update

---

## Story 2.4: Portfolio Forecasting
**Epic:** Predictive Analytics  
**Priority:** High  
**Story Points:** 8

### User Story
**As a** investor  
**I want** to see data-driven projections of my portfolio's future value  
**So that** I can plan ahead and evaluate whether my current strategy is on track

### Acceptance Criteria
- [ ] Forecast available for 1-month, 3-month, and 12-month periods
- [ ] Forecast shows expected value with upper and lower confidence bounds
- [ ] Key metrics shown: expected return, volatility, Sharpe ratio
- [ ] Forecast methodology explained in plain language (ARIMA)
- [ ] Forecasts cached for 24 hours to avoid redundant computation
- [ ] Cached vs freshly computed forecast is indicated in response

### Technical Tasks
- [x] `predictiveAnalyticsService.ts` — ARIMA-based forecasting engine
- [x] `predictiveAnalyticsService.forecastPortfolio(userId, portfolioId, period)` — generate forecast
- [x] `predictiveAnalyticsService.getCachedForecast(userId, portfolioId, period)` — cache retrieval
- [x] `GET /api/v1/ai/forecast?portfolioId=&period=` — forecast endpoint (1m, 3m, 12m)
- [x] `PortfolioForecast.tsx` — page displaying forecast chart and metrics

### Definition of Done
- [x] Forecasting service complete with caching
- [x] API endpoint validates period parameter and returns structured response
- [x] Frontend page renders forecast output
- [ ] Specialist ForecastChart component with confidence band visualisation
- [ ] Historical accuracy tracked and displayed

---

## Story 2.5: AI-Enhanced Recommendations
**Epic:** Personalised Advice  
**Priority:** High  
**Story Points:** 8

### User Story
**As a** investor  
**I want** to receive AI-scored, prioritised investment recommendations  
**So that** I focus on the actions with the highest impact first

### Acceptance Criteria
- [ ] Recommendations ranked by ML-based priority scoring
- [ ] Each recommendation includes confidence score (0–100%), estimated impact (₹), and reasoning
- [ ] Recommendation types: rebalancing, tax-loss harvesting, diversification, goal adjustment
- [ ] Pros and cons listed for each recommendation
- [ ] User can accept or dismiss a recommendation
- [ ] Dismissed/accepted status persisted and tracked

### Technical Tasks
- [x] `RecommendationEngineService.ts` — scoring and generation with AI ranking
- [x] `recommendationsRoutes.ts` — CRUD endpoints for recommendations
- [x] `GET /api/v1/recommendations` — fetch ranked recommendations
- [x] `PUT /api/v1/recommendations/:id` — update status (accept/dismiss)
- [x] `Recommendations.tsx` — card-based recommendations page

### Definition of Done
- [x] AI scoring logic in recommendation engine
- [x] API endpoints return ranked list with confidence and impact
- [x] Frontend card layout shows type, priority, impact, and rationale
- [ ] Accept/dismiss actions update status and re-rank remaining recommendations
- [ ] Recommendation history page

---

## Story 2.6: Personalised Financial Insights
**Epic:** Behavioural Finance  
**Priority:** Medium  
**Story Points:** 8

### User Story
**As a** user  
**I want** to receive timely, personalised insights about my financial behaviour and portfolio  
**So that** I stay informed and avoid common investing mistakes

### Acceptance Criteria
- [ ] Insights are generated based on user's portfolio, goals, and behavioural patterns
- [ ] At least 1 new insight generated per session trigger
- [ ] Insight types include: performance, goal progress, tax efficiency, risk, behavioural
- [ ] Each insight includes specific action items ranked by benefit
- [ ] User can mark an insight as read or save it
- [ ] Unread insight count shown on dashboard

### Technical Tasks
- [x] `insightGenerationService.ts` — insight generation pipeline using AI
- [x] `insightGenerationService.generateInsights(userId)` — generate new insights
- [x] `insightGenerationService.getUserInsights(userId, type?)` — retrieve insights (filterable)
- [x] `insightGenerationService.markInsightAsRead(id)` — mark read
- [x] `GET /api/v1/ai/insights` — fetch insights with unread count
- [x] `POST /api/v1/ai/insights/generate` — trigger insight generation
- [x] `PUT /api/v1/ai/insights/:id/read` — mark as read
- [x] `Insights.tsx` — insights listing page

### Definition of Done
- [x] Insight generation service complete
- [x] All three API endpoints functional
- [x] Frontend page renders insight list
- [ ] Specialist InsightCards component with action item tracking
- [ ] Unread badge wired to dashboard

---

## Story 2.7: AI Usage Metrics
**Epic:** Platform Observability  
**Priority:** Low  
**Story Points:** 3

### User Story
**As a** platform administrator  
**I want** to track AI feature usage per user  
**So that** I can monitor costs and enforce fair-use limits

### Acceptance Criteria
- [ ] Per-user AI call counts tracked by feature type
- [ ] Monthly cost summary available
- [ ] Monthly usage limit enforced before API calls are made
- [ ] Usage data accessible via authenticated endpoint

### Technical Tasks
- [x] `aiMetrics.ts` — usage tracking and cost calculation utilities
- [x] `AIMetrics.checkCostLimit(userId)` — pre-call limit check
- [x] `AIMetrics.getUserUsageSummary(userId)` — summary statistics
- [x] `AIMetrics.getMonthlyMetrics(userId)` — monthly breakdown
- [x] `GET /api/v1/ai/metrics` — usage metrics endpoint

### Definition of Done
- [x] Metrics tracked on every AI call
- [x] Limit check blocks calls when threshold exceeded
- [x] API endpoint returns structured summary and monthly data
- [ ] Admin dashboard surface for cross-user metrics

---

## Dependencies & Sequencing

```
Story 2.1 (Chat) — requires Story 1.8 (Auth) to be complete
Story 2.2 (History) — requires Story 2.1 (Chat) to be complete
Story 2.3 (Anomalies) — requires Story 1.2 (Portfolio) to be complete
Story 2.4 (Forecast) — requires Story 1.2 (Portfolio) to be complete
Story 2.5 (AI Recommendations) — requires Story 1.7 (Recommendations Engine) to be complete
Story 2.6 (Insights) — requires Stories 1.2, 1.6, 1.7 to be complete
Story 2.7 (Metrics) — cross-cutting, implemented alongside all AI stories
```

---

## Estimation Summary

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

**Note:** "Basic" frontend means a page exists with data wired up. Specialist UI components (ForecastChart with confidence bands, AnomalyAlerts with severity colour coding, InsightCards with action tracking) are planned for Sprint 3.

---

## Implementation Notes

All AI services live under `backend/src/services/ai/`:

| Service | File | Responsibilities |
|---|---|---|
| Chat | `chatService.ts` | Message processing, conversation management, context injection |
| Anomaly Detection | `anomalyDetectionService.ts` | Concentration, correlation, and volatility anomaly detection |
| Forecasting | `predictiveAnalyticsService.ts` | ARIMA-based portfolio projections with caching |
| Insights | `insightGenerationService.ts` | Behavioural finance insight generation pipeline |
| AI index | `services/ai/index.ts` | Service barrel export |
| Metrics | `utils/aiMetrics.ts` | Cost tracking, rate limiting, usage summaries |

All AI routes are registered under `GET|POST /api/v1/ai/*` in `backend/src/api/routes/aiRoutes.ts`.
