import { useState } from 'react'
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Alert,
} from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'

// Mock holdings data — replace with: apiService.getPortfolios() + apiService.getRiskAssessment()
const holdings = [
  { ticker: 'NIFTYBEES', name: 'Nippon Nifty 50 BeES ETF',    assetClass: 'Equity',        qty: 200,  costBasis: 1800, currentValue: 2200, purchaseDate: '2022-03-15' },
  { ticker: 'TCS',       name: 'Tata Consultancy Services',   assetClass: 'Equity',        qty: 30,   costBasis: 3500, currentValue: 3920, purchaseDate: '2021-06-01' },
  { ticker: 'RELIANCE',  name: 'Reliance Industries Ltd',     assetClass: 'Equity',        qty: 40,   costBasis: 2400, currentValue: 2800, purchaseDate: '2020-11-05' },
  { ticker: 'GOLDBEES',  name: 'Nippon India Gold BeES ETF',  assetClass: 'Gold',          qty: 65,   costBasis: 4800, currentValue: 5500, purchaseDate: '2023-01-10' },
  { ticker: 'HDFCFLEX',  name: 'HDFC Flexi Cap Fund (MF)',    assetClass: 'Mutual Funds',  qty: 150,  costBasis: 850,  currentValue: 980,  purchaseDate: '2022-07-01' },
  { ticker: 'INFY',      name: 'Infosys Ltd',                 assetClass: 'Equity',        qty: 100,  costBasis: 1650, currentValue: 1580, purchaseDate: '2023-04-20' },
  { ticker: 'PPFACC',    name: 'Public Provident Fund (PPF)', assetClass: 'PPF',           qty: 1,    costBasis: 200000, currentValue: 214200, purchaseDate: '2020-04-01' },
]

const allocationColors: Record<string, string> = {
  'Equity': '#3B82F6',
  'Mutual Funds': '#8B5CF6',
  'Gold': '#F59E0B',
  'Fixed Deposits': '#10B981',
  'PPF': '#06B6D4',
  'Cash': '#94A3B8',
}

const rebalancingAlerts = [
  { assetClass: 'Equity', target: 45, current: 53, drift: +8 },
  { assetClass: 'Gold', target: 20, current: 13, drift: -7 },
]

function calcHolding(h: typeof holdings[0]) {
  const totalCost = h.qty * h.costBasis
  const totalValue = h.qty * h.currentValue
  const gainLoss = totalValue - totalCost
  const gainLossPct = ((totalValue - totalCost) / totalCost) * 100
  return { totalCost, totalValue, gainLoss, gainLossPct }
}

function buildAllocationData(data: typeof holdings) {
  const map: Record<string, number> = {}
  data.forEach((h) => {
    const val = h.qty * h.currentValue
    map[h.assetClass] = (map[h.assetClass] || 0) + val
  })
  const total = Object.values(map).reduce((a, b) => a + b, 0)
  return Object.entries(map).map(([name, value]) => ({
    name,
    value: Math.round((value / total) * 100),
    color: allocationColors[name] || '#94A3B8',
  }))
}

const allocationData = buildAllocationData(holdings)
const totalValue = holdings.reduce((sum, h) => sum + h.qty * h.currentValue, 0)
const totalCost = holdings.reduce((sum, h) => sum + h.qty * h.costBasis, 0)
const totalGainLoss = totalValue - totalCost
const totalGainLossPct = ((totalGainLoss / totalCost) * 100).toFixed(2)

type SortKey = 'ticker' | 'assetClass' | 'totalValue' | 'gainLossPct'

export default function Portfolio() {
  const [sortBy, setSortBy] = useState<SortKey>('totalValue')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('desc') }
  }

  const sorted = [...holdings].sort((a, b) => {
    const aCalc = calcHolding(a)
    const bCalc = calcHolding(b)
    let aVal: number | string = 0
    let bVal: number | string = 0
    if (sortBy === 'ticker') { aVal = a.ticker; bVal = b.ticker }
    else if (sortBy === 'assetClass') { aVal = a.assetClass; bVal = b.assetClass }
    else if (sortBy === 'totalValue') { aVal = aCalc.totalValue; bVal = bCalc.totalValue }
    else if (sortBy === 'gainLossPct') { aVal = aCalc.gainLossPct; bVal = bCalc.gainLossPct }
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0F172A' }}>Portfolio</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          Track and manage your investment holdings across all asset classes.
        </Typography>
      </Box>

      {/* Portfolio Summary Banner */}
      <Card sx={{ mb: 3, bgcolor: '#0F172A', color: 'white' }}>
        <CardContent sx={{ p: '20px !important' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Portfolio Value
              </Typography>
              <Typography className="mono" sx={{ fontWeight: 700, fontSize: '2rem', color: 'white', mt: 0.5 }}>
                ₹{totalValue.toLocaleString('en-IN')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Gain / Loss
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                {totalGainLoss >= 0
                  ? <TrendingUpIcon sx={{ color: '#4ADE80' }} />
                  : <TrendingDownIcon sx={{ color: '#F87171' }} />}
                <Typography className="mono" sx={{ fontWeight: 700, fontSize: '1.5rem', color: totalGainLoss >= 0 ? '#4ADE80' : '#F87171' }}>
                  {totalGainLoss >= 0 ? '+' : ''}₹{Math.abs(totalGainLoss).toLocaleString('en-IN')} ({totalGainLoss >= 0 ? '+' : ''}{totalGainLossPct}%)
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" sx={{ color: 'rgba(148,163,184,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: '0.6875rem' }}>
                Total Cost Basis
              </Typography>
              <Typography className="mono" sx={{ fontWeight: 600, fontSize: '1.25rem', color: 'rgba(248,250,252,0.8)', mt: 0.5 }}>
                ₹{totalCost.toLocaleString('en-IN')}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Rebalancing Alerts */}
      {rebalancingAlerts.length > 0 && (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {rebalancingAlerts.map((alert) => (
            <Alert
              key={alert.assetClass}
              severity={Math.abs(alert.drift) > 7 ? 'error' : 'warning'}
              icon={<WarningAmberIcon fontSize="small" />}
              sx={{ borderRadius: '10px', '& .MuiAlert-message': { fontSize: '0.875rem' } }}
            >
              <strong>{alert.assetClass}</strong> is {Math.abs(alert.drift)}% {alert.drift > 0 ? 'above' : 'below'} target allocation
              ({alert.current}% current vs {alert.target}% target). Consider rebalancing.
            </Alert>
          ))}
        </Box>
      )}

      <Grid container spacing={2.5}>
        {/* Holdings Table */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Holdings</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel active={sortBy === 'ticker'} direction={sortBy === 'ticker' ? sortDir : 'asc'} onClick={() => handleSort('ticker')}>
                          Ticker
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel active={sortBy === 'assetClass'} direction={sortBy === 'assetClass' ? sortDir : 'asc'} onClick={() => handleSort('assetClass')}>
                          Class
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Cost/Share</TableCell>
                      <TableCell align="right">
                        <TableSortLabel active={sortBy === 'totalValue'} direction={sortBy === 'totalValue' ? sortDir : 'asc'} onClick={() => handleSort('totalValue')}>
                          Value
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="right">Gain ₹</TableCell>
                      <TableCell align="right">
                        <TableSortLabel active={sortBy === 'gainLossPct'} direction={sortBy === 'gainLossPct' ? sortDir : 'asc'} onClick={() => handleSort('gainLossPct')}>
                          Gain %
                        </TableSortLabel>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sorted.map((h) => {
                      const { totalValue: tv, gainLoss, gainLossPct } = calcHolding(h)
                      const isPos = gainLoss >= 0
                      return (
                        <TableRow key={h.ticker} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontFamily: 'Roboto Mono, monospace' }}>{h.ticker}</Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>{h.name}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={h.assetClass}
                              size="small"
                              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: (allocationColors[h.assetClass] || '#94A3B8') + '20', color: allocationColors[h.assetClass] || '#94A3B8', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>{h.qty}</TableCell>
                          <TableCell align="right" className="mono" sx={{ fontSize: '0.875rem' }}>₹{h.costBasis.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" className="mono" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>₹{tv.toLocaleString('en-IN')}</TableCell>
                          <TableCell align="right" className="mono" sx={{ color: isPos ? '#16A34A' : '#DC2626', fontWeight: 600, fontSize: '0.875rem' }}>
                            {isPos ? '+' : '-'}₹{Math.abs(gainLoss).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell align="right">
                            <Chip
                              label={`${isPos ? '+' : ''}${gainLossPct.toFixed(1)}%`}
                              size="small"
                              sx={{ height: 20, fontSize: '0.6875rem', bgcolor: isPos ? '#DCFCE7' : '#FEE2E2', color: isPos ? '#16A34A' : '#DC2626', fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Allocation Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: '20px !important' }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>Allocation</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>By asset class</Typography>
              <Box sx={{ height: 220, mt: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocationData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {allocationData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                {allocationData.map((d) => (
                  <Box key={d.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: d.color, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{d.name}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1E293B' }}>{d.value}%</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
