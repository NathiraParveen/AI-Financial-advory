import prisma from '@/db/client';
import logger from '@/utils/logger';
import AIMetrics from '@/utils/aiMetrics';
import * as stats from 'simple-statistics';

interface AssetForecast {
  ticker: string;
  dates: string[];
  prices: number[];
  confidence: number;
}

interface PortfolioForecastResult {
  portfolioId: string;
  period: '1m' | '3m' | '12m';
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  confidence: number;
  assetForecasts: AssetForecast[];
}

export class PredictiveAnalyticsService {
  async forecastPortfolio(
    userId: string,
    portfolioId: string,
    period: '1m' | '3m' | '12m' = '12m'
  ): Promise<PortfolioForecastResult> {
    const startTime = Date.now();

    try {
      // Fetch portfolio
      const portfolio = await prisma.portfolio.findUnique({
        where: { id: portfolioId },
        include: { holdings: true },
      });

      if (!portfolio) {
        throw new Error('Portfolio not found');
      }

      // Generate forecasts for each holding
      const assetForecasts: AssetForecast[] = [];
      for (const holding of portfolio.holdings) {
        const forecast = await this.forecastAsset(holding.ticker, period);
        assetForecasts.push(forecast);
      }

      // Calculate portfolio metrics
      const metrics = this.calculatePortfolioMetrics(assetForecasts);

      // Store forecast in database
      const forecast = await prisma.portfolioForecast.create({
        data: {
          userId,
          portfolioId,
          period,
          predictions: JSON.stringify(assetForecasts),
          metrics: JSON.stringify(metrics),
          modelVersion: 'v1.0',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hour cache
        },
      });

      const latencyMs = Date.now() - startTime;
      await AIMetrics.trackUsage(userId, 'forecast', 0, 0, latencyMs, 'success');

      logger.info({
        message: 'Portfolio forecast generated',
        userId,
        portfolioId,
        period,
        latencyMs,
      });

      return {
        portfolioId,
        period,
        ...metrics,
        assetForecasts,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      logger.error('Forecast error:', error);
      await AIMetrics.trackUsage(userId, 'forecast', 0, 0, latencyMs, 'error', String(error));
      throw error;
    }
  }

  private async forecastAsset(ticker: string, period: '1m' | '3m' | '12m'): Promise<AssetForecast> {
    try {
      // For MVP, generate synthetic historical data
      // In production, this would fetch from Yahoo Finance or similar
      const historicalPrices = this.generateSyntheticPrices(100, 100);

      // Generate forecast
      const daysToForecast = this.getPeriodDays(period);
      const forecast = this.simpleARIMAForecast(historicalPrices, daysToForecast);
      const confidence = this.calculateConfidence(historicalPrices);

      // Generate dates
      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < daysToForecast; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        dates.push(date.toISOString().split('T')[0]);
      }

      return {
        ticker,
        dates,
        prices: forecast,
        confidence,
      };
    } catch (error) {
      logger.error(`Error forecasting asset ${ticker}:`, error);
      throw error;
    }
  }

  private simpleARIMAForecast(prices: number[], days: number): number[] {
    if (prices.length < 10) return [];

    const mean = stats.mean(prices);
    const std = stats.sampleStandardDeviation(prices);
    const lastPrice = prices[prices.length - 1];

    // Calculate trend
    const trend = (prices[prices.length - 1] - prices[0]) / prices.length;

    const forecast: number[] = [];
    let currentPrice = lastPrice;

    for (let i = 0; i < days; i++) {
      // Simple ARIMA-like: drift + random walk
      const noise = (Math.random() - 0.5) * std * 0.1; // Scale noise
      currentPrice = currentPrice + trend + noise;

      // Ensure price doesn't go negative
      forecast.push(Math.max(0.01, currentPrice));
    }

    return forecast;
  }

  private calculatePortfolioMetrics(forecasts: AssetForecast[]): {
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    confidence: number;
  } {
    if (forecasts.length === 0) {
      return {
        expectedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        confidence: 0,
      };
    }

    // Simple calculation: average the metrics across all assets
    const avgConfidence = stats.mean(forecasts.map((f) => f.confidence));

    // Estimate returns and volatility
    const returns = forecasts.map((f) => {
      const startPrice = f.prices[0];
      const endPrice = f.prices[f.prices.length - 1];
      return (endPrice - startPrice) / startPrice;
    });

    const expectedReturn = stats.mean(returns);
    const volatility = stats.sampleStandardDeviation(returns);
    const riskFreeRate = 0.02; // Assume 2% risk-free rate
    const sharpeRatio = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;

    // Calculate max drawdown
    let maxDrawdown = 0;
    for (const forecast of forecasts) {
      const peak = Math.max(...forecast.prices);
      for (const price of forecast.prices) {
        const drawdown = (peak - price) / peak;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    }

    return {
      expectedReturn: Math.min(expectedReturn, 0.25), // Cap at 25%
      volatility: Math.min(volatility, 0.5), // Cap at 50%
      sharpeRatio,
      maxDrawdown: Math.min(maxDrawdown, 1),
      confidence: avgConfidence,
    };
  }

  private calculateConfidence(prices: number[]): number {
    // Higher confidence for longer, less volatile series
    if (prices.length < 60) return 0.6;

    const std = stats.sampleStandardDeviation(prices);
    const mean = stats.mean(prices);
    const cv = std / mean; // Coefficient of variation

    // Lower CV = more stable = higher confidence
    return Math.max(0.5, Math.min(0.95, 1 - cv * 0.5));
  }

  private getPeriodDays(period: '1m' | '3m' | '12m'): number {
    const daysMap = { '1m': 30, '3m': 90, '12m': 365 };
    return daysMap[period] || 30;
  }

  private generateSyntheticPrices(count: number, startPrice: number): number[] {
    const prices: number[] = [startPrice];
    let currentPrice = startPrice;

    for (let i = 1; i < count; i++) {
      // Random walk with slight upward drift
      const drift = startPrice * 0.0001; // 0.01% daily drift
      const noise = (Math.random() - 0.5) * startPrice * 0.02; // 2% volatility
      currentPrice = currentPrice + drift + noise;
      prices.push(Math.max(0.01, currentPrice));
    }

    return prices;
  }

  async getCachedForecast(
    userId: string,
    portfolioId: string,
    period: '1m' | '3m' | '12m'
  ): Promise<PortfolioForecastResult | null> {
    try {
      const forecast = await prisma.portfolioForecast.findFirst({
        where: {
          userId,
          portfolioId,
          period,
          expiresAt: {
            gt: new Date(), // Not expired
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!forecast) return null;

      return {
        portfolioId,
        period,
        ...JSON.parse(forecast.metrics),
        assetForecasts: JSON.parse(forecast.predictions),
      };
    } catch (error) {
      logger.error('Error fetching cached forecast:', error);
      return null;
    }
  }
}

export default new PredictiveAnalyticsService();
