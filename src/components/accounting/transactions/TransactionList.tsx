/**
 * TransactionList Component
 * Display and filter transactions
 */

import React from 'react';
import type { Transaction } from '../../../types';
import { useTransactions } from '../../../features/accounting/hooks';
import { formatCurrency, formatDate } from '../../../features/accounting/utils';

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions: allTransactions }) => {
  const {
    transactions,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    stats,
    resetFilters,
  } = useTransactions(allTransactions);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600">Totale Inkomsten</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(stats.totalIncome)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.income} transacties</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600">Totale Uitgaven</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.totalExpense)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.expense} transacties</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600">Nettowinst</h3>
          <p className={`text-2xl font-bold mt-2 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.netProfit)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.total} transacties</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Zoek op beschrijving..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter.type || 'all'}
            onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle types</option>
            <option value="income">Inkomsten</option>
            <option value="expense">Uitgaven</option>
          </select>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beschrijving
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bedrag
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {transaction.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.type === 'income' ? 'Inkomsten' : 'Uitgaven'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Geen transacties gevonden
          </div>
        )}
      </div>
    </div>
  );
};
