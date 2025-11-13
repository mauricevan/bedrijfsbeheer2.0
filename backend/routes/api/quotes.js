/**
 * Quote Routes
 * /api/quotes
 */

import express from 'express';
import * as quoteController from '../../controllers/quoteController.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateBody, quoteSchema } from '../../middleware/validate.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List & Create
router.get('/', quoteController.listQuotes);
router.post('/', requireAdmin, validateBody(quoteSchema), quoteController.createQuote);

// Single resource
router.get('/:id', quoteController.getQuote);
router.put('/:id', requireAdmin, validateBody(quoteSchema), quoteController.updateQuote);
router.delete('/:id', requireAdmin, quoteController.deleteQuote);

export default router;
