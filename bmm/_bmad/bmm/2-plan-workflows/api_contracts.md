# API Contracts - Investment Advisor MVP

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}

Response 201:
{
  "id": "user-123",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2026-05-08T10:00:00Z"
}

Response 400:
{
  "error": "Invalid email format"
}

Response 409:
{
  "error": "User already exists"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "user-123",
    "email": "john@example.com",
    "name": "John Doe"
  }
}

Response 401:
{
  "error": "Invalid credentials"
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer <old-token>

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}

Response 401:
{
  "error": "Invalid or expired token"
}
```

---

## Savings Endpoints

### Create/Update Savings
```http
POST /api/v1/savings
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "currentSavings": 50000,
  "monthlyIncome": 8000,
  "monthlySavings": 2000,
  "savingStartDate": "2023-01-15"
}

Response 201:
{
  "id": "savings-456",
  "userId": "user-123",
  "currentSavings": 50000,
  "monthlyIncome": 8000,
  "monthlySavings": 2000,
  "savingStartDate": "2023-01-15",
  "analysis": {
    "savingsRate": 0.25,
    "monthsOfExpenses": 5,
    "recommendedEmergencyFund": 25000,
    "projections": {
      "oneYear": 74000,
      "fiveYears": 170000,
      "tenYears": 334000
    }
  },
  "createdAt": "2026-05-08T10:00:00Z"
}

Response 400:
{
  "error": "Invalid savings data",
  "details": [
    "monthlyIncome must be positive",
    "savingStartDate must be in past"
  ]
}
```

### Get Savings
```http
GET /api/v1/savings
Authorization: Bearer <token>

Response 200:
{
  "id": "savings-456",
  "userId": "user-123",
  "currentSavings": 50000,
  "monthlyIncome": 8000,
  "monthlySavings": 2000,
  "savingStartDate": "2023-01-15",
  "analysis": {...}
}

Response 404:
{
  "error": "Savings record not found"
}
```

### Upload Savings CSV
```http
POST /api/v1/savings/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

Request:
- Form field: file (CSV file)
- CSV Format: date,amount
  2023-01-15,50000
  2023-02-15,52000
  2023-03-15,54000

Response 200:
{
  "imported": 3,
  "total": 3,
  "errors": []
}

Response 400:
{
  "imported": 2,
  "total": 3,
  "errors": [
    {
      "row": 3,
      "error": "Invalid date format"
    }
  ]
}
```

---

## Portfolio Endpoints

### Create Portfolio
```http
POST /api/v1/portfolio
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "name": "Main Investment Portfolio",
  "description": "Diversified portfolio for long-term growth"
}

Response 201:
{
  "id": "portfolio-789",
  "userId": "user-123",
  "name": "Main Investment Portfolio",
  "description": "Diversified portfolio for long-term growth",
  "totalValue": 0,
  "holdingsCount": 0,
  "createdAt": "2026-05-08T10:00:00Z"
}
```

### Get Portfolio
```http
GET /api/v1/portfolio/:portfolioId
Authorization: Bearer <token>

Response 200:
{
  "id": "portfolio-789",
  "userId": "user-123",
  "name": "Main Investment Portfolio",
  "totalValue": 85000,
  "holdingsCount": 4,
  "allocation": {
    "stocks": {
      "percent": 70,
      "value": 59500
    },
    "bonds": {
      "percent": 20,
      "value": 17000
    },
    "realEstate": {
      "percent": 10,
      "value": 8500
    }
  },
  "performance": {
    "dayChange": 215,
    "dayChangePercent": 0.25,
    "ytdChange": 4250,
    "ytdChangePercent": 5.25
  }
}
```

### Add Holding
```http
POST /api/v1/portfolio/:portfolioId/holdings
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "ticker": "VTI",
  "assetClass": "stocks",
  "quantity": 100,
  "costBasis": 200,
  "currentValue": 22000,
  "purchaseDate": "2023-03-15"
}

Response 201:
{
  "id": "holding-001",
  "portfolioId": "portfolio-789",
  "ticker": "VTI",
  "assetClass": "stocks",
  "quantity": 100,
  "costBasis": 200,
  "currentValue": 22000,
  "purchaseDate": "2023-03-15",
  "gainLoss": {
    "dollars": 2000,
    "percent": 9.1
  },
  "holdingPeriod": "long-term"
}
```

### List Holdings
```http
GET /api/v1/portfolio/:portfolioId/holdings
Authorization: Bearer <token>

Query Parameters:
- sortBy: ticker|value|gainLoss (default: value)
- order: asc|desc (default: desc)
- assetClass: stocks|bonds|crypto|realEstate (optional filter)

Response 200:
{
  "holdings": [
    {
      "id": "holding-001",
      "ticker": "VTI",
      "assetClass": "stocks",
      "quantity": 100,
      "currentValue": 22000,
      "gainLoss": {
        "dollars": 2000,
        "percent": 9.1
      }
    },
    {
      "id": "holding-002",
      "ticker": "BND",
      "assetClass": "bonds",
      "quantity": 200,
      "currentValue": 15600,
      "gainLoss": {
        "dollars": -400,
        "percent": -2.5
      }
    }
  ],
  "total": 2
}
```

### Update Holding
```http
PUT /api/v1/portfolio/:portfolioId/holdings/:holdingId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "quantity": 120,
  "currentValue": 26400
}

Response 200:
{
  "id": "holding-001",
  "ticker": "VTI",
  "quantity": 120,
  "currentValue": 26400,
  "gainLoss": {
    "dollars": 2400,
    "percent": 9.9
  }
}
```

### Delete Holding
```http
DELETE /api/v1/portfolio/:portfolioId/holdings/:holdingId
Authorization: Bearer <token>

Response 200:
{
  "message": "Holding deleted successfully"
}
```

---

## Analysis Endpoints

### Risk Assessment
```http
GET /api/v1/analysis/risk/:portfolioId
Authorization: Bearer <token>

Response 200:
{
  "portfolioId": "portfolio-789",
  "riskMetrics": {
    "volatility": 0.18,
    "sharpeRatio": 1.45,
    "maxDrawdown": -22.5
  },
  "riskClassification": {
    "level": "medium",
    "stocksPercent": 65,
    "bondsPercent": 35,
    "riskScore": 6.2
  },
  "vsUserTolerance": {
    "userTolerance": "medium",
    "match": true,
    "recommendation": "Portfolio matches your risk tolerance"
  }
}
```

### Tax Optimization
```http
GET /api/v1/analysis/tax-optimization/:portfolioId
Authorization: Bearer <token>

Response 200:
{
  "portfolioId": "portfolio-789",
  "opportunities": [
    {
      "id": "opport-001",
      "holding": {
        "ticker": "VXUS",
        "unrealizedLoss": 285
      },
      "taxSavings": 85,
      "holdingPeriod": "short-term",
      "recommendation": {
        "action": "swap",
        "currentFund": "VXUS",
        "replacementFund": "VEA",
        "reason": "Similar fund, avoids wash sale"
      },
      "washSaleWarning": "Cannot rebuy VXUS for 30 days"
    }
  ],
  "estimatedTotalTaxSavings": 85,
  "estimatedCapitalGainsTax": 1250,
  "harvestingWindow": "Open - harvest anytime"
}
```

### Rebalancing Suggestions
```http
GET /api/v1/analysis/rebalancing/:portfolioId
Authorization: Bearer <token>

Response 200:
{
  "portfolioId": "portfolio-789",
  "currentAllocation": {
    "stocks": 70,
    "bonds": 20,
    "realEstate": 10
  },
  "targetAllocation": {
    "stocks": 60,
    "bonds": 30,
    "realEstate": 10
  },
  "drift": {
    "stocks": 10,
    "bonds": -10,
    "realEstate": 0
  },
  "threshold": 5,
  "needsRebalancing": true,
  "suggestedTrades": [
    {
      "action": "sell",
      "ticker": "VTI",
      "shares": 23,
      "amount": 5060
    },
    {
      "action": "buy",
      "ticker": "BND",
      "shares": 75,
      "amount": 5850
    }
  ],
  "taxImpact": {
    "realizedGains": 500,
    "estimatedTax": 150
  }
}
```

---

## Goals Endpoints

### Create Goal
```http
POST /api/v1/goals
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "goalName": "Home Down Payment",
  "targetAmount": 100000,
  "currentAmount": 32000,
  "targetDate": "2026-12-31",
  "priority": "high",
  "riskTolerance": "medium"
}

Response 201:
{
  "id": "goal-001",
  "userId": "user-123",
  "goalName": "Home Down Payment",
  "targetAmount": 100000,
  "currentAmount": 32000,
  "targetDate": "2026-12-31",
  "priority": "high",
  "riskTolerance": "medium",
  "analysis": {
    "progressPercent": 32,
    "requiredMonthlySavings": 5625,
    "requiredAnnualReturn": 0.08,
    "recommendedAllocation": {
      "stocks": 65,
      "bonds": 35
    }
  }
}
```

### List Goals
```http
GET /api/v1/goals
Authorization: Bearer <token>

Response 200:
{
  "goals": [
    {
      "id": "goal-001",
      "goalName": "Home Down Payment",
      "progressPercent": 32,
      "onTrack": true,
      "requiredMonthlySavings": 5625
    },
    {
      "id": "goal-002",
      "goalName": "Emergency Fund",
      "progressPercent": 72,
      "onTrack": true,
      "requiredMonthlySavings": 2500
    }
  ],
  "total": 2
}
```

---

## Recommendations Endpoints

### List Recommendations
```http
GET /api/v1/recommendations
Authorization: Bearer <token>

Query Parameters:
- priorityFilter: high|medium|low (optional)
- limit: 5 (default)

Response 200:
{
  "recommendations": [
    {
      "id": "rec-001",
      "type": "rebalancing",
      "title": "Rebalance Your Portfolio",
      "description": "Your portfolio is overweight in stocks...",
      "priority": "high",
      "estimatedImpact": {
        "type": "risk-reduction",
        "value": "5% less volatility"
      },
      "status": "pending",
      "createdAt": "2026-05-08T10:00:00Z"
    },
    {
      "id": "rec-002",
      "type": "tax-optimization",
      "title": "Tax Loss Harvesting Opportunity",
      "description": "You have $2,500 in unrealized losses...",
      "priority": "medium",
      "estimatedImpact": {
        "type": "tax-savings",
        "value": "$1,000"
      },
      "status": "pending",
      "createdAt": "2026-05-08T10:30:00Z"
    }
  ],
  "total": 5
}
```

### Accept/Dismiss Recommendation
```http
PUT /api/v1/recommendations/:recommendationId
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "action": "accept"  // or "dismiss"
}

Response 200:
{
  "id": "rec-001",
  "status": "accepted",
  "updatedAt": "2026-05-08T11:00:00Z"
}
```

---

## Dashboard Endpoint

### Get Dashboard Summary
```http
GET /api/v1/dashboard/summary
Authorization: Bearer <token>

Response 200:
{
  "metrics": {
    "totalSavings": 50000,
    "portfolioValue": 85000,
    "monthlySavingsRate": 2000,
    "activeGoalsCount": 3,
    "portfolioPerformance": {
      "today": {
        "change": 215,
        "changePercent": 0.25
      },
      "oneMonth": {
        "change": 1850,
        "changePercent": 2.23
      },
      "yearToDate": {
        "change": 4250,
        "changePercent": 5.25
      }
    }
  },
  "portfolio": {
    "allocation": {
      "stocks": 70,
      "bonds": 20,
      "realEstate": 10
    },
    "totalValue": 85000
  },
  "topRecommendations": [
    {
      "id": "rec-001",
      "title": "Rebalance Your Portfolio",
      "impact": "High"
    }
  ]
}
```

---

## Common Response Codes

```
200 OK                - Request successful
201 Created          - Resource created
400 Bad Request      - Invalid input
401 Unauthorized     - Missing/invalid token
403 Forbidden        - No permission
404 Not Found        - Resource not found
409 Conflict         - Resource already exists
422 Unprocessable    - Validation error
500 Server Error     - Internal error
```

---

## Error Response Format

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "currentSavings",
      "message": "Must be a positive number"
    }
  ],
  "timestamp": "2026-05-08T10:00:00Z"
}
```

---

## Rate Limiting (Future Sprint)

```
Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1715175600

Limits:
- Unauthenticated: 30 req/min
- Authenticated: 100 req/min
- File upload: 10 req/min
```

---

*Created: 2026-05-08*  
*For: Investment Advisor MVP - Sprint 1*
