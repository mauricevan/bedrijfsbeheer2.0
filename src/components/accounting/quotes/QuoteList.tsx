/**
 * QuoteList Component
 * Display and manage list of quotes
 */

import React, { useState, useMemo } from 'react';
import type { Quote, Customer, User } from '../../../types';
import { filterQuotes, sortQuotesByDateDesc } from '../../../features/accounting/utils';
import { formatCurrency, formatDate } from '../../../features/accounting/utils';

interface QuoteListProps {
  quotes: Quote[];
  customers: Customer[];
  users: User[];
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Quote['status']) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onClone: (id: string) => void;
}

export const QuoteList: React.FC<QuoteListProps> = ({
  quotes,
  customers,
  users,
  onEdit,
  onDelete,
  onStatusChange,
  onConvertToInvoice,
  onClone,
}) => {
  const [statusFilter, setStatusFilter] = useState<Quote['status'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort quotes
  const filteredQuotes = useMemo(() => {
    let result = filterQuotes(quotes, {
      status: statusFilter,
      searchTerm: searchTerm.trim() !== '' ? searchTerm : undefined,
    });
    return sortQuotesByDateDesc(result);
  }, [quotes, statusFilter, searchTerm]);

  const getStatusBadge = (status: Quote['status']) => {
    const colors: Record<Quote['status'], string> = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-yellow-100 text-yellow-800',
    };

    const labels: Record<Quote['status'], string> = {
      draft: 'Concept',
      sent: 'Verzonden',
      approved: 'Goedgekeurd',
      rejected: 'Afgewezen',
      expired: 'Verlopen',
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
          placeholder="Zoek op klantnaam of offertenummer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Quote['status'] | 'all')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Alle statussen</option>
          <option value="draft">Concept</option>
          <option value="sent">Verzonden</option>
          <option value="approved">Goedgekeurd</option>
          <option value="rejected">Afgewezen</option>
          <option value="expired">Verlopen</option>
        </select>
      </div>

      {/* Quote Cards */}
      <div className="space-y-4">
        {filteredQuotes.map(quote => (
          <div key={quote.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">{quote.customerName}</h3>
                  {getStatusBadge(quote.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {quote.quoteNumber} • {formatDate(quote.createdAt)}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(quote.total)}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {quote.items.length} items • {quote.laborHours}u arbeid
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onEdit(quote)}
                  className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                >
                  Bewerken
                </button>
                {quote.status === 'approved' && (
                  <button
                    onClick={() => onConvertToInvoice(quote)}
                    className="px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-md"
                  >
                    → Factuur
                  </button>
                )}
                <button
                  onClick={() => onClone(quote.id)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-md"
                >
                  Dupliceren
                </button>
                <button
                  onClick={() => onDelete(quote.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
                >
                  Verwijderen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Geen offertes gevonden
        </div>
      )}
    </div>
  );
};
