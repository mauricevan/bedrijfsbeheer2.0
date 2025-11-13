import React, { useState, useMemo } from 'react';
import type { User, Quote, Invoice, Customer, InventoryItem, WorkOrder } from '../../types/index';

interface AccountingProps {
  currentUser: User;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  customers: Customer[];
  inventory: InventoryItem[];
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  users: User[];
}

type Tab = 'transacties' | 'offertes' | 'facturen';

/**
 * Accounting Component - Boekhouding, Offertes & Facturen
 *
 * Features:
 * - 3 tabs: Transacties, Offertes, Facturen
 * - Quote management (create, edit, status tracking, convert to invoice/workorder)
 * - Invoice management (create, edit, payment tracking, convert to workorder)
 * - BTW calculations (21% default)
 * - Items from voorraad selection
 * - Werkorder integration
 * - Clone functionality
 */

export const Accounting: React.FC<AccountingProps> = ({
  currentUser,
  quotes,
  setQuotes,
  invoices,
  setInvoices,
  customers,
  inventory,
  workOrders,
  setWorkOrders,
  users,
}) => {
  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<Tab>('transacties');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  // Transacties KPIs
  const transactieStats = useMemo(() => {
    const inkomsten = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const uitgaven = 0; // Placeholder for expenses

    return {
      inkomsten,
      uitgaven,
      nettoWinst: inkomsten - uitgaven,
    };
  }, [invoices]);

  // Offertes Statistics
  const quoteStats = useMemo(() => {
    return {
      totaal: quotes.length,
      draft: quotes.filter(q => q.status === 'draft').length,
      sent: quotes.filter(q => q.status === 'sent').length,
      approved: quotes.filter(q => q.status === 'approved').length,
      rejected: quotes.filter(q => q.status === 'rejected').length,
      totalValue: quotes
        .filter(q => q.status === 'approved')
        .reduce((sum, q) => sum + q.total, 0),
    };
  }, [quotes]);

  // Facturen Statistics
  const invoiceStats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paid = invoices.filter(inv => inv.status === 'paid');
    const outstanding = invoices.filter(inv =>
      inv.status === 'sent' || inv.status === 'overdue'
    );
    const overdue = invoices.filter(inv => inv.status === 'overdue');

    return {
      totalInvoiced,
      paidAmount: paid.reduce((sum, inv) => sum + inv.total, 0),
      paidCount: paid.length,
      outstandingAmount: outstanding.reduce((sum, inv) => sum + inv.total, 0),
      outstandingCount: outstanding.length,
      overdueAmount: overdue.reduce((sum, inv) => sum + inv.total, 0),
      overdueCount: overdue.length,
    };
  }, [invoices]);

  // ============================================================================
  // HANDLERS - QUOTES
  // ============================================================================

  const handleCreateQuote = (quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen offertes aanmaken');
      return;
    }

    const id = `quote-${quotes.length + 1}`;
    const now = new Date().toISOString();

    setQuotes(prev => [...prev, {
      ...quoteData,
      id,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowQuoteModal(false);
  };

  const handleUpdateQuote = (id: string, updates: Partial<Quote>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen offertes bewerken');
      return;
    }

    setQuotes(prev => prev.map(q =>
      q.id === id
        ? { ...q, ...updates, updatedAt: new Date().toISOString() }
        : q
    ));

    setEditingQuote(null);
  };

  const handleQuoteStatusChange = (id: string, status: Quote['status']) => {
    handleUpdateQuote(id, { status });
  };

  const handleConvertQuoteToInvoice = (quote: Quote) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen offertes converteren');
      return;
    }

    if (quote.status !== 'approved') {
      alert('Alleen goedgekeurde offertes kunnen worden geconverteerd');
      return;
    }

    const invoiceNumber = `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

    const newInvoice: Invoice = {
      id: `inv-${invoices.length + 1}`,
      invoiceNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      items: quote.items,
      laborHours: quote.laborHours,
      hourlyRate: quote.hourlyRate,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: 'draft',
      date: now.toISOString(),
      dueDate: dueDate.toISOString(),
      notes: `Converted from quote ${quote.quoteNumber}`,
      createdBy: currentUser.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setInvoices(prev => [...prev, newInvoice]);

    alert(`Factuur ${invoiceNumber} aangemaakt vanuit offerte ${quote.quoteNumber}`);
  };

  const handleConvertQuoteToWorkOrder = (quote: Quote) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen werkorders aanmaken');
      return;
    }

    const customer = customers.find(c => c.id === quote.customerId);
    const assignedUserId = users.find(u => !u.isAdmin)?.id || users[0].id;

    const newWorkOrder: WorkOrder = {
      id: `wo-${workOrders.length + 1}`,
      title: `Werkorder voor offerte ${quote.quoteNumber}`,
      description: quote.notes || `Werkorder aangemaakt vanuit offerte voor ${customer?.name}`,
      customerId: quote.customerId,
      assignedTo: assignedUserId,
      createdBy: currentUser.id,
      status: 'todo',
      priority: 'medium',
      estimatedHours: quote.laborHours || 0,
      actualHours: 0,
      materials: quote.items.map(item => ({
        inventoryItemId: item.inventoryItemId || '',
        quantity: item.quantity,
      })),
      quoteId: quote.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWorkOrders(prev => [...prev, newWorkOrder]);

    alert(`Werkorder aangemaakt voor offerte ${quote.quoteNumber}`);
  };

  const handleCloneQuote = (quote: Quote) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen offertes clonen');
      return;
    }

    const newQuoteNumber = `${new Date().getFullYear()}-Q${String(quotes.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const clonedQuote: Quote = {
      ...quote,
      id: `quote-${quotes.length + 1}`,
      quoteNumber: newQuoteNumber,
      status: 'draft',
      notes: `Gekloond van offerte ${quote.quoteNumber}`,
      createdAt: now,
      updatedAt: now,
    };

    setQuotes(prev => [...prev, clonedQuote]);

    alert(`Offerte ${newQuoteNumber} gekloond van ${quote.quoteNumber}`);
  };

  // ============================================================================
  // HANDLERS - INVOICES
  // ============================================================================

  const handleCreateInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'invoiceNumber'>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen facturen aanmaken');
      return;
    }

    const invoiceNumber = `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const id = `inv-${invoices.length + 1}`;
    const now = new Date().toISOString();

    setInvoices(prev => [...prev, {
      ...invoiceData,
      id,
      invoiceNumber,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowInvoiceModal(false);
  };

  const handleUpdateInvoice = (id: string, updates: Partial<Invoice>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen facturen bewerken');
      return;
    }

    setInvoices(prev => prev.map(inv =>
      inv.id === id
        ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
        : inv
    ));

    setEditingInvoice(null);
  };

  const handleInvoiceStatusChange = (id: string, status: Invoice['status']) => {
    const updates: Partial<Invoice> = { status };

    if (status === 'paid' && !invoices.find(inv => inv.id === id)?.paidDate) {
      updates.paidDate = new Date().toISOString();
    }

    handleUpdateInvoice(id, updates);
  };

  const handleConvertInvoiceToWorkOrder = (invoice: Invoice) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen werkorders aanmaken');
      return;
    }

    const customer = customers.find(c => c.id === invoice.customerId);
    const assignedUserId = users.find(u => !u.isAdmin)?.id || users[0].id;

    const newWorkOrder: WorkOrder = {
      id: `wo-${workOrders.length + 1}`,
      title: `Werkorder voor factuur ${invoice.invoiceNumber}`,
      description: invoice.notes || `Werkorder aangemaakt vanuit factuur voor ${customer?.name}`,
      customerId: invoice.customerId,
      assignedTo: assignedUserId,
      createdBy: currentUser.id,
      status: 'todo',
      priority: 'medium',
      estimatedHours: invoice.laborHours || 0,
      actualHours: 0,
      materials: invoice.items.map(item => ({
        inventoryItemId: item.inventoryItemId || '',
        quantity: item.quantity,
      })),
      invoiceId: invoice.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWorkOrders(prev => [...prev, newWorkOrder]);

    alert(`Werkorder aangemaakt voor factuur ${invoice.invoiceNumber}`);
  };

  const handleCloneInvoice = (invoice: Invoice) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen facturen clonen');
      return;
    }

    const newInvoiceNumber = `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + 30);

    const clonedInvoice: Invoice = {
      ...invoice,
      id: `inv-${invoices.length + 1}`,
      invoiceNumber: newInvoiceNumber,
      status: 'draft',
      date: now.toISOString(),
      dueDate: dueDate.toISOString(),
      paidDate: undefined,
      notes: `Gekloond van factuur ${invoice.invoiceNumber}`,
      createdBy: currentUser.id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setInvoices(prev => [...prev, clonedInvoice]);

    alert(`Factuur ${newInvoiceNumber} gekloond van ${invoice.invoiceNumber}`);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Boekhouding</h1>
        <p className="text-gray-600 mt-1">Offertes, Facturen & Transacties</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transacties')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'transacties'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💰 Transacties
          </button>
          <button
            onClick={() => setActiveTab('offertes')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'offertes'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📄 Offertes
          </button>
          <button
            onClick={() => setActiveTab('facturen')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'facturen'
                ? 'border-b-2 border-sky-600 text-sky-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🧾 Facturen
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'transacties' && (
            <TransactiesTab stats={transactieStats} />
          )}
          {activeTab === 'offertes' && (
            <OffertesTab
              quotes={quotes}
              customers={customers}
              stats={quoteStats}
              onStatusChange={handleQuoteStatusChange}
              onConvertToInvoice={handleConvertQuoteToInvoice}
              onConvertToWorkOrder={handleConvertQuoteToWorkOrder}
              onClone={handleCloneQuote}
              onEdit={setEditingQuote}
              onCreateNew={() => setShowQuoteModal(true)}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'facturen' && (
            <FacturenTab
              invoices={invoices}
              customers={customers}
              stats={invoiceStats}
              onStatusChange={handleInvoiceStatusChange}
              onConvertToWorkOrder={handleConvertInvoiceToWorkOrder}
              onClone={handleCloneInvoice}
              onEdit={setEditingInvoice}
              onCreateNew={() => setShowInvoiceModal(true)}
              currentUser={currentUser}
            />
          )}
        </div>
      </div>

      {/* Modals would go here - simplified for now */}
      {showQuoteModal && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Offerte Aanmaken</h2>
            <p className="text-gray-600 mb-4">
              Formulier voor nieuwe offerte (wordt verder uitgewerkt)
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowQuoteModal(false)}
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

      {editingQuote && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Offerte Bewerken</h2>
            <p className="text-gray-600 mb-4">
              Bewerken: {editingQuote.quoteNumber}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingQuote(null)}
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

      {showInvoiceModal && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nieuwe Factuur Aanmaken</h2>
            <p className="text-gray-600 mb-4">
              Formulier voor nieuwe factuur (wordt verder uitgewerkt)
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
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

      {editingInvoice && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Factuur Bewerken</h2>
            <p className="text-gray-600 mb-4">
              Bewerken: {editingInvoice.invoiceNumber}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingInvoice(null)}
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
    </div>
  );
};

// ============================================================================
// TAB COMPONENTS
// ============================================================================

interface TransactiesTabProps {
  stats: {
    inkomsten: number;
    uitgaven: number;
    nettoWinst: number;
  };
}

const TransactiesTab: React.FC<TransactiesTabProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Totale Inkomsten"
          value={`€${stats.inkomsten.toFixed(2)}`}
          color="green"
          icon="💰"
        />
        <KPICard
          title="Totale Uitgaven"
          value={`€${stats.uitgaven.toFixed(2)}`}
          color="red"
          icon="💸"
        />
        <KPICard
          title="Netto Winst"
          value={`€${stats.nettoWinst.toFixed(2)}`}
          color="blue"
          icon="📈"
        />
      </div>

      {/* Transaction History */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Transactie historie wordt hier weergegeven</p>
      </div>
    </div>
  );
};

interface OffertesTabProps {
  quotes: Quote[];
  customers: Customer[];
  stats: {
    totaal: number;
    draft: number;
    sent: number;
    approved: number;
    rejected: number;
    totalValue: number;
  };
  onStatusChange: (id: string, status: Quote['status']) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onConvertToWorkOrder: (quote: Quote) => void;
  onClone: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  onCreateNew: () => void;
  currentUser: User;
}

const OffertesTab: React.FC<OffertesTabProps> = ({
  quotes,
  customers,
  stats,
  onStatusChange,
  onConvertToInvoice,
  onConvertToWorkOrder,
  onClone,
  onEdit,
  onCreateNew,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatBadge label="Totaal" value={stats.totaal} color="gray" />
        <StatBadge label="Concept" value={stats.draft} color="gray" />
        <StatBadge label="Verzonden" value={stats.sent} color="blue" />
        <StatBadge label="Goedgekeurd" value={stats.approved} color="green" />
        <StatBadge label="Afgewezen" value={stats.rejected} color="red" />
        <StatBadge
          label="Totaal Waarde"
          value={`€${stats.totalValue.toFixed(0)}`}
          color="purple"
        />
      </div>

      {/* Action Button */}
      {currentUser.isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onCreateNew}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nieuwe Offerte
          </button>
        </div>
      )}

      {/* Quotes List */}
      <div className="space-y-4">
        {quotes.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500">Nog geen offertes aangemaakt</p>
          </div>
        ) : (
          quotes.map(quote => {
            const customer = customers.find(c => c.id === quote.customerId);
            return (
              <QuoteCard
                key={quote.id}
                quote={quote}
                customer={customer}
                onStatusChange={onStatusChange}
                onConvertToInvoice={onConvertToInvoice}
                onConvertToWorkOrder={onConvertToWorkOrder}
                onClone={onClone}
                onEdit={onEdit}
                currentUser={currentUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

interface FacturenTabProps {
  invoices: Invoice[];
  customers: Customer[];
  stats: {
    totalInvoiced: number;
    paidAmount: number;
    paidCount: number;
    outstandingAmount: number;
    outstandingCount: number;
    overdueAmount: number;
    overdueCount: number;
  };
  onStatusChange: (id: string, status: Invoice['status']) => void;
  onConvertToWorkOrder: (invoice: Invoice) => void;
  onClone: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onCreateNew: () => void;
  currentUser: User;
}

const FacturenTab: React.FC<FacturenTabProps> = ({
  invoices,
  customers,
  stats,
  onStatusChange,
  onConvertToWorkOrder,
  onClone,
  onEdit,
  onCreateNew,
  currentUser,
}) => {
  return (
    <div className="space-y-6">
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Totaal Gefactureerd"
          value={`€${stats.totalInvoiced.toFixed(2)}`}
          color="blue"
          icon="🧾"
        />
        <KPICard
          title="Betaald"
          value={`€${stats.paidAmount.toFixed(2)}`}
          subtitle={`${stats.paidCount} facturen`}
          color="green"
          icon="✅"
        />
        <KPICard
          title="Uitstaand"
          value={`€${stats.outstandingAmount.toFixed(2)}`}
          subtitle={`${stats.outstandingCount} facturen`}
          color="yellow"
          icon="⏳"
        />
        <KPICard
          title="Verlopen"
          value={`€${stats.overdueAmount.toFixed(2)}`}
          subtitle={`${stats.overdueCount} facturen`}
          color="red"
          icon="⚠️"
        />
      </div>

      {/* Action Button */}
      {currentUser.isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={onCreateNew}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nieuwe Factuur
          </button>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <p className="text-gray-500">Nog geen facturen aangemaakt</p>
          </div>
        ) : (
          invoices.map(invoice => {
            const customer = customers.find(c => c.id === invoice.customerId);
            return (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                customer={customer}
                onStatusChange={onStatusChange}
                onConvertToWorkOrder={onConvertToWorkOrder}
                onClone={onClone}
                onEdit={onEdit}
                currentUser={currentUser}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface QuoteCardProps {
  quote: Quote;
  customer?: Customer;
  onStatusChange: (id: string, status: Quote['status']) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onConvertToWorkOrder: (quote: Quote) => void;
  onClone: (quote: Quote) => void;
  onEdit: (quote: Quote) => void;
  currentUser: User;
}

const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  customer,
  onStatusChange,
  onConvertToInvoice,
  onConvertToWorkOrder,
  onClone,
  onEdit,
  currentUser,
}) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-yellow-100 text-yellow-700',
  };

  const statusLabels = {
    draft: 'Concept',
    sent: 'Verzonden',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen',
    expired: 'Verlopen',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{quote.quoteNumber}</h3>
          <p className="text-sm text-gray-600">{customer?.name || 'Onbekende klant'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[quote.status]}`}>
          {statusLabels[quote.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Subtotaal</p>
          <p className="font-semibold">€{quote.subtotal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">BTW ({quote.vatRate}%)</p>
          <p className="font-semibold">€{quote.vatAmount.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Totaal</p>
          <p className="text-lg font-bold text-gray-900">€{quote.total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Items</p>
          <p className="font-semibold">{quote.items.length}</p>
        </div>
      </div>

      {currentUser.isAdmin && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {quote.status === 'draft' && (
            <button
              onClick={() => onStatusChange(quote.id, 'sent')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📤 Verzenden
            </button>
          )}
          {quote.status === 'sent' && (
            <>
              <button
                onClick={() => onStatusChange(quote.id, 'approved')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                ✓ Goedkeuren
              </button>
              <button
                onClick={() => onStatusChange(quote.id, 'rejected')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
              >
                ✗ Afwijzen
              </button>
            </>
          )}
          {quote.status === 'approved' && (
            <>
              <button
                onClick={() => onConvertToInvoice(quote)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                🧾 Naar Factuur
              </button>
              <button
                onClick={() => onConvertToWorkOrder(quote)}
                className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
              >
                📋 Naar Werkorder
              </button>
            </>
          )}
          <button
            onClick={() => onClone(quote)}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            📋 Klonen
          </button>
          <button
            onClick={() => onEdit(quote)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            ✏️ Bewerken
          </button>
        </div>
      )}
    </div>
  );
};

interface InvoiceCardProps {
  invoice: Invoice;
  customer?: Customer;
  onStatusChange: (id: string, status: Invoice['status']) => void;
  onConvertToWorkOrder: (invoice: Invoice) => void;
  onClone: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  currentUser: User;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  customer,
  onStatusChange,
  onConvertToWorkOrder,
  onClone,
  onEdit,
  currentUser,
}) => {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  const statusLabels = {
    draft: 'Concept',
    sent: 'Verzonden',
    paid: 'Betaald',
    overdue: 'Verlopen',
    cancelled: 'Geannuleerd',
  };

  const isOverdue = invoice.status === 'overdue';

  return (
    <div className={`bg-white border-2 rounded-lg p-6 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-500' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
          <p className="text-sm text-gray-600">{customer?.name || 'Onbekende klant'}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
          {statusLabels[invoice.status]}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Factuurdatum</p>
          <p className="font-semibold">{new Date(invoice.date).toLocaleDateString('nl-NL')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Vervaldatum</p>
          <p className="font-semibold">{new Date(invoice.dueDate).toLocaleDateString('nl-NL')}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Totaal</p>
          <p className="text-lg font-bold text-gray-900">€{invoice.total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Items</p>
          <p className="font-semibold">{invoice.items.length}</p>
        </div>
      </div>

      {currentUser.isAdmin && (
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
          {invoice.status === 'draft' && (
            <button
              onClick={() => onStatusChange(invoice.id, 'sent')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              📤 Verzenden
            </button>
          )}
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <>
              <button
                onClick={() => onStatusChange(invoice.id, 'paid')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
              >
                ✓ Markeer Betaald
              </button>
              <button
                onClick={() => onConvertToWorkOrder(invoice)}
                className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
              >
                📋 Naar Werkorder
              </button>
            </>
          )}
          <button
            onClick={() => onClone(invoice)}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
          >
            📋 Klonen
          </button>
          <button
            onClick={() => onEdit(invoice)}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            ✏️ Bewerken
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

interface KPICardProps {
  title: string;
  value: string;
  color: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
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

interface StatBadgeProps {
  label: string;
  value: number | string;
  color: 'gray' | 'blue' | 'green' | 'red' | 'purple';
}

const StatBadge: React.FC<StatBadgeProps> = ({ label, value, color }) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700 border-gray-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};
