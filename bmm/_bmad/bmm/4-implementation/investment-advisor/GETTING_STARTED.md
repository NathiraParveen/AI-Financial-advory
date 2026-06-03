# Getting Started with Investment Advisor

## Quick Setup (5 minutes with Docker)

### Prerequisites
- Docker & Docker Compose
- Git (optional)

### Step 1: Navigate to Project Directory
```bash
cd bmm/_bmad/bmm/4-implementation/investment-advisor
```

### Step 2: Start All Services
```bash
docker-compose up --build
```

This will:
- ✅ Create SQLite database (file-based, no installation needed)
- ✅ Build and start backend API
- ✅ Build and start frontend app

### Step 3: Access the Application
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api/v1
- **Health Check**: http://localhost:5000/health

---

## Manual Setup (for development)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Edit .env.local with your settings
# Minimal settings:
# DATABASE_URL=file:./prisma/dev.db
# PORT=5000
# JWT_SECRET=your-dev-secret
# OPENAI_API_KEY=sk-your-key-here   (required for AI features)

# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:migrate

# Start development server
npm run dev
```

Backend will be available at http://localhost:5000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

---

## Project Structure Overview

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `backend/src/services/` | Business logic (analysis, recommendations, portfolio) |
| `backend/src/api/` | API route handlers |
| `backend/prisma/` | Database schema and migrations |
| `frontend/src/pages/` | Main page components |
| `frontend/src/components/` | Reusable UI components |
| `frontend/src/services/` | API client |
| `shared/` | Shared TypeScript types |

---

## Available Scripts

### Backend
```bash
npm run dev              # Start dev server with hot reload
npm run build           # Build TypeScript
npm start               # Run production build
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate Prisma client
npm run test            # Run tests
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
```

### Frontend
```bash
npm run dev             # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run test            # Run tests
npm run lint            # Run ESLint
```

---

## Core Features Available

### 1. Dashboard
- Overview of savings and portfolio
- Quick metrics display
- Recent recommendations
- Status indicators

### 2. Savings Analysis
- Upload savings data (CSV)
- Analyze current position
- Savings rate calculation
- Projections

### 3. Portfolio Management
- Track multiple portfolios
- Monitor holdings
- View allocations
- Historical data

### 4. Recommendations
- Investment recommendations
- Rebalancing alerts
- Tax optimization suggestions
- Goal alignment checks

### 5. Goal Planning
- Set financial goals
- Track progress
- Priority management
- Timeline tracking

### 6. Tax Optimization
- Tax-loss harvesting opportunities
- Capital gains analysis
- Tax-efficient strategies
- Estimated tax savings

---

## API Examples

### Create User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword"
  }'
```

### Get Savings
```bash
curl -X GET http://localhost:5000/api/v1/savings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Upload Portfolio CSV
```bash
curl -X POST http://localhost:5000/api/v1/portfolio/PORTFOLIO_ID/upload-csv \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@portfolio.csv"
```

---

## Sample CSV Formats

### Savings CSV
```csv
date,savings_amount,monthly_income,monthly_expenses
2024-01-01,50000,6000,4000
2024-02-01,53000,6000,4000
```

### Portfolio CSV
```csv
ticker,asset_class,quantity,purchase_price,purchase_date,current_price
VTSAX,stocks,100,70.50,2023-01-15,85.20
VBTLX,bonds,50,80.00,2023-02-01,81.50
VTI,stocks,25,220.00,2023-03-10,245.75
```

---

## Troubleshooting

### Database Connection Error
- SQLite is file-based — no server to start. Check that `backend/prisma/dev.db` exists.
- If missing, run: `npm run db:migrate` to create it
- Verify `DATABASE_URL=file:./prisma/dev.db` in `.env.local`

### Frontend API Connection Issues
- Ensure backend is running on port 5000
- Check CORS_ORIGIN setting
- Verify proxy in vite.config.ts

### Docker Issues
- Clean up: `docker-compose down -v`
- Rebuild: `docker-compose up --build`
- Check logs: `docker-compose logs`

---

## Development Tips

1. **Use TypeScript**: All code is typed - leverage IDE autocomplete
2. **Check Services**: Business logic in `/backend/src/services/`
3. **Material-UI Docs**: Reference https://mui.com for components
4. **Prisma**: Use `npx prisma studio` to view database

---

## Next Steps

1. Customize styles in `frontend/src/index.css`
2. Add market data integration (Alpha Vantage, Yahoo Finance)
3. Implement banking API integration (Plaid)
4. Add advanced charting (Recharts)
5. Set up CI/CD pipeline
6. Deploy to production

---

## Support & Resources

- **Backend Framework**: [Express.js](https://expressjs.com)
- **Frontend Framework**: [React](https://react.dev)
- **Database ORM**: [Prisma](https://www.prisma.io)
- **UI Library**: [Material-UI](https://mui.com)
- **Docker**: [Docker Docs](https://docs.docker.com)

---

Happy developing! 🚀
