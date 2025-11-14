/**
 * CRMPage - Customer Relationship Management
 * Klantbeheer, leads pipeline en interacties
 */

import React, { useState } from 'react';
import type { User, Customer, Lead, LeadStatus } from '../../types';
import { useCustomers, useLeads } from '../../features/crm';

type CRMPageProps = {
  currentUser: User;
  initialCustomers: Customer[];
  initialLeads: Lead[];
};

type Tab = 'dashboard' | 'customers' | 'leads' | 'interactions';

export const CRMPage: React.FC<CRMPageProps> = ({
  currentUser,
  initialCustomers,
  initialLeads,
}) => {
  const {
    filteredCustomers,
    stats: customerStats,
    searchTerm,
    handleSearch,
    clearSearch,
  } = useCustomers(initialCustomers);

  const {
    leadsByStatus,
    stats: leadStats,
    updateLeadStatus,
    moveToNextStage,
    markAsWon,
    markAsLost,
    convertToCustomer,
  } = useLeads(initialLeads);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const isAdmin = currentUser.isAdmin;

  // Render lead status column
  const renderLeadColumn = (status: LeadStatus, title: string, leads: Lead[]) => {
    const getStatusColor = () => {
      switch (status) {
        case 'new':
          return 'bg-gray-100 border-gray-300';
        case 'contacted':
          return 'bg-blue-100 border-blue-300';
        case 'qualified':
          return 'bg-green-100 border-green-300';
        case 'proposal':
          return 'bg-yellow-100 border-yellow-300';
        case 'negotiation':
          return 'bg-orange-100 border-orange-300';
        case 'won':
          return 'bg-green-200 border-green-400';
        case 'lost':
          return 'bg-red-100 border-red-300';
        default:
          return 'bg-gray-100';
      }
    };

    return (
      <div className={`rounded-lg border-2 ${getStatusColor()} p-4 min-h-[200px]`}>
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-600">
            {leads.length} leads • €
            {leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0).toLocaleString('nl-NL')}
          </p>
        </div>

        <div className="space-y-2">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-gray-900 truncate">{lead.name}</h4>
                  {lead.company && (
                    <p className="text-xs text-gray-600 truncate">🏢 {lead.company}</p>
                  )}
                  <p className="text-xs text-gray-500 truncate">📧 {lead.email}</p>
                  {lead.estimatedValue && (
                    <p className="text-xs font-semibold text-gray-900 mt-1">
                      €{lead.estimatedValue.toLocaleString('nl-NL')}
                    </p>
                  )}
                </div>
              </div>

              {isAdmin && status !== 'won' && status !== 'lost' && (
                <div className="mt-2 flex items-center space-x-1">
                  <button
                    onClick={() => moveToNextStage(lead.id)}
                    className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                  >
                    → Volgende
                  </button>
                  <button
                    onClick={() => markAsWon(lead.id)}
                    className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition"
                    title="Gewonnen"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => markAsLost(lead.id)}
                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                    title="Verloren"
                  >
                    ✗
                  </button>
                </div>
              )}

              {status === 'won' && isAdmin && !lead.customerId && (
                <button
                  onClick={() => {
                    const customerData = convertToCustomer(lead.id);
                    if (customerData) {
                      alert('Lead geconverteerd naar klant! (Placeholder)');
                    }
                  }}
                  className="mt-2 w-full px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition"
                >
                  → Converteer naar Klant
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Totaal Klanten</div>
                <div className="text-2xl font-bold text-gray-900">{customerStats.total}</div>
                <div className="text-xs text-gray-500">
                  {customerStats.business} zakelijk, {customerStats.private} particulier
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Actieve Leads</div>
                <div className="text-2xl font-bold text-blue-600">{leadStats.active}</div>
                <div className="text-xs text-gray-500">
                  {leadStats.total} totaal
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Conversie Rate</div>
                <div className="text-2xl font-bold text-green-600">
                  {leadStats.conversionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {leadStats.won} gewonnen, {leadStats.lost} verloren
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Pipeline Waarde</div>
                <div className="text-2xl font-bold text-gray-900">
                  €{leadStats.pipelineValue.total.toLocaleString('nl-NL')}
                </div>
                <div className="text-xs text-gray-500">Geschatte totaal</div>
              </div>
            </div>

            {/* Recent activity placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recente Activiteiten</h2>
              <p className="text-gray-600 text-sm">Timeline met recente klant interacties wordt hier getoond</p>
            </div>
          </div>
        );

      case 'customers':
        return (
          <div className="space-y-6">
            {/* Search bar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Zoek op naam, email, bedrijf..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    ✗ Clear
                  </button>
                )}
                {isAdmin && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Nieuwe Klant
                  </button>
                )}
              </div>
            </div>

            {/* Customers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-blue-300 transition cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
                      {customer.company && (
                        <p className="text-sm text-gray-600 truncate">🏢 {customer.company}</p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        customer.company
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {customer.company ? 'Zakelijk' : 'Particulier'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600 truncate">📧 {customer.email}</p>
                    {customer.phone && (
                      <p className="text-gray-600 truncate">📞 {customer.phone}</p>
                    )}
                    {customer.city && (
                      <p className="text-gray-600 truncate">📍 {customer.city}</p>
                    )}
                  </div>

                  {customer.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 line-clamp-2">{customer.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {customer.invoiceIds?.length || 0} facturen
                    </span>
                    <span>
                      Sinds {new Date(customer.createdAt).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <span className="text-4xl mb-4 block">👥</span>
                <p className="text-gray-600">
                  {searchTerm ? 'Geen klanten gevonden' : 'Nog geen klanten aangemaakt'}
                </p>
              </div>
            )}
          </div>
        );

      case 'leads':
        return (
          <div className="space-y-6">
            {/* Pipeline header */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Leads Pipeline</h2>
                  <p className="text-sm text-gray-600">
                    {leadStats.active} actieve leads • €{leadStats.pipelineValue.total.toLocaleString('nl-NL')} waarde
                  </p>
                </div>
                {isAdmin && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    + Nieuwe Lead
                  </button>
                )}
              </div>
            </div>

            {/* 7-fase Pipeline (Kanban) */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 overflow-x-auto">
              {renderLeadColumn('new', '1. Nieuw', leadsByStatus.new)}
              {renderLeadColumn('contacted', '2. Contact', leadsByStatus.contacted)}
              {renderLeadColumn('qualified', '3. Gekwalificeerd', leadsByStatus.qualified)}
              {renderLeadColumn('proposal', '4. Voorstel', leadsByStatus.proposal)}
              {renderLeadColumn('negotiation', '5. Onderhandeling', leadsByStatus.negotiation)}
              {renderLeadColumn('won', '6. Gewonnen ✓', leadsByStatus.won)}
              {renderLeadColumn('lost', '7. Verloren ✗', leadsByStatus.lost)}
            </div>
          </div>
        );

      case 'interactions':
        return (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <span className="text-6xl mb-4 block">💬</span>
            <h2 className="text-2xl font-bold mb-2">Interacties & Communicatie</h2>
            <p className="text-gray-600 mb-4">
              Bijhouden van alle klant contactmomenten (calls, emails, meetings)
            </p>
            <p className="text-sm text-gray-500">Module wordt binnenkort toegevoegd</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CRM - Klantrelatiebeheer</h1>
        <p className="text-gray-600 mt-2">Beheer klanten, leads en interacties</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📊 Dashboard
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            👥 Klanten ({customerStats.total})
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'leads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            🎯 Leads ({leadStats.total})
          </button>

          <button
            onClick={() => setActiveTab('interactions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'interactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
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
