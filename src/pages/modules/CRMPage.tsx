/**
 * CRMPage - Customer Relationship Management
 * Features: Customers, Leads, Pipeline, Interactions
 * Version: MVP 1.0
 */

import React, { useState, useMemo } from 'react';
import type {
  User,
  Customer,
  Lead,
  LeadStatus,
  Invoice,
  Quote,
} from '../../types';

interface CRMPageProps {
  currentUser: User | null;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  invoices: Invoice[];
  quotes: Quote[];
}

export const CRMPage: React.FC<CRMPageProps> = ({
  currentUser,
  customers,
  setCustomers,
  leads,
  setLeads,
  invoices,
  quotes,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'dashboard' | 'customers' | 'leads'>('dashboard');

  // Customer form
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    postalCode: '',
    city: '',
    vatNumber: '',
    notes: '',
  });

  // Lead form
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadFormData, setLeadFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new' as LeadStatus,
    estimatedValue: 0,
    probability: 50,
    source: '',
    notes: '',
  });

  // Search & filter
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [leadFilterStatus, setLeadFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Dashboard KPIs
  const dashboardKPIs = useMemo(() => {
    const totalCustomers = customers.length;
    const totalLeads = leads.length;
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status)).length;
    const wonLeads = leads.filter(l => l.status === 'won').length;
    const lostLeads = leads.filter(l => l.status === 'lost').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    const totalPipelineValue = leads
      .filter(l => !['won', 'lost'].includes(l.status))
      .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

    const customerInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalRevenue = customerInvoices.reduce((sum, inv) => sum + inv.total, 0);

    return {
      totalCustomers,
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      totalPipelineValue,
      totalRevenue,
    };
  }, [customers, leads, invoices]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const searchLower = customerSearchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        (customer.company && customer.company.toLowerCase().includes(searchLower))
      );
    });
  }, [customers, customerSearchTerm]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (leadFilterStatus === 'all') return true;
      return lead.status === leadFilterStatus;
    });
  }, [leads, leadFilterStatus]);

  // Leads by status (for pipeline)
  const leadsByStatus = useMemo(() => {
    const statuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    return statuses.map(status => ({
      status,
      leads: leads.filter(l => l.status === status),
      value: leads.filter(l => l.status === status).reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
    }));
  }, [leads]);

  // ============================================================================
  // CUSTOMER HANDLERS
  // ============================================================================

  const handleCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      postalCode: '',
      city: '',
      vatNumber: '',
      notes: '',
    });
    setShowCustomerForm(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      company: customer.company || '',
      address: customer.address || '',
      postalCode: customer.postalCode || '',
      city: customer.city || '',
      vatNumber: customer.vatNumber || '',
      notes: customer.notes || '',
    });
    setShowCustomerForm(true);
  };

  const handleSaveCustomer = () => {
    if (!customerFormData.name || !customerFormData.email) {
      alert('Naam en email zijn verplicht');
      return;
    }

    if (editingCustomer) {
      // Update existing
      setCustomers(prev => prev.map(c =>
        c.id === editingCustomer.id
          ? {
              ...c,
              ...customerFormData,
              updatedAt: new Date().toISOString(),
            }
          : c
      ));
    } else {
      // Create new
      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        ...customerFormData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    setShowCustomerForm(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (customerId: string) => {
    if (!confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      return;
    }
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  // ============================================================================
  // LEAD HANDLERS
  // ============================================================================

  const handleCreateLead = () => {
    setEditingLead(null);
    setLeadFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      estimatedValue: 0,
      probability: 50,
      source: '',
      notes: '',
    });
    setShowLeadForm(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setLeadFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status,
      estimatedValue: lead.estimatedValue || 0,
      probability: lead.probability || 50,
      source: lead.source || '',
      notes: lead.notes || '',
    });
    setShowLeadForm(true);
  };

  const handleSaveLead = () => {
    if (!leadFormData.name || !leadFormData.email) {
      alert('Naam en email zijn verplicht');
      return;
    }

    if (editingLead) {
      // Update existing
      setLeads(prev => prev.map(l =>
        l.id === editingLead.id
          ? {
              ...l,
              ...leadFormData,
              updatedAt: new Date().toISOString(),
            }
          : l
      ));
    } else {
      // Create new
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        ...leadFormData,
        assignedTo: currentUser!.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLeads(prev => [...prev, newLead]);
    }

    setShowLeadForm(false);
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId: string) => {
    if (!confirm('Weet je zeker dat je deze lead wilt verwijderen?')) {
      return;
    }
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, status: newStatus, updatedAt: new Date().toISOString() }
        : l
    ));
  };

  const handleConvertLeadToCustomer = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    if (lead.status !== 'won') {
      alert('Alleen gewonnen leads kunnen worden geconverteerd naar klanten');
      return;
    }

    if (!confirm(`Lead "${lead.name}" omzetten naar klant?`)) {
      return;
    }

    // Create customer from lead
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes ? `Geconverteerd van lead.\n\n${lead.notes}` : 'Geconverteerd van lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers(prev => [...prev, newCustomer]);

    // Update lead with customer link
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, customerId: newCustomer.id, updatedAt: new Date().toISOString() }
        : l
    ));

    alert(`Lead succesvol geconverteerd naar klant: ${newCustomer.name}`);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusLabel = (status: LeadStatus) => {
    const labels: Record<LeadStatus, string> = {
      new: 'Nieuw',
      contacted: 'Contact',
      qualified: 'Gekwalificeerd',
      proposal: 'Voorstel',
      negotiation: 'Onderhandeling',
      won: 'Gewonnen',
      lost: 'Verloren',
    };
    return labels[status];
  };

  const getStatusColor = (status: LeadStatus) => {
    const colors: Record<LeadStatus, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      qualified: 'bg-yellow-100 text-yellow-800',
      proposal: 'bg-orange-100 text-orange-800',
      negotiation: 'bg-pink-100 text-pink-800',
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getCustomerInvoices = (customerId: string) => {
    return invoices.filter(inv => inv.customerId === customerId);
  };

  const getCustomerQuotes = (customerId: string) => {
    return quotes.filter(q => q.customerId === customerId);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentUser) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Gelieve in te loggen om deze module te gebruiken.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👥 CRM - Klantrelatiebeheer</h1>
        <p className="text-gray-600 mt-1">Beheer klanten, leads en pipeline</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👤 Klanten ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'leads'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎯 Leads & Pipeline ({leads.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Totaal Klanten</div>
              <div className="text-3xl font-bold text-gray-900">{dashboardKPIs.totalCustomers}</div>
              <div className="text-sm text-green-600 mt-1">Actieve klantrelaties</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Actieve Leads</div>
              <div className="text-3xl font-bold text-blue-600">{dashboardKPIs.activeLeads}</div>
              <div className="text-sm text-gray-500 mt-1">van {dashboardKPIs.totalLeads} totaal</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Conversie Ratio</div>
              <div className="text-3xl font-bold text-green-600">{dashboardKPIs.conversionRate}%</div>
              <div className="text-sm text-gray-500 mt-1">{dashboardKPIs.wonLeads} gewonnen / {dashboardKPIs.lostLeads} verloren</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Pipeline Waarde</div>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardKPIs.totalPipelineValue)}</div>
              <div className="text-sm text-gray-500 mt-1">Geschatte waarde</div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Omzet Overzicht</h3>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(dashboardKPIs.totalRevenue)}
            </div>
            <p className="text-sm text-gray-600">Totale omzet van betaalde facturen</p>
          </div>

          {/* Pipeline Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Pipeline Overzicht</h3>
            <div className="space-y-3">
              {leadsByStatus.filter(s => !['won', 'lost'].includes(s.status)).map(stage => (
                <div key={stage.status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                      {getStatusLabel(stage.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {stage.leads.length} lead{stage.leads.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(stage.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div>
          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Zoek klanten..."
              value={customerSearchTerm}
              onChange={(e) => setCustomerSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleCreateCustomer}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Nieuwe Klant
            </button>
          </div>

          {/* Customers Grid */}
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Geen klanten gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map(customer => {
                const customerInvoices = getCustomerInvoices(customer.id);
                const totalSpent = customerInvoices
                  .filter(inv => inv.status === 'paid')
                  .reduce((sum, inv) => sum + inv.total, 0);

                return (
                  <div
                    key={customer.id}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          {customer.company && (
                            <p className="text-sm text-gray-600">{customer.company}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <span className="w-5">📧</span>
                        <span className="ml-2">{customer.email}</span>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center text-gray-600">
                          <span className="w-5">📞</span>
                          <span className="ml-2">{customer.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Totaal besteed:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(totalSpent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Aantal orders:</span>
                        <span className="font-semibold text-gray-900">{customerInvoices.length}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCustomer(customer);
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomer(customer.id);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Verwijderen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leads' && (
        <div>
          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <select
              value={leadFilterStatus}
              onChange={(e) => setLeadFilterStatus(e.target.value as LeadStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="new">Nieuw</option>
              <option value="contacted">Contact</option>
              <option value="qualified">Gekwalificeerd</option>
              <option value="proposal">Voorstel</option>
              <option value="negotiation">Onderhandeling</option>
              <option value="won">Gewonnen</option>
              <option value="lost">Verloren</option>
            </select>
            <button
              onClick={handleCreateLead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              + Nieuwe Lead
            </button>
          </div>

          {/* Leads List */}
          {filteredLeads.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Geen leads gevonden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLeads.map(lead => (
                <div key={lead.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>📧 {lead.email}</div>
                        {lead.phone && <div>📞 {lead.phone}</div>}
                        {lead.company && <div>🏢 {lead.company}</div>}
                        {lead.source && <div>📍 Bron: {lead.source}</div>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {formatCurrency(lead.estimatedValue || 0)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {lead.probability || 0}% kans
                      </div>
                    </div>
                  </div>

                  {lead.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
                      {lead.notes}
                    </div>
                  )}

                  {/* Status Buttons */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lead.status === 'new' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                      >
                        → Contact gemaakt
                      </button>
                    )}
                    {lead.status === 'contacted' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'qualified')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                      >
                        → Kwalificeren
                      </button>
                    )}
                    {lead.status === 'qualified' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'proposal')}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
                      >
                        → Voorstel versturen
                      </button>
                    )}
                    {lead.status === 'proposal' && (
                      <button
                        onClick={() => handleUpdateLeadStatus(lead.id, 'negotiation')}
                        className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-1 rounded text-sm"
                      >
                        → Onderhandelen
                      </button>
                    )}
                    {lead.status === 'negotiation' && (
                      <>
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'won')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          ✓ Gewonnen
                        </button>
                        <button
                          onClick={() => handleUpdateLeadStatus(lead.id, 'lost')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          ✗ Verloren
                        </button>
                      </>
                    )}
                    {lead.status === 'won' && !lead.customerId && (
                      <button
                        onClick={() => handleConvertLeadToCustomer(lead.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                      >
                        → Omzetten naar Klant
                      </button>
                    )}
                    {lead.customerId && (
                      <span className="text-sm text-green-600 font-semibold">
                        ✓ Omgezet naar klant
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLead(lead)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Verwijderen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingCustomer ? 'Klant Bewerken' : 'Nieuwe Klant'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={customerFormData.name}
                    onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrijf
                  </label>
                  <input
                    type="text"
                    value={customerFormData.company}
                    onChange={(e) => setCustomerFormData({...customerFormData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData({...customerFormData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={customerFormData.postalCode}
                    onChange={(e) => setCustomerFormData({...customerFormData, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plaats
                  </label>
                  <input
                    type="text"
                    value={customerFormData.city}
                    onChange={(e) => setCustomerFormData({...customerFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  BTW Nummer
                </label>
                <input
                  type="text"
                  value={customerFormData.vatNumber}
                  onChange={(e) => setCustomerFormData({...customerFormData, vatNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notities
                </label>
                <textarea
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData({...customerFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowCustomerForm(false);
                  setEditingCustomer(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveCustomer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingLead ? 'Lead Bewerken' : 'Nieuwe Lead'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={leadFormData.name}
                    onChange={(e) => setLeadFormData({...leadFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={leadFormData.email}
                    onChange={(e) => setLeadFormData({...leadFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={leadFormData.phone}
                    onChange={(e) => setLeadFormData({...leadFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bedrijf
                  </label>
                  <input
                    type="text"
                    value={leadFormData.company}
                    onChange={(e) => setLeadFormData({...leadFormData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={leadFormData.status}
                    onChange={(e) => setLeadFormData({...leadFormData, status: e.target.value as LeadStatus})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">Nieuw</option>
                    <option value="contacted">Contact</option>
                    <option value="qualified">Gekwalificeerd</option>
                    <option value="proposal">Voorstel</option>
                    <option value="negotiation">Onderhandeling</option>
                    <option value="won">Gewonnen</option>
                    <option value="lost">Verloren</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bron
                  </label>
                  <input
                    type="text"
                    value={leadFormData.source}
                    onChange={(e) => setLeadFormData({...leadFormData, source: e.target.value})}
                    placeholder="Website, Referral, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geschatte Waarde (€)
                  </label>
                  <input
                    type="number"
                    value={leadFormData.estimatedValue}
                    onChange={(e) => setLeadFormData({...leadFormData, estimatedValue: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kans (%)
                  </label>
                  <input
                    type="number"
                    value={leadFormData.probability}
                    onChange={(e) => setLeadFormData({...leadFormData, probability: parseInt(e.target.value) || 0})}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notities
                </label>
                <textarea
                  value={leadFormData.notes}
                  onChange={(e) => setLeadFormData({...leadFormData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowLeadForm(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveLead}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                {selectedCustomer.company && (
                  <p className="text-gray-600">{selectedCustomer.company}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contact Informatie</h3>
              <div className="space-y-2 text-sm">
                <div>📧 {selectedCustomer.email}</div>
                {selectedCustomer.phone && <div>📞 {selectedCustomer.phone}</div>}
                {selectedCustomer.address && (
                  <div>📍 {selectedCustomer.address}, {selectedCustomer.postalCode} {selectedCustomer.city}</div>
                )}
                {selectedCustomer.vatNumber && <div>🏢 BTW: {selectedCustomer.vatNumber}</div>}
              </div>
            </div>

            {/* Invoices */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Facturen ({getCustomerInvoices(selectedCustomer.id).length})</h3>
              {getCustomerInvoices(selectedCustomer.id).length === 0 ? (
                <p className="text-sm text-gray-500">Geen facturen gevonden</p>
              ) : (
                <div className="space-y-2">
                  {getCustomerInvoices(selectedCustomer.id).slice(0, 5).map(invoice => (
                    <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString('nl-NL')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(invoice.total)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {invoice.status === 'paid' ? 'Betaald' : 'Openstaand'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quotes */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Offertes ({getCustomerQuotes(selectedCustomer.id).length})</h3>
              {getCustomerQuotes(selectedCustomer.id).length === 0 ? (
                <p className="text-sm text-gray-500">Geen offertes gevonden</p>
              ) : (
                <div className="space-y-2">
                  {getCustomerQuotes(selectedCustomer.id).slice(0, 5).map(quote => (
                    <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">{quote.quoteNumber}</div>
                        <div className="text-sm text-gray-600">{new Date(quote.createdAt).toLocaleDateString('nl-NL')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(quote.total)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          quote.status === 'approved' ? 'bg-green-100 text-green-800' :
                          quote.status === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedCustomer.notes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notities</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
                  {selectedCustomer.notes}
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  handleEditCustomer(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Bewerken
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
