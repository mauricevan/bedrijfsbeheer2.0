/**
 * Invoice Routes
 * /api/invoices
 */

import express from 'express';
import * as invoiceController from '../../controllers/invoiceController.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateBody, invoiceSchema } from '../../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', invoiceController.listInvoices);
router.post('/', requireAdmin, validateBody(invoiceSchema), invoiceController.createInvoice);

router.get('/:id', invoiceController.getInvoice);
router.put('/:id', requireAdmin, invoiceController.updateInvoice);
router.delete('/:id', requireAdmin, invoiceController.deleteInvoice);

export default router;
