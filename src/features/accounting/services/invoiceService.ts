/**
 * Invoice Service
 * Pure business logic functies voor Invoice management
 * GEEN React dependencies (geen hooks, geen state)
 */

import type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  WorkOrder,
  WorkOrderMaterial,
  Quote,
} from '../../../types';

import type {
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceFormData,
} from '../types/accounting.types';

import {
  calculateInvoiceTotals,
  generateInvoiceNumber,
  calculateInvoiceItemTotal,
} from '../utils/calculations';

import {
  validateInvoiceForm,
  validateInvoiceForSending,
} from '../utils/validators';

// ============================================================================
// INVOICE CRUD OPERATIONS
// ============================================================================

/**
 * Creëer een nieuwe invoice
 */
export const createInvoice = (
  input: CreateInvoiceInput,
  existingInvoices: Invoice[]
): { invoice: Invoice; error?: string } => {
  // Valideer input
  const validation = validateInvoiceForm(input);
  if (!validation.isValid) {
    return {
      invoice: null as any,
      error: validation.errors.map(e => e.message).join(', '),
    };
  }

  // Bereken totalen
  const totals = calculateInvoiceTotals(
    input.items,
    input.laborHours,
    input.hourlyRate,
    input.vatRate
  );

  // Genereer invoice number
  const invoiceNumber = generateInvoiceNumber(existingInvoices);

  // Creëer invoice
  const invoice: Invoice = {
    id: `invoice-${Date.now()}`,
    invoiceNumber,
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
    date: input.date,
    dueDate: input.dueDate,
    notes: input.notes,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { invoice };
};

/**
 * Update een bestaande invoice
 */
export const updateInvoice = (
  invoiceId: string,
  updates: Partial<Invoice>,
  existingInvoices: Invoice[]
): { invoice: Invoice; error?: string } => {
  const existingInvoice = existingInvoices.find(i => i.id === invoiceId);

  if (!existingInvoice) {
    return { invoice: null as any, error: 'Invoice niet gevonden' };
  }

  // Check of invoice niet betaald of geannuleerd is (kan dan niet meer gewijzigd)
  if (existingInvoice.status === 'paid' || existingInvoice.status === 'cancelled') {
    return {
      invoice: null as any,
      error: 'Betaalde of geannuleerde facturen kunnen niet meer worden gewijzigd',
    };
  }

  // Herbereken totalen als items, labor of vat gewijzigd zijn
  let updatedInvoice = { ...existingInvoice, ...updates };

  if (updates.items || updates.laborHours !== undefined || updates.hourlyRate !== undefined || updates.vatRate !== undefined) {
    const totals = calculateInvoiceTotals(
      updatedInvoice.items,
      updatedInvoice.laborHours,
      updatedInvoice.hourlyRate,
      updatedInvoice.vatRate
    );

    updatedInvoice = {
      ...updatedInvoice,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
    };
  }

  updatedInvoice.updatedAt = new Date().toISOString();

  return { invoice: updatedInvoice };
};

/**
 * Update invoice status
 */
export const updateInvoiceStatus = (
  invoiceId: string,
  newStatus: InvoiceStatus,
  existingInvoices: Invoice[]
): { invoice: Invoice; error?: string } => {
  const existingInvoice = existingInvoices.find(i => i.id === invoiceId);

  if (!existingInvoice) {
    return { invoice: null as any, error: 'Invoice niet gevonden' };
  }

  const updates: Partial<Invoice> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  // Voeg paidDate toe bij markeren als betaald
  if (newStatus === 'paid' && !existingInvoice.paidDate) {
    updates.paidDate = new Date().toISOString().split('T')[0];
  }

  const updatedInvoice: Invoice = {
    ...existingInvoice,
    ...updates,
  };

  return { invoice: updatedInvoice };
};

/**
 * Delete een invoice (soft delete door status te wijzigen of echte delete)
 */
export const deleteInvoice = (
  invoiceId: string,
  existingInvoices: Invoice[]
): { success: boolean; error?: string } => {
  const invoice = existingInvoices.find(i => i.id === invoiceId);

  if (!invoice) {
    return { success: false, error: 'Invoice niet gevonden' };
  }

  // Check of invoice betaald is (kan niet verwijderd worden)
  if (invoice.status === 'paid') {
    return { success: false, error: 'Betaalde facturen kunnen niet worden verwijderd. Gebruik annuleren.' };
  }

  return { success: true };
};

// ============================================================================
// INVOICE OPERATIONS
// ============================================================================

/**
 * Clone een invoice
 */
export const cloneInvoice = (
  invoiceId: string,
  existingInvoices: Invoice[]
): { invoice: Invoice; error?: string } => {
  const original = existingInvoices.find(i => i.id === invoiceId);

  if (!original) {
    return { invoice: null as any, error: 'Originele invoice niet gevonden' };
  }

  const invoiceNumber = generateInvoiceNumber(existingInvoices);

  // Bereken nieuwe due date (30 dagen vanaf vandaag)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);

  const cloned: Invoice = {
    ...original,
    id: `invoice-${Date.now()}`,
    invoiceNumber,
    status: 'draft',
    date: new Date().toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    paidDate: undefined,
    workOrderId: undefined,
    quoteId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { invoice: cloned };
};

/**
 * Convert invoice naar workorder (voor reparaties/service)
 */
export const convertInvoiceToWorkOrder = (
  invoiceId: string,
  existingInvoices: Invoice[],
  existingWorkOrders: WorkOrder[],
  createdBy: string
): { workOrder: WorkOrder; error?: string } => {
  const invoice = existingInvoices.find(i => i.id === invoiceId);

  if (!invoice) {
    return { workOrder: null as any, error: 'Invoice niet gevonden' };
  }

  // Map invoice items naar workorder materials
  const materials: WorkOrderMaterial[] = invoice.items
    .filter(item => item.inventoryItemId)
    .map(item => ({
      inventoryItemId: item.inventoryItemId!,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

  const workOrder: WorkOrder = {
    id: `wo-${Date.now()}`,
    title: `Werkorder voor ${invoice.customerName}`,
    description: invoice.notes || '',
    assignedTo: '',
    createdBy,
    status: 'todo',
    priority: 'medium',
    estimatedHours: invoice.laborHours,
    actualHours: 0,
    materials,
    invoiceId: invoice.id,
    quoteId: invoice.quoteId,
    customerId: invoice.customerId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { workOrder };
};

/**
 * Sync invoice naar workorder
 */
export const syncInvoiceToWorkOrder = (
  invoice: Invoice,
  workOrder: WorkOrder
): { workOrder: WorkOrder } => {
  // Map invoice items naar workorder materials
  const materials: WorkOrderMaterial[] = invoice.items
    .filter(item => item.inventoryItemId)
    .map(item => ({
      inventoryItemId: item.inventoryItemId!,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

  const updatedWorkOrder: WorkOrder = {
    ...workOrder,
    estimatedHours: invoice.laborHours,
    materials,
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    updatedAt: new Date().toISOString(),
  };

  return { workOrder: updatedWorkOrder };
};

/**
 * Send invoice reminder
 */
export const sendInvoiceReminder = (
  invoice: Invoice
): { success: boolean; error?: string } => {
  // Valideer dat invoice sent of overdue is
  if (invoice.status !== 'sent' && invoice.status !== 'overdue') {
    return { success: false, error: 'Alleen verzonden of verlopen facturen kunnen een herinnering krijgen' };
  }

  // In productie: verstuur email via email service
  // Voor nu: return success
  return { success: true };
};

/**
 * Check of validation modal moet worden getoond
 */
export const shouldShowValidationModal = (
  invoice: Invoice,
  quote?: Quote
): boolean => {
  // Toon modal als invoice vanuit quote komt en waarden zijn aangepast
  if (!quote) return false;

  // Check of totaal verschilt
  if (Math.abs(invoice.total - quote.total) > 0.01) return true;

  // Check of labor hours verschillen
  if (invoice.laborHours !== quote.laborHours) return true;

  // Check of aantal items verschilt
  if (invoice.items.length !== quote.items.length) return true;

  return false;
};

// ============================================================================
// INVOICE ITEM OPERATIONS
// ============================================================================

/**
 * Voeg item toe aan invoice
 */
export const addInvoiceItem = (
  invoice: Invoice,
  item: Omit<InvoiceItem, 'id' | 'total'>
): { invoice: Invoice } => {
  const total = calculateInvoiceItemTotal(item.quantity, item.unitPrice);

  const newItem: InvoiceItem = {
    ...item,
    id: `item-${Date.now()}-${Math.random()}`,
    total,
  };

  const updatedItems = [...invoice.items, newItem];

  // Herbereken totalen
  const totals = calculateInvoiceTotals(
    updatedItems,
    invoice.laborHours,
    invoice.hourlyRate,
    invoice.vatRate
  );

  const updatedInvoice: Invoice = {
    ...invoice,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { invoice: updatedInvoice };
};

/**
 * Update item in invoice
 */
export const updateInvoiceItem = (
  invoice: Invoice,
  itemId: string,
  updates: Partial<InvoiceItem>
): { invoice: Invoice; error?: string } => {
  const itemIndex = invoice.items.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    return { invoice: null as any, error: 'Item niet gevonden' };
  }

  const updatedItem = { ...invoice.items[itemIndex], ...updates };

  // Herbereken item total als quantity of unitPrice gewijzigd
  if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
    updatedItem.total = calculateInvoiceItemTotal(updatedItem.quantity, updatedItem.unitPrice);
  }

  const updatedItems = [...invoice.items];
  updatedItems[itemIndex] = updatedItem;

  // Herbereken totalen
  const totals = calculateInvoiceTotals(
    updatedItems,
    invoice.laborHours,
    invoice.hourlyRate,
    invoice.vatRate
  );

  const updatedInvoice: Invoice = {
    ...invoice,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { invoice: updatedInvoice };
};

/**
 * Verwijder item uit invoice
 */
export const removeInvoiceItem = (
  invoice: Invoice,
  itemId: string
): { invoice: Invoice; error?: string } => {
  const updatedItems = invoice.items.filter(i => i.id !== itemId);

  if (updatedItems.length === invoice.items.length) {
    return { invoice: null as any, error: 'Item niet gevonden' };
  }

  // Herbereken totalen
  const totals = calculateInvoiceTotals(
    updatedItems,
    invoice.laborHours,
    invoice.hourlyRate,
    invoice.vatRate
  );

  const updatedInvoice: Invoice = {
    ...invoice,
    items: updatedItems,
    subtotal: totals.subtotal,
    vatAmount: totals.vatAmount,
    total: totals.total,
    updatedAt: new Date().toISOString(),
  };

  return { invoice: updatedInvoice };
};

// ============================================================================
// INVOICE HELPERS
// ============================================================================

/**
 * Link invoice to workorder
 */
export const linkInvoiceToWorkOrder = (
  invoice: Invoice,
  workOrderId: string
): { invoice: Invoice } => {
  return {
    invoice: {
      ...invoice,
      workOrderId,
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Mark invoice as paid
 */
export const markInvoiceAsPaid = (
  invoice: Invoice,
  paidDate?: string
): { invoice: Invoice; error?: string } => {
  if (invoice.status === 'paid') {
    return { invoice: null as any, error: 'Invoice is al betaald' };
  }

  return {
    invoice: {
      ...invoice,
      status: 'paid',
      paidDate: paidDate || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Cancel invoice
 */
export const cancelInvoice = (
  invoice: Invoice
): { invoice: Invoice; error?: string } => {
  if (invoice.status === 'paid') {
    return { invoice: null as any, error: 'Betaalde facturen kunnen niet worden geannuleerd' };
  }

  if (invoice.status === 'cancelled') {
    return { invoice: null as any, error: 'Invoice is al geannuleerd' };
  }

  return {
    invoice: {
      ...invoice,
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    },
  };
};

/**
 * Check en update overdue status
 */
export const checkAndUpdateOverdueStatus = (
  invoices: Invoice[]
): Invoice[] => {
  const today = new Date();

  return invoices.map(invoice => {
    // Alleen sent invoices checken
    if (invoice.status !== 'sent') return invoice;

    const dueDate = new Date(invoice.dueDate);

    if (dueDate < today) {
      return {
        ...invoice,
        status: 'overdue',
        updatedAt: new Date().toISOString(),
      };
    }

    return invoice;
  });
};
