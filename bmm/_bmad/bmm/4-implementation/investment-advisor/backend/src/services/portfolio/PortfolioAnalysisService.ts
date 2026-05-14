/**
 * Portfolio Analysis Service
 * Analyzes portfolio composition, risk, and performance
 * Asset classes reflect Indian investment landscape (equity, mutualFunds, gold, fixedDeposits, ppf, nps, bonds)
 */

export interface Holding {
  ticker: string
  assetClass: string
  currentValue: number
}

export interface PortfolioComposition {
  [assetClass: string]: number // percentage
}

export interface RiskMetrics {
  volatility: number
  sharpeRatio: number
  maxDrawdown: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface AllocationRecommendation {
  assetClass: string
  currentAllocation: number
  recommendedAllocation: number
  difference: number
}

// Expected annual returns for Indian asset classes (long-run estimates)
const INDIAN_ASSET_RETURNS: Record<string, number> = {
  equity: 0.13,         // Nifty 50 ~12-14% CAGR
  mutualFunds: 0.12,    // Diversified equity MF
  gold: 0.09,           // Sovereign Gold Bond / physical gold ~8-10%
  fixedDeposits: 0.07,  // Bank FD current rates ~6.5-7.5%
  ppf: 0.071,           // PPF current rate 7.1% p.a.
  nps: 0.10,            // NPS equity tier ~10% long-run
  bonds: 0.075,         // Corporate/G-Sec bonds
  cash: 0.04,           // Liquid fund / savings account
}

// Volatility estimates for Indian asset classes
const INDIAN_ASSET_VOLATILITY: Record<string, number> = {
  equity: 0.18,
  mutualFunds: 0.15,
  gold: 0.12,
  fixedDeposits: 0.01,
  ppf: 0.00,
  nps: 0.10,
  bonds: 0.05,
  cash: 0.01,
}

// Risk-free rate: RBI repo rate / liquid fund return proxy (~6.5%)
const RISK_FREE_RATE = 0.065

export class PortfolioAnalysisService {
  /**
   * Calculate portfolio composition by asset class
   */
  calculateComposition(holdings: Holding[]): PortfolioComposition {
    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    const composition: PortfolioComposition = {}

    if (totalValue === 0) return composition

    holdings.forEach((holding) => {
      const key = holding.assetClass
      if (!composition[key]) {
        composition[key] = 0
      }
      composition[key] += (holding.currentValue / totalValue) * 100
    })

    return composition
  }

  /**
   * Assess portfolio risk based on Indian asset class composition
   */
  assessRisk(composition: PortfolioComposition): RiskMetrics {
    const equityAllocation = (composition['equity'] || 0) + (composition['mutualFunds'] || 0) + (composition['nps'] || 0)

    let expectedReturn = 0
    let volatility = 0
    let totalWeight = 0

    for (const [assetClass, pct] of Object.entries(composition)) {
      const weight = pct / 100
      expectedReturn += weight * (INDIAN_ASSET_RETURNS[assetClass] ?? 0.06)
      volatility += weight * (INDIAN_ASSET_VOLATILITY[assetClass] ?? 0.05)
      totalWeight += weight
    }

    if (totalWeight > 0) {
      expectedReturn /= totalWeight
      volatility /= totalWeight
    }

    const sharpeRatio = volatility > 0 ? (expectedReturn - RISK_FREE_RATE) / volatility : 0
    const maxDrawdown = volatility * 2

    let riskLevel: 'low' | 'medium' | 'high' = 'medium'
    if (equityAllocation <= 30) {
      riskLevel = 'low'
    } else if (equityAllocation >= 70) {
      riskLevel = 'high'
    }

    return {
      volatility: Math.round(volatility * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      riskLevel,
    }
  }

  /**
   * Get asset allocation recommendation based on risk tolerance
   * Follows Indian investor profiles: conservative uses FD/PPF/bonds; aggressive uses equity/MF
   */
  getRecommendedAllocation(
    riskTolerance: 'low' | 'medium' | 'high',
  ): PortfolioComposition {
    const allocations = {
      low: { equity: 20, mutualFunds: 10, fixedDeposits: 35, ppf: 20, bonds: 10, gold: 5 },
      medium: { equity: 35, mutualFunds: 20, fixedDeposits: 15, ppf: 10, nps: 10, bonds: 5, gold: 5 },
      high: { equity: 50, mutualFunds: 25, nps: 10, bonds: 5, gold: 5, fixedDeposits: 5 },
    }
    return allocations[riskTolerance]
  }

  /**
   * Compare current allocation with recommendation
   */
  getRebalancingRecommendations(
    currentComposition: PortfolioComposition,
    riskTolerance: 'low' | 'medium' | 'high',
  ): AllocationRecommendation[] {
    const recommended = this.getRecommendedAllocation(riskTolerance)
    const recommendations: AllocationRecommendation[] = []

    Object.keys(recommended).forEach((assetClass) => {
      const recommendedVal = recommended[assetClass as keyof typeof recommended] as number
      const currentVal = currentComposition[assetClass] || 0
      const difference = recommendedVal - currentVal

      recommendations.push({
        assetClass,
        currentAllocation: Math.round(currentVal * 100) / 100,
        recommendedAllocation: recommendedVal,
        difference: Math.round(difference * 100) / 100,
      })
    })

    return recommendations
  }

  /**
   * Check if rebalancing is needed
   */
  shouldRebalance(
    currentComposition: PortfolioComposition,
    riskTolerance: 'low' | 'medium' | 'high',
    threshold: number = 5, // 5% threshold
  ): boolean {
    const recommendations = this.getRebalancingRecommendations(
      currentComposition,
      riskTolerance,
    )
    return recommendations.some((rec) => Math.abs(rec.difference) > threshold)
  }
}
