import { useState, useEffect, useCallback } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Alert,
  Tabs, Tab, Button, Divider, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton,
} from '@mui/material'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import SpeedIcon from '@mui/icons-material/Speed'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PieChartIcon from '@mui/icons-material/PieChart'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import api from '../services/api'

const ASSET_CLASSES = ['equity', 'mutualFunds', 'gold', 'fixedDeposits', 'ppf', 'nps', 'bonds', 'cash']
const ASSET_CLASS_LABELS: Record<string, string> = {
  equity: 'Equity', mutualFunds: 'Mutual Funds', gold: 'Gold',
  fixedDeposits: 'Fixed Deposits', ppf: 'PPF', nps: 'NPS',
  bonds: 'Bonds', cash: 'Cash',
}
const allocationColors: Record<string, string> = {
  equity: '#3B82F6', mutualFunds: '#8B5CF6', gold: '#F59E0B',
  fixedDeposits: '#10B981', ppf: '#06B6D4', nps: '#F97316',
  bonds: '#64748B', cash: '#94A3B8',
}

type SortKey = 'ticker' | 'assetClass' | 'totalValue' | 'gainLossPct'
type Period = '1m' | '3m' | '12m'
type AlertFilter = 'all' | 'high' | 'medium' | 'low'

const severityColor: Record<string, string> = { high: '#DC2626', medium: '#F59E0B', low: '#3B82F6' }
const severityBg: Record<string, string> = { high: '#FEF2F2', medium: '#FEF3C7', low: '#EFF6FF' }
const typeIcon: Record<string, React.ReactNode> = {
  concentration: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
  volatility:    <ShowChartIcon sx={{ fontSize: 18 }} />,
  sector:        <PieChartIcon sx={{ fontSize: 18 }} />,
  correlation:   <ShowChartIcon sx={{ fontSize: 18 }} />,
  liquidity:     <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
}
const periodLabels: Record<Period, string> = { '1m': '1 Month', '3m': '3 Months', '12m': '12 Months' }

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', p: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>₹{payload[0]?.value?.toLocaleString('en-IN')}</Typography>
    </Box>
  )
}

const EMPTY_HOLDING = { ticker: '', assetClass: 'equity', quantity: '', costBasis: '', currentValue: '', purchaseDate: '' }

export default function Portfolio() {
  const [tab, setTab] = useState(0)
  const [sortBy, setSortBy] = useState<SortKey>('totalValue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [forecastPeriod, setForecastPeriod] = useState<Period>('12m')
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all')

  const [loading, setLoading] = useState(true)
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [activePortfolio, setActivePortfolio] = useState<any>(null)
  const [rebalancing, setRebalancing] = useState<any>(null)
  const [riskAlerts, setRiskAlerts] = useState<any[]>([])
  const [forecast, setForecast] = useState<any>(null)
  const [forecastLoading, setForecastLoading] = useState(false)

  // Dialogs
  const [newPortfolioOpen, setNewPortfolioOpen] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [addHoldingOpen, setAddHoldingOpen] = useState(false)
  const [holdingForm, setHoldingForm] = useState(EMPTY_HOLDING)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const ps = await api.getPortfolios()
      setPortfolios(ps)
      if (ps.length > 0) {
        const full = await api.getPortfolio(ps[0].id)
        setActivePortfolio(full)
        // Load rebalancing data
        const rebal = await api.getRebalancingAnalysis(ps[0].id)
        setRebalancing(rebal)
      }
      // Load risk anomalies
      const anomaliesRes: any = await api.getAiAnomalies()
      setRiskAlerts(anomaliesRes.anomalies ?? anomaliesRes ?? [])
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const loadForecast = useCallback(async (portfolioId: string, period: Period) => {
    setForecastLoading(true)
    try {
      const f = await api.getAiForecast(portfolioId, period)
      setForecast(f)
    } catch {}
    setForecastLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 1 && activePortfolio) {
      loadForecast(activePortfolio.id, forecastPeriod)
    }
  }, [tab, activePortfolio, forecastPeriod, loadForecast])

  // Derived data
  const holdings: any[] = activePortfolio?.holdings ?? []
  const totalValue = holdings.reduce((s: number, h: any) => s + h.currentValue, 0)
  const totalCost = holdings.reduce((s: number, h: any) => s + h.costBasis, 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPct = totalCost > 0 ? ((totalGainLoss / totalCost) * 100).toFixed(2) : '0.00'

  const allocationMap: Record<string, number> = {}
  holdings.forEach((h: any) => { allocationMap[h.assetClass] = (allocationMap[h.assetClass] || 0) + h.currentValue })
  const allocationData = Object.entries(allocationMap).map(([name, value]) => ({
    name: ASSET_CLASS_LABELS[name] ?? name,
    value: Math.round((value / totalValue) * 100) || 0,
    color: allocationColors[name] || '#94A3B8',
  }))

  // Rebalancing alerts from API
  const rebalancingAlerts: { assetClass: string; target: number; current: number; drift: number }[] =
    rebalancing?.recommendations?.filter((r: any) => Math.abs(r.difference) > 5).map((r: any) => ({
      assetClass: ASSET_CLASS_LABELS[r.assetClass] ?? r.assetClass,
      target: r.recommendedAllocation,
      current: r.currentAllocation,
      drift: r.difference,
    })) ?? []

  // Risk alerts from anomaly API
  const pendingAlerts = riskAlerts.filter((a: any) => !a.acknowledged).length
  const filteredAlerts = riskAlerts.filter((a: any) => alertFilter === 'all' || a.severity === alertFilter)

  // Forecast chart data (from API predictions JSON)
  let forecastChartData: { label: string; value: number }[] = []
  if (forecast?.predictions) {
    try {
      const preds = typeof forecast.predictions === 'string' ? JSON.parse(forecast.predictions) : forecast.predictions
      forecastChartData = preds.map((p: any) => ({
        label: new Date(p.date).toLocaleDateString('en-IN', { month: 'short' }),
        value: Math.round(p.price),
      }))
    } catch {}
  }
  const forecastMetrics = forecast?.metrics ? (typeof forecast.metrics === 'string' ? JSON.parse(forecast.metrics) : forecast.metrics) : null

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const sorted = [...holdings].sort((a: any, b: any) => {
    const glA = a.currentValue - a.costBasis
    const glB = b.currentValue - b.costBasis
    const pA = a.costBasis > 0 ? (glA / a.costBasis) * 100 : 0
    const pB = b.costBasis > 0 ? (glB / b.costBasis) * 100 : 0
    let aV: any = 0, bV: any = 0
    if (sortBy === 'ticker') { aV = a.ticker; bV = b.ticker }
    else if (sortBy === 'assetClass') { aV = a.assetClass; bV = b.assetClass }
    else if (sortBy === 'totalValue') { aV = a.currentValue; bV = b.currentValue }
    else if (sortBy === 'gainLossPct') { aV = pA; bV = pB }
    if (typeof aV === 'string') return sortDir === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV)
    return sortDir === 'asc' ? aV - bV : bV - aV
  })

  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) return
    setSubmitting(true)
    try {
      await api.createPortfolio({ name: newPortfolioName } as any)
      setNewPortfolioName('')
      setNewPortfolioOpen(false)
      loadData()
    } catch {}
    setSubmitting(false)
  }

  const addHolding = async () => {
    setFormError('')
    const { ticker, assetClass, quantity, costBasis, currentValue, purchaseDate } = holdingForm
    if (!ticker || !quantity || !costBasis || !currentValue || !purchaseDate) {
      setFormError('All fields are required')
      return
    }
    setSubmitting(true)
    try {
      await api.addHolding(activePortfolio.id, {
        ticker: ticker.toUpperCase(),
        assetClass,
        quantity: parseFloat(quantity),
        costBasis: parseFloat(costBasis),
        currentValue: parseFloat(currentValue),
        purchaseDate,
      })
      setHoldingForm(EMPTY_HOLDING)
      setAddHoldingOpen(false)
      loadData()
    } catch (e: any) {
      setFormError(e.response?.data?.error || 'Failed to add holding')
    }
    setSubmitting(false)
  }

  const deleteHolding = async (holdingId: string) => {
    if (!activePortfolio) return
    try {
      await api.deleteHolding(activePortfolio.id, holdingId)
      loadData()
    } catch {}
  }

  const acknowledgeAlert = async (id: string) => {
    try { await api.acknowledgeAiAnomaly(id) } catch {}
    setRiskAlerts(prev => prev.map((a: any) => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const acknowledgeAll = async () => {
    await Promise.allSettled(
      riskAlerts.filter((a: any) => !a.acknowledged).map((a: any) => api.acknowledgeAiAnomaly(a.id))
    )
    setRiskAlerts(prev => prev.map((a: any) => ({ ...a, acknowledged: true })))
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress sx={{ color: '#F59E0B' }} />
      </Box>
    )
  }

  if (portfolios.length === 0) {
    return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Portfolio</Typography>
        </Box>
        <Card>
          <CardContent sx={{ p: '48px !important', textAlign: 'center' }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#94A3B8', mb: 0.5 }}>No portfolios yet</Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', mb: 3 }}>
              Create a portfolio and start adding your holdings
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewPortfolioOpen(true)}
              sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}
            >
              Create Portfolio
            </Button>
          </CardContent>
        </Card>
        <Dialog open={newPortfolioOpen} onClose={() => setNewPortfolioOpen(false)}>
          <DialogTitle>Create Portfolio</DialogTitle>
          <DialogContent>
            <TextField label="Portfolio Name" fullWidth value={newPortfolioName} onChange={e => setNewPortfolioName(e.target.value)} sx={{ mt: 1 }} placeholder="e.g., Main Portfolio" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewPortfolioOpen(false)}>Cancel</Button>
            <Button onClick={createPortfolio} disabled={submitting} variant="contained" sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Portfolio</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Track holdings, AI-powered forecasts, and risk alerts across all asset classes.
          </Typography>
        </Box>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAddHoldingOpen(true)} sx={{ borderColor: '#F59E0B', color: '#92400E', '&:hover': { borderColor: '#D97706', bgcolor: '#FEF3C7' } }}>
          Add Holding
        </Button>
      </Box>

      {/* Portfolio Summary Banner */}
      <Card sx={{ mb: 3, bgcolor: '#0F172A', color: 'white' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Portfolio Value
              </Typography>
              <Typography className="mono" sx={{ fontWeight: 700, fontSize: '2rem', color: 'white', mt: 0.5 }}>
                {totalValue > 0 ? `₹${totalValue.toLocaleString('en-IN')}` : '₹0'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Gain / Loss
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {totalGainLoss >= 0
                  ? <TrendingUpIcon sx={{ color: '#4ADE80' }} />
                  : <TrendingDownIcon sx={{ color: '#F87171' }} />}
                <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.5rem', color: totalGainLoss >= 0 ? '#4ADE80' : '#F87171' }}>
                  {totalGainLoss >= 0 ? '+' : ''}₹{Math.abs(totalGainLoss).toLocaleString('en-IN')} ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPct}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Cost Basis
              </Typography>
              <Typography className="mono" sx={{ fontWeight: 600, fontSize: '1.25rem', color: 'rgba(248,250,252,0.8)', mt: 0.5 }}>
                ₹{totalCost.toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid rgba(148,163,184,0.15)', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', minHeight: 44, py: 0 },
            '& .Mui-selected': { fontWeight: 700, color: '#0F172A !important' },
            '& .MuiTabs-indicator': { bgcolor: '#F59E0B', height: 3, borderRadius: '2px 2px 0 0' },
          }}
        >
          <Tab label="Holdings" />
          <Tab label="AI Forecast" icon={<QueryStatsIcon sx={{ fontSize: 16 }} />} iconPosition="start" sx={{ gap: 0.75 }} />
          <Tab
            label={`Risk Alerts${pendingAlerts > 0 ? ` (${pendingAlerts})` : ''}`}
            icon={<NotificationsActiveIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            sx={{ gap: 0.75, color: pendingAlerts > 0 ? '#DC2626 !important' : undefined }}
          />
        </Tabs>
      </Box>

      {/* Tab 0: Holdings */}
      {tab === 0 && (
        <>
          {rebalancingAlerts.length > 0 && (
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {rebalancingAlerts.map(alert => (
                <Alert key={alert.assetClass} severity={Math.abs(alert.drift) > 7 ? 'error' : 'warning'} icon={<WarningAmberIcon fontSize="small" />} sx={{ borderRadius: '10px', '& .MuiAlert-message': { fontSize: '0.875rem' } }}>
                  <strong>{alert.assetClass}</strong> is {Math.abs(alert.drift).toFixed(1)}% {alert.drift > 0 ? 'below' : 'above'} target allocation
                  ({alert.current.toFixed(1)}% current vs {alert.target}% target). Consider rebalancing.
                </Alert>
              ))}
            </Box>
          )}

          {holdings.length === 0 ? (
            <Card>
              <CardContent sx={{ p: '48px !important', textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
                  No holdings yet. Add your first holding to get started.
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddHoldingOpen(true)} sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
                  Add Holding
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Holdings</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><TableSortLabel active={sortBy === 'ticker'} direction={sortBy === 'ticker' ? sortDir : 'asc'} onClick={() => handleSort('ticker')}>Ticker</TableSortLabel></TableCell>
                            <TableCell><TableSortLabel active={sortBy === 'assetClass'} direction={sortBy === 'assetClass' ? sortDir : 'asc'} onClick={() => handleSort('assetClass')}>Class</TableSortLabel></TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Cost/Unit</TableCell>
                            <TableCell align="right"><TableSortLabel active={sortBy === 'totalValue'} direction={sortBy === 'totalValue' ? sortDir : 'asc'} onClick={() => handleSort('totalValue')}>Value</TableSortLabel></TableCell>
                            <TableCell align="right">Gain ₹</TableCell>
                            <TableCell align="right"><TableSortLabel active={sortBy === 'gainLossPct'} direction={sortBy === 'gainLossPct' ? sortDir : 'asc'} onClick={() => handleSort('gainLossPct')}>Gain %</TableSortLabel></TableCell>
                            <TableCell />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sorted.map((h: any) => {
                            const gl = h.currentValue - h.costBasis
                            const glPct = h.costBasis > 0 ? (gl / h.costBasis) * 100 : 0
                            const isPos = gl >= 0
                            const unitCost = h.quantity > 0 ? h.costBasis / h.quantity : 0
                            return (
                              <TableRow key={h.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto Mono, monospace' }}>{h.ticker}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={ASSET_CLASS_LABELS[h.assetClass] ?? h.assetClass} size="small" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: (allocationColors[h.assetClass] || '#94A3B8') + '20', color: allocationColors[h.assetClass] || '#94A3B8', fontWeight: 600 }} />
                                </TableCell>
                                <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>{h.quantity}</TableCell>
                                <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{unitCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                                <TableCell align="right" className="mono" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>₹{h.currentValue.toLocaleString('en-IN')}</TableCell>
                                <TableCell align="right" className="mono" sx={{ color: isPos ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                                  {isPos ? '+' : '-'}₹{Math.abs(gl).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell align="right">
                                  <Chip label={`${isPos ? '+' : ''}${glPct.toFixed(1)}%`} size="small" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: isPos ? '#DCFCE7' : '#FEE2E2', color: isPos ? '#16A34A' : '#DC2626', fontWeight: 700 }} />
                                </TableCell>
                                <TableCell>
                                  <IconButton size="small" onClick={() => deleteHolding(h.id)} sx={{ color: '#CBD5E1', '&:hover': { color: '#DC2626' } }}>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Typography variant="h6" sx={{ mb: 0.5 }}>Allocation</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>By asset class</Typography>
                    {allocationData.length > 0 ? (
                      <>
                        <Box sx={{ height: 220, mt: 1 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                              </Pie>
                              <Tooltip formatter={v => [`${v}%`, '']} />
                            </PieChart>
                          </ResponsiveContainer>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                          {allocationData.map(d => (
                            <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{d.name}</Typography>
                              </Box>
                              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B' }}>{d.value}%</Typography>
                            </Box>
                          ))}
                        </Box>
                      </>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Tab 1: AI Forecast */}
      {tab === 1 && (
        <>
          {forecastLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: '#F59E0B' }} />
            </Box>
          ) : forecastMetrics ? (
            <>
              <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {[
                  { label: 'Expected Return', value: `${(forecastMetrics.expectedReturn * 100).toFixed(1)}%`, change: '12-month forecast', positive: true, icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
                  { label: 'Volatility', value: `${(forecastMetrics.volatility * 100).toFixed(1)}%`, change: 'Annualised std dev', positive: false, icon: <ShowChartIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
                  { label: 'Sharpe Ratio', value: forecastMetrics.sharpeRatio?.toFixed(2) ?? '—', change: 'Risk-adjusted return', positive: (forecastMetrics.sharpeRatio ?? 0) > 1, icon: <SpeedIcon sx={{ fontSize: 20 }} />, iconBg: '#DBEAFE', iconColor: '#3B82F6' },
                  { label: 'Max Drawdown', value: `${(forecastMetrics.maxDrawdown * 100).toFixed(1)}%`, change: 'Worst-case scenario', positive: false, icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
                ].map(kpi => (
                  <Grid item xs={12} sm={6} md={3} key={kpi.label}>
                    <Card>
                      <CardContent sx={{ p: '20px !important' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>{kpi.label}</Typography>
                            <Typography className="mono" sx={{ fontWeight: 700, mt: 0.5, color: '#0F172A', fontSize: '1.5rem', lineHeight: 1.2 }}>{kpi.value}</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                              {kpi.positive ? <TrendingUpIcon sx={{ fontSize: 13, color: '#16A34A' }} /> : <TrendingDownIcon sx={{ fontSize: 13, color: '#DC2626' }} />}
                              <Typography variant="caption" sx={{ color: kpi.positive ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{kpi.change}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.iconColor, flexShrink: 0 }}>{kpi.icon}</Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {forecastChartData.length > 0 && (
                <Card>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                      <Box>
                        <Typography variant="h6">Portfolio Value Forecast</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{periodLabels[forecastPeriod]} projection</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(['1m', '3m', '12m'] as Period[]).map(p => (
                          <Chip key={p} label={p} size="small" onClick={() => setForecastPeriod(p)} sx={{ cursor: 'pointer', bgcolor: forecastPeriod === p ? '#0F172A' : '#F8FAFC', color: forecastPeriod === p ? '#F8FAFC' : '#64748B', fontWeight: forecastPeriod === p ? 700 : 400, border: '1px solid', borderColor: forecastPeriod === p ? '#0F172A' : 'rgba(148,163,184,0.2)' }} />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                          <YAxis tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                          <Tooltip content={<ForecastTooltip />} />
                          <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} fill="url(#forecastGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#F59E0B' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent sx={{ p: '48px !important', textAlign: 'center' }}>
                <QueryStatsIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#94A3B8', mb: 0.5 }}>AI Forecast unavailable</Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  Add holdings to your portfolio to generate AI-powered forecasts
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Tab 2: Risk Alerts */}
      {tab === 2 && (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              { label: 'Total Alerts', value: String(riskAlerts.length), change: `${pendingAlerts} pending`, positive: false, icon: <NotificationsActiveIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
              { label: 'High Risk',   value: String(riskAlerts.filter((a: any) => a.severity === 'high').length),   change: 'Immediate action', positive: false, icon: <TrendingDownIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
              { label: 'Medium Risk', value: String(riskAlerts.filter((a: any) => a.severity === 'medium').length), change: 'Monitor closely',   positive: false, icon: <ShowChartIcon sx={{ fontSize: 20 }} />,  iconBg: '#FEF3C7', iconColor: '#F59E0B' },
              { label: 'Acknowledged', value: String(riskAlerts.filter((a: any) => a.acknowledged).length), change: riskAlerts.every((a: any) => a.acknowledged) ? 'All reviewed' : `${pendingAlerts} remaining`, positive: riskAlerts.some((a: any) => a.acknowledged), icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
            ].map(kpi => (
              <Grid item xs={12} sm={6} md={3} key={kpi.label}>
                <Card>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>{kpi.label}</Typography>
                        <Typography className="mono" sx={{ fontWeight: 700, mt: 0.5, color: '#0F172A', fontSize: '1.5rem', lineHeight: 1.2 }}>{kpi.value}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                          {kpi.positive ? <TrendingUpIcon sx={{ fontSize: 13, color: '#16A34A' }} /> : <TrendingDownIcon sx={{ fontSize: 13, color: '#DC2626' }} />}
                          <Typography variant="caption" sx={{ color: kpi.positive ? '#16A34A' : '#DC2626', fontWeight: 600 }}>{kpi.change}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: kpi.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.iconColor, flexShrink: 0 }}>{kpi.icon}</Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Typography variant="h6">Active Anomalies</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{pendingAlerts} alert{pendingAlerts !== 1 ? 's' : ''} awaiting review</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(['all', 'high', 'medium', 'low'] as AlertFilter[]).map(s => (
                    <Chip key={s} label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} size="small" onClick={() => setAlertFilter(s)}
                      sx={{ cursor: 'pointer', bgcolor: alertFilter === s ? (s === 'all' ? '#0F172A' : severityBg[s]) : '#F8FAFC', color: alertFilter === s ? (s === 'all' ? '#F8FAFC' : severityColor[s]) : '#64748B', fontWeight: alertFilter === s ? 700 : 400, border: '1px solid', borderColor: alertFilter === s ? (s === 'all' ? '#0F172A' : severityColor[s]) : 'rgba(148,163,184,0.2)' }}
                    />
                  ))}
                  {pendingAlerts > 0 && (
                    <Button size="small" onClick={acknowledgeAll} sx={{ color: '#64748B', fontSize: '0.75rem' }}>Acknowledge all</Button>
                  )}
                </Box>
              </Box>

              <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {filteredAlerts.length === 0 && (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#16A34A', mb: 1 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {riskAlerts.length === 0 ? 'No anomalies detected for your portfolio.' : 'No alerts for this filter.'}
                    </Typography>
                  </Box>
                )}
                {filteredAlerts.map((alert: any) => (
                  <Box key={alert.id} sx={{ p: 2, borderRadius: '10px', border: '1px solid', borderColor: alert.acknowledged ? 'rgba(148,163,184,0.12)' : `${severityColor[alert.severity]}33`, bgcolor: alert.acknowledged ? '#F8FAFC' : severityBg[alert.severity], opacity: alert.acknowledged ? 0.65 : 1, transition: 'opacity 0.2s' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', flexShrink: 0, bgcolor: `${severityColor[alert.severity]}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: alert.acknowledged ? '#94A3B8' : severityColor[alert.severity] }}>
                        {typeIcon[alert.anomalyType] ?? <WarningAmberIcon sx={{ fontSize: 18 }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: alert.acknowledged ? '#64748B' : '#0F172A' }}>{alert.anomalyType?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</Typography>
                          <Chip label={alert.severity} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: severityBg[alert.severity], color: severityColor[alert.severity], fontWeight: 700, textTransform: 'capitalize' }} />
                          {alert.acknowledged && <Chip label="Acknowledged" size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 600 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.25, lineHeight: 1.6 }}>{alert.description}</Typography>
                        {alert.recommendation && (
                          <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic', display: 'block', mb: 1 }}>
                            Recommended: {alert.recommendation}
                          </Typography>
                        )}
                        <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                          Detected: {new Date(alert.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      {!alert.acknowledged && (
                        <Button size="small" onClick={() => acknowledgeAlert(alert.id)} sx={{ flexShrink: 0, bgcolor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#1E293B' } }}>
                          Acknowledge
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </>
      )}

      {/* Add Holding Dialog */}
      <Dialog open={addHoldingOpen} onClose={() => { setAddHoldingOpen(false); setHoldingForm(EMPTY_HOLDING); setFormError('') }} maxWidth="sm" fullWidth>
        <DialogTitle>Add Holding</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Ticker / Symbol" fullWidth size="small" value={holdingForm.ticker} onChange={e => setHoldingForm(f => ({ ...f, ticker: e.target.value }))} placeholder="e.g., RELIANCE, GOLDBEES, PPFACC" />
            <TextField label="Asset Class" fullWidth size="small" select value={holdingForm.assetClass} onChange={e => setHoldingForm(f => ({ ...f, assetClass: e.target.value }))}>
              {ASSET_CLASSES.map(a => <MenuItem key={a} value={a}>{ASSET_CLASS_LABELS[a]}</MenuItem>)}
            </TextField>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField label="Quantity" fullWidth size="small" type="number" value={holdingForm.quantity} onChange={e => setHoldingForm(f => ({ ...f, quantity: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Purchase Date" fullWidth size="small" type="date" InputLabelProps={{ shrink: true }} value={holdingForm.purchaseDate} onChange={e => setHoldingForm(f => ({ ...f, purchaseDate: e.target.value }))} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Total Cost Basis (₹)" fullWidth size="small" type="number" value={holdingForm.costBasis} onChange={e => setHoldingForm(f => ({ ...f, costBasis: e.target.value }))} helperText="Total amount invested" />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Current Value (₹)" fullWidth size="small" type="number" value={holdingForm.currentValue} onChange={e => setHoldingForm(f => ({ ...f, currentValue: e.target.value }))} helperText="Current market value" />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setAddHoldingOpen(false); setHoldingForm(EMPTY_HOLDING); setFormError('') }}>Cancel</Button>
          <Button onClick={addHolding} disabled={submitting} variant="contained" sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
            {submitting ? 'Adding…' : 'Add Holding'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Portfolio Dialog */}
      <Dialog open={newPortfolioOpen} onClose={() => setNewPortfolioOpen(false)}>
        <DialogTitle>Create Portfolio</DialogTitle>
        <DialogContent>
          <TextField label="Portfolio Name" fullWidth value={newPortfolioName} onChange={e => setNewPortfolioName(e.target.value)} sx={{ mt: 1 }} placeholder="e.g., Main Portfolio" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewPortfolioOpen(false)}>Cancel</Button>
          <Button onClick={createPortfolio} disabled={submitting} variant="contained" sx={{ bgcolor: '#F59E0B', color: '#0F172A', '&:hover': { bgcolor: '#D97706' } }}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
