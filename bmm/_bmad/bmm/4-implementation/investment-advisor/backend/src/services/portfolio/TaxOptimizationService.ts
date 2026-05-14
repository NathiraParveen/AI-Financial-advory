/**
 * Tax Optimization Service
 * Identifies tax-loss harvesting opportunities and optimizes portfolio for taxes
 * Applies Indian Income Tax Act capital gains rules (Budget 2024 rates)
 */

export interface TaxableSecurity {
  ticker: string
  costBasis: number
  currentValue: number
  purchaseDate: string
  // Equity/equity MF: long = held > 12 months; Debt MF/others: long = held > 24 months
  holdingPeriod: 'short' | 'long'
  assetType: 'equity' | 'debt' | 'gold' | 'realestate'
}

export interface TaxLossOpportunity {
  ticker: string
  unrealizedLoss: number
  taxSavings: number
}

export interface RebalancingImpact {
  action: string // hold, buy, sell
  asset: string
  reason: string
  taxImpact: number // positive = gain, negative = loss
}

export class TaxOptimizationService {
  // Indian STCG rates (Budget 2024): equity/equity MF 20% (Sec 111A), others as per slab (using 30% peak)
  private readonly stcgRateEquity = 0.20
  private readonly stcgRateOther = 0.30 // peak income-tax slab

  // Indian LTCG rates (Budget 2024): equity/equity MF 12.5% above ₹1.25 lakh exemption (Sec 112A),
  // debt MF/gold/others 12.5% without indexation (Sec 112)
  private readonly ltcgRateEquity = 0.125
  private readonly ltcgRateOther = 0.125

  // Annual LTCG exemption on equity under Section 112A (₹1.25 lakh)
  private readonly ltcgEquityExemption = 125000

  /**
   * Resolve applicable tax rate based on asset type and holding period
   */
  private resolveTaxRate(assetType: TaxableSecurity['assetType'], holdingPeriod: 'short' | 'long'): number {
    if (holdingPeriod === 'short') {
      return assetType === 'equity' ? this.stcgRateEquity : this.stcgRateOther
    }
    return assetType === 'equity' ? this.ltcgRateEquity : this.ltcgRateOther
  }

  /**
   * Identify tax-loss harvesting opportunities
   */
  identifyTaxLossOpportunities(securities: TaxableSecurity[]): TaxLossOpportunity[] {
    return securities
      .filter((security) => security.currentValue < security.costBasis)
      .map((security) => {
        const unrealizedLoss = security.costBasis - security.currentValue
        const taxRate = this.resolveTaxRate(security.assetType, security.holdingPeriod)
        const taxSavings = unrealizedLoss * taxRate

        return {
          ticker: security.ticker,
          unrealizedLoss,
          taxSavings,
        }
      })
      .sort((a, b) => b.taxSavings - a.taxSavings)
  }

  /**
   * Calculate total potential tax savings
   */
  calculateTotalTaxSavings(opportunities: TaxLossOpportunity[]): number {
    return opportunities.reduce((sum, opp) => sum + opp.taxSavings, 0)
  }

  /**
   * Determine holding period for tax purposes
   * Equity/equity MF: > 12 months = long; Debt MF/gold: > 24 months = long
   */
  determineHoldingPeriod(purchaseDate: string, assetType: TaxableSecurity['assetType'] = 'equity'): 'short' | 'long' {
    const purchase = new Date(purchaseDate)
    const today = new Date()
    const daysHeld = Math.floor(
      (today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24),
    )
    const longTermThresholdDays = assetType === 'equity' ? 365 : 730
    return daysHeld >= longTermThresholdDays ? 'long' : 'short'
  }

  /**
   * Calculate capital gains tax liability (Indian IT Act)
   * Applies ₹1.25 lakh LTCG exemption for equity under Section 112A
   */
  calculateCapitalGainsTax(
    gainAmount: number,
    holdingPeriod: 'short' | 'long',
    assetType: TaxableSecurity['assetType'] = 'equity',
  ): number {
    let taxableGain = gainAmount
    if (holdingPeriod === 'long' && assetType === 'equity') {
      taxableGain = Math.max(0, gainAmount - this.ltcgEquityExemption)
    }
    const taxRate = this.resolveTaxRate(assetType, holdingPeriod)
    return taxableGain * taxRate
  }

  /**
   * Analyze tax-efficient rebalancing
   */
  analyzeRebalancingForTaxes(
    securities: TaxableSecurity[],
    targetAllocation: { [key: string]: number },
    currentAllocation: { [key: string]: number },
  ): RebalancingImpact[] {
    const impacts: RebalancingImpact[] = []

    securities.forEach((security) => {
      const targetPct = targetAllocation[security.ticker] || 0
      const currentPct = currentAllocation[security.ticker] || 0
      const allocation_change = targetPct - currentPct

      if (allocation_change > 2) {
        impacts.push({
          action: 'buy',
          asset: security.ticker,
          reason: 'Increase allocation to match target',
          taxImpact: 0,
        })
      } else if (allocation_change < -2) {
        const gain = security.currentValue - security.costBasis
        const taxImpact = gain > 0
          ? this.calculateCapitalGainsTax(gain, security.holdingPeriod, security.assetType)
          : 0

        impacts.push({
          action: 'sell',
          asset: security.ticker,
          reason: 'Reduce allocation to match target',
          taxImpact,
        })
      } else {
        impacts.push({
          action: 'hold',
          asset: security.ticker,
          reason: 'Allocation within tolerance',
          taxImpact: 0,
        })
      }
    })

    return impacts
  }

  /**
   * Get tax-loss harvesting recommendations
   * Note: India does not have a wash-sale rule; losses can be set off against gains within the same year
   * Short-term losses can offset both STCG and LTCG; long-term losses can offset only LTCG
   */
  getTaxHarvestingRecommendations(
    securities: TaxableSecurity[],
    annualGainsAvailable: number = 0,
  ): TaxLossOpportunity[] {
    const opportunities = this.identifyTaxLossOpportunities(securities)
    let accumulated = 0

    return opportunities.filter((opp) => {
      if (annualGainsAvailable <= 0 || accumulated + opp.unrealizedLoss <= annualGainsAvailable) {
        accumulated += opp.unrealizedLoss
        return true
      }
      return false
    })
  }
}
