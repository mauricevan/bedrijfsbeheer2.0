/**
 * Transaction Service
 * Pure business logic functies voor Transaction management
 * GEEN React dependencies (geen hooks, geen state)
 */

import type { Transaction } from '../../../types';

// ============================================================================
// TRANSACTION GROUPING
// ============================================================================

/**
 * Groepeer transactions per maand
 */
export const groupTransactionsByMonth = (
  transactions: Transaction[]
): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }

    grouped.get(monthKey)!.push(transaction);
  });

  return grouped;
};

/**
 * Groepeer transactions per type (income/expense)
 */
export const groupTransactionsByType = (
  transactions: Transaction[]
): Map<'income' | 'expense', Transaction[]> => {
  const grouped = new Map<'income' | 'expense', Transaction[]>();

  grouped.set('income', transactions.filter(t => t.type === 'income'));
  grouped.set('expense', transactions.filter(t => t.type === 'expense'));

  return grouped;
};

/**
 * Groepeer transactions per category
 */
export const groupTransactionsByCategory = (
  transactions: Transaction[]
): Map<string, Transaction[]> => {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    if (!grouped.has(transaction.category)) {
      grouped.set(transaction.category, []);
    }

    grouped.get(transaction.category)!.push(transaction);
  });

  return grouped;
};

/**
 * Groepeer transactions per jaar
 */
export const groupTransactionsByYear = (
  transactions: Transaction[]
): Map<number, Transaction[]> => {
  const grouped = new Map<number, Transaction[]>();

  transactions.forEach(transaction => {
    const year = new Date(transaction.date).getFullYear();

    if (!grouped.has(year)) {
      grouped.set(year, []);
    }

    grouped.get(year)!.push(transaction);
  });

  return grouped;
};

// ============================================================================
// TRANSACTION SORTING
// ============================================================================

/**
 * Sort transactions by date (newest first)
 */
export const sortTransactionsByDateDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Sort transactions by date (oldest first)
 */
export const sortTransactionsByDateAsc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Sort transactions by amount (highest first)
 */
export const sortTransactionsByAmountDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => b.amount - a.amount);
};

/**
 * Sort transactions by amount (lowest first)
 */
export const sortTransactionsByAmountAsc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => a.amount - b.amount);
};

/**
 * Sort transactions by category (alphabetically)
 */
export const sortTransactionsByCategory = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => a.category.localeCompare(b.category));
};

// ============================================================================
// TRANSACTION DATE FILTERING
// ============================================================================

/**
 * Haal transactions op voor een datum range
 */
export const getTransactionsByDateRange = (
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
 * Haal transactions op voor een specifieke maand
 */
export const getTransactionsByMonth = (
  transactions: Transaction[],
  year: number,
  month: number // 0-11 (January = 0)
): Transaction[] => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month;
  });
};

/**
 * Haal transactions op voor een specifiek jaar
 */
export const getTransactionsByYear = (
  transactions: Transaction[],
  year: number
): Transaction[] => {
  return transactions.filter(t => {
    const date = new Date(t.date);
    return date.getFullYear() === year;
  });
};

/**
 * Haal transactions op voor huidige maand
 */
export const getTransactionsCurrentMonth = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  return getTransactionsByMonth(transactions, now.getFullYear(), now.getMonth());
};

/**
 * Haal transactions op voor huidige jaar
 */
export const getTransactionsCurrentYear = (transactions: Transaction[]): Transaction[] => {
  const now = new Date();
  return getTransactionsByYear(transactions, now.getFullYear());
};

/**
 * Haal transactions op voor laatste N dagen
 */
export const getTransactionsLastNDays = (
  transactions: Transaction[],
  days: number
): Transaction[] => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return getTransactionsByDateRange(transactions, startDate, endDate);
};

// ============================================================================
// TRANSACTION AGGREGATIONS
// ============================================================================

/**
 * Bereken totalen per category
 */
export const calculateTotalsByCategory = (
  transactions: Transaction[]
): Map<string, { income: number; expense: number; net: number }> => {
  const totals = new Map<string, { income: number; expense: number; net: number }>();

  transactions.forEach(transaction => {
    if (!totals.has(transaction.category)) {
      totals.set(transaction.category, { income: 0, expense: 0, net: 0 });
    }

    const categoryTotals = totals.get(transaction.category)!;

    if (transaction.type === 'income') {
      categoryTotals.income += transaction.amount;
      categoryTotals.net += transaction.amount;
    } else {
      categoryTotals.expense += transaction.amount;
      categoryTotals.net -= transaction.amount;
    }
  });

  return totals;
};

/**
 * Bereken totalen per maand
 */
export const calculateTotalsByMonth = (
  transactions: Transaction[]
): Map<string, { income: number; expense: number; net: number }> => {
  const totals = new Map<string, { income: number; expense: number; net: number }>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!totals.has(monthKey)) {
      totals.set(monthKey, { income: 0, expense: 0, net: 0 });
    }

    const monthTotals = totals.get(monthKey)!;

    if (transaction.type === 'income') {
      monthTotals.income += transaction.amount;
      monthTotals.net += transaction.amount;
    } else {
      monthTotals.expense += transaction.amount;
      monthTotals.net -= transaction.amount;
    }
  });

  return totals;
};

/**
 * Bereken running balance (lopend saldo)
 */
export const calculateRunningBalance = (
  transactions: Transaction[]
): Array<{
  transaction: Transaction;
  balance: number;
}> => {
  // Sort by date (oldest first)
  const sorted = sortTransactionsByDateAsc(transactions);

  let balance = 0;
  const result: Array<{ transaction: Transaction; balance: number }> = [];

  sorted.forEach(transaction => {
    if (transaction.type === 'income') {
      balance += transaction.amount;
    } else {
      balance -= transaction.amount;
    }

    result.push({
      transaction,
      balance,
    });
  });

  return result;
};

// ============================================================================
// TRANSACTION HELPERS
// ============================================================================

/**
 * Haal unieke categorieën op
 */
export const getUniqueCategories = (transactions: Transaction[]): string[] => {
  const categories = new Set<string>();

  transactions.forEach(t => {
    categories.add(t.category);
  });

  return Array.from(categories).sort();
};

/**
 * Haal category count op
 */
export const getCategoryCount = (
  transactions: Transaction[],
  category: string
): number => {
  return transactions.filter(t => t.category === category).length;
};

/**
 * Check of transaction bij een invoice hoort
 */
export const isInvoiceTransaction = (transaction: Transaction): boolean => {
  return !!transaction.invoiceId;
};

/**
 * Haal largest transaction op
 */
export const getLargestTransaction = (
  transactions: Transaction[]
): Transaction | undefined => {
  if (transactions.length === 0) return undefined;

  return transactions.reduce((largest, current) => {
    return current.amount > largest.amount ? current : largest;
  });
};

/**
 * Haal largest income transaction op
 */
export const getLargestIncome = (transactions: Transaction[]): Transaction | undefined => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  return getLargestTransaction(incomeTransactions);
};

/**
 * Haal largest expense transaction op
 */
export const getLargestExpense = (transactions: Transaction[]): Transaction | undefined => {
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  return getLargestTransaction(expenseTransactions);
};

// ============================================================================
// TRANSACTION ANALYSIS
// ============================================================================

/**
 * Bereken gemiddelde transaction size per type
 */
export const calculateAverageTransactionSize = (
  transactions: Transaction[],
  type?: 'income' | 'expense'
): number => {
  const filtered = type ? transactions.filter(t => t.type === type) : transactions;

  if (filtered.length === 0) return 0;

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);
  return total / filtered.length;
};

/**
 * Bereken median transaction size
 */
export const calculateMedianTransactionSize = (
  transactions: Transaction[],
  type?: 'income' | 'expense'
): number => {
  const filtered = type ? transactions.filter(t => t.type === type) : transactions;

  if (filtered.length === 0) return 0;

  const sorted = [...filtered].sort((a, b) => a.amount - b.amount);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1].amount + sorted[mid].amount) / 2;
  } else {
    return sorted[mid].amount;
  }
};

/**
 * Vind outliers (transacties die veel afwijken van gemiddelde)
 */
export const findOutliers = (
  transactions: Transaction[],
  threshold: number = 2 // Standard deviations
): Transaction[] => {
  if (transactions.length < 3) return [];

  const amounts = transactions.map(t => t.amount);
  const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;

  const squaredDiffs = amounts.map(a => Math.pow(a - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const lowerBound = mean - threshold * stdDev;
  const upperBound = mean + threshold * stdDev;

  return transactions.filter(t => t.amount < lowerBound || t.amount > upperBound);
};
