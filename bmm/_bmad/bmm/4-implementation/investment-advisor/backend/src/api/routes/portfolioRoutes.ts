import { Router, Request, Response } from 'express'
import { authMiddleware } from '@/middleware/auth'
import prisma from '@/db/client'
import { PortfolioAnalysisService } from '@/services/portfolio/PortfolioAnalysisService'
import { TaxOptimizationService } from '@/services/portfolio/TaxOptimizationService'
import type { TaxableSecurity } from '@/services/portfolio/TaxOptimizationService'

const router = Router()
router.use(authMiddleware)

const analysisService = new PortfolioAnalysisService()
const taxService = new TaxOptimizationService()

// GET /api/v1/portfolio — list user's portfolios
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { holdings: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(portfolios)
  } catch (err) {
    console.error('getPortfolios error:', err)
    res.status(500).json({ error: 'Failed to fetch portfolios' })
  }
})

// POST /api/v1/portfolio — create a portfolio
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })

    const portfolio = await prisma.portfolio.create({
      data: { userId, name, totalValue: 0 },
      include: { holdings: true },
    })
    res.status(201).json(portfolio)
  } catch (err) {
    console.error('createPortfolio error:', err)
    res.status(500).json({ error: 'Failed to create portfolio' })
  }
})

// GET /api/v1/portfolio/:id — get a single portfolio with holdings
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId },
      include: { holdings: true, rebalancingAlerts: { orderBy: { triggered: 'desc' }, take: 5 } },
    })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })
    res.json(portfolio)
  } catch (err) {
    console.error('getPortfolio error:', err)
    res.status(500).json({ error: 'Failed to fetch portfolio' })
  }
})

// DELETE /api/v1/portfolio/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const existing = await prisma.portfolio.findFirst({ where: { id: req.params.id, userId } })
    if (!existing) return res.status(404).json({ error: 'Portfolio not found' })
    await prisma.portfolio.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('deletePortfolio error:', err)
    res.status(500).json({ error: 'Failed to delete portfolio' })
  }
})

// POST /api/v1/portfolio/:id/holdings — add a holding
router.post('/:id/holdings', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({ where: { id: req.params.id, userId } })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    const { ticker, assetClass, quantity, costBasis, currentValue, purchaseDate } = req.body
    if (!ticker || !assetClass || quantity == null || costBasis == null || currentValue == null || !purchaseDate) {
      return res.status(400).json({ error: 'ticker, assetClass, quantity, costBasis, currentValue, purchaseDate are required' })
    }

    const holding = await prisma.holding.create({
      data: {
        portfolioId: req.params.id,
        ticker,
        assetClass,
        quantity: parseFloat(quantity),
        costBasis: parseFloat(costBasis),
        currentValue: parseFloat(currentValue),
        purchaseDate: new Date(purchaseDate),
      },
    })

    // Recalculate portfolio total value
    const allHoldings = await prisma.holding.findMany({ where: { portfolioId: req.params.id } })
    const totalValue = allHoldings.reduce((sum, h) => sum + h.currentValue, 0)
    await prisma.portfolio.update({ where: { id: req.params.id }, data: { totalValue } })

    // Snapshot portfolio history
    await prisma.portfolioHistory.create({ data: { portfolioId: req.params.id, totalValue } })

    res.status(201).json(holding)
  } catch (err) {
    console.error('addHolding error:', err)
    res.status(500).json({ error: 'Failed to add holding' })
  }
})

// PUT /api/v1/portfolio/:id/holdings/:hid — update a holding
router.put('/:id/holdings/:hid', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({ where: { id: req.params.id, userId } })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    const { ticker, assetClass, quantity, costBasis, currentValue, purchaseDate } = req.body
    const updated = await prisma.holding.update({
      where: { id: req.params.hid },
      data: {
        ...(ticker && { ticker }),
        ...(assetClass && { assetClass }),
        ...(quantity != null && { quantity: parseFloat(quantity) }),
        ...(costBasis != null && { costBasis: parseFloat(costBasis) }),
        ...(currentValue != null && { currentValue: parseFloat(currentValue) }),
        ...(purchaseDate && { purchaseDate: new Date(purchaseDate) }),
      },
    })

    // Recalculate total
    const allHoldings = await prisma.holding.findMany({ where: { portfolioId: req.params.id } })
    const totalValue = allHoldings.reduce((sum, h) => sum + h.currentValue, 0)
    await prisma.portfolio.update({ where: { id: req.params.id }, data: { totalValue } })

    res.json(updated)
  } catch (err) {
    console.error('updateHolding error:', err)
    res.status(500).json({ error: 'Failed to update holding' })
  }
})

// DELETE /api/v1/portfolio/:id/holdings/:hid
router.delete('/:id/holdings/:hid', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({ where: { id: req.params.id, userId } })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    await prisma.holding.delete({ where: { id: req.params.hid } })

    const allHoldings = await prisma.holding.findMany({ where: { portfolioId: req.params.id } })
    const totalValue = allHoldings.reduce((sum, h) => sum + h.currentValue, 0)
    await prisma.portfolio.update({ where: { id: req.params.id }, data: { totalValue } })

    res.json({ success: true })
  } catch (err) {
    console.error('deleteHolding error:', err)
    res.status(500).json({ error: 'Failed to delete holding' })
  }
})

// GET /api/v1/portfolio/:id/rebalancing — rebalancing analysis
router.get('/:id/rebalancing', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId },
      include: { holdings: true },
    })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    const riskTolerance = (req.query.riskTolerance as 'low' | 'medium' | 'high') || 'medium'
    const composition = analysisService.calculateComposition(portfolio.holdings)
    const riskMetrics = analysisService.assessRisk(composition)
    const recommendations = analysisService.getRebalancingRecommendations(composition, riskTolerance)
    const needsRebalancing = analysisService.shouldRebalance(composition, riskTolerance)

    res.json({ composition, riskMetrics, recommendations, needsRebalancing, riskTolerance })
  } catch (err) {
    console.error('rebalancing error:', err)
    res.status(500).json({ error: 'Failed to compute rebalancing' })
  }
})

// GET /api/v1/portfolio/:id/tax — tax optimization
router.get('/:id/tax', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId },
      include: { holdings: true },
    })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    const securities: TaxableSecurity[] = portfolio.holdings.map((h) => ({
      ticker: h.ticker,
      costBasis: h.costBasis,
      currentValue: h.currentValue,
      purchaseDate: h.purchaseDate.toISOString(),
      holdingPeriod: taxService.determineHoldingPeriod(h.purchaseDate.toISOString()),
      assetType: mapAssetType(h.assetClass),
    }))

    const opportunities = taxService.identifyTaxLossOpportunities(securities)
    const totalSavings = taxService.calculateTotalTaxSavings(opportunities)
    const recommendations = taxService.getTaxHarvestingRecommendations(securities)

    res.json({ opportunities, totalSavings, recommendations, securities })
  } catch (err) {
    console.error('tax optimization error:', err)
    res.status(500).json({ error: 'Failed to compute tax optimization' })
  }
})

// GET /api/v1/portfolio/:id/risk — risk assessment
router.get('/:id/risk', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: req.params.id, userId },
      include: { holdings: true },
    })
    if (!portfolio) return res.status(404).json({ error: 'Portfolio not found' })

    const composition = analysisService.calculateComposition(portfolio.holdings)
    const riskMetrics = analysisService.assessRisk(composition)
    res.json({ ...riskMetrics, composition, totalValue: portfolio.totalValue })
  } catch (err) {
    console.error('risk assessment error:', err)
    res.status(500).json({ error: 'Failed to compute risk assessment' })
  }
})

function mapAssetType(assetClass: string): TaxableSecurity['assetType'] {
  const map: Record<string, TaxableSecurity['assetType']> = {
    equity: 'equity',
    mutualFunds: 'equity',
    nps: 'equity',
    bonds: 'debt',
    fixedDeposits: 'debt',
    ppf: 'debt',
    gold: 'gold',
    realEstate: 'realestate',
  }
  return map[assetClass] ?? 'equity'
}

export default router
