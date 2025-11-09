import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface InvoiceCreateInput {
  clientId: string;
  invoiceNumber?: string;
  issueDate: Date;
  dueDate: Date;
  province: string;
  items: InvoiceItemInput[];
  notes?: string;
  terms?: string;
}

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  rate: number;
  taxExempt?: boolean;
}

export interface ClientCreateInput {
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  paymentTerms?: number;
  notes?: string;
}
