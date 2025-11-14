/**
 * Accounting Filters
 * Pure filter functies voor accounting module
 */

import type {
  Quote,
  Invoice,
  Transaction,
  QuoteStatus,
  InvoiceStatus,
} from '../../../types';

import type {
  QuoteFilterOptions,
  InvoiceFilterOptions,
  TransactionFilterOptions,
} from '../types/accounting.types';

// ============================================================================
// QUOTE FILTERS
// ============================================================================

/**
 * Filter quotes op basis van filter opties
 */
export const filterQuotes = (quotes: Quote[], options: QuoteFilterOptions = {}): Quote[] => {
  let filtered = [...quotes];

  // Filter op status
  if (options.status && options.status !== 'all') {
    filtered = filtered.filter(q => q.status === options.status);
  }

  // Filter op customer
  if (options.customerId) {
    filtered = filtered.filter(q => q.customerId === options.customerId);
  }

  // Filter op search term (customer naam of quote number)
  if (options.searchTerm && options.searchTerm.trim() !== '') {
    const searchLower = options.searchTerm.toLowerCase();
    filtered = filtered.filter(
      q =>
        q.customerName.toLowerCase().includes(searchLower) ||
        q.quoteNumber.toLowerCase().includes(searchLower)
    );
  }

  // Filter op datum range
  if (options.dateFrom) {
    const fromDate = new Date(options.dateFrom);
    filtered = filtered.filter(q => new Date(q.createdAt) >= fromDate);
  }

  if (options.dateTo) {
    const toDate = new Date(options.dateTo);
    toDate.setHours(23, 59, 59, 999); // Include hele dag
    filtered = filtered.filter(q => new Date(q.createdAt) <= toDate);
  }

  return filtered;
};

/**
 * Filter quotes op status
 */
export const filterQuotesByStatus = (quotes: Quote[], status: QuoteStatus): Quote[] => {
  return quotes.filter(q => q.status === status);
};

/**
 * Filter quotes op customer
 */
export const filterQuotesByCustomer = (quotes: Quote[], customerId: string): Quote[] => {
  return quotes.filter(q => q.customerId === customerId);
};

/**
 * Filter quotes die linked zijn aan workorders
 */
export const filterQuotesWithWorkOrders = (quotes: Quote[]): Quote[] => {
  return quotes.filter(q => !!q.workOrderId);
};

/**
 * Filter quotes die linked zijn aan invoices
 */
export const filterQuotesWithInvoices = (quotes: Quote[]): Quote[] => {
  return quotes.filter(q => !!q.invoiceId);
};

/**
 * Filter expired quotes
 */
export const filterExpiredQuotes = (quotes: Quote[]): Quote[] => {
  const today = new Date();

  return quotes.filter(q => {
    if (!q.validUntil) return false;
    return new Date(q.validUntil) < today;
  });
};

/**
 * Bereken totaal van gefilterde quotes
 */
export const calculateFilteredQuoteTotal = (quotes: Quote[], options: QuoteFilterOptions = {}): number => {
  const filtered = filterQuotes(quotes, options);
  return filtered.reduce((sum, q) => sum + q.total, 0);
};

// ============================================================================
// INVOICE FILTERS
// ============================================================================

/**
 * Filter invoices op basis van filter opties
 */
export const filterInvoices = (invoices: Invoice[], options: InvoiceFilterOptions = {}): Invoice[] => {
  let filtered = [...invoices];

  // Filter op status
  if (options.status && options.status !== 'all') {
    filtered = filtered.filter(i => i.status === options.status);
  }

  // Filter op customer
  if (options.customerId) {
    filtered = filtered.filter(i => i.customerId === options.customerId);
  }

  // Filter op search term (customer naam of invoice number)
  if (options.searchTerm && options.searchTerm.trim() !== '') {
    const searchLower = options.searchTerm.toLowerCase();
    filtered = filtered.filter(
      i =>
        i.customerName.toLowerCase().includes(searchLower) ||
        i.invoiceNumber.toLowerCase().includes(searchLower)
    );
  }

  // Filter op datum range (invoice date)
  if (options.dateFrom) {
    const fromDate = new Date(options.dateFrom);
    filtered = filtered.filter(i => new Date(i.date) >= fromDate);
  }

  if (options.dateTo) {
    const toDate = new Date(options.dateTo);
    toDate.setHours(23, 59, 59, 999); // Include hele dag
    filtered = filtered.filter(i => new Date(i.date) <= toDate);
  }

  // Filter alleen overdue
  if (options.overdueOnly) {
    const today = new Date();
    filtered = filtered.filter(i => {
      if (i.status === 'paid' || i.status === 'cancelled') return false;
      return new Date(i.dueDate) < today;
    });
  }

  return filtered;
};

/**
 * Filter invoices op status
 */
export const filterInvoicesByStatus = (invoices: Invoice[], status: InvoiceStatus): Invoice[] => {
  return invoices.filter(i => i.status === status);
};

/**
 * Filter invoices op customer
 */
export const filterInvoicesByCustomer = (invoices: Invoice[], customerId: string): Invoice[] => {
  return invoices.filter(i => i.customerId === customerId);
};

/**
 * Filter invoices die linked zijn aan workorders
 */
export const filterInvoicesWithWorkOrders = (invoices: Invoice[]): Invoice[] => {
  return invoices.filter(i => !!i.workOrderId);
};

/**
 * Filter invoices die linked zijn aan quotes
 */
export const filterInvoicesWithQuotes = (invoices: Invoice[]): Invoice[] => {
  return invoices.filter(i => !!i.quoteId);
};

/**
 * Filter overdue invoices
 */
export const filterOverdueInvoices = (invoices: Invoice[]): Invoice[] => {
  const today = new Date();

  return invoices.filter(i => {
    if (i.status === 'paid' || i.status === 'cancelled') return false;
    return new Date(i.dueDate) < today;
  });
};

/**
 * Filter unpaid invoices (sent + overdue)
 */
export const filterUnpaidInvoices = (invoices: Invoice[]): Invoice[] => {
  return invoices.filter(i => i.status === 'sent' || i.status === 'overdue');
};

/**
 * Filter paid invoices
 */
export const filterPaidInvoices = (invoices: Invoice[]): Invoice[] => {
  return invoices.filter(i => i.status === 'paid');
};

/**
 * Bereken totaal van gefilterde invoices
 */
export const calculateFilteredInvoiceTotal = (invoices: Invoice[], options: InvoiceFilterOptions = {}): number => {
  const filtered = filterInvoices(invoices, options);
  return filtered.reduce((sum, i) => sum + i.total, 0);
};

// ============================================================================
// TRANSACTION FILTERS
// ============================================================================

/**
 * Filter transactions op basis van filter opties
 */
export const filterTransactions = (
  transactions: Transaction[],
  options: TransactionFilterOptions = {}
): Transaction[] => {
  let filtered = [...transactions];

  // Filter op type
  if (options.type && options.type !== 'all') {
    filtered = filtered.filter(t => t.type === options.type);
  }

  // Filter op category
  if (options.category) {
    filtered = filtered.filter(t => t.category === options.category);
  }

  // Filter op datum range
  if (options.dateFrom) {
    const fromDate = new Date(options.dateFrom);
    filtered = filtered.filter(t => new Date(t.date) >= fromDate);
  }

  if (options.dateTo) {
    const toDate = new Date(options.dateTo);
    toDate.setHours(23, 59, 59, 999); // Include hele dag
    filtered = filtered.filter(t => new Date(t.date) <= toDate);
  }

  return filtered;
};

/**
 * Filter transactions op type
 */
export const filterTransactionsByType = (
  transactions: Transaction[],
  type: 'income' | 'expense'
): Transaction[] => {
  return transactions.filter(t => t.type === type);
};

/**
 * Filter transactions op category
 */
export const filterTransactionsByCategory = (transactions: Transaction[], category: string): Transaction[] => {
  return transactions.filter(t => t.category === category);
};

/**
 * Filter income transactions
 */
export const filterIncomeTransactions = (transactions: Transaction[]): Transaction[] => {
  return filterTransactionsByType(transactions, 'income');
};

/**
 * Filter expense transactions
 */
export const filterExpenseTransactions = (transactions: Transaction[]): Transaction[] => {
  return filterTransactionsByType(transactions, 'expense');
};

/**
 * Filter transactions voor een specifieke invoice
 */
export const filterTransactionsByInvoice = (transactions: Transaction[], invoiceId: string): Transaction[] => {
  return transactions.filter(t => t.invoiceId === invoiceId);
};

/**
 * Filter transactions in date range
 */
export const filterTransactionsByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter(t => {
    const transDate = new Date(t.date);
    return transDate >= startDate && transDate <= endDate;
  });
};

/**
 * Filter transactions voor current month
 */
export const filterTransactionsCurrentMonth = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return filterTransactionsByDateRange(transactions, startOfMonth, endOfMonth);
};

/**
 * Filter transactions voor current year
 */
export const filterTransactionsCurrentYear = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  return filterTransactionsByDateRange(transactions, startOfYear, endOfYear);
};

// ============================================================================
// SORTING HELPERS (bonus)
// ============================================================================

/**
 * Sort quotes by date (newest first)
 */
export const sortQuotesByDateDesc = (quotes: Quote[]): Quote[] => {
  return [...quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

/**
 * Sort quotes by total amount (highest first)
 */
export const sortQuotesByTotalDesc = (quotes: Quote[]): Quote[] => {
  return [...quotes].sort((a, b) => b.total - a.total);
};

/**
 * Sort invoices by date (newest first)
 */
export const sortInvoicesByDateDesc = (invoices: Invoice[]): Invoice[] => {
  return [...invoices].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Sort invoices by due date (earliest first)
 */
export const sortInvoicesByDueDateAsc = (invoices: Invoice[]): Invoice[] => {
  return [...invoices].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};

/**
 * Sort invoices by total amount (highest first)
 */
export const sortInvoicesByTotalDesc = (invoices: Invoice[]): Invoice[] => {
  return [...invoices].sort((a, b) => b.total - a.total);
};

/**
 * Sort transactions by date (newest first)
 */
export const sortTransactionsByDateDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Sort transactions by amount (highest first)
 */
export const sortTransactionsByAmountDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => b.amount - a.amount);
};
