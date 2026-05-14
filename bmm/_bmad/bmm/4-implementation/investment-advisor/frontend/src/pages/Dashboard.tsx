import { Box, Card, CardContent, Typography, Grid, Chip, Divider } from '@mui/material'
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

// Mock data — replace with API calls when backend is available:
// apiService.getSavings(), apiService.getPortfolios(), apiService.getRecommendations()

// Projections: ₹5L current savings + ₹29,000/mo at 12% annual return (Nifty 50 CAGR)
const savingsProjection = [
  { year: '2025', value: 500000 }, { year: '2026', value: 908000 },
  { year: '2027', value: 1364960 }, { year: '2028', value: 1880755 },
  { year: '2029', value: 2452446 }, { year: '2030', value: 3090740 },
  { year: '2031', value: 3809629 }, { year: '2032', value: 4623585 },
  { year: '2033', value: 5550415 }, { year: '2034', value: 6602465 },
  { year: '2035', value: 7802761 },
]

const allocationData = [
  { name: 'Equity', value: 40, color: '#3B82F6' },
  { name: 'Mutual Funds', value: 20, color: '#8B5CF6' },
  { name: 'Gold', value: 12, color: '#F59E0B' },
  { name: 'Fixed Deposits', value: 15, color: '#10B981' },
  { name: 'PPF', value: 10, color: '#06B6D4' },
  { name: 'Cash', value: 3, color: '#94A3B8' },
]

const topRecommendations = [
  { id: 1, type: 'rebalance', title: 'Annual Portfolio Rebalancing Due', description: 'Equity allocation has drifted +8% above target. Rebalance before 31 March to utilise ₹1.25L LTCG exemption.', impact: '+₹7,500', priority: 'high' },
  { id: 2, type: 'tax_harvest', title: 'Section 80C Limit Unutilised', description: 'You have ₹75,000 of unused 80C limit. Invest in ELSS or top up PPF before FY end.', impact: '+₹22,500', priority: 'high' },
  { id: 3, type: 'goal_alignment', title: 'Home Purchase Goal', description: 'Increase monthly SIP by ₹2,000 to stay on track for your house purchase target.', impact: '₹10L goal', priority: 'medium' },
]

const kpiData = [
  { label: 'Total Savings', value: '₹5,00,000', change: '+12.4% YTD', positive: true, icon: <SavingsIcon sx={{ fontSize: 20 }} />, iconBg: '#DBEAFE', iconColor: '#3B82F6' },
  { label: 'Portfolio Value', value: '₹14,38,200', change: '+8.2% YTD', positive: true, icon: <ShowChartIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { label: 'Monthly Savings Rate', value: '24.3%', change: '+2.1% vs last mo', positive: true, icon: <PercentIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
  { label: 'Active Goals', value: '4', change: '2 on track', positive: true, icon: <FlagIcon sx={{ fontSize: 20 }} />, iconBg: '#EDE9FE', iconColor: '#7C3AED' },
]

const typeLabel: Record<string, string> = { rebalance: 'Rebalance', tax_harvest: 'Tax', goal_alignment: 'Goal', investment: 'Invest' }
const priorityDot: Record<string, string> = { high: '#DC2626', medium: '#F59E0B', low: '#94A3B8' }
const rankBg = ['#FEE2E2', '#FEF3C7', '#EDE9FE']

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

export default function Dashboard() {
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

      {/* Charts */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6">10-Year Savings Projection</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Based on ₹29,000/mo at 12% annual return (Nifty 50 CAGR)</Typography>
                </Box>
                <Chip label="12% est. return" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600, fontSize: '0.75rem' }} />
              </Box>
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6">Asset Allocation</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current portfolio mix</Typography>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Recommendations */}
      <Card>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h6">Top Recommendations</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Prioritized actions to improve your portfolio</Typography>
            </Box>
            <Chip label="View all →" size="small" component="a" href="/recommendations" clickable sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {topRecommendations.map((rec, idx) => (
              <Box key={rec.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.12)' }}>
                <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: rankBg[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B' }}>{idx + 1}</Typography>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{rec.title}</Typography>
                    <Chip label={typeLabel[rec.type]} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: 'rgba(148,163,184,0.15)', color: '#475569' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{rec.description}</Typography>
                </Box>
                <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                  <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, display: 'block' }}>{rec.impact}</Typography>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: priorityDot[rec.priority], mt: 0.5, ml: 'auto' }} />
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
