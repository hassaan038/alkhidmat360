import express from 'express';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { signupSchema, loginSchema } from '../validators/authValidator.js';

const router = express.Router();

// Public routes
router.post('/signup', validateRequest(signupSchema), authController.signup);
router.post('/login', validateRequest(loginSchema), authController.login);

// Protected routes
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

export default router;
