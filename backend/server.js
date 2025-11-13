/**
 * Bedrijfsbeheer Dashboard - Backend Server
 * Express.js + PostgreSQL + Prisma
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Te veel verzoeken van dit IP, probeer het later opnieuw'
});
app.use('/api', limiter);

// ============================================================================
// ROUTES
// ============================================================================

// API routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Bedrijfsbeheer Dashboard API',
    version: '1.0.0',
    status: 'running',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      quotes: '/api/quotes',
      invoices: '/api/invoices',
      workorders: '/api/workorders',
      customers: '/api/customers',
      inventory: '/api/inventory'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint niet gevonden',
    path: req.path,
    method: req.method
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use(errorHandler);

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Bedrijfsbeheer Dashboard Backend');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server:      http://localhost:${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔐 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
  console.log(`💾 Database:    ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📝 API Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me');
  console.log('   GET  /api/quotes');
  console.log('   GET  /api/invoices');
  console.log('   GET  /api/workorders');
  console.log('   GET  /api/customers');
  console.log('   GET  /api/inventory');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
