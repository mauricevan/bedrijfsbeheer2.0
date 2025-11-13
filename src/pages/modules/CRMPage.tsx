/**
 * CRMPage - Customer Relationship Management
 * Klantbeheer, leads en interacties
 */

import React, { useState, useMemo } from 'react';
import type { User, Customer, Lead } from '../../types';

type CRMPageProps = {
  currentUser: User | null;
  initialCustomers: Customer[];
  initialLeads: Lead[];
};

type Tab = 'customers' | 'leads' | 'interactions';

export const CRMPage: React.FC<CRMPageProps> = ({
  currentUser,
  initialCustomers,
  initialLeads,
}) => {
  const [customers] = useState<Customer[]>(initialCustomers);
  const [leads] = useState<Lead[]>(initialLeads);
  const [activeTab, setActiveTab] = useState<Tab>('customers');

  // Statistieken
  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    businessCustomers: customers.filter(c => c.company).length,
    totalLeads: leads.length,
    activeLeads: leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status || '')).length,
  }), [customers, leads]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customers':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Totaal Klanten</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Zakelijke Klanten</div>
                <div className="text-2xl font-bold text-blue-600">{stats.businessCustomers}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Particuliere Klanten</div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalCustomers - stats.businessCustomers}
                </div>
              </div>
            </div>

            {/* Customers List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Klanten</h2>
                  {currentUser?.isAdmin && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      + Nieuwe Klant
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300">
                      <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                      {customer.company && (
                        <p className="text-sm text-gray-600">🏢 {customer.company}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">📧 {customer.email}</p>
                      {customer.phone && (
                        <p className="text-sm text-gray-600">📞 {customer.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Totaal Leads</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalLeads}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Actieve Leads</div>
                <div className="text-2xl font-bold text-blue-600">{stats.activeLeads}</div>
              </div>
            </div>

            {/* Leads List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Leads Pipeline</h2>
              <p className="text-gray-600">Pipeline met 7 fasen wordt binnenkort toegevoegd</p>
            </div>
          </div>
        );

      case 'interactions':
        return (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <span className="text-6xl mb-4 block">💬</span>
            <h2 className="text-2xl font-bold mb-2">Interacties</h2>
            <p className="text-gray-600">Communicatie geschiedenis wordt binnenkort toegevoegd</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">CRM - Klantrelatiebeheer</h1>
        <p className="text-gray-600">Beheer klanten, leads en interacties</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'customers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            👥 Klanten ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'leads' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            🎯 Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`pb-4 px-1 border-b-2 font-medium ${
              activeTab === 'interactions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600'
            }`}
          >
            💬 Interacties
          </button>
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};
