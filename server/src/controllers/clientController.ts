import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

/**
 * Get all clients for current user
 */
export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { search, province } = req.query;

    const where: any = {
      userId: req.user.id,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { businessName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (province) {
      where.province = province;
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: clients,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Get clients error:', error);
    throw new AppError('Failed to get clients', 500);
  }
};

/**
 * Get single client
 */
export const getClient = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Get client error:', error);
    throw new AppError('Failed to get client', 500);
  }
};

/**
 * Create new client
 */
export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const {
      name,
      email,
      phone,
      businessName,
      address,
      city,
      province,
      postalCode,
      paymentTerms,
      notes,
    } = req.body;

    const client = await prisma.client.create({
      data: {
        userId: req.user.id,
        name,
        email,
        phone,
        businessName,
        address,
        city,
        province,
        postalCode,
        paymentTerms,
        notes,
      },
    });

    res.status(201).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Create client error:', error);
    throw new AppError('Failed to create client', 500);
  }
};

/**
 * Update client
 */
export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;
    const {
      name,
      email,
      phone,
      businessName,
      address,
      city,
      province,
      postalCode,
      paymentTerms,
      notes,
    } = req.body;

    // Check if client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingClient) {
      throw new AppError('Client not found', 404);
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        businessName,
        address,
        city,
        province,
        postalCode,
        paymentTerms,
        notes,
      },
    });

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Update client error:', error);
    throw new AppError('Failed to update client', 500);
  }
};

/**
 * Delete client
 */
export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    const { id } = req.params;

    // Check if client belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!existingClient) {
      throw new AppError('Client not found', 404);
    }

    if (existingClient._count.invoices > 0) {
      throw new AppError('Cannot delete client with existing invoices', 400);
    }

    await prisma.client.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Delete client error:', error);
    throw new AppError('Failed to delete client', 500);
  }
};
