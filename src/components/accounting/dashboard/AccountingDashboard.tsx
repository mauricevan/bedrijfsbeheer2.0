/**
 * AccountingDashboard Component
 * Main dashboard for accounting module
 */

import React from 'react';
import type { Quote, Invoice, Transaction, Customer } from '../../../types';
import { useAccountingDashboard } from '../../../features/accounting/hooks';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';

interface AccountingDashboardProps {
  quotes: Quote[];
  invoices: Invoice[];
  transactions: Transaction[];
  customers: Customer[];
  onNavigate?: (tab: 'offertes' | 'facturen' | 'transacties') => void;
}

export const AccountingDashboard: React.FC<AccountingDashboardProps> = ({
  quotes,
  invoices,
  transactions,
  customers,
  onNavigate,
}) => {
  const {
    quoteStats,
    invoiceStats,
    transactionStats,
    monthlyRevenueData,
    outstandingByCustomer,
    recentQuotes,
    recentInvoices,
  } = useAccountingDashboard({
    quotes,
    invoices,
    transactions,
    customers,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getQuoteStatusBadge = (status: Quote['status']) => {
    const statusColors: Record<Quote['status'], string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };

    const statusLabels: Record<Quote['status'], string> = {
      draft: 'Concept',
      sent: 'Verzonden',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
      expired: 'Verlopen',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getInvoiceStatusBadge = (status: Invoice['status']) => {
    const statusColors: Record<Invoice['status'], string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const statusLabels: Record<Invoice['status'], string> = {
      draft: 'Concept',
      sent: 'Verzonden',
      paid: 'Betaald',
      overdue: 'Verlopen',
      cancelled: 'Geannuleerd',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Accounting Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Overzicht van offertes, facturen en transacties</p>
      </div>

      {/* Stats Cards */}
      <DashboardStats
        quoteStats={quoteStats}
        invoiceStats={invoiceStats}
        transactionStats={transactionStats}
      />

      {/* Charts */}
      <DashboardCharts
        monthlyRevenue={monthlyRevenueData}
        outstandingByCustomer={outstandingByCustomer}
      />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recente Offertes</h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('offertes')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Bekijk alles →
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentQuotes.map(quote => (
              <div key={quote.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{quote.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {quote.quoteNumber} • {formatDate(quote.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(quote.total)}</p>
                  <div className="mt-1">{getQuoteStatusBadge(quote.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recente Facturen</h3>
            {onNavigate && (
              <button
                onClick={() => onNavigate('facturen')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Bekijk alles →
              </button>
            )}
          </div>
          <div className="space-y-3">
            {recentInvoices.map(invoice => (
              <div key={invoice.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.customerName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {invoice.invoiceNumber} • {formatDate(invoice.date)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.total)}</p>
                  <div className="mt-1">{getInvoiceStatusBadge(invoice.status)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
