/**
 * Auth Routes
 * POST /api/auth/register, /login, /me
 */

import express from 'express';
import * as authController from '../../controllers/authController.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validateBody, registerSchema, loginSchema } from '../../middleware/validate.js';

const router = express.Router();

// Public routes
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);

export default router;
