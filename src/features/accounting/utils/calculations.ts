/**
 * Accounting Calculations
 * Pure functies voor accounting berekeningen
 */

import type {
  Quote,
  QuoteItem,
  Invoice,
  InvoiceItem,
  Transaction,
} from '../../../types';

import type {
  QuoteTotals,
  InvoiceTotals,
  TransactionStats,
  InvoiceStats,
  QuoteStats,
  MonthlyRevenue,
  OutstandingByCustomer,
} from '../types/accounting.types';

// ============================================================================
// QUOTE CALCULATIONS
// ============================================================================

/**
 * Bereken totalen voor quote
 */
export const calculateQuoteTotals = (
  items: QuoteItem[],
  laborHours: number,
  hourlyRate: number,
  vatRate: number
): QuoteTotals => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = laborHours * hourlyRate;
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    subtotal,
    vatAmount,
    total,
    itemsSubtotal,
    laborSubtotal,
  };
};

/**
 * Bereken item total voor quote item
 */
export const calculateQuoteItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

/**
 * Bereken quote statistics
 */
export const calculateQuoteStats = (quotes: Quote[]): QuoteStats => {
  const draftQuotes = quotes.filter(q => q.status === 'draft');
  const sentQuotes = quotes.filter(q => q.status === 'sent');
  const approvedQuotes = quotes.filter(q => q.status === 'approved');
  const rejectedQuotes = quotes.filter(q => q.status === 'rejected');
  const expiredQuotes = quotes.filter(q => q.status === 'expired');

  const totalAmount = quotes.reduce((sum, q) => sum + q.total, 0);
  const approvedAmount = approvedQuotes.reduce((sum, q) => sum + q.total, 0);
  const sentAmount = sentQuotes.reduce((sum, q) => sum + q.total, 0);

  return {
    totalAmount,
    approvedAmount,
    sentAmount,
    draftCount: draftQuotes.length,
    sentCount: sentQuotes.length,
    approvedCount: approvedQuotes.length,
    rejectedCount: rejectedQuotes.length,
    expiredCount: expiredQuotes.length,
  };
};

// ============================================================================
// INVOICE CALCULATIONS
// ============================================================================

/**
 * Bereken totalen voor invoice
 */
export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  laborHours: number,
  hourlyRate: number,
  vatRate: number
): InvoiceTotals => {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.total, 0);
  const laborSubtotal = laborHours * hourlyRate;
  const subtotal = itemsSubtotal + laborSubtotal;
  const vatAmount = subtotal * (vatRate / 100);
  const total = subtotal + vatAmount;

  return {
    subtotal,
    vatAmount,
    total,
    itemsSubtotal,
    laborSubtotal,
  };
};

/**
 * Bereken item total voor invoice item
 */
export const calculateInvoiceItemTotal = (quantity: number, unitPrice: number): number => {
  return quantity * unitPrice;
};

/**
 * Genereer invoice number
 */
export const generateInvoiceNumber = (invoices: Invoice[]): string => {
  const year = new Date().getFullYear();
  const count = invoices.length + 1;
  return `${year}-${String(count).padStart(3, '0')}`;
};

/**
 * Genereer quote number
 */
export const generateQuoteNumber = (quotes: Quote[]): string => {
  const year = new Date().getFullYear();
  const count = quotes.length + 1;
  return `Q${year}-${String(count).padStart(3, '0')}`;
};

/**
 * Bereken invoice statistics
 */
export const calculateInvoiceStats = (invoices: Invoice[]): InvoiceStats => {
  const draftInvoices = invoices.filter(i => i.status === 'draft');
  const sentInvoices = invoices.filter(i => i.status === 'sent');
  const paidInvoices = invoices.filter(i => i.status === 'paid');
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');

  const totalAmount = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidAmount = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const outstandingAmount = [...sentInvoices, ...overdueInvoices].reduce((sum, i) => sum + i.total, 0);
  const overdueAmount = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

  return {
    totalAmount,
    paidAmount,
    outstandingAmount,
    overdueAmount,
    draftCount: draftInvoices.length,
    sentCount: sentInvoices.length,
    paidCount: paidInvoices.length,
    overdueCount: overdueInvoices.length,
  };
};

/**
 * Bereken gemiddelde betaaldagen
 */
export const calculateAveragePaymentDays = (invoices: Invoice[]): number => {
  const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paidDate);

  if (paidInvoices.length === 0) return 0;

  const totalDays = paidInvoices.reduce((sum, invoice) => {
    if (!invoice.paidDate) return sum;

    const invoiceDate = new Date(invoice.date);
    const paidDate = new Date(invoice.paidDate);

    const diffTime = paidDate.getTime() - invoiceDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return sum + diffDays;
  }, 0);

  return Math.round(totalDays / paidInvoices.length);
};

// ============================================================================
// TRANSACTION CALCULATIONS
// ============================================================================

/**
 * Bereken transaction statistics
 */
export const calculateTransactionStats = (transactions: Transaction[]): TransactionStats => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    transactionCount: transactions.length,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  };
};

// ============================================================================
// ADVANCED CALCULATIONS
// ============================================================================

/**
 * Bereken maandelijkse revenue
 */
export const calculateMonthlyRevenue = (
  transactions: Transaction[],
  months: number = 12
): MonthlyRevenue[] => {
  const monthlyData: MonthlyRevenue[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = monthDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

    const monthTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return (
        transDate.getMonth() === monthDate.getMonth() &&
        transDate.getFullYear() === monthDate.getFullYear()
      );
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    monthlyData.push({
      month: monthStr,
      income,
      expense,
      profit: income - expense,
    });
  }

  return monthlyData;
};

/**
 * Bereken outstanding per customer
 */
export const calculateOutstandingByCustomer = (invoices: Invoice[]): OutstandingByCustomer[] => {
  const outstandingInvoices = invoices.filter(
    i => i.status === 'sent' || i.status === 'overdue'
  );

  const customerMap = new Map<string, OutstandingByCustomer>();

  outstandingInvoices.forEach(invoice => {
    const existing = customerMap.get(invoice.customerId);

    if (existing) {
      existing.amount += invoice.total;
      existing.invoiceCount += 1;
    } else {
      customerMap.set(invoice.customerId, {
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        amount: invoice.total,
        invoiceCount: 1,
      });
    }
  });

  return Array.from(customerMap.values()).sort((a, b) => b.amount - a.amount);
};

/**
 * Bereken conversion rate (quotes → invoices)
 */
export const calculateConversionRate = (quotes: Quote[], invoices: Invoice[]): number => {
  if (quotes.length === 0) return 0;

  const quotesWithInvoices = quotes.filter(q => q.invoiceId).length;

  return (quotesWithInvoices / quotes.length) * 100;
};

/**
 * Bereken gemiddelde quote value
 */
export const calculateAverageQuoteValue = (quotes: Quote[]): number => {
  if (quotes.length === 0) return 0;

  const total = quotes.reduce((sum, q) => sum + q.total, 0);
  return total / quotes.length;
};

/**
 * Bereken gemiddelde invoice value
 */
export const calculateAverageInvoiceValue = (invoices: Invoice[]): number => {
  if (invoices.length === 0) return 0;

  const total = invoices.reduce((sum, i) => sum + i.total, 0);
  return total / invoices.length;
};
