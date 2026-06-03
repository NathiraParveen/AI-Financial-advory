import { OpenAI } from 'openai';
import prisma from '@/db/client';
import logger from '@/utils/logger';
import AIMetrics from '@/utils/aiMetrics';

export class InsightGenerationService {
  private _openai: OpenAI | null = null;

  private get openai(): OpenAI {
    if (!this._openai) {
      const model = process.env.OPENAI_MODEL || 'gpt-4'
      const baseURL = process.env.OPENAI_BASE_URL
        ? `${process.env.OPENAI_BASE_URL}/openai/deployments/${model}`
        : undefined
      this._openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        ...(baseURL && {
          baseURL,
          defaultHeaders: { 'Api-Key': process.env.OPENAI_API_KEY },
          defaultQuery: { 'api-version': '2024-02-01' },
        }),
      });
    }
    return this._openai;
  }

  async generateInsights(userId: string): Promise<any[]> {
    const startTime = Date.now();

    try {
      // Get user's portfolio and goals
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: { holdings: true },
        take: 1,
      });

      const goals = await prisma.savingsGoal.findMany({
        where: {
          savings: {
            userId,
          },
        },
      });

      if (!portfolios.length) {
        logger.debug('No portfolio found for insight generation');
        return [];
      }

      const portfolio = portfolios[0];
      const insights: any[] = [];

      // Generate different types of insights
      insights.push(
        ...(await this.generatePerformanceInsight(portfolio)),
        ...(await this.generateGoalInsight(portfolio, goals)),
        ...(await this.generateDiversificationInsight(portfolio)),
        ...(await this.generateTaxInsight(portfolio))
      );

      // Store insights in database (top 5)
      for (const insight of insights.slice(0, 5)) {
        // Check if similar insight already exists (created today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingInsight = await prisma.personalizedInsight.findFirst({
          where: {
            userId,
            type: insight.type,
            createdAt: {
              gte: today,
            },
          },
        });

        if (!existingInsight) {
          await prisma.personalizedInsight.create({
            data: {
              userId,
              type: insight.type,
              title: insight.title,
              content: insight.content,
              actionItems: JSON.stringify(insight.actionItems),
              confidence: insight.confidence,
              actionable: insight.actionable,
            },
          });
        }
      }

      const latencyMs = Date.now() - startTime;
      await AIMetrics.trackUsage(userId, 'insight', 0, 0, latencyMs, 'success');

      logger.info({
        message: 'Insights generated',
        userId,
        count: insights.length,
        latencyMs,
      });

      return insights;
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('Insight generation error:', error);
      await AIMetrics.trackUsage(userId, 'insight', 0, 0, latencyMs, 'error', String(error));
      throw error;
    }
  }

  private async generatePerformanceInsight(portfolio: any): Promise<any[]> {
    try {
      const totalValue = portfolio.holdings?.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0) || 0;
      const totalCost = portfolio.holdings?.reduce((sum: number, h: any) => sum + (h.costBasis || 0), 0) || 0;

      if (totalCost === 0) {
        return [];
      }

      const gainLoss = totalValue - totalCost;
      const gainLossPercent = (gainLoss / totalCost) * 100;

      let content = '';
      let confidence = 0.85;

      if (gainLossPercent > 10) {
        content = `Your portfolio is up ${gainLossPercent.toFixed(1)}% with a gain of $${gainLoss.toLocaleString()}. Strong performance! Continue your investment discipline and avoid emotional decisions during market downturns.`;
      } else if (gainLossPercent > 0) {
        content = `Your portfolio has gained ${gainLossPercent.toFixed(1)}% ($${gainLoss.toLocaleString()}). While returns are positive, diversification could potentially improve risk-adjusted returns.`;
      } else if (gainLossPercent > -5) {
        content = `Your portfolio is down slightly (${gainLossPercent.toFixed(1)}%). Market volatility is normal. Review your allocation to ensure it matches your risk tolerance.`;
      } else {
        content = `Your portfolio is down ${Math.abs(gainLossPercent).toFixed(1)}% ($${Math.abs(gainLoss).toLocaleString()}). Consider if any positions need rebalancing or if market conditions have changed your outlook.`;
        confidence = 0.75;
      }

      return [
        {
          type: 'performance',
          title: 'Portfolio Performance Update',
          content,
          confidence,
          actionable: true,
          actionItems: [
            { title: 'Review asset allocation', priority: 'medium' },
            { title: 'Rebalance if drift exceeds 5%', priority: 'low' },
          ],
        },
      ];
    } catch (error) {
      logger.error('Error generating performance insight:', error);
      return [];
    }
  }

  private async generateGoalInsight(portfolio: any, goals: any[]): Promise<any[]> {
    try {
      if (!goals.length) {
        return [];
      }

      const totalValue = portfolio.holdings?.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0) || 0;
      const insights: any[] = [];

      for (const goal of goals.slice(0, 2)) {
        const progressPercent = (totalValue / goal.targetAmount) * 100;
        const shortfallAmount = Math.max(0, goal.targetAmount - totalValue);

        let content = '';
        let actionable = false;

        if (progressPercent >= 100) {
          content = `Excellent news! You've reached your "${goal.name}" goal with $${totalValue.toLocaleString()}. You exceeded the target by $${(totalValue - goal.targetAmount).toLocaleString()}.`;
        } else if (progressPercent >= 75) {
          content = `You're ${progressPercent.toFixed(1)}% of the way to your "${goal.name}" goal. Just $${shortfallAmount.toLocaleString()} away from reaching your target!`;
          actionable = true;
        } else if (progressPercent >= 50) {
          content = `Progress on "${goal.name}": ${progressPercent.toFixed(1)}% complete. You need $${shortfallAmount.toLocaleString()} more to reach your goal. Consider increasing your contribution rate.`;
          actionable = true;
        } else {
          content = `You're ${progressPercent.toFixed(1)}% toward your "${goal.name}" goal. To reach $${goal.targetAmount.toLocaleString()}, consider increasing your monthly contributions or adjusting your timeline.`;
          actionable = true;
        }

        insights.push({
          type: 'goal',
          title: `Goal Progress: ${goal.name}`,
          content,
          confidence: 0.9,
          actionable,
          actionItems: actionable
            ? [{ title: `Review contribution strategy for ${goal.name}`, priority: 'high' }]
            : [],
        });
      }

      return insights;
    } catch (error) {
      logger.error('Error generating goal insight:', error);
      return [];
    }
  }

  private async generateDiversificationInsight(portfolio: any): Promise<any[]> {
    try {
      if (!portfolio.holdings || portfolio.holdings.length < 3) {
        return [
          {
            type: 'risk',
            title: 'Diversification Opportunity',
            content: 'Your portfolio has few holdings. Adding more diversified assets could reduce risk without significantly affecting returns.',
            confidence: 0.8,
            actionable: true,
            actionItems: [{ title: 'Add index funds for diversification', priority: 'high' }],
          },
        ];
      }

      const totalValue = portfolio.holdings.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0);
      const topHolding = Math.max(...portfolio.holdings.map((h: any) => (h.currentValue || 0) / totalValue));

      if (topHolding > 0.4) {
        return [
          {
            type: 'risk',
            title: 'Concentration Risk',
            content: `Your largest position represents ${(topHolding * 100).toFixed(1)}% of your portfolio. Consider reducing it to 20-30% to improve diversification.`,
            confidence: 0.85,
            actionable: true,
            actionItems: [{ title: 'Reduce concentration in largest holding', priority: 'high' }],
          },
        ];
      }

      return [];
    } catch (error) {
      logger.error('Error generating diversification insight:', error);
      return [];
    }
  }

  private async generateTaxInsight(portfolio: any): Promise<any[]> {
    try {
      const holdings = portfolio.holdings || [];
      const lossingPositions = holdings.filter((h: any) => (h.currentValue || 0) < (h.costBasis || 0));

      if (lossingPositions.length > 0) {
        const totalLoss = lossingPositions.reduce((sum: number, h: any) => sum + ((h.costBasis || 0) - (h.currentValue || 0)), 0);
        const taxSavings = totalLoss * 0.24; // Assuming 24% tax bracket

        return [
          {
            type: 'tax',
            title: 'Tax-Loss Harvesting Opportunity',
            content: `You have $${totalLoss.toLocaleString()} in unrealized losses across ${lossingPositions.length} positions. Tax-loss harvesting could save you ~$${taxSavings.toLocaleString()} in taxes.`,
            confidence: 0.9,
            actionable: true,
            actionItems: [
              { title: 'Review tax-loss harvesting candidates', priority: 'high' },
              { title: 'Consider replacement positions to maintain exposure', priority: 'medium' },
            ],
          },
        ];
      }

      return [];
    } catch (error) {
      logger.error('Error generating tax insight:', error);
      return [];
    }
  }

  async getUserInsights(userId: string, type?: string): Promise<any[]> {
    try {
      const where: any = { userId };
      if (type) {
        where.type = type;
      }

      return await prisma.personalizedInsight.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      logger.error('Error fetching user insights:', error);
      throw error;
    }
  }

  async markInsightAsRead(insightId: string): Promise<void> {
    try {
      await prisma.personalizedInsight.update({
        where: { id: insightId },
        data: {
          read: true,
          readAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error marking insight as read:', error);
      throw error;
    }
  }
}

export default new InsightGenerationService();
