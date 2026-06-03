import { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Divider, CircularProgress,
  MenuItem, Select, FormControl, InputLabel,
} from '@mui/material'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import api from '../services/api'

export default function TaxOptimization() {
  const [portfolios, setPortfolios] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    api.getPortfolios()
      .then(p => {
        setPortfolios(p)
        if (p.length > 0) setSelectedId(p[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setAnalyzing(true)
    api.getTaxOptimization(selectedId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setAnalyzing(false))
  }, [selectedId])

  const opportunities = data?.opportunities || []
  const securities = data?.securities || []

  const gains = securities.filter((s: any) => s.currentValue > s.costBasis)
  const totalTaxSaving = data?.totalSavings || 0
  const shortTermOpps = opportunities.filter((s: any) => s.holdingPeriod === 'short').length
  const longTermOpps = opportunities.filter((s: any) => s.holdingPeriod === 'long').length
  const totalUnrealizedLoss = opportunities.reduce((sum: number, s: any) => sum + Math.abs(s.unrealizedLoss || 0), 0)

  const ltcgExemption = 125000
  const totalLtcgGains = gains.filter((s: any) => s.holdingPeriod === 'long').reduce((sum: number, s: any) => sum + (s.currentValue - s.costBasis), 0)
  const taxableGains = Math.max(0, totalLtcgGains - ltcgExemption)
  const totalGainsTax = taxableGains * 0.125
  const netTaxAfterHarvesting = Math.max(0, totalGainsTax - totalTaxSaving)

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Tax Optimization</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Tax-loss harvesting opportunities and capital gains analysis for your portfolio.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : portfolios.length === 0 ? (
        <Card>
          <CardContent sx={{ p: '32px !important', textAlign: 'center' }}>
            <ReceiptLongIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
            <Typography variant="h6" sx={{ color: '#0F172A', mb: 0.5 }}>No portfolio data</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Create a portfolio and add holdings on the Portfolio page to see tax optimization analysis.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Portfolio selector */}
          {portfolios.length > 1 && (
            <Box sx={{ mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel>Portfolio</InputLabel>
                <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} label="Portfolio">
                  {portfolios.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {analyzing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
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
                            <Typography className="mono" sx={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, mt: 0.5 }}>
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
                  {opportunities.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
                      No tax-loss harvesting opportunities in this portfolio — all holdings are in profit.
                    </Typography>
                  ) : (
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
                          {opportunities.map((s: any) => (
                            <TableRow key={s.ticker} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto Mono, monospace' }}>{s.ticker}</Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" sx={{ color: '#475569' }}>
                                  {s.purchaseDate ? new Date(s.purchaseDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{(s.costBasis || 0).toLocaleString('en-IN')}</TableCell>
                              <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{(s.currentValue || 0).toLocaleString('en-IN')}</TableCell>
                              <TableCell align="right" className="mono" sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                                -₹{Math.abs(s.unrealizedLoss || 0).toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={s.holdingPeriod === 'short' ? 'Short-term' : 'Long-term'}
                                  size="small"
                                  sx={{
                                    height: 20, fontSize: '0.6875rem', fontWeight: 700,
                                    bgcolor: s.holdingPeriod === 'short' ? '#FEE2E2' : '#DBEAFE',
                                    color: s.holdingPeriod === 'short' ? '#DC2626' : '#3B82F6',
                                  }}
                                />
                              </TableCell>
                              <TableCell align="right" className="mono" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.875rem' }}>
                                +₹{(s.taxSaving || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
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
                  )}
                </CardContent>
              </Card>

              {/* Net Tax Position */}
              <Grid container spacing={2.5}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent sx={{ p: '20px !important' }}>
                      <Typography variant="h6" sx={{ mb: 0.5 }}>Capital Gains Summary</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Unrealised gains subject to tax on sale</Typography>
                      <Divider sx={{ my: 2, borderColor: 'rgba(148,163,184,0.12)' }} />
                      {gains.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>No unrealised gains in this portfolio.</Typography>
                      ) : (
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
                              {gains.map((s: any) => {
                                const gain = s.currentValue - s.costBasis
                                const rate = s.holdingPeriod === 'short' ? 0.20 : 0.125
                                return (
                                  <TableRow key={s.ticker} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                                    <TableCell>
                                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'Roboto Mono, monospace', color: '#0F172A' }}>{s.ticker}</Typography>
                                    </TableCell>
                                    <TableCell align="right" className="mono" sx={{ color: '#16A34A', fontWeight: 600, fontSize: '0.875rem' }}>+₹{gain.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</TableCell>
                                    <TableCell>
                                      <Chip label={s.holdingPeriod === 'short' ? 'Short' : 'Long'} size="small" sx={{ height: 18, fontSize: '0.6875rem', bgcolor: s.holdingPeriod === 'short' ? '#FEE2E2' : '#DBEAFE', color: s.holdingPeriod === 'short' ? '#DC2626' : '#3B82F6', fontWeight: 700 }} />
                                    </TableCell>
                                    <TableCell align="right" className="mono" sx={{ color: '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                                      ₹{(gain * rate).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ bgcolor: '#0F172A', color: 'white', height: '100%' }}>
                    <CardContent sx={{ p: '20px !important' }}>
                      <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>Net Tax Position</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)' }}>After applying harvested losses to gains</Typography>
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { label: 'Total Unrealised Gains', value: `₹${gains.reduce((s: number, x: any) => s + (x.currentValue - x.costBasis), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#4ADE80' },
                          { label: 'Capital Gains Tax (est.)', value: `-₹${totalGainsTax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#F87171' },
                          { label: 'Tax Savings from Harvesting', value: `+₹${totalTaxSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: '#34D399' },
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
                            ₹{netTaxAfterHarvesting.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </Typography>
                        </Box>
                        {totalTaxSaving > 0 && (
                          <Box sx={{ bgcolor: 'rgba(52,211,153,0.15)', borderRadius: '8px', p: 1.5, border: '1px solid rgba(52,211,153,0.25)', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 600 }}>
                              Harvesting available losses saves you ~₹{totalTaxSaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })} in taxes this year.
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  )
}
