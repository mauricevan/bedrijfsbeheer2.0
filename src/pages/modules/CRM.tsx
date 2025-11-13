import React, { useState, useMemo } from 'react';
import type { User, Customer, Lead, Invoice, LeadStatus } from '../../types/index';

interface CRMProps {
  currentUser: User;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  invoices: Invoice[];
}

type Tab = 'dashboard' | 'leads' | 'klanten' | 'interacties' | 'email' | 'taken';
type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'sms';
type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Interaction {
  id: string;
  type: InteractionType;
  subject: string;
  description: string;
  customerId?: string;
  leadId?: string;
  userId: string;
  timestamp: string;
  followUpDate?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  customerId?: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * CRM Component - Klantrelatiebeheer
 *
 * Features:
 * - 6 tabs: Dashboard, Leads & Pipeline, Klanten, Interacties, Email, Taken
 * - 7-fase pipeline (Nieuw → Contact → Gekwalificeerd → Voorstel → Onderhandeling → Gewonnen/Verloren)
 * - Lead to customer conversion
 * - Interaction tracking (Call, Email, Meeting, Note, SMS)
 * - Task management with priorities and deadlines
 * - Customer notes and financial history
 */

export const CRM: React.FC<CRMProps> = ({
  currentUser,
  customers,
  setCustomers,
  leads,
  setLeads,
  invoices,
}) => {
  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // ============================================================================
  // CALCULATIONS & STATISTICS
  // ============================================================================

  // Dashboard KPIs
  const dashboardStats = useMemo(() => {
    const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.status));
    const wonLeads = leads.filter(l => l.status === 'won');
    const totalLeadValue = leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);
    const conversionRate = leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;

    const zakelijkeKlanten = customers.filter(c => c.company).length;
    const particuliereKlanten = customers.filter(c => !c.company).length;

    const overdueInteractions = interactions.filter(i =>
      i.followUpDate && new Date(i.followUpDate) < new Date()
    ).length;

    const overdueTasks = tasks.filter(t =>
      t.status !== 'done' && t.deadline && new Date(t.deadline) < new Date()
    ).length;

    return {
      totalLeads: leads.length,
      activeLeads: activeLeads.length,
      wonLeads: wonLeads.length,
      conversionRate,
      totalLeadValue,
      totalCustomers: customers.length,
      zakelijkeKlanten,
      particuliereKlanten,
      totalInteractions: interactions.length,
      overdueInteractions,
      totalTasks: tasks.length,
      overdueTasks,
    };
  }, [leads, customers, interactions, tasks]);

  // Leads grouped by phase
  const leadsByPhase = useMemo(() => {
    return {
      new: leads.filter(l => l.status === 'new'),
      contact: leads.filter(l => l.status === 'contacted'),
      qualified: leads.filter(l => l.status === 'qualified'),
      proposal: leads.filter(l => l.status === 'proposal'),
      negotiation: leads.filter(l => l.status === 'negotiation'),
      won: leads.filter(l => l.status === 'won'),
      lost: leads.filter(l => l.status === 'lost'),
    };
  }, [leads]);

  // Pipeline value per phase
  const pipelineValue = useMemo(() => {
    return {
      new: leadsByPhase.new.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      contact: leadsByPhase.contact.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      qualified: leadsByPhase.qualified.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      proposal: leadsByPhase.proposal.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      negotiation: leadsByPhase.negotiation.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
    };
  }, [leadsByPhase]);

  // Customer financials
  const customerFinancials = useMemo(() => {
    const map = new Map<string, { totalSpent: number; orderCount: number }>();

    customers.forEach(customer => {
      const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
      const totalSpent = customerInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0);

      map.set(customer.id, {
        totalSpent,
        orderCount: customerInvoices.length,
      });
    });

    return map;
  }, [customers, invoices]);

  // ============================================================================
  // HANDLERS - LEADS
  // ============================================================================

  const handleAddLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `lead-${leads.length + 1}`;
    const now = new Date().toISOString();

    setLeads(prev => [...prev, {
      ...leadData,
      id,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowAddLead(false);
  };

  const handleUpdateLeadPhase = (leadId: string, phase: LeadStatus) => {
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, status: phase, updatedAt: new Date().toISOString() }
        : l
    ));
  };

  const handleConvertLeadToCustomer = (lead: Lead) => {
    if (lead.status !== 'won') {
      alert('Alleen gewonnen leads kunnen worden geconverteerd naar klanten');
      return;
    }

    const newCustomer: Customer = {
      id: `cust-${customers.length + 1}`,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers(prev => [...prev, newCustomer]);

    alert(`Lead ${lead.name} is geconverteerd naar klant`);
  };

  // ============================================================================
  // HANDLERS - CUSTOMERS
  // ============================================================================

  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `cust-${customers.length + 1}`;
    const now = new Date().toISOString();

    setCustomers(prev => [...prev, {
      ...customerData,
      id,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowAddCustomer(false);
  };

  const handleUpdateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c =>
      c.id === id
        ? { ...c, ...updates, updatedAt: new Date().toISOString() }
        : c
    ));
  };

  const handleDeleteCustomer = (id: string) => {
    if (!confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      return;
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // ============================================================================
  // HANDLERS - INTERACTIONS
  // ============================================================================

  const handleAddInteraction = (interactionData: Omit<Interaction, 'id' | 'timestamp' | 'userId'>) => {
    const id = `int-${interactions.length + 1}`;
    const now = new Date().toISOString();

    setInteractions(prev => [...prev, {
      ...interactionData,
      id,
      timestamp: now,
      userId: currentUser.id,
    }]);

    setShowAddInteraction(false);
  };

  // ============================================================================
  // HANDLERS - TASKS
  // ============================================================================

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `task-${tasks.length + 1}`;
    const now = new Date().toISOString();

    setTasks(prev => [...prev, {
      ...taskData,
      id,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowAddTask(false);
  };

  const handleUpdateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status, updatedAt: new Date().toISOString() }
        : t
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CRM</h1>
        <p className="text-gray-600 mt-1">Klantrelatiebeheer & Leads</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <TabButton
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon="📊"
            label="Dashboard"
          />
          <TabButton
            active={activeTab === 'leads'}
            onClick={() => setActiveTab('leads')}
            icon="🎯"
            label="Leads & Pipeline"
          />
          <TabButton
            active={activeTab === 'klanten'}
            onClick={() => setActiveTab('klanten')}
            icon="👥"
            label="Klanten"
          />
          <TabButton
            active={activeTab === 'interacties'}
            onClick={() => setActiveTab('interacties')}
            icon="💬"
            label="Interacties"
          />
          <TabButton
            active={activeTab === 'email'}
            onClick={() => setActiveTab('email')}
            icon="📧"
            label="Email"
          />
          <TabButton
            active={activeTab === 'taken'}
            onClick={() => setActiveTab('taken')}
            icon="✓"
            label="Taken"
          />
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'dashboard' && (
            <DashboardTab stats={dashboardStats} />
          )}
          {activeTab === 'leads' && (
            <LeadsTab
              leadsByPhase={leadsByPhase}
              pipelineValue={pipelineValue}
              onUpdatePhase={handleUpdateLeadPhase}
              onConvertToCustomer={handleConvertLeadToCustomer}
              onAddNew={() => setShowAddLead(true)}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'klanten' && (
            <KlantenTab
              customers={customers}
              customerFinancials={customerFinancials}
              invoices={invoices}
              onUpdate={handleUpdateCustomer}
              onDelete={handleDeleteCustomer}
              onAddNew={() => setShowAddCustomer(true)}
              onSelectCustomer={setSelectedCustomer}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'interacties' && (
            <InteractiesTab
              interactions={interactions}
              customers={customers}
              leads={leads}
              onAddNew={() => setShowAddInteraction(true)}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'email' && (
            <EmailTab />
          )}
          {activeTab === 'taken' && (
            <TakenTab
              tasks={tasks}
              customers={customers}
              onUpdateStatus={handleUpdateTaskStatus}
              onDelete={handleDeleteTask}
              onAddNew={() => setShowAddTask(true)}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>

      {/* Modals - Simplified */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Klant Toevoegen</h2>
            <p className="text-gray-600 mb-4">Formulier voor nieuwe klant (wordt verder uitgewerkt)</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddCustomer(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Lead Toevoegen</h2>
            <p className="text-gray-600 mb-4">Formulier voor nieuwe lead (wordt verder uitgewerkt)</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddLead(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddInteraction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Interactie Registreren</h2>
            <p className="text-gray-600 mb-4">Formulier voor interactie (wordt verder uitgewerkt)</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddInteraction(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Taak Aanmaken</h2>
            <p className="text-gray-600 mb-4">Formulier voor taak (wordt verder uitgewerkt)</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          invoices={invoices.filter(inv => inv.customerId === selectedCustomer.id)}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

interface DashboardTabProps {
  stats: {
    totalLeads: number;
    activeLeads: number;
    wonLeads: number;
    conversionRate: number;
    totalLeadValue: number;
    totalCustomers: number;
    zakelijkeKlanten: number;
    particuliereKlanten: number;
    totalInteractions: number;
    overdueInteractions: number;
    totalTasks: number;
    overdueTasks: number;
  };
}

const DashboardTab: React.FC<DashboardTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Leads KPIs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Leads & Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Totaal Leads"
            value={stats.totalLeads.toString()}
            color="blue"
            icon="🎯"
            subtitle={`${stats.activeLeads} actief`}
          />
          <KPICard
            title="Gewonnen"
            value={stats.wonLeads.toString()}
            color="green"
            icon="✅"
            subtitle={`${stats.conversionRate.toFixed(1)}% conversie`}
          />
          <KPICard
            title="Pipeline Waarde"
            value={`€${stats.totalLeadValue.toFixed(0)}`}
            color="purple"
            icon="💰"
          />
          <KPICard
            title="Klanten"
            value={stats.totalCustomers.toString()}
            color="sky"
            icon="👥"
            subtitle={`${stats.zakelijkeKlanten} zakelijk, ${stats.particuliereKlanten} particulier`}
          />
        </div>
      </div>

      {/* Activity KPIs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activiteiten</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <KPICard
            title="Interacties"
            value={stats.totalInteractions.toString()}
            color="blue"
            icon="💬"
            subtitle={stats.overdueInteractions > 0 ? `${stats.overdueInteractions} verlopen follow-ups` : 'Alles up-to-date'}
          />
          <KPICard
            title="Taken"
            value={stats.totalTasks.toString()}
            color={stats.overdueTasks > 0 ? 'red' : 'green'}
            icon="✓"
            subtitle={stats.overdueTasks > 0 ? `${stats.overdueTasks} verlopen` : 'Alles op tijd'}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recente Activiteit</h3>
        <p className="text-gray-500 text-center py-8">
          Activiteitentimeline wordt hier weergegeven
        </p>
      </div>
    </div>
  );
};

interface LeadsTabProps {
  leadsByPhase: {
    new: Lead[];
    contact: Lead[];
    qualified: Lead[];
    proposal: Lead[];
    negotiation: Lead[];
    won: Lead[];
    lost: Lead[];
  };
  pipelineValue: {
    new: number;
    contact: number;
    qualified: number;
    proposal: number;
    negotiation: number;
  };
  onUpdatePhase: (leadId: string, phase: LeadStatus) => void;
  onConvertToCustomer: (lead: Lead) => void;
  onAddNew: () => void;
  currentUser: User;
}

const LeadsTab: React.FC<LeadsTabProps> = ({
  leadsByPhase,
  pipelineValue,
  onUpdatePhase,
  onConvertToCustomer,
  onAddNew,
  currentUser,
}) => {
  const phases: Array<{ key: keyof typeof leadsByPhase; label: string; color: string }> = [
    { key: 'new', label: 'Nieuw', color: 'gray' },
    { key: 'contact', label: 'Contact', color: 'blue' },
    { key: 'qualified', label: 'Gekwalificeerd', color: 'sky' },
    { key: 'proposal', label: 'Voorstel', color: 'purple' },
    { key: 'negotiation', label: 'Onderhandeling', color: 'yellow' },
    { key: 'won', label: 'Gewonnen', color: 'green' },
    { key: 'lost', label: 'Verloren', color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">7-Fase Pipeline</h2>
          <p className="text-gray-600 mt-1">Beheer je leads door de sales pipeline</p>
        </div>
        {currentUser.isAdmin && (
          <button
            onClick={onAddNew}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nieuwe Lead
          </button>
        )}
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {phases.map(phase => {
          const phaseLeads = leadsByPhase[phase.key];
          const value = phase.key in pipelineValue ? pipelineValue[phase.key as keyof typeof pipelineValue] : 0;

          return (
            <PipelineColumn
              key={phase.key}
              title={phase.label}
              leads={phaseLeads}
              color={phase.color}
              value={value}
              phase={phase.key}
              onUpdatePhase={onUpdatePhase}
              onConvertToCustomer={onConvertToCustomer}
              currentUser={currentUser}
            />
          );
        })}
      </div>
    </div>
  );
};

interface KlantenTabProps {
  customers: Customer[];
  customerFinancials: Map<string, { totalSpent: number; orderCount: number }>;
  invoices: Invoice[];
  onUpdate: (id: string, updates: Partial<Customer>) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  onSelectCustomer: (customer: Customer) => void;
  currentUser: User;
}

const KlantenTab: React.FC<KlantenTabProps> = ({
  customers,
  customerFinancials,
  invoices,
  onUpdate,
  onDelete,
  onAddNew,
  onSelectCustomer,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers;

    const term = searchTerm.toLowerCase();
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.company && c.company.toLowerCase().includes(term))
    );
  }, [customers, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Klanten</h2>
          <p className="text-gray-600 mt-1">{customers.length} klanten in totaal</p>
        </div>
        {currentUser.isAdmin && (
          <button
            onClick={onAddNew}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nieuwe Klant
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Zoek klant op naam, email of bedrijf..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500">Geen klanten gevonden</p>
          </div>
        ) : (
          filteredCustomers.map(customer => {
            const financials = customerFinancials.get(customer.id) || { totalSpent: 0, orderCount: 0 };
            return (
              <CustomerCard
                key={customer.id}
                customer={customer}
                financials={financials}
                onClick={() => onSelectCustomer(customer)}
                onDelete={onDelete}
                currentUser={currentUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

interface InteractiesTabProps {
  interactions: Interaction[];
  customers: Customer[];
  leads: Lead[];
  onAddNew: () => void;
  currentUser: User;
}

const InteractiesTab: React.FC<InteractiesTabProps> = ({
  interactions,
  customers,
  leads,
  onAddNew,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Interacties</h2>
          <p className="text-gray-600 mt-1">{interactions.length} interacties geregistreerd</p>
        </div>
        <button
          onClick={onAddNew}
          className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nieuwe Interactie
        </button>
      </div>

      {/* Interactions Timeline */}
      <div className="space-y-4">
        {interactions.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500">Nog geen interacties geregistreerd</p>
          </div>
        ) : (
          interactions.map(interaction => {
            const customer = customers.find(c => c.id === interaction.customerId);
            const lead = leads.find(l => l.id === interaction.leadId);
            return (
              <InteractionCard
                key={interaction.id}
                interaction={interaction}
                customer={customer}
                lead={lead}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

const EmailTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-12 text-center">
        <span className="text-6xl mb-4 block">📧</span>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Integratie</h3>
        <p className="text-gray-600 mb-4">
          Sleep .eml bestanden hier naartoe om emails te importeren
        </p>
        <div className="inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-lg">
          🚧 V5.8 - In ontwikkeling...
        </div>
      </div>
    </div>
  );
};

interface TakenTabProps {
  tasks: Task[];
  customers: Customer[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
  currentUser: User;
}

const TakenTab: React.FC<TakenTabProps> = ({
  tasks,
  customers,
  onUpdateStatus,
  onDelete,
  onAddNew,
  currentUser,
}) => {
  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done'),
    };
  }, [tasks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Taken</h2>
          <p className="text-gray-600 mt-1">{tasks.length} taken in totaal</p>
        </div>
        <button
          onClick={onAddNew}
          className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nieuwe Taak
        </button>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TaskColumn
          title="Te Doen"
          tasks={tasksByStatus.todo}
          color="gray"
          customers={customers}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
        <TaskColumn
          title="In Uitvoering"
          tasks={tasksByStatus.in_progress}
          color="blue"
          customers={customers}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
        <TaskColumn
          title="Voltooid"
          tasks={tasksByStatus.done}
          color="green"
          customers={customers}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface PipelineColumnProps {
  title: string;
  leads: Lead[];
  color: string;
  value: number;
  phase: string;
  onUpdatePhase: (leadId: string, phase: LeadStatus) => void;
  onConvertToCustomer: (lead: Lead) => void;
  currentUser: User;
}

const PipelineColumn: React.FC<PipelineColumnProps> = ({
  title,
  leads,
  color,
  value,
  phase,
  onUpdatePhase,
  onConvertToCustomer,
  currentUser,
}) => {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-900',
    blue: 'bg-blue-100 text-blue-900',
    sky: 'bg-sky-100 text-sky-900',
    purple: 'bg-purple-100 text-purple-900',
    yellow: 'bg-yellow-100 text-yellow-900',
    green: 'bg-green-100 text-green-900',
    red: 'bg-red-100 text-red-900',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className={`${colorClasses[color]} rounded-lg px-4 py-3 mb-4`}>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-75">{leads.length} leads</p>
        {value > 0 && (
          <p className="text-xs opacity-75 mt-1">€{value.toFixed(0)}</p>
        )}
      </div>

      <div className="space-y-3">
        {leads.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            Geen leads
          </p>
        ) : (
          leads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onUpdatePhase={onUpdatePhase}
              onConvertToCustomer={onConvertToCustomer}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface LeadCardProps {
  lead: Lead;
  onUpdatePhase: (leadId: string, phase: LeadStatus) => void;
  onConvertToCustomer: (lead: Lead) => void;
  currentUser: User;
}

const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onUpdatePhase,
  onConvertToCustomer,
  currentUser,
}) => {
  const nextPhase: Record<LeadStatus, LeadStatus | null> = {
    new: 'contacted',
    contacted: 'qualified',
    qualified: 'proposal',
    proposal: 'negotiation',
    negotiation: 'won',
    won: null,
    lost: null,
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
      {lead.company && (
        <p className="text-xs text-gray-600 mt-1">{lead.company}</p>
      )}
      {lead.estimatedValue && (
        <p className="text-xs text-gray-600 mt-1">€{lead.estimatedValue.toFixed(0)}</p>
      )}

      {currentUser.isAdmin && nextPhase[lead.status] && (
        <button
          onClick={() => onUpdatePhase(lead.id, nextPhase[lead.status]!)}
          className="mt-2 w-full px-2 py-1 bg-sky-600 text-white rounded text-xs hover:bg-sky-700"
        >
          → Volgende fase
        </button>
      )}

      {currentUser.isAdmin && lead.status === 'won' && (
        <button
          onClick={() => onConvertToCustomer(lead)}
          className="mt-2 w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        >
          ✓ Naar Klant
        </button>
      )}
    </div>
  );
};

interface CustomerCardProps {
  customer: Customer;
  financials: { totalSpent: number; orderCount: number };
  onClick: () => void;
  onDelete: (id: string) => void;
  currentUser: User;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  financials,
  onClick,
  onDelete,
  currentUser,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customer.name}</h3>
            {customer.company && (
              <p className="text-sm text-gray-600">{customer.company}</p>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          customer.company
            ? 'bg-blue-100 text-blue-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {customer.company ? '🏢 Zakelijk' : '👤 Particulier'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>📧</span>
          <span>{customer.email}</span>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>📞</span>
            <span>{customer.phone}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Totaal besteed</p>
            <p className="font-bold text-gray-900">€{financials.totalSpent.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Aantal orders</p>
            <p className="font-bold text-gray-900">{financials.orderCount}</p>
          </div>
        </div>
      </div>

      {currentUser.isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(customer.id);
          }}
          className="mt-4 w-full px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
        >
          Verwijderen
        </button>
      )}
    </div>
  );
};

interface InteractionCardProps {
  interaction: Interaction;
  customer?: Customer;
  lead?: Lead;
}

const InteractionCard: React.FC<InteractionCardProps> = ({
  interaction,
  customer,
  lead,
}) => {
  const typeIcons = {
    call: '📞',
    email: '📧',
    meeting: '🤝',
    note: '📝',
    sms: '💬',
  };

  const typeColors = {
    call: 'bg-blue-100 text-blue-700',
    email: 'bg-purple-100 text-purple-700',
    meeting: 'bg-green-100 text-green-700',
    note: 'bg-gray-100 text-gray-700',
    sms: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${typeColors[interaction.type]}`}>
          {typeIcons[interaction.type]}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{interaction.subject}</h3>
            <span className="text-sm text-gray-500">
              {new Date(interaction.timestamp).toLocaleDateString('nl-NL')}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">{interaction.description}</p>

          {(customer || lead) && (
            <p className="text-sm text-gray-500">
              {customer ? `Klant: ${customer.name}` : `Lead: ${lead!.name}`}
            </p>
          )}

          {interaction.followUpDate && (
            <div className="mt-2 inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
              Follow-up: {new Date(interaction.followUpDate).toLocaleDateString('nl-NL')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  color: 'gray' | 'blue' | 'green';
  customers: Customer[];
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  tasks,
  color,
  customers,
  onUpdateStatus,
  onDelete,
}) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-900',
    blue: 'bg-blue-100 text-blue-900',
    green: 'bg-green-100 text-green-900',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className={`${colorClasses[color]} rounded-lg px-4 py-3 mb-4`}>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-75">{tasks.length} taken</p>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            Geen taken
          </p>
        ) : (
          tasks.map(task => {
            const customer = customers.find(c => c.id === task.customerId);
            return (
              <TaskCard
                key={task.id}
                task={task}
                customer={customer}
                onUpdateStatus={onUpdateStatus}
                onDelete={onDelete}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  customer?: Customer;
  onUpdateStatus: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  customer,
  onUpdateStatus,
  onDelete,
}) => {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const priorityLabels = {
    low: 'Laag',
    medium: 'Gemiddeld',
    high: 'Hoog',
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow ${
      isOverdue ? 'border-2 border-red-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
          {priorityLabels[task.priority]}
        </span>
      </div>

      {task.description && (
        <p className="text-xs text-gray-600 mb-2">{task.description}</p>
      )}

      {customer && (
        <p className="text-xs text-gray-500 mb-2">Klant: {customer.name}</p>
      )}

      {task.deadline && (
        <p className={`text-xs mb-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          Deadline: {new Date(task.deadline).toLocaleDateString('nl-NL')}
        </p>
      )}

      <div className="flex gap-1 mt-2">
        {task.status === 'todo' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'in_progress')}
            className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
          >
            ▶ Start
          </button>
        )}
        {task.status === 'in_progress' && (
          <button
            onClick={() => onUpdateStatus(task.id, 'done')}
            className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
          >
            ✓ Voltooi
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
        >
          ✗
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors whitespace-nowrap ${
        active
          ? 'border-b-2 border-sky-600 text-sky-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'sky';
  icon: string;
  subtitle?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, color, icon, subtitle }) => {
  const colorClasses = {
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-sky-600',
    red: 'from-red-500 to-rose-600',
    yellow: 'from-yellow-500 to-amber-600',
    purple: 'from-purple-500 to-violet-600',
    sky: 'from-sky-500 to-blue-600',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className={`bg-gradient-to-br ${colorClasses[color]} p-4`}>
        <div className="flex items-center justify-between text-white">
          <span className="text-3xl">{icon}</span>
          <div className="text-right">
            <p className="text-sm opacity-90">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
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

interface CustomerDetailModalProps {
  customer: Customer;
  invoices: Invoice[];
  onClose: () => void;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  invoices,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            {customer.company && (
              <p className="text-gray-600">{customer.company}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contactgegevens</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {customer.email}
              </p>
              {customer.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Telefoon:</span> {customer.phone}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Type:</span> {customer.company ? 'Zakelijk' : 'Particulier'}
              </p>
              {customer.company && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Bedrijf:</span> {customer.company}
                </p>
              )}
            </div>
          </div>

          {/* Invoices */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Facturen ({invoices.length})</h3>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                Nog geen facturen voor deze klant
              </p>
            ) : (
              <div className="space-y-2">
                {invoices.map(invoice => (
                  <div key={invoice.id} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.date).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">€{invoice.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {invoice.status === 'paid' ? 'Betaald' : 'Openstaand'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
};
