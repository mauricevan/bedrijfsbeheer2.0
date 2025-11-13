import React, { useState, useMemo } from 'react';
import {
  User,
  Invoice,
  Transaction,
  InventoryItem,
  Quote,
  WorkOrder,
} from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ReportsPageProps {
  currentUser: User | null;
  invoices: Invoice[];
  transactions: Transaction[];
  inventory: InventoryItem[];
  quotes: Quote[];
  workOrders: WorkOrder[];
}

type ReportTab = 'sales' | 'inventory' | 'quotes' | 'workorders';

interface SalesKPIs {
  totalRevenue: number;
  averageSale: number;
  itemsSold: number;
  topProducts: Array<{
    product: string;
    quantity: number;
    revenue: number;
  }>;
}

interface InventoryKPIs {
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalItems: number;
}

interface QuotesKPIs {
  totalValue: number;
  acceptedValue: number;
  conversionRate: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
    value: number;
  }>;
}

interface WorkOrdersKPIs {
  totalOrders: number;
  completedCount: number;
  totalHours: number;
  averageHours: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  recentCompleted: Array<{
    id: string;
    title: string;
    hours: number;
    completedAt: string;
  }>;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format number as currency (€X,XXX.XX)
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

/**
 * Format number with thousand separators
 */
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('nl-NL').format(num);
};

/**
 * Format percentage (XX.X%)
 */
const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

/**
 * Get color class for status badges
 */
const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase();

  // Quote statuses
  if (statusLower === 'approved') {
    return 'bg-green-100 text-green-800';
  }
  if (statusLower === 'sent') {
    return 'bg-blue-100 text-blue-800';
  }
  if (statusLower === 'rejected') {
    return 'bg-red-100 text-red-800';
  }
  if (statusLower === 'expired') {
    return 'bg-gray-100 text-gray-800';
  }
  if (statusLower === 'draft') {
    return 'bg-yellow-100 text-yellow-800';
  }

  // Work order statuses
  if (statusLower === 'completed') {
    return 'bg-green-100 text-green-800';
  }
  if (statusLower === 'in_progress') {
    return 'bg-blue-100 text-blue-800';
  }
  if (statusLower === 'pending') {
    return 'bg-yellow-100 text-yellow-800';
  }

  // Inventory statuses
  if (statusLower === 'ok') {
    return 'bg-green-100 text-green-800';
  }
  if (statusLower === 'low') {
    return 'bg-orange-100 text-orange-800';
  }
  if (statusLower === 'out of stock') {
    return 'bg-red-100 text-red-800';
  }

  return 'bg-gray-100 text-gray-800';
};

/**
 * Get inventory status based on quantity and threshold
 */
const getInventoryStatus = (item: InventoryItem): string => {
  if (item.quantity === 0) {
    return 'Uitverkocht';
  }
  if (item.quantity <= item.reorderLevel) {
    return 'Laag';
  }
  return 'OK';
};

/**
 * Format date as DD-MM-YYYY
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ReportsPage: React.FC<ReportsPageProps> = ({
  currentUser: _currentUser,
  invoices,
  transactions: _transactions,
  inventory,
  quotes,
  workOrders,
}) => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [activeTab, setActiveTab] = useState<ReportTab>('sales');

  // ==========================================================================
  // COMPUTED DATA - SALES KPIs
  // ==========================================================================

  const salesKPIs = useMemo((): SalesKPIs => {
    // Calculate from invoices with status 'paid'
    const paidInvoices = invoices.filter(
      (inv) => inv.status === 'paid'
    );

    const totalRevenue = paidInvoices.reduce(
      (sum, inv) => sum + inv.total,
      0
    );

    const averageSale =
      paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Count total items sold
    const itemsSold = paidInvoices.reduce(
      (sum, inv) => sum + inv.items.length,
      0
    );

    // Calculate top products
    const productMap = new Map<
      string,
      { quantity: number; revenue: number }
    >();

    paidInvoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const existing = productMap.get(item.description) || {
          quantity: 0,
          revenue: 0,
        };
        productMap.set(item.description, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.quantity * item.unitPrice,
        });
      });
    });

    const topProducts = Array.from(productMap.entries())
      .map(([product, data]) => ({
        product,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      averageSale,
      itemsSold,
      topProducts,
    };
  }, [invoices]);

  // ==========================================================================
  // COMPUTED DATA - INVENTORY KPIs
  // ==========================================================================

  const inventoryKPIs = useMemo((): InventoryKPIs => {
    const totalValue = inventory.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    const lowStockCount = inventory.filter(
      (item) =>
        item.quantity > 0 && item.quantity <= item.reorderLevel
    ).length;

    const outOfStockCount = inventory.filter(
      (item) => item.quantity === 0
    ).length;

    const totalItems = inventory.length;

    return {
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalItems,
    };
  }, [inventory]);

  // ==========================================================================
  // COMPUTED DATA - QUOTES KPIs
  // ==========================================================================

  const quotesKPIs = useMemo((): QuotesKPIs => {
    const totalValue = quotes.reduce((sum, quote) => sum + quote.total, 0);

    const acceptedQuotes = quotes.filter(
      (q) => q.status === 'approved'
    );
    const acceptedValue = acceptedQuotes.reduce(
      (sum, quote) => sum + quote.total,
      0
    );

    const sentQuotes = quotes.filter(
      (q) =>
        q.status === 'sent' ||
        q.status === 'approved'
    );
    const conversionRate =
      sentQuotes.length > 0
        ? (acceptedQuotes.length / sentQuotes.length) * 100
        : 0;

    // Status breakdown
    const statusMap = new Map<string, { count: number; value: number }>();

    quotes.forEach((quote) => {
      const status = quote.status;
      const existing = statusMap.get(status) || { count: 0, value: 0 };
      statusMap.set(status, {
        count: existing.count + 1,
        value: existing.value + quote.total,
      });
    });

    const statusBreakdown = Array.from(statusMap.entries())
      .map(([status, data]) => ({
        status,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalValue,
      acceptedValue,
      conversionRate,
      statusBreakdown,
    };
  }, [quotes]);

  // ==========================================================================
  // COMPUTED DATA - WORK ORDERS KPIs
  // ==========================================================================

  const workOrdersKPIs = useMemo((): WorkOrdersKPIs => {
    const totalOrders = workOrders.length;

    const completedOrders = workOrders.filter(
      (wo) => wo.status === 'completed'
    );
    const completedCount = completedOrders.length;

    const totalHours = workOrders.reduce((sum, wo) => sum + wo.actualHours, 0);

    const averageHours =
      workOrders.length > 0 ? totalHours / workOrders.length : 0;

    // Status breakdown
    const statusMap = new Map<string, number>();

    workOrders.forEach((wo) => {
      const status = wo.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const statusBreakdown = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Recent completed orders (last 5)
    const recentCompleted = completedOrders
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((wo) => ({
        id: wo.id,
        title: wo.title,
        hours: wo.actualHours,
        completedAt: wo.updatedAt || wo.createdAt,
      }));

    return {
      totalOrders,
      completedCount,
      totalHours,
      averageHours,
      statusBreakdown,
      recentCompleted,
    };
  }, [workOrders]);

  // ==========================================================================
  // RENDER HELPERS - TAB BUTTONS
  // ==========================================================================

  const renderTabButtons = () => {
    const tabs: Array<{ id: ReportTab; label: string; icon: string }> = [
      { id: 'sales', label: 'Verkoop', icon: '💰' },
      { id: 'inventory', label: 'Voorraad', icon: '📦' },
      { id: 'quotes', label: 'Offertes', icon: '📄' },
      { id: 'workorders', label: 'Werkorders', icon: '🔧' },
    ];

    return (
      <div className="flex space-x-2 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - KPI CARD
  // ==========================================================================

  const renderKPICard = (
    title: string,
    value: string,
    icon: string,
    subtitle?: string
  ) => {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - SALES REPORT
  // ==========================================================================

  const renderSalesReport = () => {
    const { totalRevenue, averageSale, itemsSold, topProducts } = salesKPIs;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderKPICard(
            'Totale Omzet',
            formatCurrency(totalRevenue),
            '💵'
          )}
          {renderKPICard(
            'Gemiddelde Verkoop',
            formatCurrency(averageSale),
            '📊'
          )}
          {renderKPICard(
            'Items Verkocht',
            formatNumber(itemsSold),
            '🛒'
          )}
        </div>

        {/* Top Products Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Top 5 Producten
            </h3>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen verkoopgegevens beschikbaar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aantal Verkocht
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totale Omzet
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatNumber(product.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {formatCurrency(product.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sales Timeline - Placeholder for visualization */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Verkoop Tijdlijn
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <p className="text-lg font-medium">Tijdlijn Visualisatie</p>
              <p className="text-sm mt-2">
                Grafiek met verkopen over tijd (feature komt binnenkort)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - INVENTORY REPORT
  // ==========================================================================

  const renderInventoryReport = () => {
    const { totalValue, lowStockCount, outOfStockCount, totalItems } =
      inventoryKPIs;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {renderKPICard(
            'Totale Voorraadwaarde',
            formatCurrency(totalValue),
            '💎'
          )}
          {renderKPICard(
            'Totaal Producten',
            formatNumber(totalItems),
            '📦'
          )}
          {renderKPICard(
            'Lage Voorraad',
            formatNumber(lowStockCount),
            '⚠️'
          )}
          {renderKPICard(
            'Uitverkocht',
            formatNumber(outOfStockCount),
            '🚫'
          )}
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Voorraad Overzicht
            </h3>
          </div>
          <div className="p-6">
            {inventory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen voorraad beschikbaar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voorraad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Drempel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waarde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.map((item) => {
                      const status = getInventoryStatus(item);
                      const value = item.quantity * item.unitPrice;

                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {item.skuAutomatic}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.categoryId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatNumber(item.quantity)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {formatNumber(item.reorderLevel)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - QUOTES REPORT
  // ==========================================================================

  const renderQuotesReport = () => {
    const { totalValue, acceptedValue, conversionRate, statusBreakdown } =
      quotesKPIs;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderKPICard(
            'Totale Waarde Offertes',
            formatCurrency(totalValue),
            '📄'
          )}
          {renderKPICard(
            'Geaccepteerde Waarde',
            formatCurrency(acceptedValue),
            '✅'
          )}
          {renderKPICard(
            'Conversie Ratio',
            formatPercentage(conversionRate),
            '📈',
            'Goedgekeurd / Verzonden'
          )}
        </div>

        {/* Status Breakdown Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Status Overzicht
            </h3>
          </div>
          <div className="p-6">
            {statusBreakdown.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen offertes beschikbaar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aantal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Totale Waarde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Percentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statusBreakdown.map((item, index) => {
                      const percentage =
                        quotes.length > 0
                          ? (item.count / quotes.length) * 100
                          : 0;

                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatNumber(item.count)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                            {formatCurrency(item.value)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {formatPercentage(percentage)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel Visualization */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Conversie Trechter
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {statusBreakdown.map((item, index) => {
                const percentage =
                  quotes.length > 0 ? (item.count / quotes.length) * 100 : 0;
                const maxWidth = Math.max(percentage, 10); // Minimum 10% width for visibility

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {item.status}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} ({formatPercentage(percentage)})
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className={`h-8 rounded-full flex items-center justify-end pr-3 text-xs font-semibold ${
                          item.status === 'approved'
                            ? 'bg-green-500 text-white'
                            : item.status === 'sent'
                            ? 'bg-blue-500 text-white'
                            : item.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                        style={{ width: `${maxWidth}%` }}
                      >
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // RENDER HELPERS - WORK ORDERS REPORT
  // ==========================================================================

  const renderWorkOrdersReport = () => {
    const {
      totalOrders,
      completedCount,
      totalHours,
      averageHours,
      statusBreakdown,
      recentCompleted,
    } = workOrdersKPIs;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {renderKPICard(
            'Totaal Werkorders',
            formatNumber(totalOrders),
            '🔧'
          )}
          {renderKPICard(
            'Voltooid',
            formatNumber(completedCount),
            '✅'
          )}
          {renderKPICard(
            'Totaal Uren',
            formatNumber(totalHours),
            '⏱️'
          )}
          {renderKPICard(
            'Gem. Uren per Order',
            averageHours.toFixed(1),
            '📊'
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Status Verdeling
            </h3>
          </div>
          <div className="p-6">
            {statusBreakdown.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen werkorders beschikbaar
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {statusBreakdown.map((item, index) => {
                  const percentage =
                    totalOrders > 0 ? (item.count / totalOrders) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {formatNumber(item.count)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatPercentage(percentage)} van totaal
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Completed Orders */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Voltooide Werkorders
            </h3>
          </div>
          <div className="p-6">
            {recentCompleted.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Geen voltooide werkorders beschikbaar
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uren Besteed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Voltooid Op
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentCompleted.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {order.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {order.hours.toFixed(1)} uur
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(order.completedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Hours Distribution Chart - Placeholder */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Uren Verdeling
            </h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-medium">Uren Distributie</p>
              <p className="text-sm mt-2">
                Grafiek met uren per werkorder (feature komt binnenkort)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Rapporten & Analyses
        </h1>
        <p className="mt-2 text-gray-600">
          Bekijk belangrijke bedrijfsstatistieken en prestatie-indicatoren
        </p>
      </div>

      {/* Tab Navigation */}
      {renderTabButtons()}

      {/* Active Report Content */}
      <div className="mt-6">
        {activeTab === 'sales' && renderSalesReport()}
        {activeTab === 'inventory' && renderInventoryReport()}
        {activeTab === 'quotes' && renderQuotesReport()}
        {activeTab === 'workorders' && renderWorkOrdersReport()}
      </div>
    </div>
  );
};

export default ReportsPage;
