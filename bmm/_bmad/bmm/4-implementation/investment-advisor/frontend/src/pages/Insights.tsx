import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Divider, Button } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import FlagIcon from '@mui/icons-material/Flag'
import BalanceIcon from '@mui/icons-material/Balance'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import RefreshIcon from '@mui/icons-material/Refresh'

// Mock data — replace with: api.getAiInsights(type?) and api.generateAiInsights()

interface Insight {
  id: string
  type: 'performance' | 'goal' | 'risk' | 'tax'
  title: string
  body: string
  impact: string
  read: boolean
  createdAt: string
}

const initialInsights: Insight[] = [
  {
    id: '1', type: 'performance', read: false, createdAt: 'Today',
    title: 'Portfolio Outperforming Nifty 50',
    body: 'Your portfolio has returned 8.2% YTD vs the Nifty 50 benchmark of 6.1%. The outperformance is driven primarily by TCS and Infosys, which benefited from USD/INR appreciation and strong Q3 earnings.',
    impact: '+2.1% vs benchmark',
  },
  {
    id: '2', type: 'goal', read: false, createdAt: 'Today',
    title: 'Home Purchase Goal at Risk',
    body: 'Your home purchase goal of ₹60L by March 2027 is tracking at 74% progress. Based on current savings rate you will miss the target by approximately ₹8.4L. Consider increasing your dedicated SIP by ₹3,500/month.',
    impact: '₹8.4L shortfall',
  },
  {
    id: '3', type: 'tax', read: false, createdAt: 'Today',
    title: '₹75,000 of Section 80C Limit Available',
    body: 'You have ₹75,000 of unused 80C limit before 31 March. Recommended: ₹50,000 into Axis Long Term Equity ELSS + ₹25,000 as additional PPF contribution. This saves ₹23,400 in tax at your 31.2% effective slab.',
    impact: '₹23,400 tax savings',
  },
  {
    id: '4', type: 'risk', read: true, createdAt: 'Yesterday',
    title: 'Portfolio Diversification Needs Attention',
    body: 'Your IT sector concentration (TCS + Infosys = 38.7% of equity) and single-stock exposure (Reliance = 29.2% of total) exceed healthy thresholds. Adding Pharma or FMCG exposure would reduce correlation risk.',
    impact: 'High concentration',
  },
  {
    id: '5', type: 'tax', read: true, createdAt: 'Yesterday',
    title: 'Tax-Loss Harvesting Opportunity',
    body: 'Your small-cap ETF has an unrealised short-term loss of ₹28,600. Harvesting before 31 March offsets your STCG tax liability by ₹8,580 (at 30% rate). Reinvest in a similar fund after 30 days to maintain exposure.',
    impact: '₹8,580 tax offset',
  },
]

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  performance: { label: 'Performance', color: '#16A34A', bg: '#F0FDF4', icon: <ShowChartIcon sx={{ fontSize: 18 }} /> },
  goal: { label: 'Goal', color: '#3B82F6', bg: '#EFF6FF', icon: <FlagIcon sx={{ fontSize: 18 }} /> },
  risk: { label: 'Risk', color: '#DC2626', bg: '#FEF2F2', icon: <BalanceIcon sx={{ fontSize: 18 }} /> },
  tax: { label: 'Tax', color: '#F59E0B', bg: '#FEF3C7', icon: <ReceiptLongIcon sx={{ fontSize: 18 }} /> },
}

type Filter = 'all' | 'performance' | 'goal' | 'risk' | 'tax'

export default function Insights() {
  const [insights, setInsights] = useState(initialInsights)
  const [filter, setFilter] = useState<Filter>('all')
  const [generating, setGenerating] = useState(false)

  const markRead = (id: string) => {
    // TODO: replace with api.markInsightRead(id)
    setInsights(prev => prev.map(i => i.id === id ? { ...i, read: true } : i))
  }

  const markAllRead = () => {
    // TODO: replace with api.markInsightRead() for each unread insight
    setInsights(prev => prev.map(i => ({ ...i, read: true })))
  }

  const regenerate = async () => {
    // TODO: replace with api.generateAiInsights() then api.getAiInsights()
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1500))
    setGenerating(false)
  }

  const filtered = insights.filter(i => filter === 'all' || i.type === filter)
  const unread = insights.filter(i => !i.read).length
  const taxSavings = '₹32,000'

  const kpiData = [
    { label: 'Total Insights', value: String(insights.length), change: `${unread} unread today`, positive: true, icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
    { label: 'Performance', value: '1', change: 'Outperforming Nifty', positive: true, icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
    { label: 'Goal Alerts', value: '1', change: '1 goal at risk', positive: false, icon: <FlagIcon sx={{ fontSize: 20 }} />, iconBg: '#DBEAFE', iconColor: '#3B82F6' },
    { label: 'Tax Savings', value: taxSavings, change: 'Available this FY', positive: true, icon: <ReceiptLongIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>AI Insights</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Personalised recommendations generated daily from your portfolio, goals, and market conditions.
        </Typography>
      </Box>

      {/* KPI cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiData.map(kpi => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <Card>
              <CardContent sx={{ p: '20px !important' }}>
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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Insights panel */}
      <Card>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6">Today's Insights</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {unread} unread insight{unread !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['all', 'performance', 'goal', 'risk', 'tax'] as Filter[]).map(t => (
                <Chip
                  key={t}
                  label={t === 'all' ? 'All' : typeConfig[t].label}
                  size="small"
                  onClick={() => setFilter(t)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: filter === t ? (t === 'all' ? '#0F172A' : typeConfig[t].bg) : '#F8FAFC',
                    color: filter === t ? (t === 'all' ? '#F8FAFC' : typeConfig[t].color) : '#64748B',
                    fontWeight: filter === t ? 700 : 400,
                    border: '1px solid',
                    borderColor: filter === t ? (t === 'all' ? '#0F172A' : typeConfig[t].color) : 'rgba(148,163,184,0.2)',
                  }}
                />
              ))}
              <Button
                size="small"
                startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                onClick={regenerate}
                disabled={generating}
                sx={{ color: '#64748B', fontSize: '0.75rem' }}
              >
                {generating ? 'Generating…' : 'Regenerate'}
              </Button>
              {unread > 0 && (
                <Button
                  size="small"
                  startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
                  onClick={markAllRead}
                  sx={{ color: '#64748B', fontSize: '0.75rem' }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.map(insight => {
              const cfg = typeConfig[insight.type]
              return (
                <Box
                  key={insight.id}
                  sx={{
                    p: 2,
                    borderRadius: '10px',
                    border: '1px solid',
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
                        {insight.body}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                          <Box>
                            <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>Impact: </Typography>
                            <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: cfg.color }}>
                              {insight.impact}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8' }}>{insight.createdAt}</Typography>
                        </Box>
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
        </CardContent>
      </Card>
    </Box>
  )
}
