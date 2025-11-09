import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, InvoiceCreateInput } from '../types';
import { calculateTax, Province } from '../utils/canadianTax';

const prisma = new PrismaClient();

/**
 * Generate next invoice number
 */
async function generateInvoiceNumber(userId: string): Promise<string> {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  if (!lastInvoice) {
    return 'INV-0001';
  }

  // Extract number from last invoice (e.g., "INV-0001" -> 1)
  const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
  const lastNumber = match ? parseInt(match[1], 10) : 0;
  const nextNumber = lastNumber + 1;

  return `INV-${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Calculate invoice totals with tax
 */
function calculateInvoiceTotals(
  items: Array<{ quantity: number; rate: number; taxExempt: boolean }>,
  province: Province
) {
  // Calculate subtotal (all amounts in cents)
  const subtotal = items.reduce((sum, item) => {
    return sum + Math.round(item.quantity * item.rate);
  }, 0);

  // Calculate taxable subtotal (excluding tax-exempt items)
  const taxableSubtotal = items.reduce((sum, item) => {
    if (item.taxExempt) return sum;
    return sum + Math.round(item.quantity * item.rate);
  }, 0);

  // Calculate tax on taxable items
  const taxBreakdown = calculateTax(taxableSubtotal, province);

  return {
    subtotal,
    taxAmount: taxBreakdown.total - taxBreakdown.subtotal,
    total: subtotal + (taxBreakdown.total - taxBreakdown.subtotal),
  };
}

/**
 * Get all invoices
 */
export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { status, paymentStatus, clientId } = req.query;

    const where: any = {
      userId: req.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
          },
        },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Get invoices error:', error);
    throw new AppError('Failed to get invoices', 500);
  }
};

/**
 * Get single invoice
 */
export const getInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        client: true,
        items: {
          orderBy: { order: 'asc' },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Get invoice error:', error);
    throw new AppError('Failed to get invoice', 500);
  }
};

/**
 * Create new invoice
 */
export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const {
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      province,
      items,
      notes,
      terms,
    }: InvoiceCreateInput = req.body;

    // Verify client belongs to user
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        userId: req.user.id,
      },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Generate invoice number if not provided
    const finalInvoiceNumber = invoiceNumber || await generateInvoiceNumber(req.user.id);

    // Check for duplicate invoice number
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: req.user.id,
        invoiceNumber: finalInvoiceNumber,
      },
    });

    if (existingInvoice) {
      throw new AppError('Invoice number already exists', 400);
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(items, province as Province);

    // Create invoice with items
    const invoice = await prisma.invoice.create({
      data: {
        userId: req.user.id,
        clientId,
        invoiceNumber: finalInvoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        province: province as any,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes,
        terms,
        items: {
          create: items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            rate: Math.round(item.rate), // Convert to cents
            amount: Math.round(item.quantity * item.rate),
            taxExempt: item.taxExempt || false,
            order: index,
          })),
        },
      },
      include: {
        client: true,
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Create invoice error:', error);
    throw new AppError('Failed to create invoice', 500);
  }
};

/**
 * Update invoice
 */
export const updateInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const {
      clientId,
      issueDate,
      dueDate,
      province,
      items,
      notes,
      terms,
      status,
    } = req.body;

    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingInvoice) {
      throw new AppError('Invoice not found', 404);
    }

    // If client is being changed, verify it belongs to user
    if (clientId && clientId !== existingInvoice.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
          userId: req.user.id,
        },
      });

      if (!client) {
        throw new AppError('Client not found', 404);
      }
    }

    // Calculate new totals if items or province changed
    let updateData: any = {
      issueDate: issueDate ? new Date(issueDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      terms,
      status,
    };

    if (clientId) {
      updateData.clientId = clientId;
    }

    if (items && province) {
      const totals = calculateInvoiceTotals(items, province as Province);
      updateData.province = province;
      updateData.subtotal = totals.subtotal;
      updateData.taxAmount = totals.taxAmount;
      updateData.total = totals.total;

      // Delete existing items and create new ones
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        ...updateData,
        ...(items && {
          items: {
            create: items.map((item: any, index: number) => ({
              description: item.description,
              quantity: item.quantity,
              rate: Math.round(item.rate),
              amount: Math.round(item.quantity * item.rate),
              taxExempt: item.taxExempt || false,
              order: index,
            })),
          },
        }),
      },
      include: {
        client: true,
        items: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Update invoice error:', error);
    throw new AppError('Failed to update invoice', 500);
  }
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Verify invoice belongs to user
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingInvoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Don't allow deleting paid invoices
    if (existingInvoice.paymentStatus === 'PAID') {
      throw new AppError('Cannot delete paid invoice', 400);
    }

    await prisma.invoice.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Delete invoice error:', error);
    throw new AppError('Failed to delete invoice', 500);
  }
};

/**
 * Add payment to invoice
 */
export const addPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const { amount, paidAt, method, reference, notes } = req.body;

    // Verify invoice belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        payments: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Calculate total paid
    const currentPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const newTotalPaid = currentPaid + Math.round(amount);

    // Determine payment status
    let paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
    if (newTotalPaid >= invoice.total) {
      paymentStatus = 'PAID';
    } else if (newTotalPaid > 0) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'UNPAID';
    }

    // Create payment and update invoice
    const payment = await prisma.payment.create({
      data: {
        invoiceId: id,
        amount: Math.round(amount),
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        method,
        reference,
        notes,
      },
    });

    await prisma.invoice.update({
      where: { id },
      data: {
        amountPaid: newTotalPaid,
        paymentStatus,
        paidAt: paymentStatus === 'PAID' ? new Date() : invoice.paidAt,
      },
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Add payment error:', error);
    throw new AppError('Failed to add payment', 500);
  }
};
