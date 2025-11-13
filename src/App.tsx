/**
 * App Component - Root
 * Centralized state management volgens CONVENTIONS.md
 */

import React, { useState, useEffect } from 'react';
import { LoginPage } from './components/auth';
import { DashboardPage } from './pages/modules/DashboardPage';
import { InventoryPage } from './pages/modules/InventoryPage';
import { WorkOrdersPage } from './pages/modules/WorkOrdersPage';
import { AccountingPage } from './pages/modules/AccountingPage';
import { CRMPage } from './pages/modules/CRMPage';
import { HRMPage } from './pages/modules/HRMPage';
import { useAuth } from './features/auth';
import {
  initialUsers,
  initialInventory,
  initialCategories,
  initialCustomers,
  initialWorkOrders,
  initialQuotes,
  initialInvoices,
  initialLeads,
  initialNotifications,
  initialModuleSettings,
} from './data/initialData';
import type {
  User,
  InventoryItem,
  Category,
  Customer,
  WorkOrder,
  Quote,
  Invoice,
  Lead,
  Notification,
  ModuleSettings,
} from './types';
import './App.css';

/**
 * App - Root Component
 *
 * Centralized State Management:
 * - Alle state wordt hier beheerd
 * - Props drilling naar child components
 * - Volgens architectuur in CONVENTIONS.md
 */

const App: React.FC = () => {
  // ============================================================================
  // STATE - Centralized volgens docs
  // ============================================================================

  // Authentication
  const [users] = useState<User[]>(initialUsers);
  const { currentUser, loginError, login, logout, checkStoredSession } = useAuth(users);

  // Inventory
  const [inventory] = useState<InventoryItem[]>(initialInventory);
  const [categories] = useState<Category[]>(initialCategories);
  // setInventory, setCategories - state managed by useInventory hook in InventoryPage

  // Customers & CRM
  const [customers] = useState<Customer[]>(initialCustomers);
  const [leads] = useState<Lead[]>(initialLeads);
  // setCustomers, setLeads - used later in CRM module

  // WorkOrders
  const [workOrders] = useState<WorkOrder[]>(initialWorkOrders);
  // setWorkOrders - used later in WorkOrders module

  // Accounting
  const [quotes] = useState<Quote[]>(initialQuotes);
  const [invoices] = useState<Invoice[]>(initialInvoices);
  // setQuotes, setInvoices - used later in Accounting module

  // Notifications
  const [notifications] = useState<Notification[]>(initialNotifications);
  // setNotifications - used later in Notifications module

  // Module Settings
  const [moduleSettings] = useState<ModuleSettings[]>(initialModuleSettings);

  // UI State
  const [currentModule, setCurrentModule] = useState<string>('dashboard');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check stored session on mount
  useEffect(() => {
    checkStoredSession();
  }, [checkStoredSession]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogin = (email: string, password: string) => {
    login(email, password);
  };

  const handleLogout = () => {
    logout();
    setCurrentModule('dashboard');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Not logged in - show login page
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  // Logged in - show app
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🏢</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bedrijfsbeheer</h1>
                <p className="text-xs text-gray-600">Versie 6.0.0</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              {/* Notifications Badge */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <span className="text-xl">🔔</span>
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                  <p className="text-xs text-gray-600">
                    {currentUser.isAdmin ? 'Administrator' : 'Medewerker'}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-8 overflow-x-auto">
              {moduleSettings
                .filter((mod) => mod.enabled)
                .filter((mod) => {
                  // Hide admin-only modules for non-admin users
                  if (!currentUser.isAdmin) {
                    return !['admin', 'accounting', 'hrm'].includes(mod.moduleName);
                  }
                  return true;
                })
                .map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setCurrentModule(mod.moduleName)}
                    className={`flex items-center space-x-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                      currentModule === mod.moduleName
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <span>{mod.icon}</span>
                    <span>{mod.displayName}</span>
                  </button>
                ))}
            </nav>
          </div>
        </div>

        {/* Module Content */}
        <div className="py-6">
          {currentModule === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              workOrders={workOrders}
              invoices={invoices}
              quotes={quotes}
              notifications={notifications}
              inventory={inventory}
            />
          )}

          {currentModule === 'inventory' && (
            <InventoryPage
              currentUser={currentUser}
              initialInventory={inventory}
              initialCategories={categories}
            />
          )}

          {currentModule === 'workorders' && (
            <WorkOrdersPage
              currentUser={currentUser}
              initialWorkOrders={workOrders}
              availableUsers={users}
            />
          )}

          {currentModule === 'accounting' && currentUser.isAdmin && (
            <AccountingPage
              currentUser={currentUser}
              initialQuotes={quotes}
              initialInvoices={invoices}
              customers={customers}
            />
          )}

          {currentModule === 'crm' && (
            <CRMPage
              currentUser={currentUser}
              initialCustomers={customers}
              initialLeads={leads}
            />
          )}

          {currentModule === 'hrm' && currentUser.isAdmin && (
            <HRMPage currentUser={currentUser} users={users} />
          )}

          {/* Placeholder voor andere modules */}
          {!['dashboard', 'inventory', 'workorders', 'accounting', 'crm', 'hrm'].includes(
            currentModule
          ) && (
            <div className="p-6 max-w-7xl mx-auto">
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <span className="text-6xl mb-4 block">🚧</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {moduleSettings.find((m) => m.moduleName === currentModule)?.displayName}
                </h2>
                <p className="text-gray-600">Module wordt binnenkort toegevoegd</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-center text-sm text-gray-600">
            © 2025 Bedrijfsbeheer Dashboard v6.0.0 - Gebouwd volgens MD specificaties
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
