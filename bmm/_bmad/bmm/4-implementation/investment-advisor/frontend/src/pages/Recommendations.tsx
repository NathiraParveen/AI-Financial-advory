import { useState, useEffect } from 'react'
import { Box, Card, CardContent, Typography, Grid, Chip, Button, Divider, CircularProgress } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import BalanceIcon from '@mui/icons-material/Balance'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import FlagIcon from '@mui/icons-material/Flag'
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates'
import api from '../services/api'

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
  const [recs, setRecs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const [acting, setActing] = useState<Record<string, 'implementing' | 'dismissing'>>({})

  useEffect(() => {
    api.getRecommendations()
      .then(setRecs)
      .catch(() => setRecs([]))
      .finally(() => setLoading(false))
  }, [])

  const handleImplement = async (id: string) => {
    setActing(a => ({ ...a, [id]: 'implementing' }))
    try {
      await api.implementRecommendation(id)
      setRecs(r => r.filter(x => x.id !== id))
    } catch {}
    setActing(a => { const n = { ...a }; delete n[id]; return n })
  }

  const handleDismiss = async (id: string) => {
    setActing(a => ({ ...a, [id]: 'dismissing' }))
    try {
      await api.dismissRecommendation(id)
      setRecs(r => r.filter(x => x.id !== id))
    } catch {}
    setActing(a => { const n = { ...a }; delete n[id]; return n })
  }

  const active = recs.filter(r => r.status === 'active')

  const visible = active.filter((r) => {
    if (filter === 'all') return true
    if (filter === 'high') return r.priority === 'high'
    return r.type === filter
  })

  const totalImpact = active.reduce((s, r) => s + (r.estimatedImpact || 0), 0)

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `All (${active.length})` },
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Stats */}
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {[
              { label: 'Total Estimated Savings', value: `₹${totalImpact.toLocaleString('en-IN')}`, color: '#16A34A', bg: '#DCFCE7' },
              { label: 'High Priority', value: String(active.filter(r => r.priority === 'high').length), color: '#DC2626', bg: '#FEE2E2' },
              { label: 'Actions Remaining', value: String(active.length), color: '#3B82F6', bg: '#DBEAFE' },
            ].map((s) => (
              <Grid item xs={12} sm={4} key={s.label}>
                <Card>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                      {s.label}
                    </Typography>
                    <Typography className="mono" sx={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, mt: 0.5 }}>
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
                  {active.length === 0
                    ? 'Add savings and portfolio data to generate personalized recommendations.'
                    : 'No more recommendations in this category. Check back after your next portfolio update.'}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {visible.map((rec) => {
                const tc = typeConfig[rec.type] || typeConfig.investment
                const pc = priorityConfig[rec.priority] || priorityConfig.low
                const isActing = !!acting[rec.id]
                return (
                  <Grid item xs={12} md={6} key={rec.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: isActing ? 0.6 : 1, transition: 'opacity 0.2s' }}>
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
                              +₹{(rec.estimatedImpact || 0).toLocaleString('en-IN')}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      {/* Actions */}
                      <Box sx={{ px: 2.5, pb: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={isActing}
                          startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                          onClick={() => handleImplement(rec.id)}
                          sx={{ flexGrow: 1, bgcolor: '#0F172A', color: 'white', '&:hover': { bgcolor: '#1E293B' } }}
                        >
                          {acting[rec.id] === 'implementing' ? 'Saving…' : 'Implement'}
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isActing}
                          startIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleDismiss(rec.id)}
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
        </>
      )}
    </Box>
  )
}
