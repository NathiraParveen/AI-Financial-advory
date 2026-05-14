import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Divider,
  InputAdornment, Select, MenuItem, FormControl, InputLabel, LinearProgress, Chip,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FlagIcon from '@mui/icons-material/Flag'
import HomeIcon from '@mui/icons-material/Home'
import SavingsIcon from '@mui/icons-material/Savings'
import SchoolIcon from '@mui/icons-material/School'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import BeachAccessIcon from '@mui/icons-material/BeachAccess'

interface Goal {
  id: string
  name: string
  targetAmount: number
  targetDate: string
  priority: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  currentSaved: number
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

// Indian-context goals: amounts in INR
const initialGoals: Goal[] = [
  { id: '1', name: 'Home Purchase',      targetAmount: 1000000,  targetDate: '2027-06-01', priority: 1, riskTolerance: 'moderate',     currentSaved: 280000  },
  { id: '2', name: 'Emergency Fund',     targetAmount: 300000,   targetDate: '2026-06-01', priority: 1, riskTolerance: 'conservative', currentSaved: 185000  },
  { id: '3', name: 'Children Education', targetAmount: 2000000,  targetDate: '2035-09-01', priority: 2, riskTolerance: 'aggressive',   currentSaved: 80000   },
  { id: '4', name: 'Retirement Corpus',  targetAmount: 20000000, targetDate: '2045-01-01', priority: 2, riskTolerance: 'aggressive',   currentSaved: 1438200 },
]

function calcGoalMetrics(goal: Goal) {
  const today = new Date()
  const target = new Date(goal.targetDate)
  const monthsLeft = Math.max(0, (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()))
  const yearsLeft = monthsLeft / 12
  const remaining = goal.targetAmount - goal.currentSaved
  const requiredMonthly = monthsLeft > 0 ? remaining / monthsLeft : 0
  const progressPct = Math.min(100, (goal.currentSaved / goal.targetAmount) * 100)
  // Indian return assumptions: PPF/FD 7.1%, balanced MF 10%, equity 13%
  const annualReturn = goal.riskTolerance === 'conservative' ? 0.071 : goal.riskTolerance === 'moderate' ? 0.10 : 0.13
  return { monthsLeft, yearsLeft, remaining, requiredMonthly, progressPct, annualReturn }
}

function getGoalIcon(name: string) {
  const key = Object.keys(goalIconMap).find(k => name.toLowerCase().includes(k.toLowerCase())) || 'Default'
  return goalIconMap[key]
}

const riskLabels: Record<string, string> = { conservative: 'Conservative', moderate: 'Moderate', aggressive: 'Aggressive' }
const riskColors: Record<string, string> = { conservative: '#3B82F6', moderate: '#F59E0B', aggressive: '#DC2626' }

export default function GoalPlanning() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [form, setForm] = useState({ name: '', targetAmount: '', targetDate: '', priority: '2', riskTolerance: 'moderate' })

  const handleChange = (field: string) => (e: any) => setForm({ ...form, [field]: e.target.value })

  const handleAdd = () => {
    if (!form.name || !form.targetAmount || !form.targetDate) return
    const newGoal: Goal = {
      id: Date.now().toString(),
      name: form.name,
      targetAmount: parseFloat(form.targetAmount),
      targetDate: form.targetDate,
      priority: parseInt(form.priority),
      riskTolerance: form.riskTolerance as Goal['riskTolerance'],
      currentSaved: 0,
    }
    setGoals([...goals, newGoal])
    setForm({ name: '', targetAmount: '', targetDate: '', priority: '2', riskTolerance: 'moderate' })
  }

  const totalGoalAmount = goals.reduce((s, g) => s + g.targetAmount, 0)
  const totalSaved = goals.reduce((s, g) => s + g.currentSaved, 0)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Goal Planning</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Set financial goals, track progress, and see what it takes to reach each one on time.
        </Typography>
      </Box>

      {/* Summary Banner */}
      <Card sx={{ mb: 3, bgcolor: '#0F172A' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>Total Goal Amount</Typography>
              <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: 'white', mt: 0.5 }}>₹{totalGoalAmount.toLocaleString('en-IN')}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>Total Saved Toward Goals</Typography>
              <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#4ADE80', mt: 0.5 }}>₹{totalSaved.toLocaleString('en-IN')}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>Overall Progress</Typography>
              <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.75rem', color: '#F59E0B', mt: 0.5 }}>
                {((totalSaved / totalGoalAmount) * 100).toFixed(1)}%
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
                  fullWidth
                  sx={{ bgcolor: '#0F172A', color: 'white', '&:hover': { bgcolor: '#1E293B' } }}
                >
                  Add Goal
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Goal Cards */}
        <Grid item xs={12} md={8}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {goals.map((goal) => {
              const { monthsLeft, yearsLeft, remaining, requiredMonthly, progressPct } = calcGoalMetrics(goal)
              const iconStyle = goalIconBg[goal.priority] || { bg: '#F1F5F9', color: '#64748B' }

              return (
                <Card key={goal.id}>
                  <CardContent sx={{ p: '20px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: iconStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconStyle.color, flexShrink: 0 }}>
                          {getGoalIcon(goal.name)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#0F172A', fontSize: '0.9375rem' }}>{goal.name}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                            <Chip label={riskLabels[goal.riskTolerance]} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: riskColors[goal.riskTolerance] + '20', color: riskColors[goal.riskTolerance], fontWeight: 700 }} />
                            <Chip label={yearsLeft > 1 ? `${yearsLeft.toFixed(1)} yrs left` : `${monthsLeft} mo left`} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#F1F5F9', color: '#475569', fontWeight: 600 }} />
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#0F172A' }}>₹{goal.targetAmount.toLocaleString('en-IN')}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>target</Typography>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          ₹{goal.currentSaved.toLocaleString('en-IN')} saved
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: progressPct >= 50 ? '#16A34A' : '#F59E0B' }}>
                          {progressPct.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressPct}
                        sx={{
                          bgcolor: '#F1F5F9',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: progressPct >= 75 ? '#16A34A' : progressPct >= 40 ? '#F59E0B' : '#DC2626',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                        ₹{remaining.toLocaleString('en-IN')} remaining
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: 'rgba(148,163,184,0.1)' }} />

                    {/* Required Monthly Savings */}
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
                        <Chip
                          label={monthsLeft > 0 ? (requiredMonthly <= 10000 ? 'On track' : 'Needs attention') : 'Past due'}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.6875rem',
                            mt: 0.5,
                            fontWeight: 700,
                            bgcolor: requiredMonthly <= 10000 ? '#DCFCE7' : '#FEE2E2',
                            color: requiredMonthly <= 10000 ? '#16A34A' : '#DC2626',
                          }}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              )
            })}
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
