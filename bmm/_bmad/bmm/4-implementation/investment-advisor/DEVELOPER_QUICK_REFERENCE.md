# AI Features - Developer Quick Reference

**Last Updated**: January 15, 2024  
**Quick Links**: [Setup](#setup) | [Services](#services) | [API](#api) | [Examples](#examples) | [Debug](#debug)

---

## Setup

### 5-Minute Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local — set OPENAI_API_KEY for AI features

# 4. Database migrations (SQLite, no server needed)
npx prisma migrate dev

# 5. Start backend
npm run dev
```

### Environment Variables (Required)

```env
DATABASE_URL=file:./prisma/dev.db
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4
```

---

## Services

### ChatService

**Purpose**: AI Financial Advisor Chat  
**Location**: `src/services/ai/chatService.ts`

```typescript
import chatService from '@/services/ai/chatService';

// Send message
const result = await chatService.processMessage(
  userId,
  'How should I optimize my portfolio?',
  conversationId // optional
);
// Returns: { message, conversationId, tokens }

// Get conversation history
const messages = await chatService.getConversationHistory(conversationId);

// List user's conversations
const convs = await chatService.listUserConversations(userId, limit);

// Delete conversation
await chatService.deleteConversation(conversationId);
```

**Key Features**:
- OpenAI GPT-4 integration
- Context-aware (includes portfolio/goals)
- Conversation persistence
- Cost tracking

---

### PredictiveAnalyticsService

**Purpose**: Portfolio Forecasting  
**Location**: `src/services/ai/predictiveAnalyticsService.ts`

```typescript
import predictiveAnalyticsService from '@/services/ai/predictiveAnalyticsService';

// Generate forecast
const forecast = await predictiveAnalyticsService.forecastPortfolio(
  userId,
  portfolioId,
  '12m' // '1m' | '3m' | '12m'
);
// Returns: { expectedReturn, volatility, sharpeRatio, maxDrawdown, confidence, assetForecasts }

// Get cached forecast
const cached = await predictiveAnalyticsService.getCachedForecast(
  userId,
  portfolioId,
  '12m'
);
```

**Key Features**:
- ARIMA time series forecasting
- 1-month, 3-month, 12-month forecasts
- Confidence scoring
- 24-hour caching

---

### AnomalyDetectionService

**Purpose**: Portfolio Risk Monitoring  
**Location**: `src/services/ai/anomalyDetectionService.ts`

```typescript
import anomalyDetectionService from '@/services/ai/anomalyDetectionService';

// Detect anomalies
await anomalyDetectionService.detectAnomalies(userId, portfolioId);
// Async function, runs in background

// Get current anomalies
const anomalies = await anomalyDetectionService.getCurrentAnomalies(userId);
// Returns: Array of unacknowledged alerts

// Acknowledge anomaly
await anomalyDetectionService.acknowledgeAnomaly(anomalyId);

// Cleanup old data
await anomalyDetectionService.cleanupOldAnomalies(30); // 30 days
```

**Key Features**:
- Concentration risk detection
- Volatility monitoring
- Sector concentration analysis
- Real-time alerts

---

### InsightGenerationService

**Purpose**: Personalized Financial Insights  
**Location**: `src/services/ai/insightGenerationService.ts`

```typescript
import insightGenerationService from '@/services/ai/insightGenerationService';

// Generate insights
const insights = await insightGenerationService.generateInsights(userId);
// Returns: Array of insights with type, title, content, confidence

// Get user's insights
const userInsights = await insightGenerationService.getUserInsights(
  userId,
  'performance' // optional type filter
);

// Mark as read
await insightGenerationService.markInsightAsRead(insightId);
```

**Key Features**:
- Performance insights
- Goal progress updates
- Tax optimization ideas
- Diversification recommendations
- Behavioral alerts

---

## API

### Chat Endpoints

```
POST /api/v1/ai/chat
├─ Body: { message, conversationId? }
└─ Response: { conversationId, message, tokens, timestamp }

GET /api/v1/ai/chat
├─ Query: limit=20
└─ Response: { conversations: [], count }

GET /api/v1/ai/chat/:id
└─ Response: { conversationId, messages: [], count }

DELETE /api/v1/ai/chat/:id
└─ Response: { success, message }
```

### Forecast Endpoints

```
GET /api/v1/ai/forecast
├─ Query: portfolioId=xyz, period=12m
└─ Response: { portfolioId, period, expectedReturn, volatility, ...assetForecasts }
```

### Anomaly Endpoints

```
GET /api/v1/ai/anomalies
├─ Response: { anomalies: [], total, high, medium, low }

POST /api/v1/ai/anomalies/:id/acknowledge
└─ Response: { success, message }

POST /api/v1/ai/analyze
├─ Body: { portfolioId }
└─ Response: { success, message }
```

### Insights Endpoints

```
GET /api/v1/ai/insights
├─ Query: type? (performance|tax|goal|risk)
└─ Response: { insights: [], count, unread }

POST /api/v1/ai/insights/generate
└─ Response: { insights: [], generated }

PUT /api/v1/ai/insights/:id/read
└─ Response: { success, message }
```

### Metrics Endpoint

```
GET /api/v1/ai/metrics
└─ Response: { summary: {...}, monthly: {...} }
```

---

## Examples

### Example 1: Chat with AI

```typescript
// Frontend
const response = await fetch('/api/v1/ai/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Should I rebalance my portfolio?',
    conversationId: 'conv_123'
  })
});

const data = await response.json();
console.log(data.message); // AI response
```

### Example 2: Get Portfolio Forecast

```typescript
const forecast = await fetch(
  `/api/v1/ai/forecast?portfolioId=port_123&period=12m`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
).then(r => r.json());

console.log(`Expected return: ${(forecast.expectedReturn * 100).toFixed(2)}%`);
console.log(`Volatility: ${(forecast.volatility * 100).toFixed(2)}%`);
console.log(`Confidence: ${forecast.confidence}`);
```

### Example 3: Handle Anomalies

```typescript
// Get anomalies
const anomalies = await fetch('/api/v1/ai/anomalies', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Display high-severity anomalies
anomalies.anomalies
  .filter(a => a.severity === 'high')
  .forEach(a => {
    console.log(`⚠️ ${a.description}`);
    console.log(`   → ${a.recommendation}`);
  });

// Acknowledge
await fetch(`/api/v1/ai/anomalies/${anomaly.id}/acknowledge`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Example 4: Generate & Display Insights

```typescript
// Generate insights
const insights = await fetch('/api/v1/ai/insights/generate', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// Display insights
insights.insights.slice(0, 3).forEach(insight => {
  console.log(`[${insight.type}] ${insight.title}`);
  console.log(`${insight.content}`);
  console.log(`Confidence: ${(insight.confidence * 100).toFixed(0)}%`);
});

// Mark first one as read
await fetch(`/api/v1/ai/insights/${insights.insights[0].id}/read`, {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Database Models

### ChatConversation
```prisma
- id (String, @id)
- userId (String, foreign key)
- title (String?)
- messages (ChatMessage[])
- createdAt, updatedAt
```

### ChatMessage
```prisma
- id, conversationId (foreign key)
- role ('user' | 'assistant')
- content (Text)
- tokens (Int?)
- createdAt
```

### PortfolioForecast
```prisma
- id, userId (foreign key)
- portfolioId, period ('1m'|'3m'|'12m')
- predictions (Json), metrics (Json)
- modelVersion, expiresAt
```

### AnomalyAlert
```prisma
- id, userId (foreign key)
- anomalyType, severity
- description, recommendation
- acknowledged, acknowledgedAt
```

### PersonalizedInsight
```prisma
- id, userId (foreign key)
- type ('performance'|'tax'|'goal'|'risk')
- title, content, actionItems
- confidence, actionable
- read, readAt
```

---

## Debugging

### Enable Debug Mode

```bash
export AI_LOG_LEVEL=debug
export NODE_ENV=development
npm start
```

### Check Logs

```bash
# All logs
tail -f logs/app.log

# AI-specific
tail -f logs/ai.log

# Errors
tail -f logs/error.log
```

### Test Endpoint

```bash
# Test chat
curl -X POST http://localhost:5000/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"message": "Test"}'

# Test metrics
curl -X GET http://localhost:5000/api/v1/ai/metrics \
  -H "Authorization: Bearer TOKEN"
```

### Check Database

```bash
# Open Prisma Studio
npx prisma studio

# View specific table
SELECT * FROM chat_conversations LIMIT 10;
```

### Common Errors

**"OPENAI_API_KEY not found"**
```bash
# Solution: add key to .env.local (not .env.ai — that file is not loaded)
# Set OPENAI_API_KEY=sk-your-key in backend/.env.local, then restart
npm run dev
```

**"Database models not found"**
```bash
# Solution: run migrations
npx prisma migrate dev
```

**"Rate limit exceeded"**
```bash
# Solution: check metrics and increase limit
GET /api/v1/ai/metrics
# Edit: AI_REQUESTS_PER_MINUTE in .env.local
```

---

## Performance Tips

### Caching
- Forecasts cached for 24 hours
- Check cache before generating new forecast

### Batch Operations
- Detect anomalies asynchronously
- Don't wait for completion

### Rate Limiting
- Default: 30 req/min per user
- Cost limit: $50/month per user
- Implement queue for high volume

### Optimization
- Use conversational history limit (10 messages)
- Batch insight generation (run once daily)
- Clean up old logs weekly

---

## Cost Monitoring

```typescript
import AIMetrics from '@/utils/aiMetrics';

// Get usage summary
const summary = await AIMetrics.getUserUsageSummary(userId);
console.log(`Total cost: $${summary.totalCost.toFixed(2)}`);
console.log(`Requests: ${summary.requestCount}`);
console.log(`By feature:`, summary.byFeature);

// Check monthly metrics
const monthly = await AIMetrics.getMonthlyMetrics(userId);
console.log(`Monthly cost: $${monthly.cost.toFixed(2)}`);

// Check if user exceeded limit
const ok = await AIMetrics.checkCostLimit(userId, 50); // $50 limit
```

---

## Common Tasks

### Add Chat to Dashboard

```typescript
import { ChatPanel } from '@/components/ai/ChatPanel';

export function Dashboard() {
  return (
    <>
      <ChatPanel />
    </>
  );
}
```

### Display Forecast Chart

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export function ForecastChart({ forecast }) {
  return (
    <LineChart data={forecast.assetForecasts[0].dates.map((d, i) => ({
      date: d,
      price: forecast.assetForecasts[0].prices[i]
    }))}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="price" stroke="#8884d8" />
    </LineChart>
  );
}
```

### Trigger Analysis on User Action

```typescript
async function analyzePortfolio() {
  const response = await fetch('/api/v1/ai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ portfolioId })
  });
  
  // Analysis runs in background
  console.log('Analysis started');
}
```

---

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Service Code](backend/src/services/ai/)
- [AI Routes](backend/src/api/routes/aiRoutes.ts)
- [Environment Template](backend/.env.example)

---

## Support

Need help? Check:
1. Logs in `backend/logs/` directory
2. `/api/v1/ai/metrics` endpoint
3. Service inline comments

