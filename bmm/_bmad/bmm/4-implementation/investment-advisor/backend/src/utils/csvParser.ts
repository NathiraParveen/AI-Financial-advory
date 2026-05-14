/**
 * CSV Import utilities for handling user data uploads
 */

export interface CSVParsedSavings {
  date: string
  savings_amount: number
  monthly_income: number
  monthly_expenses: number
}

export interface CSVParsedHolding {
  ticker: string
  assetClass: string
  quantity: number
  purchasePrice: number
  purchaseDate: string
  currentPrice: number
}

/**
 * Parse savings CSV data
 */
export function parseSavingsCSV(
  csvData: string,
): CSVParsedSavings[] {
  const lines = csvData.trim().split('\n')
  if (lines.length < 2) throw new Error('Invalid CSV format')

  const header = lines[0].toLowerCase().split(',')
  const data: CSVParsedSavings[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length !== header.length) continue

    const record: any = {}
    header.forEach((col, idx) => {
      record[col.trim()] = values[idx].trim()
    })

    data.push({
      date: record.date || new Date().toISOString(),
      savings_amount: parseFloat(record.savings_amount || '0'),
      monthly_income: parseFloat(record.monthly_income || '0'),
      monthly_expenses: parseFloat(record.monthly_expenses || '0'),
    })
  }

  return data
}

/**
 * Parse portfolio holdings CSV
 */
export function parsePortfolioCSV(
  csvData: string,
): CSVParsedHolding[] {
  const lines = csvData.trim().split('\n')
  if (lines.length < 2) throw new Error('Invalid CSV format')

  const header = lines[0].toLowerCase().split(',')
  const holdings: CSVParsedHolding[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',')
    if (values.length !== header.length) continue

    const record: any = {}
    header.forEach((col, idx) => {
      record[col.trim()] = values[idx].trim()
    })

    holdings.push({
      ticker: record.ticker || 'UNKNOWN',
      assetClass: record.asset_class || record.assetclass || 'stocks',
      quantity: parseFloat(record.quantity || '0'),
      purchasePrice: parseFloat(record.purchase_price || record.purchaseprice || '0'),
      purchaseDate: record.purchase_date || record.purchasedate || new Date().toISOString(),
      currentPrice: parseFloat(record.current_price || record.currentprice || '0'),
    })
  }

  return holdings
}

/**
 * Validate CSV data
 */
export function validateSavingsData(data: CSVParsedSavings[]): string[] {
  const errors: string[] = []

  if (data.length === 0) {
    errors.push('No data rows found in CSV')
  }

  data.forEach((record, idx) => {
    if (record.savings_amount < 0) {
      errors.push(`Row ${idx + 2}: Savings amount cannot be negative`)
    }
    if (record.monthly_income < 0) {
      errors.push(`Row ${idx + 2}: Monthly income cannot be negative`)
    }
  })

  return errors
}

/**
 * Validate holdings data
 */
export function validateHoldingsData(holdings: CSVParsedHolding[]): string[] {
  const errors: string[] = []

  if (holdings.length === 0) {
    errors.push('No holdings data found in CSV')
  }

  holdings.forEach((holding, idx) => {
    if (!holding.ticker) {
      errors.push(`Row ${idx + 2}: Ticker is required`)
    }
    if (holding.quantity <= 0) {
      errors.push(`Row ${idx + 2}: Quantity must be positive`)
    }
    if (holding.currentPrice < 0) {
      errors.push(`Row ${idx + 2}: Current price cannot be negative`)
    }
  })

  return errors
}
