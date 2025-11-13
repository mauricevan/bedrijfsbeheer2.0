/**
 * API Routes - Main Router
 * Aggregates all API routes
 */

import express from 'express';
import authRoutes from './auth.js';
import quoteRoutes from './quotes.js';
import invoiceRoutes from './invoices.js';
import workOrderRoutes from './workorders.js';
import customerRoutes from './customers.js';
import inventoryRoutes from './inventory.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/quotes', quoteRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/workorders', workOrderRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);

export default router;
