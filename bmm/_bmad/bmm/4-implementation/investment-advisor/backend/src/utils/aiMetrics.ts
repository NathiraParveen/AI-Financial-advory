import prisma from '@/db/client';
import logger from './logger';

export class AIMetrics {
  // OpenAI pricing (as of early 2024)
  private static readonly PRICING = {
    'gpt-4': {
      input: 0.00003, // $0.03 per 1K tokens
      output: 0.00006, // $0.06 per 1K tokens
    },
    'gpt-3.5-turbo': {
      input: 0.0000005, // $0.0005 per 1K tokens
      output: 0.0000015, // $0.0015 per 1K tokens
    },
  };

  static async trackUsage(
    userId: string,
    featureType: string,
    inputTokens: number,
    outputTokens: number,
    latencyMs: number,
    status: 'success' | 'error',
    errorMessage?: string
  ): Promise<void> {
    try {
      const costUSD = this.calculateCost(inputTokens, outputTokens);

      await prisma.aIUsageLog.create({
        data: {
          userId,
          featureType,
          inputTokens,
          outputTokens,
          costUSD,
          latencyMs,
          status,
          errorMessage,
        },
      });

      // Log to console for monitoring
      logger.info({
        message: 'AI feature used',
        userId,
        featureType,
        tokens: inputTokens + outputTokens,
        costUSD: costUSD.toFixed(4),
        latencyMs,
        status,
      });
    } catch (error) {
      logger.error('Error tracking AI usage:', error);
    }
  }

  static calculateCost(inputTokens: number, outputTokens: number): number {
    const model = process.env.OPENAI_MODEL || 'gpt-4';
    const pricing = (this.PRICING as any)[model] || this.PRICING['gpt-4'];

    return inputTokens * pricing.input + outputTokens * pricing.output;
  }

  static async getUserUsageSummary(userId: string): Promise<{
    totalCost: number;
    requestCount: number;
    totalTokens: number;
    avgLatencyMs: number;
    successRate: number;
    byFeature: Record<string, any>;
  }> {
    try {
      const logs = await prisma.aIUsageLog.findMany({
        where: { userId },
      });

      if (logs.length === 0) {
        return {
          totalCost: 0,
          requestCount: 0,
          totalTokens: 0,
          avgLatencyMs: 0,
          successRate: 0,
          byFeature: {},
        };
      }

      const totalCost = logs.reduce((sum, log) => sum + log.costUSD, 0);
      const totalTokens = logs.reduce((sum, log) => sum + log.inputTokens + log.outputTokens, 0);
      const avgLatencyMs = logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length;
      const successCount = logs.filter((log) => log.status === 'success').length;
      const successRate = successCount / logs.length;

      // Group by feature type
      const byFeature: Record<string, any> = {};
      for (const log of logs) {
        if (!byFeature[log.featureType]) {
          byFeature[log.featureType] = {
            count: 0,
            cost: 0,
            tokens: 0,
          };
        }
        byFeature[log.featureType].count += 1;
        byFeature[log.featureType].cost += log.costUSD;
        byFeature[log.featureType].tokens += log.inputTokens + log.outputTokens;
      }

      return {
        totalCost,
        requestCount: logs.length,
        totalTokens,
        avgLatencyMs,
        successRate,
        byFeature,
      };
    } catch (error) {
      logger.error('Error getting usage summary:', error);
      throw error;
    }
  }

  static async getMonthlyMetrics(userId: string): Promise<{
    year: number;
    month: number;
    cost: number;
    requests: number;
    avgLatency: number;
    topFeature: string;
  }> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);

      const logs = await prisma.aIUsageLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lt: endDate,
          },
        },
      });

      if (logs.length === 0) {
        return {
          year,
          month,
          cost: 0,
          requests: logs.length,
          avgLatency: 0,
          topFeature: 'N/A',
        };
      }

      const totalCost = logs.reduce((sum, log) => sum + log.costUSD, 0);
      const avgLatency = logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length;

      // Find most used feature
      const featureCounts: Record<string, number> = {};
      for (const log of logs) {
        featureCounts[log.featureType] = (featureCounts[log.featureType] || 0) + 1;
      }
      const topFeature = Object.entries(featureCounts).sort((a, b) => b[1] - a[1])[0][0];

      return {
        year,
        month,
        cost: totalCost,
        requests: logs.length,
        avgLatency,
        topFeature,
      };
    } catch (error) {
      logger.error('Error getting monthly metrics:', error);
      throw error;
    }
  }

  static async checkCostLimit(userId: string, limitUSD: number = 50): Promise<boolean> {
    try {
      const summary = await this.getUserUsageSummary(userId);
      return summary.totalCost <= limitUSD;
    } catch (error) {
      logger.error('Error checking cost limit:', error);
      return true; // Allow if check fails
    }
  }

  static async cleanupOldLogs(retentionDays: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.aIUsageLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });

      logger.info({
        message: 'Cleaned up old AI usage logs',
        deletedCount: result.count,
        retentionDays,
      });
    } catch (error) {
      logger.error('Error cleaning up logs:', error);
    }
  }
}

export default AIMetrics;
