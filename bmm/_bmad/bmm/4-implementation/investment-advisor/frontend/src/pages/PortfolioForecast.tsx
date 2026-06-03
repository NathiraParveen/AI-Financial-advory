import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Divider } from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import SpeedIcon from '@mui/icons-material/Speed'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

// Mock data — replace with: api.getAiForecast(portfolioId, period)

type Period = '1m' | '3m' | '12m'

const forecastData: Record<Period, { label: string; value: number }[]> = {
  '12m': [
    { label: 'Jun', value: 1438200 }, { label: 'Jul', value: 1465000 },
    { label: 'Aug', value: 1498000 }, { label: 'Sep', value: 1521000 },
    { label: 'Oct', value: 1556000 }, { label: 'Nov', value: 1589000 },
    { label: 'Dec', value: 1624000 }, { label: 'Jan', value: 1662000 },
    { label: 'Feb', value: 1705000 }, { label: 'Mar', value: 1748000 },
    { label: 'Apr', value: 1793000 }, { label: 'May', value: 1842000 },
  ],
  '3m': [
    { label: 'W1-Jun', value: 1438200 }, { label: 'W2-Jun', value: 1448000 },
    { label: 'W3-Jun', value: 1455000 }, { label: 'W4-Jun', value: 1465000 },
    { label: 'W1-Jul', value: 1472000 }, { label: 'W2-Jul', value: 1480000 },
    { label: 'W3-Jul', value: 1488000 }, { label: 'W4-Jul', value: 1498000 },
    { label: 'W1-Aug', value: 1504000 }, { label: 'W2-Aug', value: 1512000 },
    { label: 'W3-Aug', value: 1519000 }, { label: 'W4-Aug', value: 1527000 },
  ],
  '1m': [
    { label: 'Mon', value: 1438200 }, { label: 'Tue', value: 1440100 },
    { label: 'Wed', value: 1437800 }, { label: 'Thu', value: 1443200 },
    { label: 'Fri', value: 1445800 }, { label: 'Mon', value: 1448200 },
    { label: 'Tue', value: 1451000 }, { label: 'Wed', value: 1449600 },
    { label: 'Thu', value: 1453400 }, { label: 'Fri', value: 1456200 },
    { label: 'Mon', value: 1458600 }, { label: 'Tue', value: 1461000 },
    { label: 'Wed', value: 1463800 }, { label: 'Thu', value: 1462200 },
    { label: 'Fri', value: 1465000 },
  ],
}

const periodLabels: Record<Period, string> = { '1m': '1 Month', '3m': '3 Months', '12m': '12 Months' }

const assetForecasts = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', currentValue: 420000, expectedReturn: 12.4, volatility: 18.2, sharpe: 0.68, confidence: 'high' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', currentValue: 315000, expectedReturn: 10.2, volatility: 14.8, sharpe: 0.69, confidence: 'high' },
  { symbol: 'INFOSYS', name: 'Infosys Ltd', currentValue: 280000, expectedReturn: 9.8, volatility: 15.1, sharpe: 0.65, confidence: 'medium' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', currentValue: 245000, expectedReturn: 11.1, volatility: 16.3, sharpe: 0.68, confidence: 'medium' },
  { symbol: 'GOLDBOND', name: 'Sovereign Gold Bond', currentValue: 178200, expectedReturn: 6.5, volatility: 9.2, sharpe: 0.71, confidence: 'high' },
]

const confidenceColor: Record<string, string> = { high: '#16A34A', medium: '#F59E0B', low: '#DC2626' }
const confidenceBg: Record<string, string> = { high: '#F0FDF4', medium: '#FEF3C7', low: '#FEF2F2' }

const kpiData = [
  { label: 'Expected Return', value: '28.1%', change: '12-month forecast', positive: true, icon: <TrendingUpIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
  { label: 'Volatility', value: '16.3%', change: 'Annualised std dev', positive: false, icon: <ShowChartIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
  { label: 'Sharpe Ratio', value: '1.72', change: 'Risk-adjusted return', positive: true, icon: <SpeedIcon sx={{ fontSize: 20 }} />, iconBg: '#DBEAFE', iconColor: '#3B82F6' },
  { label: 'Max Drawdown', value: '-18.4%', change: 'Worst-case scenario', positive: false, icon: <WarningAmberIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
]

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', p: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>₹{payload[0]?.value?.toLocaleString('en-IN')}</Typography>
    </Box>
  )
}

export default function PortfolioForecast() {
  const [period, setPeriod] = useState<Period>('12m')
  const data = forecastData[period]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Portfolio Forecast</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          ARIMA-based predictive analysis of your holdings — results cached for 24 hours.
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

      {/* Forecast chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box>
              <Typography variant="h6">Portfolio Value Forecast</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {periodLabels[period]} projection · Model: ARIMA
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {(['1m', '3m', '12m'] as Period[]).map(p => (
                <Chip
                  key={p}
                  label={p}
                  size="small"
                  onClick={() => setPeriod(p)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: period === p ? '#0F172A' : '#F8FAFC',
                    color: period === p ? '#F8FAFC' : '#64748B',
                    fontWeight: period === p ? 700 : 400,
                    border: '1px solid',
                    borderColor: period === p ? '#0F172A' : 'rgba(148,163,184,0.2)',
                  }}
                />
              ))}
            </Box>
          </Box>
          <Box sx={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
          <Box sx={{ display: 'flex', gap: 3, mt: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 24, height: 2, bgcolor: '#F59E0B', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Forecast</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Start: </Typography>
              <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: '#0F172A' }}>₹14,38,200</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>End: </Typography>
              <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: '#16A34A' }}>
                ₹{data[data.length - 1]?.value?.toLocaleString('en-IN')}
              </Typography>
            </Box>
            <Chip label="Cached · 24h TTL" size="small" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600 }} />
          </Box>
        </CardContent>
      </Card>

      {/* Per-asset table */}
      <Card>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Asset-Level Projections</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Individual holding risk metrics and expected returns</Typography>
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {assetForecasts.map(asset => (
              <Box key={asset.symbol} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, borderRadius: '8px', bgcolor: '#F8FAFC', border: '1px solid rgba(148,163,184,0.12)', flexWrap: 'wrap' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#7C3AED', fontSize: '0.6875rem' }}>
                    {asset.symbol.slice(0, 3)}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 120 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>{asset.symbol}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{asset.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 90 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Current Value</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                    ₹{asset.currentValue.toLocaleString('en-IN')}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Exp. Return</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 700, color: '#16A34A' }}>
                    +{asset.expectedReturn}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 72 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Volatility</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>
                    {asset.volatility}%
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', minWidth: 64 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Sharpe</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                    {asset.sharpe}
                  </Typography>
                </Box>
                <Chip
                  label={asset.confidence}
                  size="small"
                  sx={{ height: 20, fontSize: '0.6875rem', bgcolor: confidenceBg[asset.confidence], color: confidenceColor[asset.confidence], fontWeight: 600, minWidth: 56, textTransform: 'capitalize' }}
                />
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
