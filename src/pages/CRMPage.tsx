/**
 * CRM Page
 * Main page for CRM module (Customers & Leads management)
 */

import React, { useState } from 'react';
import { useCRM } from '../features/crm/hooks';
import { CustomerCard, LeadCard } from '../components/crm';
import { groupLeadsByStatus } from '../features/crm/utils/helpers';
import { initialCustomers } from '../data/initialData';
import type { LeadStatus } from '../types';

// Demo leads data (als initialLeads niet bestaat)
const demoLeads = [
  {
    id: 'lead-1',
    name: 'Jan Bakker',
    email: 'jan@bakkerij.nl',
    phone: '06-12345678',
    company: 'Bakkerij Bakker',
    status: 'new' as LeadStatus,
    estimatedValue: 5000,
    probability: 20,
    source: 'website',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'lead-2',
    name: 'Sophie Jansen',
    email: 'sophie@example.nl',
    phone: '06-87654321',
    status: 'qualified' as LeadStatus,
    estimatedValue: 12000,
    probability: 60,
    source: 'referral',
    createdAt: '2024-01-10T14:30:00.000Z',
    updatedAt: '2024-01-18T09:15:00.000Z',
    lastContactedAt: '2024-01-18T09:15:00.000Z'
  }
];

export const CRMPage: React.FC = () => {
  const crm = useCRM(initialCustomers, demoLeads);
  const [activeTab, setActiveTab] = useState<'customers' | 'leads' | 'pipeline'>('customers');

  const leadGroups = groupLeadsByStatus(crm.leads);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CRM</h1>
          <p className="text-gray-600">
            Klantrelatiebeheer - Klanten & Leads
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Totaal Klanten</p>
            <p className="text-3xl font-bold text-gray-900">
              {crm.stats.totalCustomers}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {crm.stats.zakelijkCustomers} zakelijk, {crm.stats.particulierCustomers} particulier
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Actieve Leads</p>
            <p className="text-3xl font-bold text-blue-600">
              {crm.stats.activeLeads}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              In pipeline
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Conversie Rate</p>
            <p className="text-3xl font-bold text-green-600">
              {crm.stats.conversionRate.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {crm.stats.wonLeads} gewonnen van {crm.stats.wonLeads + crm.stats.lostLeads}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pipeline Waarde</p>
            <p className="text-3xl font-bold text-purple-600">
              €{crm.stats.pipelineValue.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Geschatte waarde
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('customers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Klanten ({crm.customers.length})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Leads ({crm.leads.length})
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pipeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pipeline
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'customers' && (
          <div>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Zoek klanten..."
                value={crm.customerFilters.search || ''}
                onChange={e =>
                  crm.setCustomerFilters({ ...crm.customerFilters, search: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Customers grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {crm.filteredCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onDelete={crm.removeCustomer}
                />
              ))}
            </div>

            {crm.filteredCustomers.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Geen klanten gevonden
              </div>
            )}
          </div>
        )}

        {activeTab === 'leads' && (
          <div>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Zoek leads..."
                value={crm.leadFilters.search || ''}
                onChange={e =>
                  crm.setLeadFilters({ ...crm.leadFilters, search: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Leads list */}
            <div className="space-y-2">
              {crm.filteredLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onDelete={crm.removeLead}
                  onStatusChange={crm.updateLeadStatusData}
                  onConvert={crm.convertLead}
                />
              ))}
            </div>

            {crm.filteredLeads.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Geen leads gevonden
              </div>
            )}
          </div>
        )}

        {activeTab === 'pipeline' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(
              status => (
                <div key={status} className="bg-gray-100 rounded-lg p-3">
                  <h3 className="font-semibold text-gray-900 mb-3 capitalize">
                    {status.replace('_', ' ')} ({leadGroups[status].length})
                  </h3>
                  <div className="space-y-2">
                    {leadGroups[status].map(lead => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onDelete={crm.removeLead}
                        onStatusChange={crm.updateLeadStatusData}
                        onConvert={crm.convertLead}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CRMPage;
