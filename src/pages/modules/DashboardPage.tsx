/**
 * DashboardPage
 * Main dashboard met KPI cards en overzichten
 */

import React, { useMemo } from 'react';
import type {
  User,
  WorkOrder,
  Invoice,
  Notification,
  InventoryItem,
  Quote
} from '../../types';

type DashboardPageProps = {
  currentUser: User | null;
  workOrders: WorkOrder[];
  invoices: Invoice[];
  quotes: Quote[];
  notifications: Notification[];
  inventory: InventoryItem[];
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  workOrders,
  invoices,
  quotes,
  notifications,
  inventory,
}) => {
  // KPI Calculations
  const kpis = useMemo(() => {
    // Totale omzet (betaalde facturen)
    const totalRevenue = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    // Open facturen
    const openInvoices = invoices.filter((inv) => inv.status !== 'paid').length;

    // Actieve werkorders
    const activeWorkOrders = workOrders.filter(
      (wo) => wo.status === 'in_progress' || wo.status === 'pending'
    ).length;

    // Lage voorraad items
    const lowStockItems = inventory.filter(
      (item) => item.quantity <= item.reorderLevel
    ).length;

    // Ongelezen notificaties
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    // Goedgekeurde offertes (te converteren)
    const approvedQuotes = quotes.filter((q) => q.status === 'approved').length;

    return {
      totalRevenue,
      openInvoices,
      activeWorkOrders,
      lowStockItems,
      unreadNotifications,
      approvedQuotes,
    };
  }, [invoices, workOrders, inventory, notifications, quotes]);

  // Filter werkorders voor huidige gebruiker (als niet admin)
  const userWorkOrders = useMemo(() => {
    if (currentUser?.isAdmin) {
      return workOrders;
    }
    return workOrders.filter((wo) => wo.assignedTo === currentUser?.id);
  }, [workOrders, currentUser]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Welkom terug, {currentUser?.name}!
          {currentUser?.isAdmin ? ' (Admin)' : ' (Medewerker)'}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Omzet */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Totale Omzet</p>
              <p className="text-3xl font-bold text-gray-900">
                €{kpis.totalRevenue.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Open Facturen */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open Facturen</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.openInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧾</span>
            </div>
          </div>
        </div>

        {/* Actieve Werkorders */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Actieve Werkorders</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.activeWorkOrders}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>

        {/* Lage Voorraad */}
        {currentUser?.isAdmin && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lage Voorraad</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.lowStockItems}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
            </div>
          </div>
        )}

        {/* Goedgekeurde Offertes */}
        {currentUser?.isAdmin && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Goedgekeurde Offertes</p>
                <p className="text-3xl font-bold text-gray-900">{kpis.approvedQuotes}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </div>
        )}

        {/* Notificaties */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ongelezen Meldingen</p>
              <p className="text-3xl font-bold text-gray-900">{kpis.unreadNotifications}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🔔</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recente Werkorders */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {currentUser?.isAdmin ? 'Recente Werkorders' : 'Mijn Werkorders'}
          </h2>
        </div>
        <div className="p-6">
          {userWorkOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Geen werkorders</p>
          ) : (
            <div className="space-y-4">
              {userWorkOrders.slice(0, 5).map((wo) => (
                <div
                  key={wo.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="font-medium text-gray-900">{wo.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{wo.description}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        wo.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : wo.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : wo.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {wo.status === 'completed'
                        ? 'Afgerond'
                        : wo.status === 'in_progress'
                        ? 'In Uitvoering'
                        : wo.status === 'pending'
                        ? 'In Wacht'
                        : 'Te Doen'}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {wo.actualHours}u / {wo.estimatedHours}u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notificaties */}
      {kpis.unreadNotifications > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recente Meldingen</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {notifications
                .filter((n) => !n.read)
                .slice(0, 5)
                .map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      notif.type === 'error'
                        ? 'bg-red-50 border-red-500'
                        : notif.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : notif.type === 'success'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notif.timestamp).toLocaleString('nl-NL')}
                        </p>
                      </div>
                      <span className="text-lg">
                        {notif.type === 'error'
                          ? '❌'
                          : notif.type === 'warning'
                          ? '⚠️'
                          : notif.type === 'success'
                          ? '✅'
                          : 'ℹ️'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
