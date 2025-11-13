/**
 * CustomerCard Component
 * Displays a single customer in card format
 */

import React from 'react';
import type { Customer } from '../../types';
import {
  getCustomerInitials,
  getCustomerType
} from '../../features/crm/utils/helpers';
import { formatAddress, formatPhoneNumber } from '../../features/crm/utils/formatters';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  onView?: (customer: Customer) => void;
  readOnly?: boolean;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
  onView,
  readOnly = false
}) => {
  const type = getCustomerType(customer);
  const initials = getCustomerInitials(customer.name);
  const address = formatAddress(customer.address, customer.postalCode, customer.city);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {customer.name}
          </h3>
          {customer.company && (
            <p className="text-sm text-gray-600">{customer.company}</p>
          )}
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              type === 'zakelijk'
                ? 'bg-purple-100 text-purple-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {type === 'zakelijk' ? 'Zakelijk' : 'Particulier'}
          </span>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <p>
          <span className="font-medium">Email:</span> {customer.email}
        </p>
        {customer.phone && (
          <p>
            <span className="font-medium">Telefoon:</span>{' '}
            {formatPhoneNumber(customer.phone)}
          </p>
        )}
        {address && (
          <p>
            <span className="font-medium">Adres:</span> {address}
          </p>
        )}
        {customer.vatNumber && (
          <p>
            <span className="font-medium">BTW:</span> {customer.vatNumber}
          </p>
        )}
      </div>

      {/* Notes preview */}
      {customer.notes && (
        <div className="text-xs text-gray-500 mb-3 p-2 bg-gray-50 rounded">
          {customer.notes.length > 100
            ? `${customer.notes.substring(0, 100)}...`
            : customer.notes}
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onView && (
            <button
              onClick={() => onView(customer)}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Details
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(customer)}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Bewerken
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Weet je zeker dat je "${customer.name}" wilt verwijderen?`)) {
                  onDelete(customer.id);
                }
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
              title="Verwijder klant"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};
