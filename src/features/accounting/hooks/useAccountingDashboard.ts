/**
 * useAccountingDashboard Hook
 * Business logic voor Accounting Dashboard calculations
 */

import { useMemo } from 'react';
import type { Quote, Invoice, Transaction, Customer } from '../../../types';
import {
  calculateQuoteConversionRate,
  calculateAveragePaymentDays,
  calculateMonthlyRevenue,
  calculateOutstandingByCustomer,
} from '../utils/calculations';
import {
  filterQuotes,
  filterInvoices,
  sortQuotesByDateDesc,
  sortInvoicesByDateDesc,
} from '../utils/filters';

interface UseDashboardProps {
  quotes: Quote[];
  invoices: Invoice[];
  transactions: Transaction[];
  customers: Customer[];
}

export const useAccountingDashboard = ({
  quotes,
  invoices,
  transactions,
  customers,
}: UseDashboardProps) => {
  // ============================================================================
  // QUOTE STATS
  // ============================================================================

  const quoteStats = useMemo(() => {
    const draft = quotes.filter(q => q.status === 'draft');
    const sent = quotes.filter(q => q.status === 'sent');
    const approved = quotes.filter(q => q.status === 'approved');
    const rejected = quotes.filter(q => q.status === 'rejected');
    const expired = quotes.filter(q => q.status === 'expired');

    const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
    const approvedValue = approved.reduce((sum, q) => sum + q.total, 0);
    const sentValue = sent.reduce((sum, q) => sum + q.total, 0);

    const conversionRate = calculateQuoteConversionRate(quotes);

    return {
      total: quotes.length,
      draft: draft.length,
      sent: sent.length,
      approved: approved.length,
      rejected: rejected.length,
      expired: expired.length,
      totalValue,
      approvedValue,
      sentValue,
      conversionRate,
    };
  }, [quotes]);

  // ============================================================================
  // INVOICE STATS
  // ============================================================================

  const invoiceStats = useMemo(() => {
    const draft = invoices.filter(i => i.status === 'draft');
    const sent = invoices.filter(i => i.status === 'sent');
    const paid = invoices.filter(i => i.status === 'paid');
    const overdue = invoices.filter(i => i.status === 'overdue');
    const cancelled = invoices.filter(i => i.status === 'cancelled');

    const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);
    const paidAmount = paid.reduce((sum, i) => sum + i.total, 0);
    const outstandingAmount = [...sent, ...overdue].reduce((sum, i) => sum + i.total, 0);
    const overdueAmount = overdue.reduce((sum, i) => sum + i.total, 0);

    const averagePaymentDays = calculateAveragePaymentDays(paid);

    return {
      total: invoices.length,
      draft: draft.length,
      sent: sent.length,
      paid: paid.length,
      overdue: overdue.length,
      cancelled: cancelled.length,
      totalInvoiced,
      paidAmount,
      outstandingAmount,
      overdueAmount,
      averagePaymentDays,
    };
  }, [invoices]);

  // ============================================================================
  // TRANSACTION STATS
  // ============================================================================

  const transactionStats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income');
    const expense = transactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return {
      total: transactions.length,
      income: income.length,
      expense: expense.length,
      totalIncome,
      totalExpense,
      netProfit,
    };
  }, [transactions]);

  // ============================================================================
  // CHART DATA
  // ============================================================================

  // Monthly revenue chart data
  const monthlyRevenueData = useMemo(() => {
    return calculateMonthlyRevenue(invoices);
  }, [invoices]);

  // Outstanding by customer
  const outstandingByCustomer = useMemo(() => {
    return calculateOutstandingByCustomer(invoices, customers);
  }, [invoices, customers]);

  // Recent quotes (last 5)
  const recentQuotes = useMemo(() => {
    return sortQuotesByDateDesc(quotes).slice(0, 5);
  }, [quotes]);

  // Recent invoices (last 5)
  const recentInvoices = useMemo(() => {
    return sortInvoicesByDateDesc(invoices).slice(0, 5);
  }, [invoices]);

  return {
    quoteStats,
    invoiceStats,
    transactionStats,
    monthlyRevenueData,
    outstandingByCustomer,
    recentQuotes,
    recentInvoices,
  };
};
