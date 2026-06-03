# Database Schema & Data Models - Investment Advisor MVP

## Database Schema Overview

**Database Type:** SQLite (File-based: dev.db)
**ORM:** Prisma
**Approach:** Type-safe queries with TypeScript integration

---

## Data Models

### User Model
```prisma
model User {
  id                String         @id @default(cuid())
  email             String         @unique
  name              String
  passwordHash      String
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  savings           Savings?
  portfolios        Portfolio[]
  goals             SavingsGoal[]
  recommendations   Recommendation[]
  
  @@index([email])
}
```

### Savings Model
```prisma
model Savings {
  id                String         @id @default(cuid())
  userId            String         @unique
  currentSavings    Float
  monthlyIncome     Float
  monthlySavings    Float
  savingStartDate   DateTime
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### SavingsGoal Model
```prisma
model SavingsGoal {
  id                String         @id @default(cuid())
  userId            String
  goalName          String
  targetAmount      Float
  currentAmount     Float          @default(0)
  targetDate        DateTime
  priority          String         // high | medium | low
  riskTolerance     String         // conservative | moderate | aggressive
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}
```

### Portfolio Model
```prisma
model Portfolio {
  id                String         @id @default(cuid())
  userId            String
  name              String
  description       String?
  totalValue        Float          @default(0)
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  holdings          Holding[]
  alerts            RebalancingAlert[]
  taxOptimization   TaxOptimization?
  history           PortfolioHistory[]
  
  @@index([userId])
}
```

### Holding Model
```prisma
model Holding {
  id                String         @id @default(cuid())
  portfolioId       String
  ticker            String
  assetClass       String         // stocks | bonds | crypto | realEstate | other
  quantity          Float
  costBasis         Float
  currentValue      Float
  purchaseDate      DateTime
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  portfolio         Portfolio      @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@unique([portfolioId, ticker])
  @@index([portfolioId])
}
```

### Recommendation Model
```prisma
model Recommendation {
  id                String         @id @default(cuid())
  userId            String
  type              String         // rebalancing | tax-optimization | diversification | goal-adjustment
  title             String
  description       String
  rationale         String?
  estimatedImpact   String         // $$ amount or % improvement
  priority          String         // high | medium | low
  status            String         @default("pending") // pending | accepted | dismissed
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  
  // Relations
  user              User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}
```

### TaxOptimization Model
```prisma
model TaxOptimization {
  id                String         @id @default(cuid())
  portfolioId       String         @unique
  taxLossHarvestingOpportunities String? // JSON array
  estimatedTaxSavings Float        @default(0)
  estimatedCapitalGainsTax Float   @default(0)
  lastAnalyzedAt    DateTime       @default(now())
  
  // Relations
  portfolio         Portfolio      @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}
```

### RebalancingAlert Model
```prisma
model RebalancingAlert {
  id                String         @id @default(cuid())
  portfolioId       String         @unique
  targetAllocation  String         // JSON object
  currentAllocation String         // JSON object
  threshold         Float          @default(5) // percentage
  triggered         Boolean        @default(false)
  lastCheckedAt     DateTime       @default(now())
  
  // Relations
  portfolio         Portfolio      @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
}
```

### PortfolioHistory Model
```prisma
model PortfolioHistory {
  id                String         @id @default(cuid())
  portfolioId       String
  date              DateTime       @default(now())
  totalValue        Float
  dayChange         Float
  percentChange     Float
  
  // Relations
  portfolio         Portfolio      @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@index([portfolioId])
  @@index([date])
}
```

---

## Indexes & Query Optimization

### Primary Indexes
- User.email - Unique, for login lookups
- Savings.userId - For user's savings retrieval
- Portfolio.userId - For user's portfolios list
- Holding.portfolioId - For holdings by portfolio
- Recommendation.userId - For user's recommendations
- PortfolioHistory.portfolioId, date - For time-based queries

### Performance Considerations
- No N+1 queries (Prisma relations)
- Pagination for large result sets (default: 20 items)
- JSON fields for flexible data (tax opportunities)
- Cascade deletes to maintain referential integrity

---

## Data Relationships

```
User (1) ──┬─→ (1) Savings
           ├─→ (M) Portfolio
           │         ├─→ (M) Holding
           │         ├─→ (1) TaxOptimization
           │         ├─→ (1) RebalancingAlert
           │         └─→ (M) PortfolioHistory
           ├─→ (M) SavingsGoal
           └─→ (M) Recommendation
```

---

## Sample Queries

### Create User with Savings
```typescript
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    passwordHash: hashedPassword,
    savings: {
      create: {
        currentSavings: 50000,
        monthlyIncome: 8000,
        monthlySavings: 2000,
        savingStartDate: new Date('2023-01-01')
      }
    }
  },
  include: {
    savings: true
  }
});
```

### Get Portfolio with Holdings
```typescript
const portfolio = await prisma.portfolio.findUnique({
  where: { id: portfolioId },
  include: {
    holdings: {
      orderBy: { currentValue: 'desc' }
    },
    history: {
      orderBy: { date: 'desc' },
      take: 30 // Last 30 days
    }
  }
});
```

### Update Goal Progress
```typescript
const goal = await prisma.savingsGoal.update({
  where: { id: goalId },
  data: {
    currentAmount: newAmount,
    updatedAt: new Date()
  }
});
```

---

## Migration Strategy

### Database Migration Process
1. Create migration: `npx prisma migrate dev --name [name]`
2. Review generated SQL
3. Test on dev database
4. Deploy to production
5. Track migration history

### Seed Data (Development)
- 2 test users with complete profiles
- 4 sample portfolios with 20+ holdings
- 5 example goals
- 10 sample recommendations
- Tax optimization opportunities
- Rebalancing alerts

**Command:** `npm run db:seed`

---

## Data Validation Rules

### User
- Email: Valid format, unique
- Password: 8+ chars, hashed with bcrypt

### Savings
- currentSavings: >= 0
- monthlyIncome: > 0
- monthlySavings: >= 0
- savingStartDate: Valid date, not in future

### Portfolio Holding
- Ticker: Non-empty string (max 10 chars)
- Quantity: > 0
- costBasis: >= 0
- currentValue: >= 0
- purchaseDate: Valid date, not in future

### SavingsGoal
- goalName: Non-empty
- targetAmount: > 0
- targetDate: In future
- priority: enum (high | medium | low)
- riskTolerance: enum (conservative | moderate | aggressive)

---

## Backup & Recovery

**Backup Strategy:**
- Daily automated backup of SQLite file
- Version control includes schema
- Point-in-time recovery via Prisma migrations

**Recovery Process:**
1. Identify target backup
2. Restore SQLite file
3. Verify data integrity
4. Run Prisma migrations if needed

---

*Created: 2026-05-08*  
*For: Investment Advisor MVP - Sprint 1*
