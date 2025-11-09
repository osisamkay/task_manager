import { Router } from 'express';
import { body, param } from 'express-validator';
import * as invoiceController from '../controllers/invoiceController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/invoices
 * Get all invoices
 */
router.get('/', invoiceController.getInvoices);

/**
 * GET /api/invoices/:id
 * Get single invoice
 */
router.get(
  '/:id',
  validate([param('id').isString()]),
  invoiceController.getInvoice
);

/**
 * POST /api/invoices
 * Create new invoice
 */
router.post(
  '/',
  validate([
    body('clientId').isString().notEmpty(),
    body('invoiceNumber').optional().isString(),
    body('issueDate').isISO8601(),
    body('dueDate').isISO8601(),
    body('province').isIn([
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]),
    body('items').isArray({ min: 1 }),
    body('items.*.description').notEmpty().trim(),
    body('items.*.quantity').isFloat({ min: 0.01 }),
    body('items.*.rate').isInt({ min: 0 }),
    body('items.*.taxExempt').optional().isBoolean(),
    body('notes').optional().trim(),
    body('terms').optional().trim(),
  ]),
  invoiceController.createInvoice
);

/**
 * PUT /api/invoices/:id
 * Update invoice
 */
router.put(
  '/:id',
  validate([
    param('id').isString(),
    body('clientId').optional().isString(),
    body('issueDate').optional().isISO8601(),
    body('dueDate').optional().isISO8601(),
    body('province').optional().isIn([
      'AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
    ]),
    body('items').optional().isArray({ min: 1 }),
    body('items.*.description').optional().notEmpty().trim(),
    body('items.*.quantity').optional().isFloat({ min: 0.01 }),
    body('items.*.rate').optional().isInt({ min: 0 }),
    body('items.*.taxExempt').optional().isBoolean(),
    body('notes').optional().trim(),
    body('terms').optional().trim(),
    body('status').optional().isIn(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
  ]),
  invoiceController.updateInvoice
);

/**
 * DELETE /api/invoices/:id
 * Delete invoice
 */
router.delete(
  '/:id',
  validate([param('id').isString()]),
  invoiceController.deleteInvoice
);

/**
 * POST /api/invoices/:id/payments
 * Add payment to invoice
 */
router.post(
  '/:id/payments',
  validate([
    param('id').isString(),
    body('amount').isInt({ min: 1 }),
    body('paidAt').optional().isISO8601(),
    body('method').optional().isString(),
    body('reference').optional().isString(),
    body('notes').optional().trim(),
  ]),
  invoiceController.addPayment
);

export default router;
