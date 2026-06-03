import { Router, Request, Response } from 'express'
import { authMiddleware } from '@/middleware/auth'
import prisma from '@/db/client'

const router = Router()
router.use(authMiddleware)

// GET /api/v1/savings — get user's savings profile (latest)
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const savings = await prisma.savings.findFirst({
      where: { userId },
      include: { goals: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!savings) return res.status(404).json({ error: 'No savings profile found' })
    res.json(savings)
  } catch (err) {
    console.error('getSavings error:', err)
    res.status(500).json({ error: 'Failed to fetch savings' })
  }
})

// POST /api/v1/savings — create or update savings profile
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { currentSavings, monthlyIncome, monthlySavings, goals } = req.body

    if (currentSavings == null || monthlyIncome == null || monthlySavings == null) {
      return res.status(400).json({ error: 'currentSavings, monthlyIncome, monthlySavings are required' })
    }

    // Upsert: delete old and create fresh (simple approach for single-user savings profile)
    const existing = await prisma.savings.findFirst({ where: { userId } })
    if (existing) {
      await prisma.savingsGoal.deleteMany({ where: { savingsId: existing.id } })
      await prisma.savings.delete({ where: { id: existing.id } })
    }

    const savings = await prisma.savings.create({
      data: {
        userId,
        currentSavings: parseFloat(currentSavings),
        monthlyIncome: parseFloat(monthlyIncome),
        monthlySavings: parseFloat(monthlySavings),
        goals: goals?.length
          ? {
              create: goals.map((g: any) => ({
                name: g.name,
                targetAmount: parseFloat(g.targetAmount),
                targetDate: new Date(g.targetDate),
                priority: parseInt(g.priority) || 1,
                riskTolerance: g.riskTolerance || 'medium',
              })),
            }
          : undefined,
      },
      include: { goals: true },
    })
    res.status(201).json(savings)
  } catch (err) {
    console.error('createSavings error:', err)
    res.status(500).json({ error: 'Failed to save savings profile' })
  }
})

// PUT /api/v1/savings/:id — update a savings record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const existing = await prisma.savings.findFirst({ where: { id: req.params.id, userId } })
    if (!existing) return res.status(404).json({ error: 'Not found' })

    const { currentSavings, monthlyIncome, monthlySavings } = req.body
    const updated = await prisma.savings.update({
      where: { id: req.params.id },
      data: {
        ...(currentSavings != null && { currentSavings: parseFloat(currentSavings) }),
        ...(monthlyIncome != null && { monthlyIncome: parseFloat(monthlyIncome) }),
        ...(monthlySavings != null && { monthlySavings: parseFloat(monthlySavings) }),
      },
      include: { goals: true },
    })
    res.json(updated)
  } catch (err) {
    console.error('updateSavings error:', err)
    res.status(500).json({ error: 'Failed to update savings' })
  }
})

// DELETE /api/v1/savings/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const existing = await prisma.savings.findFirst({ where: { id: req.params.id, userId } })
    if (!existing) return res.status(404).json({ error: 'Not found' })
    await prisma.savings.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('deleteSavings error:', err)
    res.status(500).json({ error: 'Failed to delete savings' })
  }
})

// GET /api/v1/savings/goals — get goals for latest savings
router.get('/goals', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const savings = await prisma.savings.findFirst({
      where: { userId },
      include: { goals: true },
      orderBy: { createdAt: 'desc' },
    })
    if (!savings) return res.json([])
    res.json(savings.goals)
  } catch (err) {
    console.error('getGoals error:', err)
    res.status(500).json({ error: 'Failed to fetch goals' })
  }
})

// POST /api/v1/savings/goals — add a goal to existing savings profile
router.post('/goals', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const savings = await prisma.savings.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
    if (!savings) return res.status(404).json({ error: 'Create a savings profile first' })

    const { name, targetAmount, targetDate, priority, riskTolerance } = req.body
    if (!name || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'name, targetAmount, targetDate are required' })
    }
    const goal = await prisma.savingsGoal.create({
      data: {
        savingsId: savings.id,
        name,
        targetAmount: parseFloat(targetAmount),
        targetDate: new Date(targetDate),
        priority: parseInt(priority) || 1,
        riskTolerance: riskTolerance || 'medium',
      },
    })
    res.status(201).json(goal)
  } catch (err) {
    console.error('addGoal error:', err)
    res.status(500).json({ error: 'Failed to add goal' })
  }
})

// DELETE /api/v1/savings/goals/:id
router.delete('/goals/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id },
      include: { savings: true },
    })
    if (!goal || goal.savings.userId !== userId) return res.status(404).json({ error: 'Not found' })
    await prisma.savingsGoal.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) {
    console.error('deleteGoal error:', err)
    res.status(500).json({ error: 'Failed to delete goal' })
  }
})

export default router
