/**
 * AccountingPage - Boekhouding Module
 * Features: Quotes (Offertes), Invoices (Facturen), Transactions
 * Version: MVP 1.0 - Basic CRUD
 */

import React, { useState, useMemo } from 'react';
import type {
  Quote,
  Invoice,
  Transaction,
  User,
  Customer,
  InventoryItem,
  WorkOrder,
  QuoteItem,
  InvoiceItem,
} from '../../types';

interface AccountingPageProps {
  currentUser: User | null;
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  customers: Customer[];
  inventory: InventoryItem[];
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
}

export const AccountingPage: React.FC<AccountingPageProps> = ({
  currentUser,
  quotes,
  setQuotes,
  invoices,
  setInvoices,
  transactions,
  setTransactions: _setTransactions, // TODO: will be used for transaction management
  customers,
  inventory: _inventory, // TODO: will be used in quote/invoice forms
  workOrders: _workOrders, // TODO: will be used for workorder integration
  setWorkOrders: _setWorkOrders, // TODO: will be used for workorder creation
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'quotes' | 'invoices' | 'transactions'>('quotes');

  // Quote form state
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [quoteFormData, setQuoteFormData] = useState({
    customerId: '',
    items: [] as QuoteItem[],
    laborHours: 0,
    hourlyRate: 50,
    vatRate: 21,
    notes: '',
    validUntil: '',
  });

  // Invoice form state
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState({
    customerId: '',
    items: [] as InvoiceItem[],
    laborHours: 0,
    hourlyRate: 50,
    vatRate: 21,
    notes: '',
    dueDate: '',
  });

  // Search & filter
  const [quoteSearchTerm, setQuoteSearchTerm] = useState('');
  const [invoiceSearchTerm, setInvoiceSearchTerm] = useState('');

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // KPI calculations
  const kpiData = useMemo(() => {
    const totalQuoted = quotes
      .filter(q => q.status !== 'rejected')
      .reduce((sum, q) => sum + q.total, 0);

    const approvedQuotes = quotes.filter(q => q.status === 'approved').length;

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);

    const overdueInvoices = invoices.filter(inv => {
      if (inv.status !== 'sent') return false;
      return new Date(inv.dueDate) < new Date();
    }).length;

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalQuoted,
      approvedQuotes,
      totalInvoiced,
      totalPaid,
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
    };
  }, [quotes, invoices, transactions]);

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      const customer = customers.find(c => c.id === quote.customerId);
      const searchLower = quoteSearchTerm.toLowerCase();
      return (
        quote.quoteNumber.toLowerCase().includes(searchLower) ||
        quote.customerName.toLowerCase().includes(searchLower) ||
        customer?.email.toLowerCase().includes(searchLower)
      );
    });
  }, [quotes, customers, quoteSearchTerm]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const customer = customers.find(c => c.id === invoice.customerId);
      const searchLower = invoiceSearchTerm.toLowerCase();
      return (
        invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
        invoice.customerName.toLowerCase().includes(searchLower) ||
        customer?.email.toLowerCase().includes(searchLower)
      );
    });
  }, [invoices, customers, invoiceSearchTerm]);

  // ============================================================================
  // QUOTE HANDLERS
  // ============================================================================

  const handleCreateQuote = () => {
    setEditingQuote(null);
    setQuoteFormData({
      customerId: '',
      items: [],
      laborHours: 0,
      hourlyRate: 50,
      vatRate: 21,
      notes: '',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowQuoteForm(true);
  };

  const handleSaveQuote = () => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen offertes aanmaken');
      return;
    }

    if (!quoteFormData.customerId) {
      alert('Selecteer een klant');
      return;
    }

    if (quoteFormData.items.length === 0) {
      alert('Voeg minstens één item toe');
      return;
    }

    const customer = customers.find(c => c.id === quoteFormData.customerId);
    if (!customer) {
      alert('Klant niet gevonden');
      return;
    }

    // Calculate totals
    const itemsTotal = quoteFormData.items.reduce((sum, item) => sum + item.total, 0);
    const laborTotal = quoteFormData.laborHours * quoteFormData.hourlyRate;
    const subtotal = itemsTotal + laborTotal;
    const vatAmount = (subtotal * quoteFormData.vatRate) / 100;
    const total = subtotal + vatAmount;

    if (editingQuote) {
      // Update existing quote
      setQuotes(prev => prev.map(q =>
        q.id === editingQuote.id
          ? {
              ...q,
              customerId: quoteFormData.customerId,
              customerName: customer.name,
              items: quoteFormData.items,
              laborHours: quoteFormData.laborHours,
              hourlyRate: quoteFormData.hourlyRate,
              subtotal,
              vatRate: quoteFormData.vatRate,
              vatAmount,
              total,
              notes: quoteFormData.notes,
              validUntil: quoteFormData.validUntil,
              updatedAt: new Date().toISOString(),
            }
          : q
      ));
    } else {
      // Create new quote
      const newQuote: Quote = {
        id: `Q-${Date.now()}`,
        quoteNumber: `Q${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
        customerId: quoteFormData.customerId,
        customerName: customer.name,
        items: quoteFormData.items,
        laborHours: quoteFormData.laborHours,
        hourlyRate: quoteFormData.hourlyRate,
        subtotal,
        vatRate: quoteFormData.vatRate,
        vatAmount,
        total,
        status: 'draft',
        notes: quoteFormData.notes,
        validUntil: quoteFormData.validUntil,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setQuotes(prev => [...prev, newQuote]);
    }

    setShowQuoteForm(false);
    setEditingQuote(null);
  };

  const handleDeleteQuote = (quoteId: string) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen offertes verwijderen');
      return;
    }

    if (!confirm('Weet je zeker dat je deze offerte wilt verwijderen?')) {
      return;
    }

    setQuotes(prev => prev.filter(q => q.id !== quoteId));
  };




  const handleUpdateQuoteStatus = (quoteId: string, status: Quote['status']) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen status wijzigen');
      return;
    }

    setQuotes(prev => prev.map(q =>
      q.id === quoteId
        ? { ...q, status, updatedAt: new Date().toISOString() }
        : q
    ));
  };

  // ============================================================================
  // INVOICE HANDLERS
  // ============================================================================

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setInvoiceFormData({
      customerId: '',
      items: [],
      laborHours: 0,
      hourlyRate: 50,
      vatRate: 21,
      notes: '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowInvoiceForm(true);
  };

  const handleSaveInvoice = () => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen facturen aanmaken');
      return;
    }

    if (!invoiceFormData.customerId) {
      alert('Selecteer een klant');
      return;
    }

    if (invoiceFormData.items.length === 0) {
      alert('Voeg minstens één item toe');
      return;
    }

    const customer = customers.find(c => c.id === invoiceFormData.customerId);
    if (!customer) {
      alert('Klant niet gevonden');
      return;
    }

    // Calculate totals
    const itemsTotal = invoiceFormData.items.reduce((sum, item) => sum + item.total, 0);
    const laborTotal = invoiceFormData.laborHours * invoiceFormData.hourlyRate;
    const subtotal = itemsTotal + laborTotal;
    const vatAmount = (subtotal * invoiceFormData.vatRate) / 100;
    const total = subtotal + vatAmount;

    if (editingInvoice) {
      // Update existing invoice
      setInvoices(prev => prev.map(inv =>
        inv.id === editingInvoice.id
          ? {
              ...inv,
              customerId: invoiceFormData.customerId,
              customerName: customer.name,
              items: invoiceFormData.items,
              laborHours: invoiceFormData.laborHours,
              hourlyRate: invoiceFormData.hourlyRate,
              subtotal,
              vatRate: invoiceFormData.vatRate,
              vatAmount,
              total,
              notes: invoiceFormData.notes,
              dueDate: invoiceFormData.dueDate,
              updatedAt: new Date().toISOString(),
            }
          : inv
      ));
    } else {
      // Create new invoice
      const newInvoice: Invoice = {
        id: `INV-${Date.now()}`,
        invoiceNumber: `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        customerId: invoiceFormData.customerId,
        customerName: customer.name,
        items: invoiceFormData.items,
        laborHours: invoiceFormData.laborHours,
        hourlyRate: invoiceFormData.hourlyRate,
        subtotal,
        vatRate: invoiceFormData.vatRate,
        vatAmount,
        total,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        dueDate: invoiceFormData.dueDate,
        notes: invoiceFormData.notes,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setInvoices(prev => [...prev, newInvoice]);
    }

    setShowInvoiceForm(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen facturen verwijderen');
      return;
    }

    if (!confirm('Weet je zeker dat je deze factuur wilt verwijderen?')) {
      return;
    }

    setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
  };




  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen status wijzigen');
      return;
    }

    const updates: Partial<Invoice> = { status, updatedAt: new Date().toISOString() };

    if (status === 'paid') {
      updates.paidDate = new Date().toISOString().split('T')[0];
    }

    setInvoices(prev => prev.map(inv =>
      inv.id === invoiceId
        ? { ...inv, ...updates }
        : inv
    ));
  };

  // ============================================================================
  // CONVERSIONS
  // ============================================================================

  const handleConvertQuoteToInvoice = (quoteId: string) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen offertes omzetten naar facturen');
      return;
    }

    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) {
      alert('Offerte niet gevonden');
      return;
    }

    if (quote.status !== 'approved') {
      alert('Alleen goedgekeurde offertes kunnen worden omgezet naar facturen');
      return;
    }

    if (quote.invoiceId) {
      alert('Deze offerte is al omgezet naar een factuur');
      return;
    }

    // Create invoice from quote
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      customerId: quote.customerId,
      customerName: quote.customerName,
      items: quote.items.map(item => ({
        ...item,
        id: `II-${item.id}`,
      })),
      laborHours: quote.laborHours,
      hourlyRate: quote.hourlyRate,
      subtotal: quote.subtotal,
      vatRate: quote.vatRate,
      vatAmount: quote.vatAmount,
      total: quote.total,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: quote.notes ? `${quote.notes}\n\nGeconverteerd van offerte ${quote.quoteNumber}` : `Geconverteerd van offerte ${quote.quoteNumber}`,
      quoteId: quote.id,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices(prev => [...prev, newInvoice]);

    // Update quote with invoice link
    setQuotes(prev => prev.map(q =>
      q.id === quoteId
        ? { ...q, invoiceId: newInvoice.id, updatedAt: new Date().toISOString() }
        : q
    ));

    alert(`Factuur ${newInvoice.invoiceNumber} aangemaakt!`);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      draft: 'Concept',
      sent: 'Verzonden',
      approved: 'Goedgekeurd',
      rejected: 'Afgekeurd',
      expired: 'Verlopen',
      paid: 'Betaald',
      overdue: 'Verlopen',
      cancelled: 'Geannuleerd',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
        <h1 className="text-3xl font-bold text-gray-900">💰 Boekhouding</h1>
        <p className="text-gray-600 mt-1">Offertes, Facturen en Transacties beheren</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 Offertes ({quotes.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🧾 Facturen ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            💸 Transacties ({transactions.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'quotes' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Totaal Geoffreerd</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.totalQuoted)}</div>
              <div className="text-sm text-gray-500 mt-1">{quotes.length} offertes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Goedgekeurd</div>
              <div className="text-2xl font-bold text-green-600">{kpiData.approvedQuotes}</div>
              <div className="text-sm text-gray-500 mt-1">Offertes</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Conversie Ratio</div>
              <div className="text-2xl font-bold text-blue-600">
                {quotes.length > 0 ? Math.round((kpiData.approvedQuotes / quotes.length) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500 mt-1">Goedkeuringspercentage</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Zoek offertes..."
              value={quoteSearchTerm}
              onChange={(e) => setQuoteSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {currentUser.isAdmin && (
              <button
                onClick={handleCreateQuote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Nieuwe Offerte
              </button>
            )}
          </div>

          {/* Quotes List */}
          {filteredQuotes.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Geen offertes gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredQuotes.map(quote => (
                <div key={quote.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{quote.quoteNumber}</h3>
                      <p className="text-sm text-gray-600">{quote.customerName}</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(quote.status)}
                      <div className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(quote.total)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Aangemaakt:</span>
                      <span className="text-gray-900 ml-2">{formatDate(quote.createdAt)}</span>
                    </div>
                    {quote.validUntil && (
                      <div>
                        <span className="text-gray-600">Geldig tot:</span>
                        <span className="text-gray-900 ml-2">{formatDate(quote.validUntil)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-2">Items: {quote.items.length}</div>
                    {quote.laborHours > 0 && (
                      <div className="text-sm text-gray-600">Werkuren: {quote.laborHours}u à {formatCurrency(quote.hourlyRate)}/u</div>
                    )}
                  </div>

                  {currentUser.isAdmin && (
                    <div className="mt-4 flex gap-2">
                      {quote.status === 'draft' && (
                        <button
                          onClick={() => handleUpdateQuoteStatus(quote.id, 'sent')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Verzenden
                        </button>
                      )}
                      {quote.status === 'sent' && (
                        <>
                          <button
                            onClick={() => handleUpdateQuoteStatus(quote.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Goedkeuren
                          </button>
                          <button
                            onClick={() => handleUpdateQuoteStatus(quote.id, 'rejected')}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Afkeuren
                          </button>
                        </>
                      )}
                      {quote.status === 'approved' && !quote.invoiceId && (
                        <button
                          onClick={() => handleConvertQuoteToInvoice(quote.id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm"
                        >
                          🧾 Omzetten naar Factuur
                        </button>
                      )}
                      {quote.invoiceId && (
                        <span className="text-sm text-green-600">✓ Omgezet naar factuur</span>
                      )}
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm ml-auto"
                      >
                        Verwijderen
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'invoices' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Totaal Gefactureerd</div>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(kpiData.totalInvoiced)}</div>
              <div className="text-sm text-gray-500 mt-1">{invoices.length} facturen</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Betaald</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(kpiData.totalPaid)}</div>
              <div className="text-sm text-gray-500 mt-1">{kpiData.paidCount} facturen</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Uitstaand</div>
              <div className="text-2xl font-bold text-orange-600">{formatCurrency(kpiData.totalInvoiced - kpiData.totalPaid)}</div>
              <div className="text-sm text-gray-500 mt-1">{invoices.length - kpiData.paidCount} facturen</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Verlopen</div>
              <div className="text-2xl font-bold text-red-600">{kpiData.overdueCount}</div>
              <div className="text-sm text-gray-500 mt-1">Facturen</div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mb-6 flex justify-between items-center">
            <input
              type="text"
              placeholder="Zoek facturen..."
              value={invoiceSearchTerm}
              onChange={(e) => setInvoiceSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {currentUser.isAdmin && (
              <button
                onClick={handleCreateInvoice}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                + Nieuwe Factuur
              </button>
            )}
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Geen facturen gevonden</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredInvoices.map(invoice => {
                const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();

                return (
                  <div
                    key={invoice.id}
                    className={`bg-white rounded-lg shadow p-6 ${isOverdue ? 'border-2 border-red-400' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                        <p className="text-sm text-gray-600">{invoice.customerName}</p>
                        {invoice.quoteId && (
                          <p className="text-xs text-blue-600 mt-1">Geconverteerd van offerte</p>
                        )}
                      </div>
                      <div className="text-right">
                        {getStatusBadge(isOverdue ? 'overdue' : invoice.status)}
                        <div className="text-xl font-bold text-gray-900 mt-2">{formatCurrency(invoice.total)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Factuurdatum:</span>
                        <span className="text-gray-900 ml-2">{formatDate(invoice.date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Vervaldatum:</span>
                        <span className={`ml-2 ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {formatDate(invoice.dueDate)}
                        </span>
                      </div>
                      {invoice.paidDate && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Betaald op:</span>
                          <span className="text-green-600 ml-2 font-semibold">{formatDate(invoice.paidDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600 mb-2">Items: {invoice.items.length}</div>
                      {invoice.laborHours > 0 && (
                        <div className="text-sm text-gray-600">Werkuren: {invoice.laborHours}u à {formatCurrency(invoice.hourlyRate)}/u</div>
                      )}
                    </div>

                    {currentUser.isAdmin && (
                      <div className="mt-4 flex gap-2">
                        {invoice.status === 'draft' && (
                          <button
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, 'sent')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Verzenden
                          </button>
                        )}
                        {invoice.status === 'sent' && (
                          <button
                            onClick={() => handleUpdateInvoiceStatus(invoice.id, 'paid')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Markeer als Betaald
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm ml-auto"
                        >
                          Verwijderen
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Totale Inkomsten</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(kpiData.totalIncome)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Totale Uitgaven</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(kpiData.totalExpense)}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Netto Winst</div>
              <div className={`text-2xl font-bold ${kpiData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(kpiData.netProfit)}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">Geen transacties gevonden</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschrijving</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bedrag</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map(transaction => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'income' ? 'Inkomst' : 'Uitgave'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold">
                        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quote Form Modal (simplified version - expand later) */}
      {showQuoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingQuote ? 'Offerte Bewerken' : 'Nieuwe Offerte'}
            </h2>

            {/* Basic form fields will be added in next iteration */}
            <p className="text-gray-600 mb-4">Form implementation komt in de volgende iteratie...</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowQuoteForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveQuote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Form Modal (simplified version - expand later) */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingInvoice ? 'Factuur Bewerken' : 'Nieuwe Factuur'}
            </h2>

            {/* Basic form fields will be added in next iteration */}
            <p className="text-gray-600 mb-4">Form implementation komt in de volgende iteratie...</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveInvoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
