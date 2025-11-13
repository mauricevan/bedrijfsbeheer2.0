/**
 * useAccounting Hook
 * Business logic voor Quotes & Invoices
 */

import { useState, useCallback, useMemo } from 'react';
import type { Quote, Invoice, Customer } from '../../../types';

export const useAccounting = (
  initialQuotes: Quote[],
  initialInvoices: Invoice[],
  _customers: Customer[]
) => {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [selectedTab, setSelectedTab] = useState<'quotes' | 'invoices'>('quotes');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Quotes stats
  const quotesStats = useMemo(() => {
    return {
      total: quotes.length,
      draft: quotes.filter((q) => q.status === 'draft').length,
      sent: quotes.filter((q) => q.status === 'sent').length,
      approved: quotes.filter((q) => q.status === 'approved').length,
      rejected: quotes.filter((q) => q.status === 'rejected').length,
      totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
    };
  }, [quotes]);

  // Invoices stats
  const invoicesStats = useMemo(() => {
    return {
      total: invoices.length,
      draft: invoices.filter((i) => i.status === 'draft').length,
      sent: invoices.filter((i) => i.status === 'sent').length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
      totalRevenue: invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
      totalOutstanding: invoices.filter((i) => i.status !== 'paid').reduce((sum, i) => sum + i.total, 0),
    };
  }, [invoices]);

  // ============================================================================
  // QUOTES CRUD
  // ============================================================================

  const addQuote = useCallback((quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: Quote = {
      ...quote,
      id: `quote-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotes((prev) => [...prev, newQuote]);
    return newQuote;
  }, []);

  const updateQuote = useCallback((id: string, updates: Partial<Quote>) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q
      )
    );
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const convertQuoteToInvoice = useCallback((quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (!quote) return null;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      items: quote.items.map((item) => ({ ...item })),
      laborHours: quote.laborHours,
      hourlyRate: quote.hourlyRate,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: 'draft',
      date: today,
      dueDate: dueDate.toISOString().split('T')[0],
      quoteId: quote.id,
      notes: quote.notes,
      createdBy: quote.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [...prev, newInvoice]);

    // Update quote status
    updateQuote(quoteId, { invoiceId: newInvoice.id });

    return newInvoice;
  }, [quotes, invoices, updateQuote]);

  // ============================================================================
  // INVOICES CRUD
  // ============================================================================

  const addInvoice = useCallback((invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInvoices((prev) => [...prev, newInvoice]);
    return newInvoice;
  }, []);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      )
    );
  }, []);

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const markInvoiceAsPaid = useCallback((id: string) => {
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'paid',
              paidDate: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    quotes,
    invoices,
    quotesStats,
    invoicesStats,

    // UI State
    selectedTab,
    setSelectedTab,

    // Quotes CRUD
    addQuote,
    updateQuote,
    deleteQuote,
    convertQuoteToInvoice,

    // Invoices CRUD
    addInvoice,
    updateInvoice,
    deleteInvoice,
    markInvoiceAsPaid,
  };
};
