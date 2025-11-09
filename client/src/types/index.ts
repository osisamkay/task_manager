export type Province =
  | 'AB' | 'BC' | 'MB' | 'NB' | 'NL' | 'NT'
  | 'NS' | 'NU' | 'ON' | 'PE' | 'QC' | 'SK' | 'YT';

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  businessName?: string;
  address?: string;
  city?: string;
  province?: Province;
  postalCode?: string;
  paymentTerms?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  taxExempt: boolean;
  order: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  province: Province;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  notes?: string;
  terms?: string;
  client: Client;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  method?: string;
  reference?: string;
  notes?: string;
}

export const PROVINCES: Record<Province, string> = {
  AB: 'Alberta',
  BC: 'British Columbia',
  MB: 'Manitoba',
  NB: 'New Brunswick',
  NL: 'Newfoundland and Labrador',
  NT: 'Northwest Territories',
  NS: 'Nova Scotia',
  NU: 'Nunavut',
  ON: 'Ontario',
  PE: 'Prince Edward Island',
  QC: 'Quebec',
  SK: 'Saskatchewan',
  YT: 'Yukon',
};

export const TAX_RATES: Record<Province, { gst: number; pst: number; hst: number; qst: number; combined: number }> = {
  AB: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  BC: { gst: 5, pst: 7, hst: 0, qst: 0, combined: 12 },
  MB: { gst: 5, pst: 7, hst: 0, qst: 0, combined: 12 },
  NB: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  NL: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  NT: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  NS: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  NU: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  ON: { gst: 0, pst: 0, hst: 13, qst: 0, combined: 13 },
  PE: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  QC: { gst: 5, pst: 0, hst: 0, qst: 9.975, combined: 14.975 },
  SK: { gst: 5, pst: 6, hst: 0, qst: 0, combined: 11 },
  YT: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
};
