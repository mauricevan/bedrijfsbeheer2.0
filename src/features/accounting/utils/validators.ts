/**
 * Accounting Validators
 * Pure validatie functies voor accounting module
 */

import type {
  Quote,
  QuoteItem,
  Invoice,
  InvoiceItem,
  QuoteStatus,
  InvoiceStatus,
} from '../../../types';

import type {
  ValidationResult,
  ValidationError,
  QuoteFormData,
  InvoiceFormData,
} from '../types/accounting.types';

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Helper: Maak ValidationResult
 */
const createValidationResult = (errors: ValidationError[] = []): ValidationResult => {
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Helper: Maak ValidationError
 */
const createError = (field: string, message: string, code?: string): ValidationError => {
  return { field, message, code };
};

// ============================================================================
// QUOTE VALIDATORS
// ============================================================================

/**
 * Valideer quote form data
 */
export const validateQuoteForm = (data: QuoteFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Customer validatie
  if (!data.customerId) {
    errors.push(createError('customerId', 'Klant is verplicht', 'REQUIRED'));
  }

  if (!data.customerName || data.customerName.trim() === '') {
    errors.push(createError('customerName', 'Klantnaam is verplicht', 'REQUIRED'));
  }

  // Items validatie
  if (!data.items || data.items.length === 0) {
    errors.push(createError('items', 'Minimaal 1 item is verplicht', 'MIN_ITEMS'));
  }

  // VAT rate validatie
  if (data.vatRate < 0 || data.vatRate > 100) {
    errors.push(createError('vatRate', 'BTW percentage moet tussen 0 en 100 zijn', 'INVALID_VAT'));
  }

  // Labor validatie
  if (data.laborHours < 0) {
    errors.push(createError('laborHours', 'Arbeidsuren kunnen niet negatief zijn', 'INVALID_LABOR'));
  }

  if (data.hourlyRate < 0) {
    errors.push(createError('hourlyRate', 'Uurtarief kan niet negatief zijn', 'INVALID_RATE'));
  }

  // Valid until validatie (optioneel)
  if (data.validUntil) {
    const validUntilDate = new Date(data.validUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day

    if (validUntilDate < today) {
      errors.push(createError('validUntil', 'Geldig tot datum moet in de toekomst liggen', 'INVALID_DATE'));
    }
  }

  return createValidationResult(errors);
};

/**
 * Valideer quote items
 */
export const validateQuoteItems = (items: QuoteItem[]): ValidationResult => {
  const errors: ValidationError[] = [];

  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(createError(`items[${index}].description`, 'Omschrijving is verplicht', 'REQUIRED'));
    }

    if (item.quantity <= 0) {
      errors.push(createError(`items[${index}].quantity`, 'Aantal moet groter dan 0 zijn', 'INVALID_QUANTITY'));
    }

    if (item.unitPrice < 0) {
      errors.push(createError(`items[${index}].unitPrice`, 'Eenheidsprijs kan niet negatief zijn', 'INVALID_PRICE'));
    }

    if (item.total < 0) {
      errors.push(createError(`items[${index}].total`, 'Totaal kan niet negatief zijn', 'INVALID_TOTAL'));
    }

    // Check totaal berekening
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.total - expectedTotal) > 0.01) {
      errors.push(
        createError(
          `items[${index}].total`,
          'Totaal komt niet overeen met berekening (aantal × eenheidsprijs)',
          'INVALID_CALCULATION'
        )
      );
    }
  });

  return createValidationResult(errors);
};

/**
 * Valideer quote status transition
 */
export const validateQuoteStatusTransition = (
  currentStatus: QuoteStatus,
  newStatus: QuoteStatus
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Define allowed transitions
  const allowedTransitions: Record<QuoteStatus, QuoteStatus[]> = {
    draft: ['sent', 'expired'],
    sent: ['approved', 'rejected', 'expired'],
    approved: ['expired'], // Kan alleen expiren na approval
    rejected: [], // Finale status
    expired: [], // Finale status
  };

  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    errors.push(
      createError(
        'status',
        `Status kan niet van '${currentStatus}' naar '${newStatus}' worden gewijzigd`,
        'INVALID_TRANSITION'
      )
    );
  }

  return createValidationResult(errors);
};

/**
 * Valideer quote conversion naar invoice
 */
export const validateQuoteToInvoice = (quote: Quote): ValidationResult => {
  const errors: ValidationError[] = [];

  if (quote.status !== 'approved') {
    errors.push(createError('status', 'Alleen goedgekeurde offertes kunnen worden gefactureerd', 'NOT_APPROVED'));
  }

  if (quote.invoiceId) {
    errors.push(createError('invoiceId', 'Deze offerte heeft al een factuur', 'ALREADY_INVOICED'));
  }

  if (!quote.items || quote.items.length === 0) {
    errors.push(createError('items', 'Offerte heeft geen items', 'NO_ITEMS'));
  }

  return createValidationResult(errors);
};

// ============================================================================
// INVOICE VALIDATORS
// ============================================================================

/**
 * Valideer invoice form data
 */
export const validateInvoiceForm = (data: InvoiceFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  // Customer validatie
  if (!data.customerId) {
    errors.push(createError('customerId', 'Klant is verplicht', 'REQUIRED'));
  }

  if (!data.customerName || data.customerName.trim() === '') {
    errors.push(createError('customerName', 'Klantnaam is verplicht', 'REQUIRED'));
  }

  // Items validatie
  if (!data.items || data.items.length === 0) {
    errors.push(createError('items', 'Minimaal 1 item is verplicht', 'MIN_ITEMS'));
  }

  // VAT rate validatie
  if (data.vatRate < 0 || data.vatRate > 100) {
    errors.push(createError('vatRate', 'BTW percentage moet tussen 0 en 100 zijn', 'INVALID_VAT'));
  }

  // Labor validatie
  if (data.laborHours < 0) {
    errors.push(createError('laborHours', 'Arbeidsuren kunnen niet negatief zijn', 'INVALID_LABOR'));
  }

  if (data.hourlyRate < 0) {
    errors.push(createError('hourlyRate', 'Uurtarief kan niet negatief zijn', 'INVALID_RATE'));
  }

  // Date validatie
  if (!data.date) {
    errors.push(createError('date', 'Factuurdatum is verplicht', 'REQUIRED'));
  }

  if (!data.dueDate) {
    errors.push(createError('dueDate', 'Vervaldatum is verplicht', 'REQUIRED'));
  }

  if (data.date && data.dueDate) {
    const invoiceDate = new Date(data.date);
    const dueDate = new Date(data.dueDate);

    if (dueDate < invoiceDate) {
      errors.push(createError('dueDate', 'Vervaldatum moet na factuurdatum liggen', 'INVALID_DUE_DATE'));
    }
  }

  return createValidationResult(errors);
};

/**
 * Valideer invoice items
 */
export const validateInvoiceItems = (items: InvoiceItem[]): ValidationResult => {
  const errors: ValidationError[] = [];

  items.forEach((item, index) => {
    if (!item.description || item.description.trim() === '') {
      errors.push(createError(`items[${index}].description`, 'Omschrijving is verplicht', 'REQUIRED'));
    }

    if (item.quantity <= 0) {
      errors.push(createError(`items[${index}].quantity`, 'Aantal moet groter dan 0 zijn', 'INVALID_QUANTITY'));
    }

    if (item.unitPrice < 0) {
      errors.push(createError(`items[${index}].unitPrice`, 'Eenheidsprijs kan niet negatief zijn', 'INVALID_PRICE'));
    }

    if (item.total < 0) {
      errors.push(createError(`items[${index}].total`, 'Totaal kan niet negatief zijn', 'INVALID_TOTAL'));
    }

    // Check totaal berekening
    const expectedTotal = item.quantity * item.unitPrice;
    if (Math.abs(item.total - expectedTotal) > 0.01) {
      errors.push(
        createError(
          `items[${index}].total`,
          'Totaal komt niet overeen met berekening (aantal × eenheidsprijs)',
          'INVALID_CALCULATION'
        )
      );
    }
  });

  return createValidationResult(errors);
};

/**
 * Valideer invoice status transition
 */
export const validateInvoiceStatusTransition = (
  currentStatus: InvoiceStatus,
  newStatus: InvoiceStatus
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Define allowed transitions
  const allowedTransitions: Record<InvoiceStatus, InvoiceStatus[]> = {
    draft: ['sent', 'cancelled'],
    sent: ['paid', 'overdue', 'cancelled'],
    paid: [], // Finale status
    overdue: ['paid', 'cancelled'],
    cancelled: [], // Finale status
  };

  const allowed = allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    errors.push(
      createError(
        'status',
        `Status kan niet van '${currentStatus}' naar '${newStatus}' worden gewijzigd`,
        'INVALID_TRANSITION'
      )
    );
  }

  return createValidationResult(errors);
};

/**
 * Valideer invoice voor sending
 */
export const validateInvoiceForSending = (invoice: Invoice): ValidationResult => {
  const errors: ValidationError[] = [];

  if (invoice.status !== 'draft') {
    errors.push(createError('status', 'Alleen concept facturen kunnen worden verzonden', 'NOT_DRAFT'));
  }

  if (!invoice.items || invoice.items.length === 0) {
    errors.push(createError('items', 'Factuur heeft geen items', 'NO_ITEMS'));
  }

  if (invoice.total <= 0) {
    errors.push(createError('total', 'Factuur totaal moet groter dan 0 zijn', 'INVALID_TOTAL'));
  }

  return createValidationResult(errors);
};

// ============================================================================
// GENERAL VALIDATORS
// ============================================================================

/**
 * Valideer VAT rate
 */
export const validateVatRate = (vatRate: number): ValidationResult => {
  const errors: ValidationError[] = [];

  if (vatRate < 0 || vatRate > 100) {
    errors.push(createError('vatRate', 'BTW percentage moet tussen 0 en 100 zijn', 'INVALID_VAT'));
  }

  // Nederlandse standaard tarieven
  const validRates = [0, 9, 21]; // Vrijgesteld, verlaagd, hoog

  if (!validRates.includes(vatRate)) {
    // Waarschuwing, geen error
    errors.push(
      createError(
        'vatRate',
        `BTW tarief ${vatRate}% is niet standaard. Nederlandse tarieven zijn: 0%, 9%, 21%`,
        'NON_STANDARD_VAT'
      )
    );
  }

  return createValidationResult(errors);
};

/**
 * Valideer email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    errors.push(createError('email', 'Ongeldig e-mailadres', 'INVALID_EMAIL'));
  }

  return createValidationResult(errors);
};

/**
 * Valideer amount (positief getal)
 */
export const validateAmount = (amount: number, field: string = 'amount'): ValidationResult => {
  const errors: ValidationError[] = [];

  if (amount < 0) {
    errors.push(createError(field, 'Bedrag kan niet negatief zijn', 'INVALID_AMOUNT'));
  }

  if (!Number.isFinite(amount)) {
    errors.push(createError(field, 'Bedrag moet een geldig getal zijn', 'INVALID_NUMBER'));
  }

  return createValidationResult(errors);
};
