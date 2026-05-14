/**
 * Financial calculation utilities
 */

/**
 * Calculate Future Value with compound interest
 * FV = PV * (1 + r)^n
 */
export function calculateFutureValue(
  presentValue: number,
  annualRate: number,
  years: number,
  compoundingPeriodsPerYear: number = 12,
): number {
  const rate = annualRate / compoundingPeriodsPerYear
  const periods = years * compoundingPeriodsPerYear
  return presentValue * Math.pow(1 + rate, periods)
}

/**
 * Calculate Present Value (discounted cash flow)
 * PV = FV / (1 + r)^n
 */
export function calculatePresentValue(
  futureValue: number,
  discountRate: number,
  years: number,
): number {
  return futureValue / Math.pow(1 + discountRate, years)
}

/**
 * Calculate required return to reach a goal
 * Solves for r in: FV = PV * (1 + r)^n
 */
export function calculateRequiredReturn(
  presentValue: number,
  futureValue: number,
  years: number,
): number {
  if (presentValue <= 0) return 0
  return Math.pow(futureValue / presentValue, 1 / years) - 1
}

/**
 * Calculate annualized return
 */
export function calculateAnnualizedReturn(
  startValue: number,
  endValue: number,
  years: number,
): number {
  if (startValue <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

/**
 * Calculate monthly payment needed to reach goal
 * Using Future Value of Annuity formula
 */
export function calculateMonthlyPayment(
  targetAmount: number,
  annualRate: number,
  monthsUntilTarget: number,
): number {
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) {
    return targetAmount / monthsUntilTarget
  }
  const factor = (Math.pow(1 + monthlyRate, monthsUntilTarget) - 1) / monthlyRate
  return targetAmount / factor
}

/**
 * Calculate time to reach savings goal
 */
export function calculateTimeToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlyContribution: number,
  annualReturn: number = 0.06,
): number {
  if (currentAmount >= targetAmount) return 0

  const monthlyRate = annualReturn / 12
  let balance = currentAmount
  let months = 0

  while (balance < targetAmount && months < 600) {
    // Safety limit of 50 years
    balance = balance * (1 + monthlyRate) + monthlyContribution
    months++
  }

  return months
}

/**
 * Calculate portfolio allocation percentages
 */
export function calculateAllocation(
  holdings: { value: number }[],
): number[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0)
  if (totalValue === 0) return holdings.map(() => 0)
  return holdings.map((h) => (h.value / totalValue) * 100)
}

/**
 * Calculate standard deviation (volatility)
 */
export function calculateStandardDeviation(returns: number[]): number {
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length
  const squaredDiffs = returns.map((r) => Math.pow(r - mean, 2))
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / returns.length
  return Math.sqrt(variance)
}

/**
 * Calculate Sharpe ratio
 * (Portfolio Return - Risk Free Rate) / Standard Deviation
 */
export function calculateSharpeRatio(
  portfolioReturn: number,
  riskFreeRate: number = 0.02,
  volatility: number,
): number {
  if (volatility === 0) return 0
  return (portfolioReturn - riskFreeRate) / volatility
}

/**
 * Calculate rebalancing needed amounts
 */
export function calculateRebalancingAmounts(
  currentAllocations: { [key: string]: number },
  targetAllocations: { [key: string]: number },
  totalPortfolioValue: number,
): { [key: string]: number } {
  const rebalancing: { [key: string]: number } = {}

  Object.keys(targetAllocations).forEach((asset) => {
    const targetValue = (targetAllocations[asset] / 100) * totalPortfolioValue
    const currentValue = (currentAllocations[asset] / 100) * totalPortfolioValue
    rebalancing[asset] = targetValue - currentValue
  })

  return rebalancing
}

/**
 * Calculate compound annual growth rate (CAGR)
 */
export function calculateCAGR(
  startValue: number,
  endValue: number,
  years: number,
): number {
  if (startValue <= 0 || years <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `$${value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
