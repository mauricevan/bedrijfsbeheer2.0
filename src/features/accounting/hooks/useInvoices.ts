/**
 * useInvoices Hook
 * Business logic voor Invoices (Facturen) beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type { Invoice, InvoiceStatus, InvoiceItem } from '../../../types';

export const useInvoices = (initialInvoices: Invoice[]) => {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Stats
  const stats = useMemo(() => {
    const draft = invoices.filter(i => i.status === 'draft');
    const sent = invoices.filter(i => i.status === 'sent');
    const paid = invoices.filter(i => i.status === 'paid');
    const overdue = invoices.filter(i => i.status === 'overdue');
    const cancelled = invoices.filter(i => i.status === 'cancelled');

    const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);
    const paidAmount = paid.reduce((sum, i) => sum + i.total, 0);
    const outstandingAmount = [...sent, ...overdue].reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + i.total, 0);

    return {
      total: invoices.length,
      draft: draft.length,
      sent: sent.length,
      paid: paid.length,
      overdue: overdue.length,
      cancelled: cancelled.length,
      totalAmount,
      paidAmount,
      outstandingAmount,
      overdueAmount,
    };
  }, [invoices]);

  // Filter by status
  const filterByStatus = useCallback((status: InvoiceStatus) => {
    return invoices.filter(i => i.status === status);
  }, [invoices]);

  // Check for overdue invoices
  const checkOverdueInvoices = useCallback(() => {
    const today = new Date();
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.status === 'sent' && new Date(inv.dueDate) < today) {
          return { ...inv, status: 'overdue' as InvoiceStatus, updatedAt: new Date().toISOString() };
        }
        return inv;
      })
    );
  }, []);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const year = new Date().getFullYear();
    const invoiceNumber = `${year}-${String(invoices.length + 1).padStart(3, '0')}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `invoice-${Date.now()}`,
      invoiceNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices(prev => [...prev, newInvoice]);
    return newInvoice;
  }, [invoices.length]);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev =>
      prev.map(i =>
        i.id === id
          ? { ...i, ...updates, updatedAt: new Date().toISOString() }
          : i
      )
    );
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateInvoiceStatus = useCallback((id: string, status: InvoiceStatus) => {
    const updates: Partial<Invoice> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    // Add paidDate when marking as paid
    if (status === 'paid') {
      updates.paidDate = new Date().toISOString();
    }

    setInvoices(prev =>
      prev.map(i => (i.id === id ? { ...i, ...updates } : i))
    );
  }, []);

  const markAsPaid = useCallback((id: string) => {
    updateInvoiceStatus(id, 'paid');
  }, [updateInvoiceStatus]);

  const cloneInvoice = useCallback((id: string) => {
    const original = invoices.find(i => i.id === id);
    if (!original) return null;

    const year = new Date().getFullYear();
    const invoiceNumber = `${year}-${String(invoices.length + 1).padStart(3, '0')}`;

    const cloned: Invoice = {
      ...original,
      id: `invoice-${Date.now()}`,
      invoiceNumber,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
      paidDate: undefined,
      workOrderId: undefined,
      quoteId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices(prev => [...prev, cloned]);
    return cloned;
  }, [invoices]);

  // Link werkorder to invoice
  const linkWorkOrder = useCallback((invoiceId: string, workOrderId: string) => {
    updateInvoice(invoiceId, { workOrderId });
  }, [updateInvoice]);

  // Calculate totals for invoice
  const calculateInvoiceTotals = useCallback((items: InvoiceItem[], laborHours: number, hourlyRate: number, vatRate: number) => {
    const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = laborHours * hourlyRate;
    const subtotal = itemsSubtotal + laborSubtotal;
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatAmount,
      total,
    };
  }, []);

  return {
    invoices,
    stats,
    filterByStatus,
    checkOverdueInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    updateInvoiceStatus,
    markAsPaid,
    cloneInvoice,
    linkWorkOrder,
    calculateInvoiceTotals,
  };
};
