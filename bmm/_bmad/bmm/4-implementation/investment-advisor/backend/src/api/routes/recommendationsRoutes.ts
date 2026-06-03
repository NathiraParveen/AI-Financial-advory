import { Router, Request, Response } from 'express'
import { authMiddleware } from '@/middleware/auth'
import prisma from '@/db/client'
import { RecommendationEngineService } from '@/services/recommendations/RecommendationEngineService'

const router = Router()
router.use(authMiddleware)
const engine = new RecommendationEngineService()

// GET /api/v1/recommendations — generate + return recommendations for the user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    // Gather user data
    const savings = await prisma.savings.findFirst({
      where: { userId },
      include: { goals: true },
      orderBy: { createdAt: 'desc' },
    })

    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { holdings: true },
    })

    const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0)
    const monthlyIncome = savings?.monthlyIncome ?? 0
    const monthlySavings = savings?.monthlySavings ?? 0
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0

    const profile = {
      riskTolerance: 'medium' as const,
      investmentTimeframe: 10,
      currentSavingsRate: savingsRate,
      totalPortfolioValue,
      annualIncome: monthlyIncome * 12,
    }

    const goals = (savings?.goals ?? []).map((g) => ({
      name: g.name,
      targetAmount: g.targetAmount,
      targetDate: g.targetDate.toISOString(),
      priority: g.priority,
    }))

    const generated = engine.generateRecommendations(profile, goals)

    // Persist to DB (delete old active ones and re-create)
    await prisma.recommendation.deleteMany({ where: { userId, status: 'active' } })
    const saved = await Promise.all(
      generated.map((r) =>
        prisma.recommendation.create({
          data: {
            userId,
            type: r.type,
            title: r.title,
            description: r.description,
            rationale: r.rationale,
            estimatedImpact: r.estimatedImpact,
            priority: r.priority,
            action: r.action,
            status: 'active',
          },
        }),
      ),
    )

    res.json(saved)
  } catch (err) {
    console.error('getRecommendations error:', err)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})

// POST /api/v1/recommendations/:id/implement
router.post('/:id/implement', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const rec = await prisma.recommendation.findFirst({ where: { id: req.params.id, userId } })
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' })
    const updated = await prisma.recommendation.update({
      where: { id: req.params.id },
      data: { status: 'implemented', implementedAt: new Date() },
    })
    res.json(updated)
  } catch (err) {
    console.error('implement rec error:', err)
    res.status(500).json({ error: 'Failed to update recommendation' })
  }
})

// POST /api/v1/recommendations/:id/dismiss
router.post('/:id/dismiss', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const rec = await prisma.recommendation.findFirst({ where: { id: req.params.id, userId } })
    if (!rec) return res.status(404).json({ error: 'Recommendation not found' })
    const updated = await prisma.recommendation.update({
      where: { id: req.params.id },
      data: { status: 'dismissed', dismissedAt: new Date() },
    })
    res.json(updated)
  } catch (err) {
    console.error('dismiss rec error:', err)
    res.status(500).json({ error: 'Failed to dismiss recommendation' })
  }
})

export default router
