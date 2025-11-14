/**
 * Inventory Routes
 * /api/inventory
 */

import express from 'express';
import * as inventoryController from '../../controllers/inventoryController.js';
import { authenticate, requireAdmin } from '../../middleware/authenticate.js';
import { validateBody, inventorySchema } from '../../middleware/validate.js';

const router = express.Router();

router.use(authenticate);

router.get('/', inventoryController.listInventoryItems);
router.get('/low-stock', inventoryController.getLowStockItems);
router.post('/', requireAdmin, validateBody(inventorySchema), inventoryController.createInventoryItem);

router.get('/:id', inventoryController.getInventoryItem);
router.put('/:id', requireAdmin, validateBody(inventorySchema), inventoryController.updateInventoryItem);
router.delete('/:id', requireAdmin, inventoryController.deleteInventoryItem);

export default router;
