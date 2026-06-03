import { useRef, useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, TextField, Button, Divider,
  InputAdornment, Chip, Alert, CircularProgress,
} from '@mui/material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import CalculateIcon from '@mui/icons-material/Calculate'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import SaveIcon from '@mui/icons-material/Save'
import api from '../services/api'

// Mirrors SavingsAnalysisService logic (backend/src/services/analysis/SavingsAnalysisService.ts)
function calculateSavingsRate(monthlyIncome: number, monthlySavings: number): number {
  if (monthlyIncome === 0) return 0
  return (monthlySavings / monthlyIncome) * 100
}

function calculateMonthsOfExpenses(currentSavings: number, monthlyIncome: number, monthlySavings: number): number {
  const expenses = monthlyIncome - monthlySavings
  if (expenses === 0) return 0
  return currentSavings / expenses
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

interface Analysis {
  savingsRate: number
  monthsOfExpenses: number
  emergencyFundGap: number
  annualSavings: number
  projections: { year: string; value: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(148,163,184,0.2)', borderRadius: '8px', p: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>₹{payload[0].value.toLocaleString('en-IN')}</Typography>
    </Box>
  )
}

export default function SavingsAnalysis() {
  const [form, setForm] = useState({ currentSavings: '', monthlyIncome: '', monthlySavings: '' })
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvSuccess, setCsvSuccess] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Pre-fill from saved data
  useEffect(() => {
    api.getSavings().then(s => {
      setForm({
        currentSavings: String(s.currentSavings),
        monthlyIncome: String(s.monthlyIncome),
        monthlySavings: String(s.monthlySavings),
      })
    }).catch(() => {})
  }, [])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value })

  function applyRows(rows: Record<string, string>[]) {
    const normalised = rows.map(r => {
      const key = (k: string) => Object.keys(r).find(c => c.trim().toLowerCase() === k)
      return { date: r[key('date') || ''] ?? '', amount: r[key('amount') || ''] ?? '' }
    })
    const valid = normalised.filter(r => r.date && !isNaN(parseFloat(r.amount)))
    if (valid.length === 0) {
      setCsvError('File must have "date" and "amount" columns with at least one valid row.')
      return
    }
    const sorted = valid.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const latestAmount = Math.round(parseFloat(sorted[0].amount))
    setForm(f => ({ ...f, currentSavings: String(latestAmount) }))
    setCsvSuccess(`Loaded ${valid.length} rows — current savings set to ₹${latestAmount.toLocaleString('en-IN')} (latest entry: ${sorted[0].date})`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(null)
    setCsvSuccess(null)
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => applyRows(results.data as Record<string, string>[]),
        error: (err) => setCsvError(`Parse error: ${err.message}`),
      })
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target?.result, { type: 'array', cellDates: true })
          const ws = wb.Sheets[wb.SheetNames[0]]
          // sheet_to_json with header:1 gives raw arrays; with defVal:'' fills blanks
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' })
          applyRows(rows)
        } catch (err) {
          setCsvError(`Excel parse error: ${String(err)}`)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      setCsvError('Unsupported file type. Please upload a .csv, .xlsx, or .xls file.')
    }
    e.target.value = ''
  }

  const handleAnalyze = async () => {
    const cs = parseFloat(form.currentSavings) || 0
    const mi = parseFloat(form.monthlyIncome) || 0
    const ms = parseFloat(form.monthlySavings) || 0
    const monthlyExpenses = mi - ms
    const emergencyTarget = monthlyExpenses * 6
    setAnalysis({
      savingsRate: calculateSavingsRate(mi, ms),
      monthsOfExpenses: calculateMonthsOfExpenses(cs, mi, ms),
      emergencyFundGap: Math.max(0, emergencyTarget - cs),
      annualSavings: ms * 12,
      projections: projectSavingsGrowth(cs, ms * 12, 10),
    })
    // Save to backend
    setSaving(true)
    setSaveSuccess(false)
    try {
      await api.createSavings({ currentSavings: cs, monthlyIncome: mi, monthlySavings: ms } as any)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {}
    setSaving(false)
  }

  const savingsRateColor = (rate: number) => rate >= 20 ? '#16A34A' : rate >= 10 ? '#F59E0B' : '#DC2626'
  const savingsRateLabel = (rate: number) => rate >= 20 ? 'Excellent' : rate >= 10 ? 'Good' : 'Below Target'

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Savings Analysis</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Analyse your savings position and project long-term growth.
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Input Form */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Your Financial Details</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Enter your current figures to generate your analysis</Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.12)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Current Savings"
                  value={form.currentSavings}
                  onChange={handleChange('currentSavings')}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  helperText="Total across all savings accounts"
                />
                <TextField
                  label="Monthly Income (gross)"
                  value={form.monthlyIncome}
                  onChange={handleChange('monthlyIncome')}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  helperText="Your total monthly take-home income"
                />
                <TextField
                  label="Monthly Savings"
                  value={form.monthlySavings}
                  onChange={handleChange('monthlySavings')}
                  fullWidth
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                  helperText="Amount you save each month"
                />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={saving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : saveSuccess ? <SaveIcon /> : <CalculateIcon />}
                  onClick={handleAnalyze}
                  disabled={saving}
                  sx={{ bgcolor: saveSuccess ? '#16A34A' : '#0F172A', color: 'white', '&:hover': { bgcolor: saveSuccess ? '#15803D' : '#1E293B' }, mt: 0.5, transition: 'background-color 0.3s' }}
                >
                  {saving ? 'Saving…' : saveSuccess ? 'Saved!' : 'Analyse & Save'}
                </Button>
              </Box>

              <Divider sx={{ my: 2.5, borderColor: 'rgba(148,163,184,0.12)' }} />

              {/* CSV Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed rgba(148,163,184,0.3)',
                  borderRadius: '10px',
                  p: 2.5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#F59E0B' },
                  transition: 'all 0.2s',
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 32, color: '#94A3B8', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', mb: 0.25 }}>
                  Import via CSV or Excel
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  .csv / .xlsx / .xls — columns: date, amount
                </Typography>
              </Box>
              {csvError && <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>{csvError}</Alert>}
              {csvSuccess && <Alert severity="success" sx={{ mt: 1, fontSize: '0.8rem' }}>{csvSuccess}</Alert>}
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={7}>
          {analysis ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Stats Row */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ p: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TrendingUpIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>
                          Savings Rate
                        </Typography>
                      </Box>
                      <Typography className="mono" sx={{ fontSize: '1.75rem', fontWeight: 700, color: savingsRateColor(analysis.savingsRate) }}>
                        {analysis.savingsRate.toFixed(1)}%
                      </Typography>
                      <Chip
                        label={savingsRateLabel(analysis.savingsRate)}
                        size="small"
                        sx={{ mt: 0.75, height: 20, fontSize: '0.6875rem', bgcolor: savingsRateColor(analysis.savingsRate) + '20', color: savingsRateColor(analysis.savingsRate), fontWeight: 700 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ p: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SecurityIcon sx={{ fontSize: 18, color: '#3B82F6' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>
                          Emergency Cover
                        </Typography>
                      </Box>
                      <Typography className="mono" sx={{ fontSize: '1.75rem', fontWeight: 700, color: analysis.monthsOfExpenses >= 6 ? '#16A34A' : analysis.monthsOfExpenses >= 3 ? '#F59E0B' : '#DC2626' }}>
                        {analysis.monthsOfExpenses.toFixed(1)}mo
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        Target: 6 months
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ p: '16px !important' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: analysis.emergencyFundGap > 0 ? '#FEE2E2' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <AccountBalanceIcon sx={{ fontSize: 18, color: analysis.emergencyFundGap > 0 ? '#DC2626' : '#16A34A' }} />
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.6875rem' }}>
                          Emergency Gap
                        </Typography>
                      </Box>
                      <Typography className="mono" sx={{ fontSize: '1.75rem', fontWeight: 700, color: analysis.emergencyFundGap > 0 ? '#DC2626' : '#16A34A' }}>
                        {analysis.emergencyFundGap > 0 ? `-₹${analysis.emergencyFundGap.toLocaleString('en-IN')}` : 'Funded ✓'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                        Annual savings: ₹{analysis.annualSavings.toLocaleString('en-IN')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Projection Chart */}
              <Card>
                <CardContent sx={{ p: '20px !important' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                    <Box>
                      <Typography variant="h6">10-Year Savings Growth</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Projected at 12% annual compound return (Nifty 50 CAGR)</Typography>
                    </Box>
                    <Chip
                      label={`+${(((analysis.projections[9]?.value || 0) - parseFloat(form.currentSavings)) / parseFloat(form.currentSavings) * 100).toFixed(0)}% projected`}
                      size="small"
                      sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700 }}
                    />
                  </Box>
                  <Box sx={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysis.projections} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                        <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: '#F59E0B' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent sx={{ textAlign: 'center', p: '48px !important' }}>
                <CalculateIcon sx={{ fontSize: 56, color: '#CBD5E1', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#94A3B8', mb: 0.5 }}>Ready to analyse</Typography>
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  Fill in your details on the left and click "Analyse My Savings" to see your projection.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
