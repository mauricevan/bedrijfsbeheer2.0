/**
 * DashboardCharts Component
 * Display charts for accounting dashboard
 */

import React from 'react';

interface MonthlyRevenueData {
  month: string;
  revenue: number;
  invoiceCount: number;
}

interface OutstandingByCustomerData {
  customerId: string;
  customerName: string;
  amount: number;
  invoiceCount: number;
}

interface DashboardChartsProps {
  monthlyRevenue: MonthlyRevenueData[];
  outstandingByCustomer: OutstandingByCustomerData[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  monthlyRevenue,
  outstandingByCustomer,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Monthly Revenue Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Maandelijkse Omzet</h3>
        <div className="space-y-2">
          {monthlyRevenue.slice(-6).map((data, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{data.month}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{data.invoiceCount} facturen</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(data.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Outstanding by Customer Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Openstaand per Klant</h3>
        <div className="space-y-2">
          {outstandingByCustomer.slice(0, 10).map((data, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm text-gray-600 truncate">{data.customerName}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">{data.invoiceCount} facturen</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(data.amount)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
