/**
 * InvoiceList Component
 * Display and manage list of invoices
 */

import React, { useState, useMemo } from 'react';
import type { Invoice, Customer, User } from '../../../types';
import { filterInvoices, sortInvoicesByDateDesc } from '../../../features/accounting/utils';
import { formatCurrency, formatDate } from '../../../features/accounting/utils';

interface InvoiceListProps {
  invoices: Invoice[];
  customers: Customer[];
  users: User[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Invoice['status']) => void;
  onMarkAsPaid: (id: string) => void;
  onClone: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  customers,
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onMarkAsPaid,
  onClone,
}) => {
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort invoices
  const filteredInvoices = useMemo(() => {
    let result = filterInvoices(invoices, {
      status: statusFilter,
      searchTerm: searchTerm.trim() !== '' ? searchTerm : undefined,
    });
    return sortInvoicesByDateDesc(result);
  }, [invoices, statusFilter, searchTerm]);

  const getStatusBadge = (status: Invoice['status']) => {
    const colors: Record<Invoice['status'], string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<Invoice['status'], string> = {
      draft: 'Concept',
      sent: 'Verzonden',
      paid: 'Betaald',
      overdue: 'Verlopen',
      cancelled: 'Geannuleerd',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Zoek op klantnaam of factuurnummer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Invoice['status'] | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle statussen</option>
          <option value="draft">Concept</option>
          <option value="sent">Verzonden</option>
          <option value="paid">Betaald</option>
          <option value="overdue">Verlopen</option>
          <option value="cancelled">Geannuleerd</option>
        </select>
      </div>

      {/* Invoice Cards */}
      <div className="space-y-4">
        {filteredInvoices.map(invoice => (
          <div key={invoice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{invoice.customerName}</h3>
                  {getStatusBadge(invoice.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {invoice.invoiceNumber} • Datum: {formatDate(invoice.date)} • Vervaldag: {formatDate(invoice.dueDate)}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(invoice.total)}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {invoice.items.length} items • {invoice.laborHours}u arbeid
                </div>
                {invoice.paidDate && (
                  <p className="text-sm text-green-600 mt-1">
                    Betaald op: {formatDate(invoice.paidDate)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {invoice.status !== 'paid' && (
                  <>
                    <button
                      onClick={() => onEdit(invoice)}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => onMarkAsPaid(invoice.id)}
                      className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
                    >
                      Markeer als betaald
                    </button>
                  </>
                )}
                <button
                  onClick={() => onClone(invoice.id)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Dupliceren
                </button>
                {invoice.status !== 'paid' && (
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Verwijderen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Geen facturen gevonden
        </div>
      )}
    </div>
  );
};
