/**
 * Savings Analysis Service
 * Analyzes user's current savings position and provides insights
 */

export interface SavingsData {
  currentSavings: number
  monthlyIncome: number
  monthlySavings: number
}

export interface SavingsAnalysis {
  savingsRate: number // percentage
  monthsOfExpenses: number // emergency fund ratio
  recommendedEmergencyFund: number
  savingsPower: number // annual savings
  projecteds: ProjectedSavings[]
}

export interface ProjectedSavings {
  year: number
  projectedSavings: number
}

export class SavingsAnalysisService {
  /**
   * Calculate savings rate as percentage of income
   */
  calculateSavingsRate(data: SavingsData): number {
    if (data.monthlyIncome === 0) return 0
    return (data.monthlySavings / data.monthlyIncome) * 100
  }

  /**
   * Calculate months of living expenses covered by savings
   */
  calculateMonthsOfExpenses(data: SavingsData): number {
    if (data.monthlySavings === 0) return 0
    return data.currentSavings / (data.monthlyIncome - data.monthlySavings)
  }

  /**
   * Recommend emergency fund size (3-6 months of expenses)
   */
  calculateRecommendedEmergencyFund(monthlyExpenses: number): number {
    return monthlyExpenses * 6 // 6 months emergency fund
  }

  /**
   * Project savings growth over years
   * Default return of 12% reflects Nifty 50 long-run CAGR for Indian equity investors
   */
  projectSavingsGrowth(
    currentSavings: number,
    annualSavings: number,
    years: number,
    annualReturn: number = 0.12,
  ): ProjectedSavings[] {
    const projections: ProjectedSavings[] = []
    let balance = currentSavings

    for (let year = 1; year <= years; year++) {
      balance = balance * (1 + annualReturn) + annualSavings
      projections.push({
        year,
        projectedSavings: Math.round(balance),
      })
    }

    return projections
  }

  /**
   * Comprehensive savings analysis
   */
  analyze(data: SavingsData, monthlyExpenses: number): SavingsAnalysis {
    const savingsRate = this.calculateSavingsRate(data)
    const monthsOfExpenses = this.calculateMonthsOfExpenses(data)
    const recommendedEmergencyFund = this.calculateRecommendedEmergencyFund(monthlyExpenses)
    const annualSavings = data.monthlySavings * 12

    return {
      savingsRate,
      monthsOfExpenses,
      recommendedEmergencyFund,
      savingsPower: annualSavings,
      projecteds: this.projectSavingsGrowth(
        data.currentSavings,
        annualSavings,
        10,
      ),
    }
  }
}
