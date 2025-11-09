import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('businessName').optional().trim(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
  ]),
  authController.register
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  validate([
    body('businessName').optional().trim(),
    body('businessNumber').optional().trim(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('province').optional().isIn([
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]),
    body('postalCode').optional().trim(),
    body('primaryColor').optional().isHexColor(),
  ]),
  authController.updateProfile
);

export default router;
