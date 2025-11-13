/**
 * useQuotes Hook
 * Business logic voor Quotes (Offertes) beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type { Quote, QuoteStatus, QuoteItem, Customer } from '../../../types';

export const useQuotes = (initialQuotes: Quote[]) => {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Stats
  const stats = useMemo(() => {
    const draft = quotes.filter(q => q.status === 'draft');
    const sent = quotes.filter(q => q.status === 'sent');
    const approved = quotes.filter(q => q.status === 'approved');
    const rejected = quotes.filter(q => q.status === 'rejected');
    const expired = quotes.filter(q => q.status === 'expired');

    const totalAmount = quotes.reduce((sum, q) => sum + q.total, 0);
    const approvedAmount = approved.reduce((sum, q) => sum + q.total, 0);
    const sentAmount = sent.reduce((sum, q) => sum + q.total, 0);

    return {
      total: quotes.length,
      draft: draft.length,
      sent: sent.length,
      approved: approved.length,
      rejected: rejected.length,
      expired: expired.length,
      totalAmount,
      approvedAmount,
      sentAmount,
    };
  }, [quotes]);

  // Filter by status
  const filterByStatus = useCallback((status: QuoteStatus) => {
    return quotes.filter(q => q.status === status);
  }, [quotes]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addQuote = useCallback((quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const quoteNumber = `Q${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;

    const newQuote: Quote = {
      ...quoteData,
      id: `quote-${Date.now()}`,
      quoteNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setQuotes(prev => [...prev, newQuote]);
    return newQuote;
  }, [quotes.length]);

  const updateQuote = useCallback((id: string, updates: Partial<Quote>) => {
    setQuotes(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, ...updates, updatedAt: new Date().toISOString() }
          : q
      )
    );
  }, []);

  const deleteQuote = useCallback((id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  }, []);

  const updateQuoteStatus = useCallback((id: string, status: QuoteStatus) => {
    setQuotes(prev =>
      prev.map(q =>
        q.id === id
          ? { ...q, status, updatedAt: new Date().toISOString() }
          : q
      )
    );
  }, []);

  const cloneQuote = useCallback((id: string) => {
    const original = quotes.find(q => q.id === id);
    if (!original) return null;

    const quoteNumber = `Q${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`;

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

    setQuotes(prev => [...prev, cloned]);
    return cloned;
  }, [quotes]);

  // Link werkorder to quote
  const linkWorkOrder = useCallback((quoteId: string, workOrderId: string) => {
    updateQuote(quoteId, { workOrderId });
  }, [updateQuote]);

  // Link invoice to quote
  const linkInvoice = useCallback((quoteId: string, invoiceId: string) => {
    updateQuote(quoteId, { invoiceId });
  }, [updateQuote]);

  // Calculate totals for quote
  const calculateQuoteTotals = useCallback((items: QuoteItem[], laborHours: number, hourlyRate: number, vatRate: number) => {
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
    quotes,
    stats,
    filterByStatus,
    addQuote,
    updateQuote,
    deleteQuote,
    updateQuoteStatus,
    cloneQuote,
    linkWorkOrder,
    linkInvoice,
    calculateQuoteTotals,
  };
};
