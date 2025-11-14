/**
 * Quote Service
 * Pure business logic functies voor Quote management
 * GEEN React dependencies (geen hooks, geen state)
 */

import type {
  Quote,
  QuoteItem,
  QuoteStatus,
  Invoice,
  InvoiceItem,
  WorkOrder,
  WorkOrderMaterial,
} from '../../../types';

import type {
  CreateQuoteInput,
  UpdateQuoteInput,
  QuoteFormData,
} from '../types/accounting.types';

import {
  calculateQuoteTotals,
  generateQuoteNumber,
  calculateQuoteItemTotal,
} from '../utils/calculations';

import { validateQuoteForm, validateQuoteToInvoice } from '../utils/validators';

// ============================================================================
// QUOTE CRUD OPERATIONS
// ============================================================================

/**
 * Creëer een nieuwe quote
 */
export const createQuote = (
  input: CreateQuoteInput,
  existingQuotes: Quote[]
): { quote: Quote; error?: string } => {
  // Valideer input
  const validation = validateQuoteForm(input);
  if (!validation.isValid) {
    return {
      quote: null as any,
      error: validation.errors.map(e => e.message).join(', '),
    };
  }

  // Bereken totalen
  const totals = calculateQuoteTotals(
    input.items,
    input.laborHours,
    input.hourlyRate,
    input.vatRate
  );

  // Genereer quote number
  const quoteNumber = generateQuoteNumber(existingQuotes);

  // Creëer quote
  const quote: Quote = {
    id: `quote-${Date.now()}`,
    quoteNumber,
    customerId: input.customerId,
    customerName: input.customerName,
    items: input.items,
    laborHours: input.laborHours,
    hourlyRate: input.hourlyRate,
    subtotal: totals.subtotal,
    vatRate: input.vatRate,
    vatAmount: totals.vatAmount,
    total: totals.total,
    status: 'draft',
    notes: input.notes,
    validUntil: input.validUntil,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { quote };
};

/**
 * Update een bestaande quote
 */
export const updateQuote = (
  quoteId: string,
  updates: Partial<Quote>,
  existingQuotes: Quote[]
): { quote: Quote; error?: string } => {
  const existingQuote = existingQuotes.find(q => q.id === quoteId);

  if (!existingQuote) {
    return { quote: null as any, error: 'Quote niet gevonden' };
  }

  // Herbereken totalen als items, labor of vat gewijzigd zijn
  let updatedQuote = { ...existingQuote, ...updates };

  if (updates.items || updates.laborHours !== undefined || updates.hourlyRate !== undefined || updates.vatRate !== undefined) {
    const totals = calculateQuoteTotals(
      updatedQuote.items,
      updatedQuote.laborHours,
      updatedQuote.hourlyRate,
      updatedQuote.vatRate
    );

    updatedQuote = {
      ...updatedQuote,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
    };
  }

  updatedQuote.updatedAt = new Date().toISOString();

  return { quote: updatedQuote };
};

/**
 * Update quote status
 */
export const updateQuoteStatus = (
  quoteId: string,
  newStatus: QuoteStatus,
  existingQuotes: Quote[]
): { quote: Quote; error?: string } => {
  const existingQuote = existingQuotes.find(q => q.id === quoteId);

  if (!existingQuote) {
    return { quote: null as any, error: 'Quote niet gevonden' };
  }

  const updatedQuote: Quote = {
    ...existingQuote,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  return { quote: updatedQuote };
};

/**
 * Delete een quote (soft delete door status te wijzigen of echte delete)
 */
export const deleteQuote = (
  quoteId: string,
  existingQuotes: Quote[]
): { success: boolean; error?: string } => {
  const quote = existingQuotes.find(q => q.id === quoteId);

  if (!quote) {
    return { success: false, error: 'Quote niet gevonden' };
  }

  // Check of quote linked is aan invoice of workorder
  if (quote.invoiceId) {
    return { success: false, error: 'Kan geen quote verwijderen die gekoppeld is aan een factuur' };
  }

  if (quote.workOrderId) {
    return { success: false, error: 'Kan geen quote verwijderen die gekoppeld is aan een werkorder' };
  }

  return { success: true };
};

// ============================================================================
// QUOTE OPERATIONS
// ============================================================================

/**
 * Clone een quote
 */
export const cloneQuote = (
  quoteId: string,
  existingQuotes: Quote[]
): { quote: Quote; error?: string } => {
  const original = existingQuotes.find(q => q.id === quoteId);

  if (!original) {
    return { quote: null as any, error: 'Originele quote niet gevonden' };
  }

  const quoteNumber = generateQuoteNumber(existingQuotes);

  const cloned: Quote = {
    ...original,
    id: `quote-${Date.now()}`,
    quoteNumber,
    status: 'draft',
    workOrderId: undefined,
    invoiceId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { quote: cloned };
};

/**
 * Convert quote naar invoice
 */
export const convertQuoteToInvoice = (
  quoteId: string,
  existingQuotes: Quote[],
  existingInvoices: Invoice[],
  createdBy: string,
  adjustments?: {
    items?: InvoiceItem[];
    laborHours?: number;
    hourlyRate?: number;
    notes?: string;
  }
): { invoice: Invoice; error?: string } => {
  const quote = existingQuotes.find(q => q.id === quoteId);

  if (!quote) {
    return { invoice: null as any, error: 'Quote niet gevonden' };
  }

  // Valideer quote voor conversie
  const validation = validateQuoteToInvoice(quote);
  if (!validation.isValid) {
    return {
      invoice: null as any,
      error: validation.errors.map(e => e.message).join(', '),
    };
  }

  // Use adjustments or original quote values
  const items: InvoiceItem[] = adjustments?.items || quote.items.map(item => ({
    ...item,
    id: `inv-item-${Date.now()}-${Math.random()}`,
  }));

  const laborHours = adjustments?.laborHours !== undefined ? adjustments.laborHours : quote.laborHours;
  const hourlyRate = adjustments?.hourlyRate !== undefined ? adjustments.hourlyRate : quote.hourlyRate;

  // Bereken totalen
  const totals = calculateQuoteTotals(items, laborHours, hourlyRate, quote.vatRate);

  // Genereer invoice number
  const year = new Date().getFullYear();
  const invoiceNumber = `${year}-${String(existingInvoices.length + 1).padStart(3, '0')}`;

  // Bereken due date (30 dagen standaard)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const invoice: Invoice = {
    id: `invoice-${Date.now()}`,
    invoiceNumber,
    customerId: quote.customerId,
    customerName: quote.customerName,
    items,
    laborHours,
    hourlyRate,
    subtotal: totals.subtotal,
    vatRate: quote.vatRate,
    vatAmount: totals.vatAmount,
    total: totals.total,
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    notes: adjustments?.notes || quote.notes,
    quoteId: quote.id,
    workOrderId: quote.workOrderId,
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { invoice };
};

/**
 * Sync quote naar workorder (voor materialen en uren)
 */
export const syncQuoteToWorkOrder = (
  quote: Quote,
  workOrder: WorkOrder
): { workOrder: WorkOrder } => {
  // Map quote items naar workorder materials
  const materials: WorkOrderMaterial[] = quote.items
    .filter(item => item.inventoryItemId) // Alleen items met inventory link
    .map(item => ({
      inventoryItemId: item.inventoryItemId!,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

  const updatedWorkOrder: WorkOrder = {
    ...workOrder,
    estimatedHours: quote.laborHours,
    materials,
    quoteId: quote.id,
    customerId: quote.customerId,
    updatedAt: new Date().toISOString(),
  };

  return { workOrder: updatedWorkOrder };
};

// ============================================================================
// QUOTE ITEM OPERATIONS
// ============================================================================

/**
 * Voeg item toe aan quote
 */
export const addQuoteItem = (
  quote: Quote,
  item: Omit<QuoteItem, 'id' | 'total'>
): { quote: Quote } => {
  const total = calculateQuoteItemTotal(item.quantity, item.unitPrice);

  const newItem: QuoteItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random()}`,
    total,
  };

  const updatedItems = [...quote.items, newItem];

  // Herbereken totalen
  const totals = calculateQuoteTotals(
    updatedItems,
    quote.laborHours,
    quote.hourlyRate,
    quote.vatRate
  );

  const updatedQuote: Quote = {
    ...quote,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { quote: updatedQuote };
};

/**
 * Update item in quote
 */
export const updateQuoteItem = (
  quote: Quote,
  itemId: string,
  updates: Partial<QuoteItem>
): { quote: Quote; error?: string } => {
  const itemIndex = quote.items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return { quote: null as any, error: 'Item niet gevonden' };
  }

  const updatedItem = { ...quote.items[itemIndex], ...updates };

  // Herbereken item total als quantity of unitPrice gewijzigd
  if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
    updatedItem.total = calculateQuoteItemTotal(updatedItem.quantity, updatedItem.unitPrice);
  }

  const updatedItems = [...quote.items];
  updatedItems[itemIndex] = updatedItem;

  // Herbereken totalen
  const totals = calculateQuoteTotals(
    updatedItems,
    quote.laborHours,
    quote.hourlyRate,
    quote.vatRate
  );

  const updatedQuote: Quote = {
    ...quote,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { quote: updatedQuote };
};

/**
 * Verwijder item uit quote
 */
export const removeQuoteItem = (
  quote: Quote,
  itemId: string
): { quote: Quote; error?: string } => {
  const updatedItems = quote.items.filter(i => i.id !== itemId);

  if (updatedItems.length === quote.items.length) {
    return { quote: null as any, error: 'Item niet gevonden' };
  }

  // Herbereken totalen
  const totals = calculateQuoteTotals(
    updatedItems,
    quote.laborHours,
    quote.hourlyRate,
    quote.vatRate
  );

  const updatedQuote: Quote = {
    ...quote,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { quote: updatedQuote };
};

// ============================================================================
// QUOTE HELPERS
// ============================================================================

/**
 * Link quote to workorder
 */
export const linkQuoteToWorkOrder = (
  quote: Quote,
  workOrderId: string
): { quote: Quote } => {
  return {
    quote: {
      ...quote,
      workOrderId,
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Link quote to invoice
 */
export const linkQuoteToInvoice = (
  quote: Quote,
  invoiceId: string
): { quote: Quote } => {
  return {
    quote: {
      ...quote,
      invoiceId,
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Accept quote (status → approved)
 */
export const acceptQuote = (
  quote: Quote
): { quote: Quote; error?: string } => {
  if (quote.status !== 'sent') {
    return { quote: null as any, error: 'Alleen verzonden offertes kunnen worden geaccepteerd' };
  }

  return {
    quote: {
      ...quote,
      status: 'approved',
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Reject quote (status → rejected)
 */
export const rejectQuote = (
  quote: Quote
): { quote: Quote; error?: string } => {
  if (quote.status !== 'sent') {
    return { quote: null as any, error: 'Alleen verzonden offertes kunnen worden afgewezen' };
  }

  return {
    quote: {
      ...quote,
      status: 'rejected',
      updatedAt: new Date().toISOString(),
    },
  };
};
