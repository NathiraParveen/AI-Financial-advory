import { Router, Request, Response } from 'express';
import { authMiddleware } from '@/middleware/auth';
import chatService from '@/services/ai/chatService';
import predictiveAnalyticsService from '@/services/ai/predictiveAnalyticsService';
import anomalyDetectionService from '@/services/ai/anomalyDetectionService';
import insightGenerationService from '@/services/ai/insightGenerationService';
import AIMetrics from '@/utils/aiMetrics';
import logger from '@/utils/logger';

const router = Router();

// ===== CHAT ROUTES =====

/**
 * POST /api/v1/ai/chat
 * Send a message to the AI financial advisor
 */
router.post('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { conversationId, message } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required and must be non-empty' });
    }

    // Check rate limit
    const canProceed = await AIMetrics.checkCostLimit(userId);
    if (!canProceed) {
      return res.status(429).json({ error: 'Monthly AI usage limit exceeded' });
    }

    const result = await chatService.processMessage(userId, message.trim(), conversationId);

    res.json({
      conversationId: result.conversationId,
      message: result.message,
      tokens: result.tokens,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Chat endpoint error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

/**
 * GET /api/v1/ai/chat/:id
 * Get chat conversation history
 */
router.get('/chat/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const messages = await chatService.getConversationHistory(req.params.id);

    res.json({
      conversationId: req.params.id,
      messages,
      count: messages.length,
    });
  } catch (error) {
    logger.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

/**
 * DELETE /api/v1/ai/chat/:id
 * Delete a conversation
 */
router.delete('/chat/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await chatService.deleteConversation(req.params.id);

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    logger.error('Delete conversation error:', error);
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

/**
 * GET /api/v1/ai/chat
 * List user's conversations
 */
router.get('/chat', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const conversations = await chatService.listUserConversations(userId, limit);

    res.json({
      conversations,
      count: conversations.length,
    });
  } catch (error) {
    logger.error('List conversations error:', error);
    res.status(500).json({ error: 'Failed to list conversations' });
  }
});

// ===== FORECAST ROUTES =====

/**
 * GET /api/v1/ai/forecast
 * Get portfolio forecast
 */
router.get('/forecast', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { portfolioId, period = '12m' } = req.query;

    if (!portfolioId || !['1m', '3m', '12m'].includes(period as string)) {
      return res.status(400).json({ error: 'Invalid portfolio ID or period' });
    }

    // Try to get cached forecast first
    const cachedForecast = await predictiveAnalyticsService.getCachedForecast(
      userId,
      portfolioId as string,
      period as '1m' | '3m' | '12m'
    );

    if (cachedForecast) {
      return res.json({
        ...cachedForecast,
        cached: true,
        timestamp: new Date(),
      });
    }

    // Generate new forecast
    const forecast = await predictiveAnalyticsService.forecastPortfolio(
      userId,
      portfolioId as string,
      period as '1m' | '3m' | '12m'
    );

    res.json({
      ...forecast,
      cached: false,
      timestamp: new Date(),
    });
  } catch (error) {
    logger.error('Forecast endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// ===== ANOMALY ROUTES =====

/**
 * GET /api/v1/ai/anomalies
 * Get current anomalies for user
 */
router.get('/anomalies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const anomalies = await anomalyDetectionService.getCurrentAnomalies(userId);

    res.json({
      anomalies,
      total: anomalies.length,
      high: anomalies.filter((a) => a.severity === 'high').length,
      medium: anomalies.filter((a) => a.severity === 'medium').length,
      low: anomalies.filter((a) => a.severity === 'low').length,
    });
  } catch (error) {
    logger.error('Get anomalies error:', error);
    res.status(500).json({ error: 'Failed to fetch anomalies' });
  }
});

/**
 * POST /api/v1/ai/anomalies/:id/acknowledge
 * Acknowledge an anomaly alert
 */
router.post('/anomalies/:id/acknowledge', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await anomalyDetectionService.acknowledgeAnomaly(req.params.id);

    res.json({ success: true, message: 'Anomaly acknowledged' });
  } catch (error) {
    logger.error('Acknowledge anomaly error:', error);
    res.status(500).json({ error: 'Failed to acknowledge anomaly' });
  }
});

/**
 * POST /api/v1/ai/analyze
 * Trigger anomaly detection for a portfolio
 */
router.post('/analyze', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { portfolioId } = req.body;
    if (!portfolioId) {
      return res.status(400).json({ error: 'Portfolio ID is required' });
    }

    // Trigger analysis asynchronously
    anomalyDetectionService.detectAnomalies(userId, portfolioId).catch((error) => {
      logger.error('Background anomaly detection error:', error);
    });

    res.json({ success: true, message: 'Analysis triggered' });
  } catch (error) {
    logger.error('Analyze endpoint error:', error);
    res.status(500).json({ error: 'Failed to trigger analysis' });
  }
});

// ===== INSIGHTS ROUTES =====

/**
 * GET /api/v1/ai/insights
 * Get personalized insights
 */
router.get('/insights', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const type = req.query.type as string | undefined;
    const insights = await insightGenerationService.getUserInsights(userId, type);

    res.json({
      insights,
      count: insights.length,
      unread: insights.filter((i) => !i.read).length,
    });
  } catch (error) {
    logger.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

/**
 * POST /api/v1/ai/insights/generate
 * Generate new insights
 */
router.post('/insights/generate', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const insights = await insightGenerationService.generateInsights(userId);

    res.json({
      insights,
      generated: insights.length,
    });
  } catch (error) {
    logger.error('Generate insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

/**
 * PUT /api/v1/ai/insights/:id/read
 * Mark insight as read
 */
router.put('/insights/:id/read', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await insightGenerationService.markInsightAsRead(req.params.id);

    res.json({ success: true, message: 'Insight marked as read' });
  } catch (error) {
    logger.error('Mark insight read error:', error);
    res.status(500).json({ error: 'Failed to mark insight as read' });
  }
});

// ===== USAGE & METRICS ROUTES =====

/**
 * GET /api/v1/ai/metrics
 * Get user's AI usage metrics
 */
router.get('/metrics', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const summary = await AIMetrics.getUserUsageSummary(userId);
    const monthly = await AIMetrics.getMonthlyMetrics(userId);

    res.json({
      summary,
      monthly,
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;
