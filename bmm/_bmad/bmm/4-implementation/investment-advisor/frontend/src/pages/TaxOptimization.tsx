import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

// Mock data — replace with: apiService.getTaxOptimization(portfolioId)
// Mirrors TaxOptimizationService logic — Indian STCG/LTCG rates (Budget 2024)
const taxableSecurities = [
  { ticker: 'INFY',      name: 'Infosys Ltd',               purchaseDate: '2022-03-15', costBasis: 165000, currentValue: 158000, holdingPeriod: 'long',  taxRate: 0.125 },
  { ticker: 'ADANIPORT', name: 'Adani Ports & SEZ',         purchaseDate: '2023-04-20', costBasis: 72000,  currentValue: 68000,  holdingPeriod: 'short', taxRate: 0.20  },
  { ticker: 'SBINCAP',   name: 'SBI Small Cap Fund (MF)',   purchaseDate: '2021-06-01', costBasis: 54000,  currentValue: 49500,  holdingPeriod: 'long',  taxRate: 0.125 },
  { ticker: 'TATASTEEL', name: 'Tata Steel Ltd',            purchaseDate: '2024-01-10', costBasis: 16000,  currentValue: 14500,  holdingPeriod: 'short', taxRate: 0.20  },
]

const positiveHoldings = [
  { ticker: 'TCS',       name: 'Tata Consultancy Services', gainLoss: 12600, holdingPeriod: 'long',  taxRate: 0.125 },
  { ticker: 'RELIANCE',  name: 'Reliance Industries',       gainLoss: 16000, holdingPeriod: 'long',  taxRate: 0.125 },
  { ticker: 'NIFTYBEES', name: 'Nippon Nifty 50 BeES ETF',  gainLoss: 88000, holdingPeriod: 'long',  taxRate: 0.125 },
]

// ₹1.25 lakh LTCG exemption on equity (Section 112A)
const ltcgEquityExemption = 125000
const totalLtcgGains = positiveHoldings.filter(h => h.holdingPeriod === 'long').reduce((s, h) => s + h.gainLoss, 0)
const taxableGains = Math.max(0, totalLtcgGains - ltcgEquityExemption)

function calcTaxSaving(costBasis: number, currentValue: number, taxRate: number) {
  const unrealizedLoss = currentValue - costBasis
  if (unrealizedLoss >= 0) return { unrealizedLoss: 0, taxSaving: 0 }
  return { unrealizedLoss, taxSaving: Math.abs(unrealizedLoss) * taxRate }
}

const opportunities = taxableSecurities
  .map((s) => ({ ...s, ...calcTaxSaving(s.costBasis, s.currentValue, s.taxRate) }))
  .filter((s) => s.unrealizedLoss < 0)

const totalTaxSaving = opportunities.reduce((sum, s) => sum + s.taxSaving, 0)
const shortTermOpps = opportunities.filter(s => s.holdingPeriod === 'short').length
const longTermOpps = opportunities.filter(s => s.holdingPeriod === 'long').length
const totalUnrealizedLoss = opportunities.reduce((sum, s) => sum + Math.abs(s.unrealizedLoss), 0)

const totalCapitalGains = positiveHoldings.reduce((sum, h) => sum + h.gainLoss, 0)
const totalGainsTax = taxableGains * 0.125
const netTaxAfterHarvesting = Math.max(0, totalGainsTax - totalTaxSaving)

export default function TaxOptimization() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Tax Optimization</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Tax-loss harvesting opportunities and capital gains analysis for your portfolio.
        </Typography>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          { label: 'Total Potential Tax Savings', value: `₹${totalTaxSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#16A34A', bg: '#DCFCE7', icon: <ReceiptLongIcon sx={{ fontSize: 20 }} /> },
          { label: 'Short-Term Opportunities', value: String(shortTermOpps), sub: '20% STCG (Sec 111A)', color: '#DC2626', bg: '#FEE2E2', icon: <CalendarTodayIcon sx={{ fontSize: 20 }} /> },
          { label: 'Long-Term Opportunities', value: String(longTermOpps), sub: '12.5% LTCG (Sec 112A)', color: '#3B82F6', bg: '#DBEAFE', icon: <TrendingDownIcon sx={{ fontSize: 20 }} /> },
        ].map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card>
              <CardContent sx={{ p: '20px !important' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                      {s.label}
                    </Typography>
                    <Typography className="mono" sx={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, mt: 0.5 }}>
                      {s.value}
                    </Typography>
                    {s.sub && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.sub}</Typography>}
                  </Box>
                  <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
                    {s.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tax-Loss Harvesting Table */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Tax-Loss Harvesting Opportunities</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Securities with unrealized losses you can harvest to offset capital gains
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Holding</TableCell>
                  <TableCell>Purchase Date</TableCell>
                  <TableCell align="right">Cost Basis (₹)</TableCell>
                  <TableCell align="right">Current Value (₹)</TableCell>
                  <TableCell align="right">Unrealised Loss (₹)</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell align="right">Est. Tax Saving</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {opportunities.map((s) => (
                  <TableRow key={s.ticker} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto Mono, monospace' }}>{s.ticker}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{s.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#475569' }}>{new Date(s.purchaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</Typography>
                    </TableCell>
                    <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{s.costBasis.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{s.currentValue.toLocaleString('en-IN')}</TableCell>
                    <TableCell align="right" className="mono" sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                      -₹{Math.abs(s.unrealizedLoss).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.holdingPeriod === 'short' ? 'Short-term' : 'Long-term'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          bgcolor: s.holdingPeriod === 'short' ? '#FEE2E2' : '#DBEAFE',
                          color: s.holdingPeriod === 'short' ? '#DC2626' : '#3B82F6',
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" className="mono" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.875rem' }}>
                      +₹{s.taxSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell colSpan={4}><Typography variant="body2" sx={{ fontWeight: 700 }}>Total</Typography></TableCell>
                  <TableCell align="right" className="mono" sx={{ color: '#DC2626', fontWeight: 700 }}>-₹{totalUnrealizedLoss.toLocaleString('en-IN')}</TableCell>
                  <TableCell />
                  <TableCell align="right" className="mono" sx={{ color: '#16A34A', fontWeight: 700 }}>+₹{totalTaxSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Capital Gains Summary */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Capital Gains Summary</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unrealised gains subject to tax on sale</Typography>
              <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Holding</TableCell>
                      <TableCell align="right">Gain</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell align="right">Est. Tax</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positiveHoldings.map((h) => (
                      <TableRow key={h.ticker} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Roboto Mono, monospace', color: '#0F172A' }}>{h.ticker}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{h.name}</Typography>
                        </TableCell>
                        <TableCell align="right" className="mono" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '0.875rem' }}>+${h.gainLoss.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip label="Long-term" size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: '#DBEAFE', color: '#3B82F6', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell align="right" className="mono" sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                          ${(h.gainLoss * h.taxRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: '#0F172A', color: 'white', height: '100%' }}>
            <CardContent sx={{ p: '24px !important' }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>Net Tax Position</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)' }}>After applying harvested losses to gains</Typography>
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { label: 'Total Unrealised Gains', value: `$${totalCapitalGains.toLocaleString()}`, color: '#4ADE80' },
                  { label: 'Capital Gains Tax (est.)', value: `-$${totalGainsTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#F87171' },
                  { label: 'Tax Savings from Harvesting', value: `+$${totalTaxSaving.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: '#34D399' },
                ].map((row) => (
                  <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'rgba(148,163,184,0.8)' }}>{row.label}</Typography>
                    <Typography className="mono" sx={{ fontWeight: 700, color: row.color, fontSize: '1rem' }}>{row.value}</Typography>
                  </Box>
                ))}
                <Divider sx={{ borderColor: 'rgba(148,163,184,0.15)' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(248,250,252,0.9)', fontWeight: 600 }}>Net Tax Owed</Typography>
                  <Typography className="mono" sx={{ fontWeight: 800, color: netTaxAfterHarvesting > 0 ? '#F87171' : '#4ADE80', fontSize: '1.375rem' }}>
                    ${netTaxAfterHarvesting.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'rgba(52,211,153,0.15)', borderRadius: '8px', p: 1.5, border: '1px solid rgba(52,211,153,0.25)', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 600 }}>
                    💡 Harvesting available losses saves you ~${totalTaxSaving.toLocaleString(undefined, { maximumFractionDigits: 0 })} in taxes this year.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
