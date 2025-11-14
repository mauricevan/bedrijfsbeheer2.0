/**
 * DashboardStats Component
 * Display statistics cards for accounting dashboard
 */

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <div className="mt-2 flex items-center">
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-gray-500 ml-2">vs vorige maand</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface DashboardStatsProps {
  quoteStats: {
    total: number;
    approved: number;
    sent: number;
    totalValue: number;
    conversionRate: number;
  };
  invoiceStats: {
    total: number;
    paid: number;
    outstandingAmount: number;
    overdueAmount: number;
    averagePaymentDays: number;
  };
  transactionStats: {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  quoteStats,
  invoiceStats,
  transactionStats,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Quote Stats */}
      <StatCard
        title="Totaal Offertes"
        value={quoteStats.total}
        subtitle={`${quoteStats.approved} goedgekeurd, ${quoteStats.sent} verzonden`}
      />
      <StatCard
        title="Offerte Waarde"
        value={formatCurrency(quoteStats.totalValue)}
        subtitle={`Conversie: ${formatPercentage(quoteStats.conversionRate)}`}
      />

      {/* Invoice Stats */}
      <StatCard
        title="Openstaand"
        value={formatCurrency(invoiceStats.outstandingAmount)}
        subtitle={`Waarvan ${formatCurrency(invoiceStats.overdueAmount)} verlopen`}
      />
      <StatCard
        title="Gemiddelde Betaaltermijn"
        value={`${invoiceStats.averagePaymentDays.toFixed(0)} dagen`}
        subtitle={`${invoiceStats.paid} van ${invoiceStats.total} betaald`}
      />

      {/* Transaction Stats */}
      <StatCard
        title="Inkomsten"
        value={formatCurrency(transactionStats.totalIncome)}
        subtitle="Totaal inkomsten"
      />
      <StatCard
        title="Uitgaven"
        value={formatCurrency(transactionStats.totalExpense)}
        subtitle="Totaal uitgaven"
      />
      <StatCard
        title="Nettowinst"
        value={formatCurrency(transactionStats.netProfit)}
        subtitle="Inkomsten - Uitgaven"
        className={transactionStats.netProfit >= 0 ? 'border-green-200' : 'border-red-200'}
      />
    </div>
  );
};
