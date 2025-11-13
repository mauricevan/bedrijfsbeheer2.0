/**
 * CRMPage
 * Customer Relationship Management met 7-fase pipeline
 */

import React from 'react';
import type { User, Customer, Lead, LeadStatus } from '../../types';
import { useCRM } from '../../features/crm';

type CRMPageProps = {
  currentUser: User;
  initialCustomers: Customer[];
  initialLeads: Lead[];
};

export const CRMPage: React.FC<CRMPageProps> = ({
  currentUser: _currentUser,
  initialCustomers,
  initialLeads,
}) => {
  const {
    customers,
    leads,
    leadsByStatus,
    stats,
    selectedTab,
    setSelectedTab,
    moveLeadStatus,
    convertLeadToCustomer,
  } = useCRM(initialCustomers, initialLeads);

  const getStatusLabel = (status: LeadStatus): string => {
    const labels: Record<LeadStatus, string> = {
      new: '1. Nieuw',
      contacted: '2. Gecontacteerd',
      qualified: '3. Gekwalificeerd',
      proposal: '4. Offerte',
      negotiation: '5. Onderhandeling',
      won: '6. Gewonnen',
      lost: '7. Verloren',
    };
    return labels[status];
  };

  const getStatusColor = (status: LeadStatus): string => {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-gray-100 border-gray-300',
      contacted: 'bg-blue-100 border-blue-300',
      qualified: 'bg-cyan-100 border-cyan-300',
      proposal: 'bg-indigo-100 border-indigo-300',
      negotiation: 'bg-purple-100 border-purple-300',
      won: 'bg-green-100 border-green-300',
      lost: 'bg-red-100 border-red-300',
    };
    return colors[status];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
        <p className="text-gray-600 mt-2">Customer Relationship Management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Klanten</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Actieve Leads</p>
          <p className="text-2xl font-bold text-blue-600">{stats.activeLeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Pipeline Waarde</p>
          <p className="text-2xl font-bold text-indigo-600">€{stats.pipelineValue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Gewonnen</p>
          <p className="text-2xl font-bold text-green-600">{stats.wonLeads} (€{stats.wonValue.toLocaleString()})</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('customers')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'customers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Klanten ({customers.length})
            </button>
            <button
              onClick={() => setSelectedTab('leads')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 Leads Pipeline ({leads.length})
            </button>
          </nav>
        </div>

        {/* Customers Tab */}
        {selectedTab === 'customers' && (
          <div className="p-6">
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen klanten gevonden</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        {customer.company && (
                          <p className="text-sm text-gray-600">{customer.company}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📧 {customer.email}</p>
                      {customer.phone && <p>📞 {customer.phone}</p>}
                      {customer.city && <p>📍 {customer.city}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Leads Pipeline Tab (7 fases) */}
        {selectedTab === 'leads' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as LeadStatus[]).map(
                (status) => (
                  <div key={status} className={`rounded-lg p-3 ${getStatusColor(status)}`}>
                    <h3 className="font-semibold text-sm mb-3 text-gray-900">
                      {getStatusLabel(status)}
                      <span className="ml-2 text-xs">({leadsByStatus[status].length})</span>
                    </h3>
                    <div className="space-y-2">
                      {leadsByStatus[status].map((lead) => (
                        <div
                          key={lead.id}
                          className="p-3 bg-white rounded border-2 border-gray-200 hover:shadow-sm transition"
                        >
                          <p className="font-medium text-sm text-gray-900 mb-1">{lead.name}</p>
                          {lead.company && (
                            <p className="text-xs text-gray-600 mb-2">{lead.company}</p>
                          )}
                          {lead.estimatedValue && (
                            <p className="text-xs font-medium text-green-600 mb-2">
                              €{lead.estimatedValue.toLocaleString()}
                            </p>
                          )}

                          {/* Pipeline Actions */}
                          <div className="flex gap-1 mt-2">
                            {status !== 'new' && !['won', 'lost'].includes(status) && (
                              <button
                                onClick={() => {
                                  const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
                                  const currentIndex = statuses.indexOf(status);
                                  if (currentIndex > 0) {
                                    moveLeadStatus(lead.id, statuses[currentIndex - 1]);
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                                title="Vorige fase"
                              >
                                ←
                              </button>
                            )}

                            {!['won', 'lost'].includes(status) && (
                              <>
                                <button
                                  onClick={() => {
                                    const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
                                    const currentIndex = statuses.indexOf(status);
                                    if (currentIndex < statuses.length - 1) {
                                      moveLeadStatus(lead.id, statuses[currentIndex + 1]);
                                    } else {
                                      // At negotiation, can go to won
                                      moveLeadStatus(lead.id, 'won');
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="Volgende fase"
                                >
                                  →
                                </button>

                                {status === 'negotiation' && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Lead "${lead.name}" converteren naar klant?`)) {
                                        const customer = convertLeadToCustomer(lead.id);
                                        if (customer) {
                                          alert(`Klant "${customer.name}" aangemaakt!`);
                                          setSelectedTab('customers');
                                        }
                                      }
                                    }}
                                    className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                    title="Win & Converteer"
                                  >
                                    ✓
                                  </button>
                                )}
                              </>
                            )}

                            {!['won', 'lost'].includes(status) && (
                              <button
                                onClick={() => moveLeadStatus(lead.id, 'lost')}
                                className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                title="Verloren"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
