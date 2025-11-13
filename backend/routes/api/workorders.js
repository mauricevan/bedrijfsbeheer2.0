/**
 * WorkOrder Routes
 * /api/workorders
 */

import express from 'express';
import * as workOrderController from '../../controllers/workOrderController.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateBody, workOrderSchema } from '../../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', workOrderController.listWorkOrders);
router.post('/', requireAdmin, validateBody(workOrderSchema), workOrderController.createWorkOrder);

router.get('/:id', workOrderController.getWorkOrder);
router.put('/:id', workOrderController.updateWorkOrder); // Users can update their own
router.delete('/:id', requireAdmin, workOrderController.deleteWorkOrder);

export default router;
