/**
 * Recommendation Engine Service
 * Generates personalized investment recommendations for Indian investors
 * Covers tax-saving instruments (Section 80C/80D), SIP discipline, PPF, NPS, ELSS, and SGBs
 */

export interface UserProfile {
  riskTolerance: 'low' | 'medium' | 'high'
  investmentTimeframe: number // years
  currentSavingsRate: number // percentage
  totalPortfolioValue: number
  annualIncome?: number // ₹ — used for 80C utilisation check
  section80CInvested?: number // ₹ already invested under Sec 80C this year
}

export interface Goal {
  name: string
  targetAmount: number
  targetDate: string
  priority: number
}

export interface Recommendation {
  id: string
  type: 'investment' | 'rebalance' | 'tax_harvest' | 'risk_adjustment' | 'goal_alignment'
  title: string
  description: string
  rationale: string
  estimatedImpact: number
  priority: 'high' | 'medium' | 'low'
  action: string
}

// Section 80C annual limit (₹)
const SEC_80C_LIMIT = 150000

export class RecommendationEngineService {
  /**
   * Generate investment recommendations based on Indian investor profile and goals
   */
  generateRecommendations(profile: UserProfile, goals: Goal[]): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Section 80C utilisation — ELSS / PPF top-up
    const invested80C = profile.section80CInvested ?? 0
    const remaining80C = Math.max(0, SEC_80C_LIMIT - invested80C)
    if (remaining80C > 0) {
      recommendations.push({
        id: 'tax-80c-001',
        type: 'investment',
        title: 'Utilise Section 80C Deduction',
        description: `You have ₹${remaining80C.toLocaleString('en-IN')} of unused Section 80C limit remaining.`,
        rationale:
          'Section 80C allows up to ₹1.5 lakh deduction. Investing in ELSS mutual funds or topping up PPF reduces taxable income, providing an immediate tax benefit.',
        estimatedImpact: remaining80C * 0.30, // tax saving at 30% peak slab
        priority: 'high',
        action: 'Invest in ELSS (3-year lock-in, equity growth) or top up PPF before March 31',
      })
    }

    // SIP discipline for long-term wealth creation
    if (profile.currentSavingsRate > 15) {
      recommendations.push({
        id: 'sip-001',
        type: 'investment',
        title: 'Start or Increase Monthly SIP',
        description: 'Your savings rate is strong. Channel surplus into disciplined monthly SIPs.',
        rationale:
          'Rupee-cost averaging through SIPs in diversified equity mutual funds harnesses Nifty 50 long-run returns (~12-14% CAGR) with lower timing risk.',
        estimatedImpact: profile.totalPortfolioValue * 0.02,
        priority: 'medium',
        action: 'Set up SIPs in large-cap, flexi-cap, and mid-cap funds proportional to risk profile',
      })
    }

    // NPS for retirement + additional 80CCD(1B) benefit
    if (profile.investmentTimeframe > 10) {
      recommendations.push({
        id: 'nps-001',
        type: 'investment',
        title: 'Invest in NPS for Retirement',
        description: 'National Pension System offers an additional ₹50,000 deduction under Section 80CCD(1B).',
        rationale:
          'NPS provides market-linked returns (~10% for equity tier) and an extra ₹50,000 deduction over and above the ₹1.5 lakh 80C limit, reducing tax liability further.',
        estimatedImpact: 50000 * 0.30, // tax saving on ₹50k at 30% slab
        priority: 'medium',
        action: 'Open Tier-I NPS account and invest ₹50,000 per year for maximum 80CCD(1B) benefit',
      })
    }

    // Risk adjustment based on time horizon — shift from FD-heavy to equity
    if (profile.investmentTimeframe > 10 && profile.riskTolerance === 'low') {
      recommendations.push({
        id: 'risk-001',
        type: 'risk_adjustment',
        title: 'Reduce FD Dependence — Add Equity Exposure',
        description: 'Long investment horizon allows gradual shift from fixed deposits to equity.',
        rationale:
          'FD returns (~7%) lag inflation in the long run. With 10+ years ahead, adding equity mutual funds or direct equity improves real returns while market volatility evens out.',
        estimatedImpact: profile.totalPortfolioValue * 0.015,
        priority: 'low',
        action: 'Redirect 10-15% of FD maturity proceeds into Nifty 50 index funds or large-cap SIPs',
      })
    }

    // Sovereign Gold Bond (SGB) instead of physical gold
    recommendations.push({
      id: 'sgb-001',
      type: 'investment',
      title: 'Switch Physical Gold to Sovereign Gold Bonds',
      description: 'Sovereign Gold Bonds earn 2.5% annual interest on top of gold price appreciation.',
      rationale:
          'SGBs eliminate storage cost and making charges of physical gold, provide 2.5% p.a. interest, and are LTCG-exempt if held till maturity (8 years).',
      estimatedImpact: profile.totalPortfolioValue * 0.005,
      priority: 'low',
      action: 'Apply for next SGB tranche via bank/RBI Retail Direct; limit gold to 5-10% of portfolio',
    })

    // Goal alignment recommendations
    goals.forEach((goal) => {
      const yearsToGoal = this.calculateYearsUntilGoal(goal.targetDate)
      if (yearsToGoal > 0 && yearsToGoal < 3) {
        recommendations.push({
          id: `goal-${goal.name.replace(/\s/g, '-')}`,
          type: 'goal_alignment',
          title: `Accelerate Savings for ${goal.name}`,
          description: `Goal target date is approaching in ${yearsToGoal} year(s). Shift to lower-risk instruments.`,
          rationale: `As "${goal.name}" draws near, capital preservation is critical. Move accumulated corpus to debt mutual funds, FD, or liquid funds to protect against equity volatility.`,
          estimatedImpact: goal.targetAmount * 0.1,
          priority: goal.priority <= 1 ? 'high' : 'medium',
          action: `Increase monthly SIP/RD allocation towards ${goal.name} by 10-15% and de-risk to debt instruments`,
        })
      }
    })

    // Portfolio rebalancing
    recommendations.push({
      id: 'rebal-001',
      type: 'rebalance',
      title: 'Annual Portfolio Rebalancing',
      description: 'Your portfolio allocation has drifted from target. Rebalance before financial year end.',
      rationale:
        'Annual rebalancing restores your target allocation, locks in equity gains, and can be timed to utilise the ₹1.25 lakh LTCG exemption on equity.',
      estimatedImpact: profile.totalPortfolioValue * 0.005,
      priority: 'medium',
      action: 'Review allocation against target; sell over-weight assets and redeploy into under-weight classes before March 31',
    })

    return recommendations.sort((a, b) => this.priorityScore(b.priority) - this.priorityScore(a.priority))
  }

  private priorityScore(priority: 'high' | 'medium' | 'low'): number {
    const scores = { high: 3, medium: 2, low: 1 }
    return scores[priority]
  }

  private calculateYearsUntilGoal(targetDate: string): number {
    const target = new Date(targetDate)
    const now = new Date()
    const daysUntil = Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.floor(daysUntil / 365)
  }

  generateRecommendationId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  calculateMonetaryImpact(portfolioValue: number, expectedReturn: number): number {
    return portfolioValue * expectedReturn
  }

  scoreRecommendation(rec: Recommendation): number {
    const priorityScores = { high: 100, medium: 50, low: 25 }
    const impactScore = Math.log(Math.abs(rec.estimatedImpact) + 1) * 10
    return priorityScores[rec.priority] + impactScore
  }
}
