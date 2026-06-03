import { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Divider, Button, CircularProgress } from '@mui/material'
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import SavingsIcon from '@mui/icons-material/Savings'
import FlagIcon from '@mui/icons-material/Flag'
import PercentIcon from '@mui/icons-material/Percent'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import BalanceIcon from '@mui/icons-material/Balance'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import RefreshIcon from '@mui/icons-material/Refresh'
import api from '../services/api'

const ASSET_COLORS: Record<string, string> = {
  equity: '#3B82F6', mutualFunds: '#8B5CF6', gold: '#F59E0B',
  fixedDeposits: '#10B981', ppf: '#06B6D4', nps: '#F97316',
  bonds: '#64748B', cash: '#94A3B8',
}

function projectSavingsGrowth(currentSavings: number, annualSavings: number, years: number, annualReturn = 0.12) {
  const projections = []
  let balance = currentSavings
  const startYear = new Date().getFullYear()
  for (let y = 1; y <= years; y++) {
    balance = balance * (1 + annualReturn) + annualSavings
    projections.push({ year: String(startYear + y), value: Math.round(balance) })
  }
  return projections
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', p: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </Typography>
    </Box>
  )
}

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  performance: { label: 'Performance', color: '#16A34A', bg: '#F0FDF4', icon: <ShowChartIcon sx={{ fontSize: 18 }} /> },
  goal:        { label: 'Goal',        color: '#3B82F6', bg: '#EFF6FF', icon: <FlagIcon sx={{ fontSize: 18 }} /> },
  risk:        { label: 'Risk',        color: '#DC2626', bg: '#FEF2F2', icon: <BalanceIcon sx={{ fontSize: 18 }} /> },
  tax:         { label: 'Tax',         color: '#F59E0B', bg: '#FEF3C7', icon: <ReceiptLongIcon sx={{ fontSize: 18 }} /> },
  behavioral:  { label: 'Behavioral',  color: '#7C3AED', bg: '#EDE9FE', icon: <AutoAwesomeIcon sx={{ fontSize: 18 }} /> },
}

const typeLabel: Record<string, string> = { rebalance: 'Rebalance', tax_harvest: 'Tax', goal_alignment: 'Goal', investment: 'Invest', risk_adjustment: 'Risk' }
const priorityDot: Record<string, string> = { high: '#DC2626', medium: '#F59E0B', low: '#94A3B8' }
const rankBg = ['#FEE2E2', '#FEF3C7', '#EDE9FE']

type InsightFilter = 'all' | 'performance' | 'goal' | 'risk' | 'tax' | 'behavioral'

export default function Dashboard() {
  const [loadingSavings, setLoadingSavings] = useState(true)
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingRecs, setLoadingRecs] = useState(true)

  const [savings, setSavings] = useState<any>(null)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [insightFilter, setInsightFilter] = useState<InsightFilter>('all')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    api.getSavings().then(s => setSavings(s)).catch(() => setSavings(null)).finally(() => setLoadingSavings(false))
    api.getPortfolios().then(p => setPortfolios(p)).catch(() => setPortfolios([])).finally(() => setLoadingPortfolio(false))
    api.getRecommendations().then(r => setRecommendations(r)).catch(() => setRecommendations([])).finally(() => setLoadingRecs(false))
    api.getAiInsights().then((r: any) => setInsights(r.insights ?? r)).catch(() => setInsights([]))
  }, [])

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0)
  const allHoldings = portfolios.flatMap((p: any) => p.holdings || [])
  const totalByAsset: Record<string, number> = {}
  allHoldings.forEach((h: any) => {
    totalByAsset[h.assetClass] = (totalByAsset[h.assetClass] || 0) + h.currentValue
  })
  const allocationData = Object.entries(totalByAsset).map(([name, value]) => ({
    name: name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    value: Math.round((value / totalPortfolioValue) * 100) || 0,
    color: ASSET_COLORS[name] || '#94A3B8',
  }))

  const savingsRate = savings && savings.monthlyIncome > 0
    ? (savings.monthlySavings / savings.monthlyIncome) * 100
    : 0
  const goalsCount = savings?.goals?.length ?? 0
  const savingsProjection = savings
    ? projectSavingsGrowth(savings.currentSavings, savings.monthlySavings * 12, 10)
    : []

  const kpiData = [
    {
      label: 'Total Savings', value: savings ? `₹${savings.currentSavings.toLocaleString('en-IN')}` : '—',
      change: savings ? `${savingsRate.toFixed(1)}% savings rate` : 'Set up savings profile',
      positive: true, icon: <SavingsIcon sx={{ fontSize: 20 }} />, iconBg: '#DBEAFE', iconColor: '#3B82F6',
    },
    {
      label: 'Portfolio Value', value: totalPortfolioValue > 0 ? `₹${totalPortfolioValue.toLocaleString('en-IN')}` : '—',
      change: portfolios.length > 0 ? `${portfolios.length} portfolio(s)` : 'No portfolios yet',
      positive: true, icon: <ShowChartIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A',
    },
    {
      label: 'Monthly Savings Rate', value: savings ? `${savingsRate.toFixed(1)}%` : '—',
      change: savingsRate >= 20 ? 'Excellent' : savingsRate >= 10 ? 'Good' : 'Below target',
      positive: savingsRate >= 10, icon: <PercentIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B',
    },
    {
      label: 'Active Goals', value: String(goalsCount),
      change: goalsCount > 0 ? `${goalsCount} goal(s) tracked` : 'No goals set',
      positive: goalsCount > 0, icon: <FlagIcon sx={{ fontSize: 20 }} />, iconBg: '#EDE9FE', iconColor: '#7C3AED',
    },
  ]

  const topRecommendations = recommendations.slice(0, 3)
  const unreadInsights = insights.filter((i: any) => !i.read)
  const unreadCount = unreadInsights.length

  const markRead = async (id: string) => {
    try { await api.markInsightRead(id) } catch {}
    setInsights(prev => prev.map((i: any) => i.id === id ? { ...i, read: true } : i))
  }

  const markAllRead = async () => {
    await Promise.allSettled(unreadInsights.map((i: any) => api.markInsightRead(i.id)))
    setInsights(prev => prev.map((i: any) => ({ ...i, read: true })))
  }

  const regenerate = async () => {
    setGenerating(true)
    try {
      await api.generateAiInsights()
      const fresh: any = await api.getAiInsights()
      setInsights(fresh.insights ?? fresh)
    } catch {}
    setGenerating(false)
  }

  const filteredInsights = insights.filter((i: any) => insightFilter === 'all' || i.type === insightFilter)
  const loading = loadingSavings || loadingPortfolio

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Portfolio Overview</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Here's your financial snapshot for today.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiData.map((kpi) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card>
              <CardContent sx={{ p: '20px !important' }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} sx={{ color: '#F59E0B' }} />
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                        {kpi.label}
                      </Typography>
                      <Typography className="mono" sx={{ fontWeight: 700, mt: 0.5, color: '#0F172A', fontSize: '1.5rem', lineHeight: 1.2 }}>
                        {kpi.value}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                        {kpi.positive
                          ? <TrendingUpIcon sx={{ fontSize: 13, color: '#16A34A' }} />
                          : <TrendingDownIcon sx={{ fontSize: 13, color: '#DC2626' }} />}
                        <Typography variant="caption" sx={{ color: kpi.positive ? '#16A34A' : '#DC2626', fontWeight: 600 }}>
                          {kpi.change}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.iconColor, flexShrink: 0 }}>
                      {kpi.icon}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6">10-Year Savings Projection</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Based on your monthly savings at 12% annual return (Nifty 50 CAGR)</Typography>
                </Box>
                <Chip label="12% est. return" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600, fontSize: '0.75rem' }} />
              </Box>
              {savings ? (
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={savingsProjection} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                      <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} fill="url(#amberGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#F59E0B' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Set up your savings profile in Savings Analysis to see your projection
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6">Asset Allocation</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current portfolio mix</Typography>
              {allocationData.length > 0 ? (
                <>
                  <Box sx={{ height: 190, mt: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={allocationData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={3} dataKey="value">
                          {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip formatter={(v) => [`${v}%`, '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {allocationData.map((d) => (
                      <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.color }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {d.name} <strong style={{ color: '#1E293B' }}>{d.value}%</strong>
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              ) : (
                <Box sx={{ height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center' }}>
                    Add holdings in Portfolio to see allocation
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Recommendations */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Top Recommendations</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Prioritized actions to improve your portfolio</Typography>
            </Box>
            <Chip label="View all →" size="small" component="a" href="/recommendations" clickable sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
          {loadingRecs ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#F59E0B' }} />
            </Box>
          ) : topRecommendations.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {topRecommendations.map((rec: any, idx: number) => (
                <Box key={rec.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.12)' }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: rankBg[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B' }}>{idx + 1}</Typography>
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{rec.title}</Typography>
                      <Chip label={typeLabel[rec.type] ?? rec.type} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: 'rgba(148,163,184,0.15)', color: '#475569' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{rec.description}</Typography>
                  </Box>
                  <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                    <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, display: 'block' }}>
                      +₹{rec.estimatedImpact?.toLocaleString('en-IN', { maximumFractionDigits: 0 }) ?? '—'}
                    </Typography>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityDot[rec.priority] || '#94A3B8', mt: 0.5, ml: 'auto' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 2 }}>
              Add your portfolio and savings data to generate recommendations
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AutoAwesomeIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
              </Box>
              <Box>
                <Typography variant="h6">AI Insights</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {unreadCount} unread · personalised for your portfolio
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['all', 'performance', 'goal', 'risk', 'tax'] as InsightFilter[]).map(t => (
                <Chip
                  key={t}
                  label={t === 'all' ? 'All' : typeConfig[t]?.label ?? t}
                  size="small"
                  onClick={() => setInsightFilter(t)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: insightFilter === t ? (t === 'all' ? '#0F172A' : typeConfig[t]?.bg ?? '#F8FAFC') : '#F8FAFC',
                    color: insightFilter === t ? (t === 'all' ? '#F8FAFC' : typeConfig[t]?.color ?? '#64748B') : '#64748B',
                    fontWeight: insightFilter === t ? 700 : 400,
                    border: '1px solid',
                    borderColor: insightFilter === t ? (t === 'all' ? '#0F172A' : typeConfig[t]?.color ?? '#CBD5E1') : 'rgba(148,163,184,0.2)',
                  }}
                />
              ))}
              <Button size="small" startIcon={<RefreshIcon sx={{ fontSize: 14 }} />} onClick={regenerate} disabled={generating} sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                {generating ? 'Generating…' : 'Regenerate'}
              </Button>
              {unreadCount > 0 && (
                <Button size="small" startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />} onClick={markAllRead} sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />

          {filteredInsights.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#94A3B8', textAlign: 'center', py: 3 }}>
              {insights.length === 0 ? 'Click "Regenerate" to generate AI insights for your portfolio' : 'No insights in this category'}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {filteredInsights.map((insight: any) => {
                const cfg = typeConfig[insight.type] ?? typeConfig.behavioral
                return (
                  <Box
                    key={insight.id}
                    sx={{
                      p: 2, borderRadius: '10px', border: '1px solid',
                      borderColor: insight.read ? 'rgba(148,163,184,0.12)' : `${cfg.color}33`,
                      bgcolor: insight.read ? '#F8FAFC' : cfg.bg,
                      opacity: insight.read ? 0.75 : 1,
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                        bgcolor: insight.read ? 'rgba(148,163,184,0.1)' : cfg.bg,
                        border: `1px solid ${cfg.color}33`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: insight.read ? '#94A3B8' : cfg.color,
                      }}>
                        {cfg.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: insight.read ? '#475569' : '#0F172A' }}>
                            {insight.title}
                          </Typography>
                          <Chip label={cfg.label} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: cfg.bg, color: cfg.color, fontWeight: 700 }} />
                          {!insight.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: cfg.color, flexShrink: 0 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.25, lineHeight: 1.65 }}>
                          {insight.content}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                            {new Date(insight.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </Typography>
                          {!insight.read && (
                            <Button size="small" onClick={() => markRead(insight.id)} sx={{ color: '#64748B', fontSize: '0.75rem', py: 0.25 }}>
                              Mark as read
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
