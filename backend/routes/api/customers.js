/**
 * Customer Routes
 * /api/customers
 */

import express from 'express';
import * as customerController from '../../controllers/customerController.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateBody, customerSchema } from '../../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.listCustomers);
router.post('/', requireAdmin, validateBody(customerSchema), customerController.createCustomer);

router.get('/:id', customerController.getCustomer);
router.put('/:id', requireAdmin, validateBody(customerSchema), customerController.updateCustomer);
router.delete('/:id', requireAdmin, customerController.deleteCustomer);

export default router;
