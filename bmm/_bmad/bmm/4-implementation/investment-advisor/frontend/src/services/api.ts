/**
 * API client for Investment Advisor frontend
 * Handles all communication with the backend API
 */

import axios, { AxiosInstance } from 'axios'
import type { 
  User, 
  Savings, 
  Portfolio, 
  Recommendation,
  RiskAssessment,
  TaxOptimizationResult 
} from '@shared/types'

class APIClient {
  private api: AxiosInstance
  private token: string | null = null

  constructor(baseURL: string = '/api/v1') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add token to requests
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    // Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.token = null
          window.location.href = '/login'
        }
        return Promise.reject(error)
      },
    )
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('authToken', token)
  }

  // ============ Auth ============
  async register(email: string, name: string, password: string): Promise<User> {
    const { data } = await this.api.post('/auth/register', {
      email,
      name,
      password,
    })
    this.setToken(data.token)
    return data.user
  }

  async login(email: string, password: string): Promise<User> {
    const { data } = await this.api.post('/auth/login', {
      email,
      password,
    })
    this.setToken(data.token)
    return data.user
  }

  async logout() {
    this.token = null
    localStorage.removeItem('authToken')
  }

  // ============ Savings ============
  async getSavings(): Promise<Savings> {
    const { data } = await this.api.get('/savings')
    return data
  }

  async createSavings(savingsData: Partial<Savings>): Promise<Savings> {
    const { data } = await this.api.post('/savings', savingsData)
    return data
  }

  async uploadSavingsCSV(file: File): Promise<Savings> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await this.api.post('/savings/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  }

  // ============ Portfolio ============
  async getPortfolios(): Promise<Portfolio[]> {
    const { data } = await this.api.get('/portfolio')
    return data
  }

  async getPortfolio(id: string): Promise<Portfolio> {
    const { data } = await this.api.get(`/portfolio/${id}`)
    return data
  }

  async createPortfolio(portfolio: Partial<Portfolio>): Promise<Portfolio> {
    const { data } = await this.api.post('/portfolio', portfolio)
    return data
  }

  async addHolding(portfolioId: string, holding: any) {
    const { data } = await this.api.post(`/portfolio/${portfolioId}/holdings`, holding)
    return data
  }

  async uploadPortfolioCSV(portfolioId: string, file: File): Promise<Portfolio> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await this.api.post(
      `/portfolio/${portfolioId}/upload-csv`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    return data
  }

  // ============ Analysis ============
  async getRiskAssessment(portfolioId: string): Promise<RiskAssessment> {
    const { data } = await this.api.get(`/analysis/risk/${portfolioId}`)
    return data
  }

  async getTaxOptimization(portfolioId: string): Promise<TaxOptimizationResult> {
    const { data } = await this.api.get(`/analysis/tax-optimization/${portfolioId}`)
    return data
  }

  async getRebalancingAnalysis(portfolioId: string) {
    const { data } = await this.api.get(`/analysis/rebalancing/${portfolioId}`)
    return data
  }

  // ============ Recommendations ============
  async getRecommendations(): Promise<Recommendation[]> {
    const { data } = await this.api.get('/recommendations')
    return data
  }

  async implementRecommendation(recId: string): Promise<Recommendation> {
    const { data } = await this.api.post(`/recommendations/${recId}/implement`)
    return data
  }

  async dismissRecommendation(recId: string): Promise<Recommendation> {
    const { data } = await this.api.post(`/recommendations/${recId}/dismiss`)
    return data
  }
}

export default new APIClient()
