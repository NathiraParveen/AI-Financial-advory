// User and Authentication Types
export interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface AuthRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Savings Types
export interface Savings {
  id: string
  userId: string
  currentSavings: number
  monthlyIncome: number
  monthlySavings: number
  savingStartDate: string
  goals: SavingsGoal[]
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  targetDate: string
  priority: number
  riskTolerance: 'low' | 'medium' | 'high'
}

// Portfolio Types
export interface Portfolio {
  id: string
  userId: string
  name: string
  totalValue: number
  holdings: Holding[]
  history: PortfolioHistory[]
}

export interface Holding {
  id: string
  ticker: string
  assetClass: string
  quantity: number
  costBasis: number
  currentValue: number
  purchaseDate: string
}

export interface PortfolioHistory {
  id: string
  totalValue: number
  timestamp: string
}

// Recommendation Types
export type RecommendationType =
  | 'investment'
  | 'rebalance'
  | 'tax_harvest'
  | 'risk_adjustment'
  | 'goal_alignment'

export interface Recommendation {
  id: string
  userId: string
  type: RecommendationType
  title: string
  description: string
  rationale: string
  estimatedImpact: number
  priority: 'high' | 'medium' | 'low'
  action: string
  status: 'active' | 'implemented' | 'dismissed'
  createdAt: string
  dismissedAt?: string
  implementedAt?: string
}

// Analysis Results
export interface RiskAssessment {
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  portfolio_volatility: number
  recommended_asset_allocation: {
    [key: string]: number
  }
}

export interface TaxOptimizationResult {
  taxLossHarvestingOpportunities: Array<{
    ticker: string
    unrealizedLoss: number
  }>
  estimatedTaxSavings: number
}

export interface RebalancingAlert {
  portfolioId: string
  targetAllocation: { [key: string]: number }
  currentAllocation: { [key: string]: number }
  threshold: number
  triggered: string
}
