import { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Divider,
  InputAdornment, Select, MenuItem, FormControl, InputLabel, LinearProgress, Chip,
  CircularProgress, IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FlagIcon from '@mui/icons-material/Flag'
import HomeIcon from '@mui/icons-material/Home'
import SavingsIcon from '@mui/icons-material/Savings'
import SchoolIcon from '@mui/icons-material/School'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'
import api from '../services/api'

interface Goal {
  id: string
  name: string
  targetAmount: number
  targetDate: string
  priority: number
  riskTolerance: string
}

const goalIconMap: Record<string, JSX.Element> = {
  'Home': <HomeIcon sx={{ fontSize: 20 }} />,
  'Emergency': <SavingsIcon sx={{ fontSize: 20 }} />,
  'Education': <SchoolIcon sx={{ fontSize: 20 }} />,
  'Car': <DirectionsCarIcon sx={{ fontSize: 20 }} />,
  'Vacation': <BeachAccessIcon sx={{ fontSize: 20 }} />,
  'Default': <FlagIcon sx={{ fontSize: 20 }} />,
}

const goalIconBg: Record<number, { bg: string; color: string }> = {
  1: { bg: '#FEE2E2', color: '#DC2626' },
  2: { bg: '#FEF3C7', color: '#F59E0B' },
  3: { bg: '#DBEAFE', color: '#3B82F6' },
}

function calcGoalMetrics(goal: Goal) {
  const today = new Date()
  const target = new Date(goal.targetDate)
  const monthsLeft = Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()))
  const yearsLeft = monthsLeft / 12
  const annualReturn = goal.riskTolerance === 'conservative' ? 0.071 : goal.riskTolerance === 'moderate' ? 0.10 : 0.13
  const requiredMonthly = monthsLeft > 0 ? goal.targetAmount / monthsLeft : 0
  return { monthsLeft, yearsLeft, requiredMonthly, annualReturn }
}

function getGoalIcon(name: string) {
  const key = Object.keys(goalIconMap).find(k => name.toLowerCase().includes(k.toLowerCase())) || 'Default'
  return goalIconMap[key]
}

const riskLabels: Record<string, string> = { conservative: 'Conservative', moderate: 'Moderate', aggressive: 'Aggressive' }
const riskColors: Record<string, string> = { conservative: '#3B82F6', moderate: '#F59E0B', aggressive: '#DC2626' }

export default function GoalPlanning() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', priority: '2', riskTolerance: 'moderate' })
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [noSavings, setNoSavings] = useState(false)

  useEffect(() => {
    api.getSavings()
      .then(s => {
        setGoals((s as any).goals || [])
        setNoSavings(false)
      })
      .catch(() => setNoSavings(true))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value })

  const handleAdd = async () => {
    if (!form.name || !form.targetAmount || !form.targetDate) return
    setAdding(true)
    try {
      const goal = await api.addSavingsGoal({
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        targetDate: form.targetDate,
        priority: parseInt(form.priority),
        riskTolerance: form.riskTolerance,
      })
      setGoals(g => [...g, goal])
      setForm({ name: '', targetAmount: '', targetDate: '', priority: '2', riskTolerance: 'moderate' })
    } catch {}
    setAdding(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await api.deleteSavingsGoal(id)
      setGoals(g => g.filter(x => x.id !== id))
    } catch {}
    setDeleting(null)
  }

  const totalGoalAmount = goals.reduce((s, g) => s + g.targetAmount, 0)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Goal Planning</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Set financial goals and see what it takes to reach each one on time.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {noSavings && (
            <Card sx={{ mb: 3, border: '1px solid #FEF3C7', bgcolor: '#FFFBEB' }}>
              <CardContent sx={{ p: '16px !important' }}>
                <Typography variant="body2" sx={{ color: '#92400E' }}>
                  Save your savings profile first on the <strong>Savings Analysis</strong> page — goals are linked to your savings record.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Summary Banner */}
          {goals.length > 0 && (
            <Card sx={{ mb: 3, bgcolor: '#0F172A' }}>
              <CardContent sx={{ p: '20px !important' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>Total Goal Amount</Typography>
                    <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: 'white', mt: 0.5 }}>₹{totalGoalAmount.toLocaleString('en-IN')}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>Active Goals</Typography>
                    <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#4ADE80', mt: 0.5 }}>{goals.length}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>High Priority</Typography>
                    <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#F59E0B', mt: 0.5 }}>
                      {goals.filter(g => g.priority === 1).length}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          <Grid container spacing={2.5}>
            {/* Create Goal Form */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ p: '20px !important' }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>Add New Goal</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Define a target and we'll calculate your path</Typography>
                  <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField label="Goal Name" placeholder="e.g. Home Purchase" value={form.name} onChange={handleChange('name')} fullWidth />
                    <TextField
                      label="Target Amount"
                      value={form.targetAmount}
                      onChange={handleChange('targetAmount')}
                      fullWidth
                      InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    />
                    <TextField label="Target Date" type="date" value={form.targetDate} onChange={handleChange('targetDate')} fullWidth InputLabelProps={{ shrink: true }} />
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority</InputLabel>
                      <Select value={form.priority} onChange={handleChange('priority')} label="Priority">
                        <MenuItem value="1">High — Critical goal</MenuItem>
                        <MenuItem value="2">Medium — Important</MenuItem>
                        <MenuItem value="3">Low — Nice to have</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Risk Tolerance</InputLabel>
                      <Select value={form.riskTolerance} onChange={handleChange('riskTolerance')} label="Risk Tolerance">
                        <MenuItem value="conservative">Conservative (7.1% — PPF/FD rate)</MenuItem>
                        <MenuItem value="moderate">Moderate (10% — Balanced MF)</MenuItem>
                        <MenuItem value="aggressive">Aggressive (13% — Equity/Nifty)</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAdd}
                      disabled={adding || noSavings}
                      fullWidth
                      sx={{ bgcolor: '#0F172A', color: 'white', '&:hover': { bgcolor: '#1E293B' } }}
                    >
                      {adding ? 'Adding…' : 'Add Goal'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Goal Cards */}
            <Grid item xs={12} md={8}>
              {goals.length === 0 ? (
                <Card>
                  <CardContent sx={{ p: '32px !important', textAlign: 'center' }}>
                    <FlagIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
                    <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.5 }}>No goals yet</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Add your first financial goal using the form on the left.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {goals.map((goal) => {
                    const { monthsLeft, yearsLeft, requiredMonthly } = calcGoalMetrics(goal)
                    const iconStyle = goalIconBg[goal.priority] || { bg: '#F1F5F9', color: '#64748B' }

                    return (
                      <Card key={goal.id} sx={{ opacity: deleting === goal.id ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                        <CardContent sx={{ p: '20px !important' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: iconStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconStyle.color, flexShrink: 0 }}>
                                {getGoalIcon(goal.name)}
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ color: '#0F172A', fontSize: '0.9375rem' }}>{goal.name}</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                                  <Chip label={riskLabels[goal.riskTolerance] || goal.riskTolerance} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: (riskColors[goal.riskTolerance] || '#64748B') + '20', color: riskColors[goal.riskTolerance] || '#64748B', fontWeight: 700 }} />
                                  <Chip label={yearsLeft > 1 ? `${yearsLeft.toFixed(1)} yrs left` : `${monthsLeft} mo left`} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
                                </Box>
                              </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ textAlign: 'right' }}>
                                <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0F172A' }}>₹{goal.targetAmount.toLocaleString('en-IN')}</Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>target</Typography>
                              </Box>
                              <IconButton size="small" onClick={() => handleDelete(goal.id)} disabled={deleting === goal.id} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626' } }}>
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Box>
                          </Box>

                          <Box sx={{ mb: 2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={0}
                              sx={{ bgcolor: '#F1F5F9', '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' } }}
                            />
                            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                              Start saving toward this goal to track progress
                            </Typography>
                          </Box>

                          <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.1)' }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                                Required Monthly Savings
                              </Typography>
                              <Typography className="mono" sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#F59E0B', mt: 0.25 }}>
                                ₹{requiredMonthly.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.6875rem' }}>
                                Target Date
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B', mt: 0.25 }}>
                                {new Date(goal.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    )
                  })}
                </Box>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  )
}
