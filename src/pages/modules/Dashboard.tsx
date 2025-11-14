import React, { useMemo } from 'react';
import type {
  User,
  WorkOrder,
  InventoryItem,
  Quote,
  Invoice,
  Notification,
} from '../../types/index';

interface DashboardProps {
  currentUser: User;
  workOrders: WorkOrder[];
  inventory: InventoryItem[];
  quotes: Quote[];
  invoices: Invoice[];
  notifications: Notification[];
}

/**
 * Dashboard Component - Centraal overzicht van bedrijfsactiviteiten
 *
 * Features:
 * - KPI Cards (omzet, werkorders, voorraad, notificaties)
 * - Recente werkorders
 * - Lage voorraad warnings
 * - Notificaties paneel
 * - Role-based filtering (Admin ziet alles, User ziet eigen data)
 */

export const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  workOrders,
  inventory,
  quotes,
  invoices,
  notifications,
}) => {
  // ============================================================================
  // CALCULATIONS & DERIVED STATE
  // ============================================================================

  // Filte werkorders op basis van rol
  const filteredWorkOrders = useMemo(() => {
    if (currentUser.isAdmin) {
      return workOrders; // Admin ziet alle werkorders
    }
    return workOrders.filter(wo => wo.assignedTo === currentUser.id);
  }, [workOrders, currentUser]);

  // KPI: Total Revenue (approved quotes + paid invoices)
  const totalRevenue = useMemo(() => {
    const quotesTotal = quotes
      .filter(q => q.status === 'approved')
      .reduce((sum, q) => sum + q.total, 0);

    const invoicesTotal = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    return quotesTotal + invoicesTotal;
  }, [quotes, invoices]);

  // KPI: Werkorders per status
  const workOrderStats = useMemo(() => {
    return {
      todo: filteredWorkOrders.filter(wo => wo.status === 'todo').length,
      in_progress: filteredWorkOrders.filter(wo => wo.status === 'in_progress').length,
      pending: filteredWorkOrders.filter(wo => wo.status === 'pending').length,
      completed: filteredWorkOrders.filter(wo => wo.status === 'completed').length,
      total: filteredWorkOrders.length,
    };
  }, [filteredWorkOrders]);

  // KPI: Lage voorraad items
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.reorderLevel);
  }, [inventory]);

  // Recente werkorders (laatste 5)
  const recentWorkOrders = useMemo(() => {
    return [...filteredWorkOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [filteredWorkOrders]);

  // Ongelezen notificaties
  const unreadNotifications = useMemo(() => {
    if (currentUser.isAdmin) {
      return notifications.filter(n => !n.read);
    }
    return notifications.filter(n => !n.read && n.userId === currentUser.id);
  }, [notifications, currentUser]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Welkom terug, {currentUser.name}! Hier is je overzicht.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue Card */}
        <KPICard
          title="Totale Omzet"
          value={`€${totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
          color="green"
          subtitle={`${quotes.filter(q => q.status === 'approved').length + invoices.filter(i => i.status === 'paid').length} transacties`}
        />

        {/* Werkorders Card */}
        <KPICard
          title="Werkorders"
          value={workOrderStats.total.toString()}
          icon="🔧"
          color="blue"
          subtitle={`${workOrderStats.in_progress} in uitvoering`}
        />

        {/* Low Stock Card */}
        <KPICard
          title="Voorraad Alerts"
          value={lowStockItems.length.toString()}
          icon="📦"
          color={lowStockItems.length > 5 ? 'red' : 'yellow'}
          subtitle={lowStockItems.length > 0 ? 'Actie vereist' : 'Alles OK'}
        />

        {/* Notifications Card */}
        <KPICard
          title="Notificaties"
          value={unreadNotifications.length.toString()}
          icon="🔔"
          color="purple"
          subtitle={`${unreadNotifications.filter(n => n.priority === 'high').length} urgent`}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity & Low Stock */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Werkorders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Recente Werkorders
              </h2>
              <a
                href="/workorders"
                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
              >
                Alles bekijken →
              </a>
            </div>

            {recentWorkOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Geen werkorders gevonden
              </p>
            ) : (
              <div className="space-y-3">
                {recentWorkOrders.map((wo) => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{wo.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {wo.description || 'Geen beschrijving'}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center gap-3">
                      <StatusBadge status={wo.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Warnings */}
          {lowStockItems.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Lage Voorraad Waarschuwingen
                </h2>
                <a
                  href="/inventory"
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Naar Voorraad →
                </a>
              </div>

              <div className="space-y-3">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          SKU: {item.skuAutomatic}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-yellow-700">
                        {item.quantity} {item.unit}
                      </p>
                      <p className="text-xs text-gray-500">
                        Drempel: {item.reorderLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Notifications */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recente Notificaties
            </h2>

            {unreadNotifications.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-5xl">✅</span>
                <p className="text-gray-500 mt-3">
                  Geen nieuwe meldingen
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unreadNotifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-3 rounded-lg border-l-4
                      ${notification.type === 'error' ? 'bg-red-50 border-red-500' : ''}
                      ${notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' : ''}
                      ${notification.type === 'success' ? 'bg-green-50 border-green-500' : ''}
                      ${notification.type === 'info' ? 'bg-blue-50 border-blue-500' : ''}
                    `}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString('nl-NL')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Overzicht</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sky-100">Te doen</span>
                <span className="font-bold">{workOrderStats.todo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-100">In uitvoering</span>
                <span className="font-bold">{workOrderStats.in_progress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sky-100">Afgerond</span>
                <span className="font-bold">{workOrderStats.completed}</span>
              </div>
              <div className="pt-3 border-t border-sky-400 flex justify-between">
                <span className="text-sky-100">Totaal items</span>
                <span className="font-bold">{inventory.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface KPICardProps {
  title: string;
  value: string;
  icon: string;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-sky-600',
    red: 'from-red-500 to-rose-600',
    yellow: 'from-yellow-500 to-amber-600',
    purple: 'from-purple-500 to-violet-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between text-white">
          <span className="text-3xl">{icon}</span>
          <div className="text-right">
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
        </div>
      </div>
      {subtitle && (
        <div className="px-4 py-3 bg-gray-50">
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      )}
    </div>
  );
};

interface StatusBadgeProps {
  status: WorkOrder['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    todo: { label: 'Te doen', color: 'bg-gray-100 text-gray-700' },
    pending: { label: 'In wacht', color: 'bg-yellow-100 text-yellow-700' },
    in_progress: { label: 'Bezig', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Klaar', color: 'bg-green-100 text-green-700' },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};
