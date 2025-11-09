import { Router } from 'express';
import { body, param } from 'express-validator';
import * as clientController from '../controllers/clientController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/clients
 * Get all clients
 */
router.get('/', clientController.getClients);

/**
 * GET /api/clients/:id
 * Get single client
 */
router.get(
  '/:id',
  validate([param('id').isString()]),
  clientController.getClient
);

/**
 * POST /api/clients
 * Create new client
 */
router.post(
  '/',
  validate([
    body('name').notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('businessName').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('province').optional().isIn([
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]),
    body('postalCode').optional().trim(),
    body('paymentTerms').optional().isInt({ min: 0 }),
    body('notes').optional().trim(),
  ]),
  clientController.createClient
);

/**
 * PUT /api/clients/:id
 * Update client
 */
router.put(
  '/:id',
  validate([
    param('id').isString(),
    body('name').notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().trim(),
    body('businessName').optional().trim(),
    body('address').optional().trim(),
    body('city').optional().trim(),
    body('province').optional().isIn([
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]),
    body('postalCode').optional().trim(),
    body('paymentTerms').optional().isInt({ min: 0 }),
    body('notes').optional().trim(),
  ]),
  clientController.updateClient
);

/**
 * DELETE /api/clients/:id
 * Delete client
 */
router.delete(
  '/:id',
  validate([param('id').isString()]),
  clientController.deleteClient
);

export default router;
