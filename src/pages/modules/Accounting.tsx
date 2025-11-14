/**
 * Accounting Component - Refactored Version
 *
 * Boekhouding, Offertes & Facturen
 *
 * This is the refactored version using modular components and hooks.
 * Features:
 * - Dashboard with statistics and charts
 * - Quote management (CRUD, status tracking, convert to invoice)
 * - Invoice management (CRUD, payment tracking, overdue detection)
 * - Transaction tracking and filtering
 */

import React, { useState } from 'react';
import type { User, Quote, Invoice, Customer, InventoryItem, WorkOrder, Transaction } from '../../types/index';
import { useQuotes, useInvoices, useModal } from '../../features/accounting/hooks';
import {
  AccountingDashboard,
  QuoteList,
  QuoteForm,
  InvoiceList,
  InvoiceForm,
  TransactionList,
} from '../../components/accounting';
import { ConfirmModal } from '../../components/common/modals';
import { createQuote, updateQuote, convertQuoteToInvoice } from '../../features/accounting/services';
import { createInvoice, updateInvoice, markInvoiceAsPaid } from '../../features/accounting/services';

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
  transactions?: Transaction[];
}

type Tab = 'dashboard' | 'transacties' | 'offertes' | 'facturen';

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
  transactions = [],
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Modals
  const quoteFormModal = useModal();
  const invoiceFormModal = useModal();
  const deleteQuoteModal = useModal();
  const deleteInvoiceModal = useModal();

  // Editing state
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Hooks
  const quoteHook = useQuotes(quotes);
  const invoiceHook = useInvoices(invoices);

  // ============================================================================
  // QUOTE HANDLERS
  // ============================================================================

  const handleCreateQuote = () => {
    setEditingQuote(null);
    quoteFormModal.open();
  };

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    quoteFormModal.open();
  };

  const handleSubmitQuote = (formData: any) => {
    if (editingQuote) {
      // Update existing quote
      const { quote, error } = updateQuote(editingQuote.id, formData, quotes);
      if (error) {
        alert(error);
        return;
      }
      setQuotes(prev => prev.map(q => (q.id === editingQuote.id ? quote : q)));
    } else {
      // Create new quote
      const { quote, error } = createQuote(
        {
          ...formData,
          createdBy: currentUser.id,
        },
        quotes
      );
      if (error) {
        alert(error);
        return;
      }
      setQuotes(prev => [...prev, quote]);
    }
    quoteFormModal.close();
    setEditingQuote(null);
  };

  const handleDeleteQuote = (id: string) => {
    setDeleteTarget(id);
    deleteQuoteModal.open();
  };

  const confirmDeleteQuote = () => {
    if (deleteTarget) {
      setQuotes(prev => prev.filter(q => q.id !== deleteTarget));
      deleteQuoteModal.close();
      setDeleteTarget(null);
    }
  };

  const handleQuoteStatusChange = (id: string, status: Quote['status']) => {
    quoteHook.updateQuoteStatus(id, status);
    setQuotes(prev => prev.map(q => (q.id === id ? { ...q, status } : q)));
  };

  const handleConvertQuoteToInvoice = (quote: Quote) => {
    const { invoice, error } = convertQuoteToInvoice(
      quote.id,
      quotes,
      invoices,
      currentUser.id
    );

    if (error) {
      alert(error);
      return;
    }

    setInvoices(prev => [...prev, invoice]);
    // Update quote status to approved and link invoice
    setQuotes(prev =>
      prev.map(q => (q.id === quote.id ? { ...q, status: 'approved', invoiceId: invoice.id } : q))
    );
    alert(`Factuur ${invoice.invoiceNumber} aangemaakt vanuit offerte ${quote.quoteNumber}`);
  };

  const handleCloneQuote = (id: string) => {
    const cloned = quoteHook.cloneQuote(id);
    if (cloned) {
      setQuotes(prev => [...prev, cloned]);
    }
  };

  // ============================================================================
  // INVOICE HANDLERS
  // ============================================================================

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    invoiceFormModal.open();
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    invoiceFormModal.open();
  };

  const handleSubmitInvoice = (formData: any) => {
    if (editingInvoice) {
      // Update existing invoice
      const { invoice, error } = updateInvoice(editingInvoice.id, formData, invoices);
      if (error) {
        alert(error);
        return;
      }
      setInvoices(prev => prev.map(i => (i.id === editingInvoice.id ? invoice : i)));
    } else {
      // Create new invoice
      const { invoice, error } = createInvoice(
        {
          ...formData,
          createdBy: currentUser.id,
        },
        invoices
      );
      if (error) {
        alert(error);
        return;
      }
      setInvoices(prev => [...prev, invoice]);
    }
    invoiceFormModal.close();
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    setDeleteTarget(id);
    deleteInvoiceModal.open();
  };

  const confirmDeleteInvoice = () => {
    if (deleteTarget) {
      setInvoices(prev => prev.filter(i => i.id !== deleteTarget));
      deleteInvoiceModal.close();
      setDeleteTarget(null);
    }
  };

  const handleInvoiceStatusChange = (id: string, status: Invoice['status']) => {
    invoiceHook.updateInvoiceStatus(id, status);
    setInvoices(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
  };

  const handleMarkInvoiceAsPaid = (id: string) => {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    const { invoice: updatedInvoice, error } = markInvoiceAsPaid(invoice);
    if (error) {
      alert(error);
      return;
    }

    setInvoices(prev => prev.map(i => (i.id === id ? updatedInvoice : i)));
  };

  const handleCloneInvoice = (id: string) => {
    const cloned = invoiceHook.cloneInvoice(id);
    if (cloned) {
      setInvoices(prev => [...prev, cloned]);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Accounting</h1>
        <p className="text-gray-600 mt-1">Beheer offertes, facturen en transacties</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transacties')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transacties'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Transacties
          </button>
          <button
            onClick={() => setActiveTab('offertes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'offertes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Offertes
          </button>
          <button
            onClick={() => setActiveTab('facturen')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'facturen'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Facturen
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <AccountingDashboard
          quotes={quotes}
          invoices={invoices}
          transactions={transactions}
          customers={customers}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}

      {activeTab === 'transacties' && <TransactionList transactions={transactions} />}

      {activeTab === 'offertes' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Offertes</h2>
            <button
              onClick={handleCreateQuote}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nieuwe Offerte
            </button>
          </div>
          <QuoteList
            quotes={quotes}
            customers={customers}
            users={users}
            onEdit={handleEditQuote}
            onDelete={handleDeleteQuote}
            onStatusChange={handleQuoteStatusChange}
            onConvertToInvoice={handleConvertQuoteToInvoice}
            onClone={handleCloneQuote}
          />
        </div>
      )}

      {activeTab === 'facturen' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Facturen</h2>
            <button
              onClick={handleCreateInvoice}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nieuwe Factuur
            </button>
          </div>
          <InvoiceList
            invoices={invoices}
            customers={customers}
            users={users}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
            onStatusChange={handleInvoiceStatusChange}
            onMarkAsPaid={handleMarkInvoiceAsPaid}
            onClone={handleCloneInvoice}
          />
        </div>
      )}

      {/* Modals */}
      {quoteFormModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingQuote ? 'Offerte Bewerken' : 'Nieuwe Offerte'}
              </h2>
              <QuoteForm
                quote={editingQuote || undefined}
                customers={customers}
                inventory={inventory}
                users={users}
                currentUser={currentUser}
                onSubmit={handleSubmitQuote}
                onCancel={() => {
                  quoteFormModal.close();
                  setEditingQuote(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {invoiceFormModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingInvoice ? 'Factuur Bewerken' : 'Nieuwe Factuur'}
              </h2>
              <InvoiceForm
                invoice={editingInvoice || undefined}
                customers={customers}
                inventory={inventory}
                users={users}
                currentUser={currentUser}
                onSubmit={handleSubmitInvoice}
                onCancel={() => {
                  invoiceFormModal.close();
                  setEditingInvoice(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteQuoteModal.isOpen}
        title="Offerte Verwijderen"
        message="Weet je zeker dat je deze offerte wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        cancelText="Annuleren"
        variant="danger"
        onConfirm={confirmDeleteQuote}
        onCancel={deleteQuoteModal.close}
      />

      <ConfirmModal
        isOpen={deleteInvoiceModal.isOpen}
        title="Factuur Verwijderen"
        message="Weet je zeker dat je deze factuur wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        cancelText="Annuleren"
        variant="danger"
        onConfirm={confirmDeleteInvoice}
        onCancel={deleteInvoiceModal.close}
      />
    </div>
  );
};
