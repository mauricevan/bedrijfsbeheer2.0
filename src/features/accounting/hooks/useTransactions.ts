/**
 * useTransactions Hook
 * Business logic voor Transaction filtering en analysis
 */

import { useState, useMemo, useCallback } from 'react';
import type { Transaction } from '../../../types';
import { filterTransactions, sortTransactionsByDateDesc } from '../utils/filters';
import type { TransactionFilterOptions } from '../types/accounting.types';

export const useTransactions = (allTransactions: Transaction[]) => {
  const [filter, setFilter] = useState<TransactionFilterOptions>({
    type: 'all',
    category: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    let filtered = filterTransactions(allTransactions, {
      ...filter,
      searchTerm: searchTerm.trim() !== '' ? searchTerm : undefined,
    });

    // Sort by date (newest first)
    filtered = sortTransactionsByDateDesc(filtered);

    return filtered;
  }, [allTransactions, filter, searchTerm]);

  // Transaction stats
  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income');
    const expense = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expense.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpense;

    return {
      total: filteredTransactions.length,
      income: income.length,
      expense: expense.length,
      totalIncome,
      totalExpense,
      netProfit,
    };
  }, [filteredTransactions]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilter({
      type: 'all',
      category: 'all',
    });
    setSearchTerm('');
  }, []);

  return {
    transactions: filteredTransactions,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    stats,
    resetFilters,
  };
};
