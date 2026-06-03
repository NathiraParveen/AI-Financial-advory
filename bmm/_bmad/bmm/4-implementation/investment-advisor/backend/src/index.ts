import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import aiRoutes from '@/api/routes/aiRoutes';
import authRoutes from '@/api/routes/authRoutes';
import savingsRoutes from '@/api/routes/savingsRoutes';
import portfolioRoutes from '@/api/routes/portfolioRoutes';
import recommendationsRoutes from '@/api/routes/recommendationsRoutes';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API endpoints placeholder
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Investment Advisor API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      savings: '/api/v1/savings',
      portfolio: '/api/v1/portfolio',
      recommendations: '/api/v1/recommendations',
      analysis: '/api/v1/analysis',
      ai: '/api/v1/ai',
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/savings', savingsRoutes);
app.use('/api/v1/portfolio', portfolioRoutes);
app.use('/api/v1/recommendations', recommendationsRoutes);
app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error({
    error: err.message,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Investment Advisor API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
