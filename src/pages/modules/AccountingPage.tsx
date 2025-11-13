/**
 * AccountingPage
 * Offertes & Facturen beheer
 */

import React from 'react';
import type { User, Quote, Invoice, Customer } from '../../types';
import { useAccounting } from '../../features/accounting';

type AccountingPageProps = {
  currentUser: User;
  initialQuotes: Quote[];
  initialInvoices: Invoice[];
  customers: Customer[];
};

export const AccountingPage: React.FC<AccountingPageProps> = ({
  currentUser: _currentUser,
  initialQuotes,
  initialInvoices,
  customers,
}) => {
  const {
    quotes,
    invoices,
    quotesStats,
    invoicesStats,
    selectedTab,
    setSelectedTab,
    convertQuoteToInvoice,
    markInvoiceAsPaid,
  } = useAccounting(initialQuotes, initialInvoices, customers);

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Boekhouding</h1>
        <p className="text-gray-600 mt-2">Offertes & Facturen beheer</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {selectedTab === 'quotes' ? (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Totaal Offertes</p>
              <p className="text-2xl font-bold text-gray-900">{quotesStats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Goedgekeurd</p>
              <p className="text-2xl font-bold text-green-600">{quotesStats.approved}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Verstuurd</p>
              <p className="text-2xl font-bold text-blue-600">{quotesStats.sent}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Totale Waarde</p>
              <p className="text-2xl font-bold text-gray-900">€{quotesStats.totalValue.toFixed(2)}</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Totaal Facturen</p>
              <p className="text-2xl font-bold text-gray-900">{invoicesStats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Betaald</p>
              <p className="text-2xl font-bold text-green-600">{invoicesStats.paid}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Omzet</p>
              <p className="text-2xl font-bold text-green-600">€{invoicesStats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600">Uitstaand</p>
              <p className="text-2xl font-bold text-orange-600">€{invoicesStats.totalOutstanding.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('quotes')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'quotes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Offertes ({quotes.length})
            </button>
            <button
              onClick={() => setSelectedTab('invoices')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'invoices'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🧾 Facturen ({invoices.length})
            </button>
          </nav>
        </div>

        {/* Quotes Tab */}
        {selectedTab === 'quotes' && (
          <div className="p-6">
            {quotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen offertes gevonden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Nummer</th>
                      <th className="pb-3 font-medium">Klant</th>
                      <th className="pb-3 font-medium">Datum</th>
                      <th className="pb-3 font-medium text-right">Totaal</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((quote) => (
                      <tr key={quote.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{quote.quoteNumber}</td>
                        <td className="py-3 text-gray-900">{quote.customerName}</td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(quote.createdAt).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          €{quote.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getQuoteStatusColor(quote.status)}`}>
                            {quote.status === 'draft' ? 'Concept' :
                             quote.status === 'sent' ? 'Verstuurd' :
                             quote.status === 'approved' ? 'Goedgekeurd' :
                             quote.status === 'rejected' ? 'Afgewezen' : 'Verlopen'}
                          </span>
                        </td>
                        <td className="py-3">
                          {quote.status === 'approved' && !quote.invoiceId && (
                            <button
                              onClick={() => {
                                const invoice = convertQuoteToInvoice(quote.id);
                                if (invoice) {
                                  alert(`Factuur ${invoice.invoiceNumber} aangemaakt!`);
                                  setSelectedTab('invoices');
                                }
                              }}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              → Naar Factuur
                            </button>
                          )}
                          {quote.invoiceId && (
                            <span className="text-xs text-green-600">✓ Factuur aangemaakt</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {selectedTab === 'invoices' && (
          <div className="p-6">
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen facturen gevonden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Nummer</th>
                      <th className="pb-3 font-medium">Klant</th>
                      <th className="pb-3 font-medium">Datum</th>
                      <th className="pb-3 font-medium">Vervaldatum</th>
                      <th className="pb-3 font-medium text-right">Totaal</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                        <td className="py-3 text-gray-900">{invoice.customerName}</td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(invoice.date).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(invoice.dueDate).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900">
                          €{invoice.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getInvoiceStatusColor(invoice.status)}`}>
                            {invoice.status === 'draft' ? 'Concept' :
                             invoice.status === 'sent' ? 'Verstuurd' :
                             invoice.status === 'paid' ? 'Betaald' : 'Achterstallig'}
                          </span>
                        </td>
                        <td className="py-3">
                          {invoice.status !== 'paid' && (
                            <button
                              onClick={() => {
                                markInvoiceAsPaid(invoice.id);
                                alert(`Factuur ${invoice.invoiceNumber} gemarkeerd als betaald!`);
                              }}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              ✓ Betaald
                            </button>
                          )}
                          {invoice.status === 'paid' && invoice.paidDate && (
                            <span className="text-xs text-gray-600">
                              Betaald: {new Date(invoice.paidDate).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
