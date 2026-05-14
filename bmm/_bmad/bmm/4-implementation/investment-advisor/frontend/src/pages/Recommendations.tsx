import { useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Divider } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import BalanceIcon from '@mui/icons-material/Balance'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import FlagIcon from '@mui/icons-material/Flag'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'

// Mock data — replace with: apiService.getRecommendations()
const allRecs = [
  { id: '1', type: 'investment',      priority: 'high',   title: 'Utilise Section 80C Deduction',          description: 'You have ₹75,000 of unused Section 80C limit remaining this FY. Invest in ELSS or top up PPF before 31 March.',                                           rationale: 'Section 80C investments reduce taxable income by up to ₹1.5 lakh, saving ₹22,500 in tax at the 30% slab.',        estimatedImpact: 22500, action: 'Invest ₹75,000 in ELSS fund (3-yr lock-in) or top up PPF before 31 March', status: 'active' },
  { id: '2', type: 'tax_harvest',     priority: 'high',   title: 'Harvest Losses on INFY',                 description: 'Infosys (INFY) is showing ₹7,000 in unrealised losses. Booking the loss offsets your LTCG from TCS and RELIANCE.',                                       rationale: 'Short-term losses can offset both STCG and LTCG, reducing net tax liability this financial year.',                 estimatedImpact: 1400,  action: 'Sell INFY, book ₹7,000 loss; re-enter after 30 days to avoid wash-rule debate', status: 'active' },
  { id: '3', type: 'goal_alignment',  priority: 'high',   title: 'Accelerate House Purchase Savings',      description: 'Your home purchase goal is 2.5 years away. At the current SIP rate you\'ll be ₹80,000 short of the ₹10L target.',                                       rationale: 'Increasing monthly SIP by ₹2,000 into a debt mutual fund closes the gap with 3 months to spare.',                 estimatedImpact: 80000, action: 'Increase SIP in HDFC Short Duration Fund by ₹2,000/mo', status: 'active' },
  { id: '4', type: 'investment',      priority: 'medium', title: 'Invest ₹50,000 in NPS for 80CCD(1B)',    description: 'NPS Tier-I offers an additional ₹50,000 deduction under Section 80CCD(1B) over and above the ₹1.5L 80C limit.',                                           rationale: 'At 30% tax slab, this saves ₹15,000 in taxes annually while building a market-linked retirement corpus.',        estimatedImpact: 15000, action: 'Open NPS Tier-I via eNPS or bank and invest ₹50,000 this FY', status: 'active' },
  { id: '5', type: 'rebalance',       priority: 'medium', title: 'Annual Portfolio Rebalancing',           description: 'Equity allocation has drifted to 53% vs target 45%. Rebalance to maintain your risk profile and utilise the ₹1.25L LTCG exemption.',                   rationale: 'Annual rebalancing locks in gains on NIFTYBEES and TCS. Selling before 31 March lets you utilise the LTCG exemption.', estimatedImpact: 7500,  action: 'Sell ₹43,000 of NIFTYBEES → shift proceeds into GOLDBEES and HDFC Flexi Cap', status: 'active' },
  { id: '6', type: 'risk_adjustment', priority: 'low',    title: 'Switch Physical Gold to Sovereign Gold Bonds', description: 'Sovereign Gold Bonds (SGBs) earn 2.5% annual interest on top of gold price appreciation, unlike physical gold or Gold ETFs.', rationale: 'SGBs held to maturity (8 years) are LTCG-exempt and eliminate storage/making charges of physical gold.', estimatedImpact: 5000, action: 'Apply for next SGB tranche via SBI/HDFC Bank; limit gold to 10% of portfolio', status: 'active' },
]

type FilterType = 'all' | 'high' | 'investment' | 'rebalance' | 'tax_harvest' | 'goal_alignment' | 'risk_adjustment'

const typeConfig: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  rebalance:       { label: 'Rebalance',  color: '#3B82F6', bg: '#DBEAFE', icon: <BalanceIcon sx={{ fontSize: 16 }} /> },
  tax_harvest:     { label: 'Tax',        color: '#7C3AED', bg: '#EDE9FE', icon: <ReceiptLongIcon sx={{ fontSize: 16 }} /> },
  goal_alignment:  { label: 'Goal',       color: '#16A34A', bg: '#DCFCE7', icon: <FlagIcon sx={{ fontSize: 16 }} /> },
  investment:      { label: 'Invest',     color: '#0EA5E9', bg: '#E0F2FE', icon: <ShowChartIcon sx={{ fontSize: 16 }} /> },
  risk_adjustment: { label: 'Risk',       color: '#F59E0B', bg: '#FEF3C7', icon: <TipsAndUpdatesIcon sx={{ fontSize: 16 }} /> },
}

const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: 'High',   color: '#DC2626', bg: '#FEE2E2' },
  medium: { label: 'Medium', color: '#D97706', bg: '#FEF3C7' },
  low:    { label: 'Low',    color: '#64748B', bg: '#F1F5F9' },
}

export default function Recommendations() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [implemented, setImplemented] = useState<Set<string>>(new Set())

  const visible = allRecs.filter((r) => {
    if (dismissed.has(r.id) || implemented.has(r.id)) return false
    if (filter === 'all') return true
    if (filter === 'high') return r.priority === 'high'
    return r.type === filter
  })

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${allRecs.length})` },
    { key: 'high', label: 'High Priority' },
    { key: 'rebalance', label: 'Rebalance' },
    { key: 'tax_harvest', label: 'Tax' },
    { key: 'investment', label: 'Invest' },
    { key: 'goal_alignment', label: 'Goals' },
  ]

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Recommendations</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Personalized actions ranked by estimated financial impact.
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Estimated Savings', value: `₹${allRecs.reduce((s, r) => s + r.estimatedImpact, 0).toLocaleString('en-IN')}`, color: '#16A34A', bg: '#DCFCE7' },
          { label: 'High Priority', value: String(allRecs.filter(r => r.priority === 'high').length), color: '#DC2626', bg: '#FEE2E2' },
          { label: 'Actions Remaining', value: String(allRecs.length - implemented.size - dismissed.size), color: '#3B82F6', bg: '#DBEAFE' },
        ].map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card>
              <CardContent sx={{ p: '16px !important' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                  {s.label}
                </Typography>
                <Typography className="mono" sx={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, mt: 0.5 }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Chips */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {filters.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            onClick={() => setFilter(f.key)}
            sx={{
              fontWeight: filter === f.key ? 700 : 500,
              bgcolor: filter === f.key ? '#0F172A' : '#F1F5F9',
              color: filter === f.key ? 'white' : '#475569',
              '&:hover': { bgcolor: filter === f.key ? '#1E293B' : '#E2E8F0' },
            }}
          />
        ))}
      </Box>

      {/* Recommendation Cards */}
      {visible.length === 0 ? (
        <Card>
          <CardContent sx={{ p: '32px !important', textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#16A34A', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.5 }}>All caught up!</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No more recommendations in this category. Check back after your next portfolio update.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {visible.map((rec) => {
            const tc = typeConfig[rec.type] || typeConfig.investment
            const pc = priorityConfig[rec.priority]
            return (
              <Grid item xs={12} md={6} key={rec.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ p: '20px !important', flexGrow: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tc.color }}>
                          {tc.icon}
                        </Box>
                        <Chip label={tc.label} size="small" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: tc.bg, color: tc.color, fontWeight: 700 }} />
                      </Box>
                      <Chip label={pc.label} size="small" sx={{ height: 20, fontSize: '0.6875rem', bgcolor: pc.bg, color: pc.color, fontWeight: 700 }} />
                    </Box>

                    <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.75, fontSize: '0.9375rem' }}>{rec.title}</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, lineHeight: 1.6 }}>{rec.description}</Typography>

                    <Divider sx={{ mb: 1.5, borderColor: 'rgba(148,163,184,0.12)' }} />

                    {/* Rationale */}
                    <Box sx={{ bgcolor: '#F8FAFC', borderRadius: '8px', p: 1.5, mb: 1.5, border: '1px solid rgba(148,163,184,0.12)' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                        Why this matters
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', lineHeight: 1.6 }}>{rec.rationale}</Typography>
                    </Box>

                    {/* Suggested Action */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ color: '#475569', fontStyle: 'italic' }}>→ {rec.action}</Typography>
                      <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.6875rem' }}>Est. impact</Typography>
                        <Typography className="mono" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.9375rem' }}>
                          +₹{rec.estimatedImpact.toLocaleString('en-IN')}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>

                  {/* Actions */}
                  <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                      onClick={() => setImplemented(new Set([...implemented, rec.id]))}
                      sx={{ flexGrow: 1, bgcolor: '#0F172A', color: 'white', '&:hover': { bgcolor: '#1E293B' } }}
                    >
                      Implement
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                      onClick={() => setDismissed(new Set([...dismissed, rec.id]))}
                      sx={{ color: '#64748B', borderColor: 'rgba(148,163,184,0.3)', '&:hover': { bgcolor: '#F1F5F9' } }}
                    >
                      Dismiss
                    </Button>
                  </Box>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}
