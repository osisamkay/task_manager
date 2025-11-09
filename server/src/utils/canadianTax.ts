/**
 * Canadian Tax Calculation Engine
 * Handles GST, PST, HST, and QST calculations for all provinces
 */

export enum Province {
  AB = 'AB', // Alberta
  BC = 'BC', // British Columbia
  MB = 'MB', // Manitoba
  NB = 'NB', // New Brunswick
  NL = 'NL', // Newfoundland and Labrador
  NT = 'NT', // Northwest Territories
  NS = 'NS', // Nova Scotia
  NU = 'NU', // Nunavut
  ON = 'ON', // Ontario
  PE = 'PE', // Prince Edward Island
  QC = 'QC', // Quebec
  SK = 'SK', // Saskatchewan
  YT = 'YT', // Yukon
}

export interface TaxRate {
  gst: number;
  pst: number;
  hst: number;
  qst: number;
  combined: number;
}

export interface TaxBreakdown {
  subtotal: number;
  gst: number;
  pst: number;
  hst: number;
  qst: number;
  total: number;
  province: Province;
}

/**
 * Current Canadian tax rates by province (as of 2024)
 * Note: These should be periodically updated to reflect CRA changes
 */
export const TAX_RATES: Record<Province, TaxRate> = {
  [Province.AB]: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  [Province.BC]: { gst: 5, pst: 7, hst: 0, qst: 0, combined: 12 },
  [Province.MB]: { gst: 5, pst: 7, hst: 0, qst: 0, combined: 12 },
  [Province.NB]: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  [Province.NL]: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  [Province.NT]: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  [Province.NS]: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  [Province.NU]: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
  [Province.ON]: { gst: 0, pst: 0, hst: 13, qst: 0, combined: 13 },
  [Province.PE]: { gst: 0, pst: 0, hst: 15, qst: 0, combined: 15 },
  [Province.QC]: { gst: 5, pst: 0, hst: 0, qst: 9.975, combined: 14.975 },
  [Province.SK]: { gst: 5, pst: 6, hst: 0, qst: 0, combined: 11 },
  [Province.YT]: { gst: 5, pst: 0, hst: 0, qst: 0, combined: 5 },
};

/**
 * Calculate Canadian taxes for a given province and subtotal
 * @param subtotal - Amount before tax (in cents)
 * @param province - Canadian province code
 * @returns Tax breakdown with all amounts in cents
 */
export function calculateTax(subtotal: number, province: Province): TaxBreakdown {
  const rates = TAX_RATES[province];

  if (!rates) {
    throw new Error(`Invalid province: ${province}`);
  }

  // All calculations in cents to avoid floating point issues
  const gst = rates.hst > 0 ? 0 : Math.round(subtotal * (rates.gst / 100));
  const pst = Math.round(subtotal * (rates.pst / 100));
  const hst = Math.round(subtotal * (rates.hst / 100));

  // For Quebec, QST is calculated on subtotal + GST
  const qst = rates.qst > 0
    ? Math.round((subtotal + gst) * (rates.qst / 100))
    : 0;

  const total = subtotal + gst + pst + hst + qst;

  return {
    subtotal,
    gst,
    pst,
    hst,
    qst,
    total,
    province,
  };
}

/**
 * Extract tax from a total amount (reverse calculation)
 * @param total - Total amount including tax (in cents)
 * @param province - Canadian province code
 * @returns Tax breakdown with subtotal and taxes
 */
export function extractTaxFromTotal(total: number, province: Province): TaxBreakdown {
  const rates = TAX_RATES[province];

  if (!rates) {
    throw new Error(`Invalid province: ${province}`);
  }

  const combinedRate = rates.combined / 100;

  // For Quebec with compound QST
  if (province === Province.QC) {
    // Total = Subtotal * (1 + GST_rate) * (1 + QST_rate)
    const gstRate = rates.gst / 100;
    const qstRate = rates.qst / 100;
    const divisor = (1 + gstRate) * (1 + qstRate);
    const subtotal = Math.round(total / divisor);

    return calculateTax(subtotal, province);
  }

  // For other provinces
  const subtotal = Math.round(total / (1 + combinedRate));
  return calculateTax(subtotal, province);
}

/**
 * Format currency in Canadian dollars
 * @param cents - Amount in cents
 * @returns Formatted string (e.g., "$1,234.56")
 */
export function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(dollars);
}

/**
 * Get province name from code
 */
export function getProvinceName(province: Province): string {
  const names: Record<Province, string> = {
    [Province.AB]: 'Alberta',
    [Province.BC]: 'British Columbia',
    [Province.MB]: 'Manitoba',
    [Province.NB]: 'New Brunswick',
    [Province.NL]: 'Newfoundland and Labrador',
    [Province.NT]: 'Northwest Territories',
    [Province.NS]: 'Nova Scotia',
    [Province.NU]: 'Nunavut',
    [Province.ON]: 'Ontario',
    [Province.PE]: 'Prince Edward Island',
    [Province.QC]: 'Quebec',
    [Province.SK]: 'Saskatchewan',
    [Province.YT]: 'Yukon',
  };

  return names[province];
}

/**
 * Get tax type display name for a province
 */
export function getTaxTypeName(province: Province): string {
  const rates = TAX_RATES[province];

  if (rates.hst > 0) {
    return 'HST';
  }

  const parts: string[] = [];
  if (rates.gst > 0) parts.push('GST');
  if (rates.pst > 0) parts.push('PST');
  if (rates.qst > 0) parts.push('QST');

  return parts.join(' + ');
}
