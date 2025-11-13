import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type {
  User,
  Customer,
  InventoryItem,
  Category,
  WorkOrder,
  Quote,
  Invoice,
  Notification,
  Lead,
} from './types/index';

// Initial Data
import {
  initialUsers,
  initialCustomers,
  initialInventory,
  initialCategories,
  initialWorkOrders,
  initialQuotes,
  initialInvoices,
  initialNotifications,
} from './data/initialData';

// Pages
import { Login } from './pages/Login';
import './App.css';

/**
 * App Component - Root component met centralized state management
 *
 * Architectuur Principes:
 * - Alle state bevindt zich in App.tsx (single source of truth)
 * - Props drilling pattern voor data flow
 * - Immutable updates (spread operators)
 * - Role-based access control (Admin vs User)
 *
 * State Management:
 * - Authentication: currentUser
 * - Data: customers, inventory, workOrders, quotes, invoices, etc.
 * - UI: notifications
 *
 * Voor details zie: docs/AI_GUIDE.md en docs/02-architecture/state-management.md
 */

const App: React.FC = () => {
  // ============================================================================
  // AUTHENTICATION STATE
  // ============================================================================

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // ============================================================================
  // BUSINESS DATA STATE
  // ============================================================================

  // Customers & CRM
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [categories, setCategories] = useState<Category[]>(initialCategories);

  // Workorders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);

  // Accounting
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // ============================================================================
  // AUTHENTICATION HANDLERS
  // ============================================================================

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Main Navigation Header */}
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Bedrijfsbeheer Dashboard
                  </h1>
                  <p className="text-xs text-gray-500">v5.8.0</p>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center gap-4">
                {/* Notifications Badge */}
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>

                {/* User Info */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500">
                      {currentUser.isAdmin ? '👑 Admin' : '👤 User'} • {currentUser.role}
                    </p>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    Uitloggen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Module Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 overflow-x-auto py-3">
              <NavButton to="/dashboard" icon="📊" label="Dashboard" />
              <NavButton to="/inventory" icon="📦" label="Voorraad" />
              <NavButton to="/workorders" icon="🔧" label="Werkorders" />
              <NavButton to="/accounting" icon="💰" label="Boekhouding" />
              <NavButton to="/crm" icon="👥" label="CRM" />
              {currentUser.isAdmin && (
                <>
                  <NavButton to="/hrm" icon="👨‍💼" label="HRM" />
                  <NavButton to="/pos" icon="🛒" label="POS" />
                  <NavButton to="/planning" icon="📅" label="Planning" />
                  <NavButton to="/reports" icon="📈" label="Reports" />
                  <NavButton to="/admin" icon="⚙️" label="Instellingen" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Dashboard Module
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Deze module wordt binnenkort gebouwd met KPI cards en statistieken
                  </p>
                  <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                    🚧 In ontwikkeling...
                  </div>
                </div>
              }
            />
            <Route
              path="/inventory"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Voorraadbeheer Module
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Deze module wordt binnenkort gebouwd
                  </p>
                  <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                    🚧 In ontwikkeling...
                  </div>
                </div>
              }
            />
            <Route
              path="/workorders"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Werkorders Module
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Kanban board met werkorders
                  </p>
                  <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                    🚧 In ontwikkeling...
                  </div>
                </div>
              }
            />
            <Route
              path="/accounting"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Boekhouding Module
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Offertes & Facturen
                  </p>
                  <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                    🚧 In ontwikkeling...
                  </div>
                </div>
              }
            />
            <Route
              path="/crm"
              element={
                <div className="text-center py-20">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    CRM Module
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Klantenbeheer & Leads
                  </p>
                  <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                    🚧 In ontwikkeling...
                  </div>
                </div>
              }
            />
            <Route
              path="/hrm"
              element={
                currentUser.isAdmin ? (
                  <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      HRM Module
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Personeelsbeheer
                    </p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                      🚧 In ontwikkeling...
                    </div>
                  </div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/pos"
              element={
                currentUser.isAdmin ? (
                  <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      POS Module
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Kassasysteem
                    </p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                      🚧 In ontwikkeling...
                    </div>
                  </div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/planning"
              element={
                currentUser.isAdmin ? (
                  <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Planning Module
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Agenda & Kalender
                    </p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                      🚧 In ontwikkeling...
                    </div>
                  </div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/reports"
              element={
                currentUser.isAdmin ? (
                  <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Reports Module
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Rapportages & Analytics
                    </p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                      🚧 In ontwikkeling...
                    </div>
                  </div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route
              path="/admin"
              element={
                currentUser.isAdmin ? (
                  <div className="text-center py-20">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Admin Instellingen
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Modules & Systeem Configuratie
                    </p>
                    <div className="inline-block bg-blue-50 text-blue-700 px-6 py-3 rounded-lg">
                      🚧 In ontwikkeling...
                    </div>
                  </div>
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2025 Bedrijfsbeheer Dashboard • Versie 5.8.0
              </p>
              <p className="text-sm text-gray-500">
                Gebouwd met React 19 + TypeScript + Tailwind CSS 4
              </p>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface NavButtonProps {
  to: string;
  icon: string;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ to, icon, label }) => {
  const isActive = window.location.pathname === to;

  return (
    <a
      href={to}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm font-medium
        ${isActive
          ? 'bg-sky-100 text-sky-700'
          : 'text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </a>
  );
};

export default App;
