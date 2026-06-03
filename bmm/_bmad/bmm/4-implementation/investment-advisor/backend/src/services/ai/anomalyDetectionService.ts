import prisma from '@/db/client';
import logger from '@/utils/logger';
import AIMetrics from '@/utils/aiMetrics';
import * as stats from 'simple-statistics';

export class AnomalyDetectionService {
  async detectAnomalies(userId: string, portfolioId: string): Promise<void> {
    const startTime = Date.now();

    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });

      if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) {
        logger.debug('No portfolio or holdings found for anomaly detection');
        return;
      }

      // Run multiple anomaly checks in parallel
      await Promise.all([
        this.checkConcentrationRisk(userId, portfolio),
        this.checkVolatilitySpike(userId, portfolio),
        this.checkSectorConcentration(userId, portfolio),
      ]);

      const latencyMs = Date.now() - startTime;
      await AIMetrics.trackUsage(userId, 'anomaly', 0, 0, latencyMs, 'success');

      logger.info({
        message: 'Anomaly detection completed',
        userId,
        portfolioId,
        latencyMs,
      });
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('Anomaly detection error:', error);
      await AIMetrics.trackUsage(userId, 'anomaly', 0, 0, latencyMs, 'error', String(error));
    }
  }

  private async checkConcentrationRisk(userId: string, portfolio: any): Promise<void> {
    try {
      if (!portfolio.holdings || portfolio.holdings.length === 0) {
        return;
      }

      const totalValue = portfolio.holdings.reduce((sum: number, h: any) => sum + (h.currentValue || 0), 0);

      if (totalValue === 0) {
        return;
      }

      // Check individual holding concentration
      for (const holding of portfolio.holdings) {
        const concentration = holding.currentValue / totalValue;

        if (concentration > 0.4) {
          const severity = concentration > 0.6 ? 'high' : 'medium';
          const existingAlert = await prisma.anomalyAlert.findFirst({
            where: {
              userId,
              anomalyType: 'concentration',
              acknowledged: false,
              description: {
                contains: holding.ticker,
              },
            },
          });

          if (!existingAlert) {
            await prisma.anomalyAlert.create({
              data: {
                userId,
                anomalyType: 'concentration',
                severity,
                description: `${holding.ticker} represents ${(concentration * 100).toFixed(1)}% of portfolio (concentration risk)`,
                recommendation: `Consider reducing ${holding.ticker} to below 30% of portfolio value to improve diversification`,
              },
            });

            logger.info({
              message: 'Concentration anomaly detected',
              userId,
              ticker: holding.ticker,
              concentration: (concentration * 100).toFixed(1),
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking concentration risk:', error);
    }
  }

  private async checkVolatilitySpike(userId: string, portfolio: any): Promise<void> {
    try {
      if (!portfolio.holdings || portfolio.holdings.length < 2) {
        return;
      }

      // Calculate portfolio volatility
      const values = portfolio.holdings.map((h: any) => h.currentValue || 0);
      const returns = this.calculateReturns(values);

      if (returns.length === 0) {
        return;
      }

      const volatility = stats.sampleStandardDeviation(returns);
      const historicalVolatility = 0.12; // Assume 12% historical volatility

      if (volatility > historicalVolatility * 1.5) {
        const severity = volatility > historicalVolatility * 2 ? 'high' : 'medium';

        const existingAlert = await prisma.anomalyAlert.findFirst({
          where: {
            userId,
            anomalyType: 'volatility',
            acknowledged: false,
          },
        });

        if (!existingAlert) {
          await prisma.anomalyAlert.create({
            data: {
              userId,
              anomalyType: 'volatility',
              severity,
              description: `Portfolio volatility has increased to ${(volatility * 100).toFixed(1)}% (historical: ${(historicalVolatility * 100).toFixed(1)}%)`,
              recommendation: 'Consider rebalancing to reduce portfolio risk during market volatility',
            },
          });

          logger.info({
            message: 'Volatility anomaly detected',
            userId,
            volatility: (volatility * 100).toFixed(1),
          });
        }
      }
    } catch (error) {
      logger.error('Error checking volatility spike:', error);
    }
  }

  private async checkSectorConcentration(userId: string, portfolio: any): Promise<void> {
    try {
      if (!portfolio.holdings || portfolio.holdings.length === 0) {
        return;
      }

      // Simple sector check: group by asset class
      const sectorMap: { [key: string]: number } = {};
      let totalValue = 0;

      for (const holding of portfolio.holdings) {
        const assetClass = holding.assetClass || 'unknown';
        sectorMap[assetClass] = (sectorMap[assetClass] || 0) + (holding.currentValue || 0);
        totalValue += holding.currentValue || 0;
      }

      if (totalValue === 0) {
        return;
      }

      // Check each sector
      for (const [sector, value] of Object.entries(sectorMap)) {
        const concentration = (value as number) / totalValue;

        if (concentration > 0.5) {
          const severity = concentration > 0.7 ? 'high' : 'medium';
          const existingAlert = await prisma.anomalyAlert.findFirst({
            where: {
              userId,
              anomalyType: 'concentration',
              acknowledged: false,
              description: {
                contains: sector,
              },
            },
          });

          if (!existingAlert) {
            await prisma.anomalyAlert.create({
              data: {
                userId,
                anomalyType: 'concentration',
                severity,
                description: `${sector} sector represents ${(concentration * 100).toFixed(1)}% of portfolio`,
                recommendation: `Diversify away from ${sector} to reduce sector concentration risk`,
              },
            });

            logger.info({
              message: 'Sector concentration anomaly detected',
              userId,
              sector,
              concentration: (concentration * 100).toFixed(1),
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking sector concentration:', error);
    }
  }

  private calculateReturns(values: number[]): number[] {
    if (values.length < 2) {
      return [];
    }

    const returns: number[] = [];
    for (let i = 1; i < values.length; i++) {
      const ret = (values[i] - values[i - 1]) / values[i - 1];
      returns.push(ret);
    }
    return returns;
  }

  async getCurrentAnomalies(userId: string): Promise<any[]> {
    try {
      return await prisma.anomalyAlert.findMany({
        where: { userId, acknowledged: false },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error) {
      logger.error('Error fetching anomalies:', error);
      throw error;
    }
  }

  async acknowledgeAnomaly(anomalyId: string): Promise<void> {
    try {
      await prisma.anomalyAlert.update({
        where: { id: anomalyId },
        data: {
          acknowledged: true,
          acknowledgedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Error acknowledging anomaly:', error);
      throw error;
    }
  }

  async cleanupOldAnomalies(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      await prisma.anomalyAlert.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          acknowledged: true,
        },
      });

      logger.info({
        message: 'Cleaned up old anomalies',
        retentionDays,
      });
    } catch (error) {
      logger.error('Error cleaning up old anomalies:', error);
    }
  }
}

export default new AnomalyDetectionService();
