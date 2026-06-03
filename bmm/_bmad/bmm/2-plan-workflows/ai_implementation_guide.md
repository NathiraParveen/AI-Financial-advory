# AI Features - Technical Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the AI features into the Investment Advisor backend and frontend.

---

## Part 1: Backend Setup

### 1.1 Install AI/ML Dependencies

#### Backend Package.json Updates
```json
{
  "dependencies": {
    // Existing
    "express": "^4.18.2",
    "typescript": "^5.0.0",
    "prisma": "^5.0.0",
    
    // New AI Dependencies
    "openai": "^4.26.0",
    "@anthropic-ai/sdk": "^0.15.0",
    "langchain": "^0.1.0",
    "@pinecone-database/pinecone": "^1.1.0",
    "dotenv": "^16.3.1",
    "axios": "^1.6.0",
    "redis": "^4.6.0",
    "bull": "^4.11.0",
    
    // ML/Analytics
    "tensorflow": "^4.0.0",
    "simple-statistics": "^7.8.0",
    "numjs": "^0.16.1",
    
    // NLP
    "natural": "^6.7.0",
    "compromise": "^14.10.0",
    
    // Utilities
    "uuid": "^9.0.0",
    "helmet": "^7.0.0",
    "winston": "^3.10.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### 1.2 Environment Configuration

Create `.env.ai`:
```bash
# LLM Configuration
OPENAI_API_KEY=sk_test_XXXXXXXX
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Alternative: Anthropic Claude
ANTHROPIC_API_KEY=sk_ant_XXXXXXXX
ANTHROPIC_MODEL=claude-3-sonnet

# Vector Database
PINECONE_API_KEY=XXXXXXXX
PINECONE_ENVIRONMENT=us-west-2
PINECONE_INDEX_NAME=investment-advisor

# Redis Cache
REDIS_URL=redis://localhost:6379

# Market Data APIs
YAHOO_FINANCE_API_KEY=optional
IEX_CLOUD_API_KEY=XXXXXXXX
ALPHA_VANTAGE_API_KEY=XXXXXXXX

# Feature Flags
AI_CHAT_ENABLED=true
AI_FORECAST_ENABLED=true
AI_ANOMALY_DETECTION_ENABLED=true
AI_SENTIMENT_ENABLED=false

# Rate Limiting
AI_REQUESTS_PER_MINUTE=30
AI_REQUESTS_PER_DAY=5000

# Logging
AI_LOG_LEVEL=info
AI_LOG_FILE=./logs/ai.log
```

### 1.3 Database Schema Updates

Add to `schema.prisma`:

```prisma
// Chat & Conversation Storage
model ChatConversation {
  id          String   @id @default(cuid())
  userId      String   @db.VarChar(36)
  user        User     @relation(fields: [userId], references: [id])
  title       String?
  messages    ChatMessage[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([userId])
}

model ChatMessage {
  id             String   @id @default(cuid())
  conversationId String   @db.VarChar(36)
  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String   // "user" | "assistant"
  content        String   @db.Text
  tokens         Int?     // Token count for cost tracking
  createdAt      DateTime @default(now())
  
  @@index([conversationId])
}

// Predictions & Forecasts
model PortfolioForecast {
  id             String   @id @default(cuid())
  userId         String   @db.VarChar(36)
  user           User     @relation(fields: [userId], references: [id])
  portfolioId    String   @db.VarChar(36)
  period         String   // "1m" | "3m" | "12m"
  predictions    Json     // {date, price, confidence}[]
  metrics        Json     // {expectedReturn, volatility, sharpe}
  modelVersion   String
  createdAt      DateTime @default(now())
  expiresAt      DateTime // Cache invalidation
  
  @@index([userId])
  @@index([portfolioId])
}

// Anomalies & Alerts
model AnomalyAlert {
  id             String   @id @default(cuid())
  userId         String   @db.VarChar(36)
  user           User     @relation(fields: [userId], references: [id])
  anomalyType    String   // "concentration" | "correlation" | "volatility"
  severity       String   // "low" | "medium" | "high"
  description    String   @db.Text
  recommendation String?  @db.Text
  acknowledged   Boolean  @default(false)
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([severity])
}

// Insights
model PersonalizedInsight {
  id             String   @id @default(cuid())
  userId         String   @db.VarChar(36)
  user           User     @relation(fields: [userId], references: [id])
  type           String   // "performance" | "tax" | "goal" | "risk"
  title          String
  content        String   @db.Text
  confidence     Float    // 0-1
  actionable     Boolean
  read           Boolean  @default(false)
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([type])
}

// Sentiment Data
model MarketSentiment {
  id             String   @id @default(cuid())
  ticker         String   @db.VarChar(10)
  sentiment      Float    // -1 to 1
  volume         Int      // Mention count
  source         String   // "news" | "social" | "combined"
  timestamp      DateTime @default(now())
  
  @@index([ticker])
  @@index([timestamp])
}

// AI Usage Tracking
model AIUsageLog {
  id             String   @id @default(cuid())
  userId         String   @db.VarChar(36)
  featureType    String   // "chat" | "forecast" | "anomaly"
  inputTokens    Int
  outputTokens   Int
  costUSD        Float
  latencyMs      Int
  status         String   // "success" | "error"
  createdAt      DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

Run migrations:
```bash
npx prisma migrate dev --name add_ai_features
npx prisma generate
```

---

## Part 2: AI Service Implementation

### 2.1 Chat Service

Create `src/services/ai/chatService.ts`:

```typescript
import { OpenAI } from 'openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ChatConversation, ChatMessage } from '@prisma/client';
import prisma from '@/db/client';
import logger from '@/utils/logger';

interface ChatContext {
  portfolio: any;
  goals: any;
  history: ChatMessage[];
}

export class ChatService {
  private openai: OpenAI;
  private vectorStore: PineconeStore;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async processMessage(
    userId: string,
    message: string,
    conversationId: string
  ): Promise<string> {
    try {
      // Fetch user context
      const context = await this.getUserContext(userId);
      
      // Retrieve relevant docs from vector DB
      const relevantDocs = await this.retrieveRelevantContext(message);
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context, relevantDocs);
      
      // Get conversation history
      const history = await this.getChatHistory(conversationId, 10);
      
      // Build messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];
      
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages,
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      });
      
      const assistantMessage = response.choices[0].message.content || '';
      
      // Store conversation
      await this.storeMessage(
        conversationId,
        'user',
        message,
        response.usage?.prompt_tokens
      );
      
      await this.storeMessage(
        conversationId,
        'assistant',
        assistantMessage,
        response.usage?.completion_tokens
      );
      
      // Log usage
      await this.logUsage(
        userId,
        'chat',
        response.usage?.prompt_tokens || 0,
        response.usage?.completion_tokens || 0
      );
      
      return assistantMessage;
    } catch (error) {
      logger.error('Chat processing error:', error);
      throw error;
    }
  }
  
  private async getUserContext(userId: string): Promise<ChatContext> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        portfolios: true,
        savingsGoals: true,
      },
    });
    
    const conversations = await prisma.chatConversation.findMany({
      where: { userId },
      include: { messages: true },
      take: 5,
    });
    
    return {
      portfolio: user?.portfolios?.[0],
      goals: user?.savingsGoals,
      history: conversations.flatMap(c => c.messages),
    };
  }
  
  private buildSystemPrompt(context: ChatContext, relevantDocs: string[]): string {
    return `You are an expert financial advisor AI assistant for the Investment Advisor platform.
    
User Portfolio Summary:
- Total Value: $${context.portfolio?.totalValue || 0}
- Asset Allocation: ${JSON.stringify(context.portfolio?.allocation || {})}

User Goals:
${context.goals?.map(g => `- ${g.name}: $${g.targetAmount} by ${g.deadline}`).join('\n')}

Relevant Documentation:
${relevantDocs.join('\n')}

Guidelines:
1. Provide personalized advice based on their portfolio and goals
2. Always include risk disclaimers
3. Suggest concrete actions when appropriate
4. Explain concepts in simple terms
5. Consider tax implications
6. Reference specific holdings when relevant`;
  }
  
  private async retrieveRelevantContext(query: string): Promise<string[]> {
    // TODO: Implement vector DB retrieval
    return [];
  }
  
  private async getChatHistory(
    conversationId: string,
    limit: number
  ): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }
  
  private async storeMessage(
    conversationId: string,
    role: string,
    content: string,
    tokens?: number
  ): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        conversationId,
        role,
        content,
        tokens,
      },
    });
  }
  
  private async logUsage(
    userId: string,
    featureType: string,
    inputTokens: number,
    outputTokens: number
  ): Promise<void> {
    // Rough cost estimation: $0.03 per 1K input, $0.06 per 1K output
    const costUSD =
      (inputTokens / 1000) * 0.03 + (outputTokens / 1000) * 0.06;
    
    await prisma.aIUsageLog.create({
      data: {
        userId,
        featureType,
        inputTokens,
        outputTokens,
        costUSD,
        latencyMs: 0,
        status: 'success',
      },
    });
  }
}

export default new ChatService();
```

### 2.2 Predictive Analytics Service

Create `src/services/ai/predictiveAnalyticsService.ts`:

```typescript
import axios from 'axios';
import stats from 'simple-statistics';
import prisma from '@/db/client';

export class PredictiveAnalyticsService {
  
  async forecastPortfolio(
    userId: string,
    portfolioId: string,
    period: '1m' | '3m' | '12m'
  ): Promise<any> {
    try {
      // Fetch portfolio holdings
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });
      
      if (!portfolio) throw new Error('Portfolio not found');
      
      // Get historical price data for each holding
      const predictions = await Promise.all(
        portfolio.holdings.map(holding =>
          this.forecastAsset(holding.ticker, period)
        )
      );
      
      // Calculate portfolio metrics
      const metrics = this.calculatePortfolioMetrics(predictions, portfolio);
      
      // Store forecast
      const forecast = await prisma.portfolioForecast.create({
        data: {
          userId,
          portfolioId,
          period,
          predictions: predictions as any,
          metrics: metrics as any,
          modelVersion: 'v1.0',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour cache
        },
      });
      
      return forecast;
    } catch (error) {
      console.error('Forecast error:', error);
      throw error;
    }
  }
  
  private async forecastAsset(
    ticker: string,
    period: '1m' | '3m' | '12m'
  ): Promise<any> {
    // Get historical data
    const historicalPrices = await this.getHistoricalPrices(ticker);
    
    // Calculate ARIMA-like forecast (simplified)
    const forecast = this.simpleARIMAForecast(
      historicalPrices,
      this.getPeriodDays(period)
    );
    
    return {
      ticker,
      forecast,
      confidence: this.calculateConfidence(historicalPrices),
    };
  }
  
  private getHistoricalPrices(ticker: string): Promise<number[]> {
    // TODO: Call Yahoo Finance or IEX Cloud API
    return Promise.resolve([]);
  }
  
  private simpleARIMAForecast(prices: number[], days: number): any[] {
    if (prices.length < 30) return [];
    
    const mean = stats.mean(prices);
    const std = stats.sampleStandardDeviation(prices);
    const lastPrice = prices[prices.length - 1];
    
    const forecast = [];
    let currentPrice = lastPrice;
    
    for (let i = 0; i < days; i++) {
      // Simple random walk with drift
      const drift = (prices[prices.length - 1] - prices[0]) / prices.length;
      const noise = (Math.random() - 0.5) * std;
      currentPrice = currentPrice + drift + noise;
      
      forecast.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        price: Math.max(0, currentPrice),
      });
    }
    
    return forecast;
  }
  
  private calculatePortfolioMetrics(predictions: any[], portfolio: any): any {
    return {
      expectedReturn: 0.08,
      volatility: 0.12,
      sharpeRatio: 0.67,
      maxDrawdown: -0.15,
    };
  }
  
  private calculateConfidence(prices: number[]): number {
    // Higher confidence for longer, less volatile series
    if (prices.length < 60) return 0.6;
    const std = stats.sampleStandardDeviation(prices);
    const cv = std / stats.mean(prices); // Coefficient of variation
    return Math.max(0.5, Math.min(0.95, 1 - cv));
  }
  
  private getPeriodDays(period: '1m' | '3m' | '12m'): number {
    return { '1m': 30, '3m': 90, '12m': 365 }[period] || 30;
  }
}

export default new PredictiveAnalyticsService();
```

### 2.3 Anomaly Detection Service

Create `src/services/ai/anomalyDetectionService.ts`:

```typescript
import prisma from '@/db/client';
import logger from '@/utils/logger';

export class AnomalyDetectionService {
  
  async detectAnomalies(userId: string, portfolioId: string): Promise<void> {
    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });
      
      if (!portfolio) return;
      
      // Run multiple anomaly checks
      await Promise.all([
        this.checkConcentrationRisk(userId, portfolio),
        this.checkCorrelationBreakdown(userId, portfolio),
        this.checkVolatilitySpike(userId, portfolio),
      ]);
    } catch (error) {
      logger.error('Anomaly detection error:', error);
    }
  }
  
  private async checkConcentrationRisk(userId: string, portfolio: any): Promise<void> {
    // If single sector > 40%, flag
    const sectorConcentration = this.calculateSectorConcentration(portfolio);
    
    for (const [sector, percentage] of Object.entries(sectorConcentration)) {
      if ((percentage as number) > 0.4) {
        await prisma.anomalyAlert.create({
          data: {
            userId,
            anomalyType: 'concentration',
            severity: (percentage as number) > 0.6 ? 'high' : 'medium',
            description: `${sector} sector represents ${(percentage as number * 100).toFixed(1)}% of portfolio`,
            recommendation: `Consider rebalancing to reduce concentration risk`,
          },
        });
      }
    }
  }
  
  private async checkCorrelationBreakdown(userId: string, portfolio: any): Promise<void> {
    // Monitor correlation changes
    const historicalCorrelation = 0.3;
    const currentCorrelation = 0.7;
    
    if (Math.abs(currentCorrelation - historicalCorrelation) > 0.3) {
      await prisma.anomalyAlert.create({
        data: {
          userId,
          anomalyType: 'correlation',
          severity: 'medium',
          description: `Correlation between portfolio assets has increased significantly`,
          recommendation: `Your diversification benefits have reduced. Review asset allocation.`,
        },
      });
    }
  }
  
  private async checkVolatilitySpike(userId: string, portfolio: any): Promise<void> {
    // Monitor volatility changes
    const historicalVolatility = 0.12;
    const currentVolatility = 0.18;
    
    if (currentVolatility > historicalVolatility * 1.5) {
      await prisma.anomalyAlert.create({
        data: {
          userId,
          anomalyType: 'volatility',
          severity: currentVolatility > historicalVolatility * 2 ? 'high' : 'medium',
          description: `Portfolio volatility has increased ${(((currentVolatility - historicalVolatility) / historicalVolatility) * 100).toFixed(1)}%`,
        },
      });
    }
  }
  
  private calculateSectorConcentration(portfolio: any): Record<string, number> {
    // TODO: Implement sector analysis
    return {};
  }
}

export default new AnomalyDetectionService();
```

---

## Part 3: API Routes

### 3.1 Chat Routes

Create `src/api/routes/aiChat.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import chatService from '@/services/ai/chatService';
import prisma from '@/db/client';

const router = Router();

// POST /api/v1/ai/chat - Send chat message
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { conversationId, message } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // Create conversation if doesn't exist
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.chatConversation.create({
        data: { userId },
      });
      convId = conv.id;
    }
    
    // Process message
    const response = await chatService.processMessage(
      userId,
      message,
      convId
    );
    
    res.json({
      conversationId: convId,
      message: response,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Chat processing failed' });
  }
});

// GET /api/v1/ai/chat/:id - Get chat history
router.get('/chat/:id', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// DELETE /api/v1/ai/chat/:id - Clear conversation
router.delete('/chat/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.chatConversation.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

export default router;
```

### 3.2 Forecast Routes

Create `src/api/routes/aiForecast.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import predictiveAnalyticsService from '@/services/ai/predictiveAnalyticsService';

const router = Router();

// GET /api/v1/ai/forecast?portfolioId=xxx&period=12m
router.get('/forecast', authMiddleware, async (req, res) => {
  try {
    const { portfolioId, period } = req.query;
    const userId = req.user.id;
    
    if (!portfolioId || !['1m', '3m', '12m'].includes(period as string)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    const forecast = await predictiveAnalyticsService.forecastPortfolio(
      userId,
      portfolioId as string,
      period as '1m' | '3m' | '12m'
    );
    
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: 'Forecast generation failed' });
  }
});

export default router;
```

### 3.3 Anomaly Routes

Create `src/api/routes/aiAnomalies.ts`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import anomalyService from '@/services/ai/anomalyDetectionService';
import prisma from '@/db/client';

const router = Router();

// GET /api/v1/ai/anomalies - Get current anomalies
router.get('/anomalies', authMiddleware, async (req, res) => {
  try {
    const alerts = await prisma.anomalyAlert.findMany({
      where: { userId: req.user.id, acknowledged: false },
      orderBy: { createdAt: 'desc' },
    });
    
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

// POST /api/v1/ai/anomalies/:id/acknowledge
router.post('/anomalies/:id/acknowledge', authMiddleware, async (req, res) => {
  try {
    await prisma.anomalyAlert.update({
      where: { id: req.params.id },
      data: { acknowledged: true },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge anomaly' });
  }
});

export default router;
```

### 3.4 Register Routes

Update `src/index.ts` or main route file:

```typescript
import express from 'express';
import aiChatRoutes from '@/api/routes/aiChat';
import aiForecastRoutes from '@/api/routes/aiForecast';
import aiAnomalyRoutes from '@/api/routes/aiAnomalies';

const app = express();

// ... existing routes ...

// AI Routes
app.use('/api/v1/ai', aiChatRoutes);
app.use('/api/v1/ai', aiForecastRoutes);
app.use('/api/v1/ai', aiAnomalyRoutes);

export default app;
```

---

## Part 4: Frontend Components

### 4.1 Chat Panel Component

Create `src/components/ai/ChatPanel.tsx`:

```typescript
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatPanel.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/ai/chat', {
        conversationId,
        message: input,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(response.data.conversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>Financial Advisor AI</h3>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask me anything about your portfolio..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
```

### 4.2 Forecast Chart Component

Create `src/components/ai/ForecastChart.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';

interface ForecastChartProps {
  portfolioId: string;
  period: '1m' | '3m' | '12m';
}

export const ForecastChart: React.FC<ForecastChartProps> = ({
  portfolioId,
  period,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const response = await axios.get('/api/v1/ai/forecast', {
          params: { portfolioId, period },
        });
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [portfolioId, period]);

  if (loading) return <div>Loading forecast...</div>;
  if (!data) return <div>Unable to generate forecast</div>;

  return (
    <div className="forecast-chart">
      <h3>{period.toUpperCase()} Portfolio Forecast</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data.predictions || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="forecast-metrics">
        <div>Expected Return: {(data.metrics?.expectedReturn * 100).toFixed(2)}%</div>
        <div>Volatility: {(data.metrics?.volatility * 100).toFixed(2)}%</div>
        <div>Sharpe Ratio: {data.metrics?.sharpeRatio.toFixed(2)}</div>
      </div>
    </div>
  );
};
```

---

## Part 5: Configuration & Deployment

### 5.1 Docker Configuration

Update `Dockerfile` for backend:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npx tsc

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

### 5.2 Docker Compose Update

Update `docker-compose.yml`:

```yaml
version: '3.9'

services:
  backend:
    build: ./backend
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/investment
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    ports:
      - "5000:5000"
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## Part 6: Testing

Create `src/services/ai/__tests__/chatService.test.ts`:

```typescript
import { ChatService } from '../chatService';
import prisma from '@/db/client';

jest.mock('@/db/client');

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService();
  });

  it('should process a user message', async () => {
    const response = await service.processMessage(
      'user123',
      'What should I do with my portfolio?',
      'conv123'
    );

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should retrieve chat history', async () => {
    // TODO: Add tests
  });
});
```

---

## Part 7: Monitoring & Logging

Create `src/utils/aiMetrics.ts`:

```typescript
import logger from './logger';
import prisma from '@/db/client';

export class AIMetrics {
  static async trackFeatureUsage(
    userId: string,
    feature: string,
    latencyMs: number,
    success: boolean
  ): Promise<void> {
    logger.info({
      message: 'AI Feature Used',
      userId,
      feature,
      latencyMs,
      success,
      timestamp: new Date(),
    });

    // Optional: Store in database for analytics
  }

  static async getUsageSummary(userId: string): Promise<any> {
    return await prisma.aIUsageLog.aggregate({
      where: { userId },
      _sum: { inputTokens: true, outputTokens: true, costUSD: true },
      _count: true,
    });
  }
}

export default AIMetrics;
```

---

## Next Steps

1. **Install Dependencies**: Run `npm install` with updated package.json
2. **Setup Environment**: Create `.env.ai` with API keys
3. **Database**: Run Prisma migrations
4. **Implement Services**: Start with ChatService
5. **Add Routes**: Implement API endpoints
6. **Frontend**: Build React components
7. **Testing**: Add unit and integration tests
8. **Deployment**: Configure Docker and deploy

---

## Resource Links

- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Docs](https://langchain.readthedocs.io/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

