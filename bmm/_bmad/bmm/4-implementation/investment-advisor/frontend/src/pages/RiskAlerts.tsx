import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Divider } from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import PieChartIcon from '@mui/icons-material/PieChart'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

// Mock data — replace with: api.getAiAnomalies() and api.triggerAiAnalysis(portfolioId)

interface RiskAlert {
  id: string
  type: 'concentration' | 'volatility' | 'sector'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  metric: string
  threshold: string
  detected: string
  acknowledged: boolean
}

const initialAlerts: RiskAlert[] = [
  {
    id: '1', type: 'concentration', severity: 'high',
    title: 'High Single-Stock Concentration',
    description: 'Reliance Industries constitutes 29.2% of your total portfolio, exceeding the 25% single-stock safe limit. Consider partial profit-booking or rebalancing into other sectors.',
    metric: '29.2%', threshold: '25.0%', detected: '2 hours ago', acknowledged: false,
  },
  {
    id: '2', type: 'sector', severity: 'high',
    title: 'IT Sector Overweight',
    description: 'Technology sector (TCS + Infosys) accounts for 58.4% of your equity holdings, above the 50% sector concentration warning level.',
    metric: '58.4%', threshold: '50.0%', detected: '2 hours ago', acknowledged: false,
  },
  {
    id: '3', type: 'volatility', severity: 'medium',
    title: 'Elevated Portfolio Volatility',
    description: 'Cross-holding return standard deviation is 1.6× above the historical baseline of 12%, indicating increased short-term market risk.',
    metric: '1.60×', threshold: '1.50×', detected: '5 hours ago', acknowledged: false,
  },
  {
    id: '4', type: 'sector', severity: 'medium',
    title: 'Energy Sector Approaching Threshold',
    description: 'Energy sector allocation at 29.2% is approaching the 30% medium-alert threshold. Monitor for further drift before year-end.',
    metric: '29.2%', threshold: '30.0%', detected: '1 day ago', acknowledged: false,
  },
  {
    id: '5', type: 'concentration', severity: 'low',
    title: 'HDFC Bank Position Growth',
    description: 'HDFC Bank holding has grown 4.2% relative to portfolio due to price appreciation. Still within safe limits — no action required.',
    metric: '17.1%', threshold: '25.0%', detected: '2 days ago', acknowledged: false,
  },
]

const severityColor: Record<string, string> = { high: '#DC2626', medium: '#F59E0B', low: '#3B82F6' }
const severityBg: Record<string, string> = { high: '#FEF2F2', medium: '#FEF3C7', low: '#EFF6FF' }

const typeIcon: Record<string, React.ReactNode> = {
  concentration: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
  volatility: <ShowChartIcon sx={{ fontSize: 18 }} />,
  sector: <PieChartIcon sx={{ fontSize: 18 }} />,
}

type Filter = 'all' | 'high' | 'medium' | 'low'

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts)
  const [filter, setFilter] = useState<Filter>('all')

  const acknowledge = (id: string) => {
    // TODO: replace with api.acknowledgeAiAnomaly(id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a))
  }

  const acknowledgeAll = () => {
    // TODO: replace with api.acknowledgeAiAnomaly() for each pending alert
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }

  const filtered = alerts.filter(a => filter === 'all' || a.severity === filter)
  const pending = alerts.filter(a => !a.acknowledged).length
  const high = alerts.filter(a => a.severity === 'high').length
  const medium = alerts.filter(a => a.severity === 'medium').length
  const acknowledged = alerts.filter(a => a.acknowledged).length

  const kpiData = [
    { label: 'Total Alerts', value: String(alerts.length), change: `${pending} pending review`, positive: false, icon: <NotificationsActiveIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { label: 'High Risk', value: String(high), change: 'Immediate action needed', positive: false, icon: <TrendingDownIcon sx={{ fontSize: 20 }} />, iconBg: '#FEE2E2', iconColor: '#DC2626' },
    { label: 'Medium Risk', value: String(medium), change: 'Monitor closely', positive: false, icon: <ShowChartIcon sx={{ fontSize: 20 }} />, iconBg: '#FEF3C7', iconColor: '#F59E0B' },
    { label: 'Acknowledged', value: String(acknowledged), change: acknowledged === alerts.length ? 'All reviewed' : `${alerts.length - acknowledged} remaining`, positive: acknowledged > 0, icon: <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />, iconBg: '#DCFCE7', iconColor: '#16A34A' },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Risk Alerts</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          AI-detected portfolio anomalies — concentration risk, volatility spikes, and sector imbalances.
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

      {/* Alerts panel */}
      <Card>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6">Active Anomalies</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {pending} alert{pending !== 1 ? 's' : ''} awaiting review
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['all', 'high', 'medium', 'low'] as Filter[]).map(s => (
                <Chip
                  key={s}
                  label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  size="small"
                  onClick={() => setFilter(s)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: filter === s ? (s === 'all' ? '#0F172A' : severityBg[s]) : '#F8FAFC',
                    color: filter === s ? (s === 'all' ? '#F8FAFC' : severityColor[s]) : '#64748B',
                    fontWeight: filter === s ? 700 : 400,
                    border: '1px solid',
                    borderColor: filter === s ? (s === 'all' ? '#0F172A' : severityColor[s]) : 'rgba(148,163,184,0.2)',
                  }}
                />
              ))}
              {pending > 0 && (
                <Button size="small" onClick={acknowledgeAll} sx={{ color: '#64748B', fontSize: '0.75rem' }}>
                  Acknowledge all
                </Button>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.12)' }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {filtered.length === 0 && (
              <Box sx={{ py: 5, textAlign: 'center' }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 40, color: '#16A34A', mb: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No alerts for this filter.</Typography>
              </Box>
            )}
            {filtered.map(alert => (
              <Box
                key={alert.id}
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: alert.acknowledged ? 'rgba(148,163,184,0.12)' : `${severityColor[alert.severity]}33`,
                  bgcolor: alert.acknowledged ? '#F8FAFC' : severityBg[alert.severity],
                  opacity: alert.acknowledged ? 0.65 : 1,
                  transition: 'opacity 0.2s, background-color 0.2s',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    bgcolor: alert.acknowledged ? 'rgba(148,163,184,0.12)' : `${severityColor[alert.severity]}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: alert.acknowledged ? '#94A3B8' : severityColor[alert.severity],
                  }}>
                    {typeIcon[alert.type]}
                  </Box>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: alert.acknowledged ? '#64748B' : '#0F172A' }}>
                        {alert.title}
                      </Typography>
                      <Chip label={alert.severity} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: alert.acknowledged ? 'rgba(148,163,184,0.12)' : severityBg[alert.severity], color: alert.acknowledged ? '#94A3B8' : severityColor[alert.severity], fontWeight: 700, textTransform: 'capitalize' }} />
                      {alert.acknowledged && <Chip label="Acknowledged" size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 600 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.25, lineHeight: 1.6 }}>
                      {alert.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Current</Typography>
                        <Typography className="mono" variant="caption" sx={{ fontWeight: 700, color: alert.acknowledged ? '#64748B' : severityColor[alert.severity] }}>
                          {alert.metric}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Threshold</Typography>
                        <Typography className="mono" variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                          {alert.threshold}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Detected</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: '#475569' }}>{alert.detected}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  {!alert.acknowledged && (
                    <Button
                      size="small"
                      onClick={() => acknowledge(alert.id)}
                      sx={{ flexShrink: 0, bgcolor: '#0F172A', color: '#F8FAFC', borderRadius: '8px', px: 1.5, fontSize: '0.75rem', '&:hover': { bgcolor: '#1E293B' } }}
                    >
                      Acknowledge
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
