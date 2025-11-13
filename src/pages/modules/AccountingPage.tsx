/**
 * AccountingPage - Boekhouding, Offertes & Facturen
 * Volledig accounting systeem met quotes en invoices
 */

import React, { useState } from 'react';
import type { User, Quote, Invoice, Customer, InventoryItem } from '../../types';
import { useQuotes, useInvoices } from '../../features/accounting';

type AccountingPageProps = {
  currentUser: User;
  initialQuotes: Quote[];
  initialInvoices: Invoice[];
  customers: Customer[];
  inventory: InventoryItem[];
};

type Tab = 'quotes' | 'invoices' | 'accounting';

export const AccountingPage: React.FC<AccountingPageProps> = ({
  currentUser,
  initialQuotes,
  initialInvoices,
  customers,
  inventory,
}) => {
  const {
    quotes,
    stats: quoteStats,
    updateQuoteStatus,
    cloneQuote,
  } = useQuotes(initialQuotes);

  const {
    invoices,
    stats: invoiceStats,
    updateInvoiceStatus,
    markAsPaid,
    cloneInvoice,
  } = useInvoices(initialInvoices);

  const [activeTab, setActiveTab] = useState<Tab>('quotes');

  const isAdmin = currentUser.isAdmin;

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'quotes':
        return (
          <div className="space-y-6">
            {/* Statistieken Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Totaal Geoffreerd</div>
                <div className="text-2xl font-bold text-gray-900">
                  €{quoteStats.totalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{quoteStats.total} offertes</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Geaccepteerd</div>
                <div className="text-2xl font-bold text-green-600">
                  €{quoteStats.approvedAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{quoteStats.approved} offertes</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Verzonden</div>
                <div className="text-2xl font-bold text-blue-600">{quoteStats.sent}</div>
                <div className="text-xs text-gray-500">Wacht op reactie</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-sm text-gray-600">Status Overzicht</div>
                <div className="text-xs space-y-1 mt-2">
                  <div>Draft: {quoteStats.draft}</div>
                  <div>Afgewezen: {quoteStats.rejected}</div>
                  <div>Verlopen: {quoteStats.expired}</div>
                </div>
              </div>
            </div>

            {/* Quotes List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Offertes</h2>
                  {isAdmin && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      + Nieuwe Offerte
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {quotes.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">📄</span>
                    <p className="text-gray-600">Nog geen offertes aangemaakt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {quotes.map((quote) => (
                      <div
                        key={quote.id}
                        className={`p-4 rounded-lg border-2 transition ${
                          quote.status === 'approved'
                            ? 'border-green-200 bg-green-50'
                            : quote.status === 'rejected'
                            ? 'border-red-200 bg-red-50'
                            : quote.status === 'expired'
                            ? 'border-gray-300 bg-gray-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900">
                                {quote.quoteNumber}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  quote.status === 'draft'
                                    ? 'bg-gray-100 text-gray-800'
                                    : quote.status === 'sent'
                                    ? 'bg-blue-100 text-blue-800'
                                    : quote.status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : quote.status === 'rejected'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {quote.status === 'draft'
                                  ? 'Concept'
                                  : quote.status === 'sent'
                                  ? 'Verzonden'
                                  : quote.status === 'approved'
                                  ? 'Geaccepteerd'
                                  : quote.status === 'rejected'
                                  ? 'Afgewezen'
                                  : 'Verlopen'}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              Klant: {quote.customerName}
                            </p>

                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-gray-600">
                                {quote.items.length} item(s)
                              </span>
                              {quote.laborHours > 0 && (
                                <span className="text-gray-600">
                                  {quote.laborHours} uur @ €{quote.hourlyRate}/u
                                </span>
                              )}
                              <span className="font-semibold text-gray-900">
                                Totaal: €{quote.total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {quote.validUntil && (
                              <p className="text-xs text-gray-500 mt-1">
                                Geldig tot: {new Date(quote.validUntil).toLocaleDateString('nl-NL')}
                              </p>
                            )}

                            {quote.workOrderId && (
                              <div className="mt-2 inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                🔧 Gekoppeld aan werkorder
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => cloneQuote(quote.id)}
                                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                                  title="Clone offerte"
                                >
                                  📋
                                </button>
                                <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                                  ✏️
                                </button>
                                {quote.status === 'approved' && !quote.invoiceId && (
                                  <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition">
                                    🧾 → Factuur
                                  </button>
                                )}
                                {quote.status === 'approved' && !quote.workOrderId && (
                                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                                    📋 → Werkorder
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'invoices':
        return (
          <div className="space-y-6">
            {/* Statistieken Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Totaal Gefactureerd</div>
                <div className="text-2xl font-bold text-gray-900">
                  €{invoiceStats.totalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{invoiceStats.total} facturen</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Betaald</div>
                <div className="text-2xl font-bold text-green-600">
                  €{invoiceStats.paidAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">{invoiceStats.paid} facturen</div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Uitstaand</div>
                <div className="text-2xl font-bold text-blue-600">
                  €{invoiceStats.outstandingAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">
                  {invoiceStats.sent + invoiceStats.overdue} facturen
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
                <div className="text-sm text-gray-600">Verlopen</div>
                <div className="text-2xl font-bold text-red-600">
                  €{invoiceStats.overdueAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500">
                  {invoiceStats.overdue} facturen ⚠️
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Facturen</h2>
                  {isAdmin && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      + Nieuwe Factuur
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-4 block">🧾</span>
                    <p className="text-gray-600">Nog geen facturen aangemaakt</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className={`p-4 rounded-lg border-2 transition ${
                          invoice.status === 'paid'
                            ? 'border-green-200 bg-green-50'
                            : invoice.status === 'overdue'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-gray-900">
                                {invoice.invoiceNumber}
                              </h3>
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  invoice.status === 'draft'
                                    ? 'bg-gray-100 text-gray-800'
                                    : invoice.status === 'sent'
                                    ? 'bg-blue-100 text-blue-800'
                                    : invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {invoice.status === 'draft'
                                  ? 'Concept'
                                  : invoice.status === 'sent'
                                  ? 'Verzonden'
                                  : invoice.status === 'paid'
                                  ? 'Betaald'
                                  : invoice.status === 'overdue'
                                  ? 'Verlopen'
                                  : 'Geannuleerd'}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mt-1">
                              Klant: {invoice.customerName}
                            </p>

                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="text-gray-600">
                                Datum: {new Date(invoice.date).toLocaleDateString('nl-NL')}
                              </span>
                              <span className="text-gray-600">
                                Betalen voor: {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}
                              </span>
                              <span className="font-semibold text-gray-900">
                                €{invoice.total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {invoice.paidDate && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ Betaald op {new Date(invoice.paidDate).toLocaleDateString('nl-NL')}
                              </p>
                            )}

                            {invoice.quoteId && (
                              <div className="mt-2 inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                📄 Van offerte {invoice.quoteId}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => cloneInvoice(invoice.id)}
                                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                                  title="Clone factuur"
                                >
                                  📋
                                </button>
                                <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                                  ✏️
                                </button>
                                {invoice.status !== 'paid' && (
                                  <button
                                    onClick={() => markAsPaid(invoice.id)}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                  >
                                    ✓ Markeer Betaald
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'accounting':
        return (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <span className="text-6xl mb-4 block">📚</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Boekhouding & Dossier
            </h2>
            <p className="text-gray-600 mb-4">
              Grootboek, BTW-overzicht en digitaal dossier
            </p>
            <p className="text-sm text-gray-500">Module wordt binnenkort toegevoegd</p>
          </div>
        );

      default:
        return null;
    }
  };

  // Render
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Boekhouding</h1>
        <p className="text-gray-600 mt-2">Offertes, facturen en boekhouding</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'quotes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📄 Offertes ({quotes.length})
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'invoices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            🧾 Facturen ({invoices.length})
          </button>

          <button
            onClick={() => setActiveTab('accounting')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'accounting'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            📚 Boekhouding & Dossier
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};
