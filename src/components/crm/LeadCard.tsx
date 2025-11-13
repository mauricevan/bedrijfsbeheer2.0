/**
 * LeadCard Component
 * Displays a single lead in pipeline kanban format
 */

import React from 'react';
import type { Lead, LeadStatus } from '../../types';
import {
  getLeadStatusColor,
  getLeadStatusLabel
} from '../../features/crm/utils/helpers';
import { formatCurrency, formatRelativeDate } from '../../features/crm/utils/formatters';

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: string) => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onConvert?: (leadId: string) => void;
  readOnly?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onEdit,
  onDelete,
  onConvert,
  readOnly = false
}) => {
  const statusColor = getLeadStatusColor(lead.status);
  const statusLabel = getLeadStatusLabel(lead.status);

  return (
    <div className="bg-white rounded-lg shadow p-3 mb-2 hover:shadow-md transition-shadow">
      {/* Name & Company */}
      <h4 className="font-semibold text-gray-900 mb-1">{lead.name}</h4>
      {lead.company && (
        <p className="text-sm text-gray-600 mb-2">{lead.company}</p>
      )}

      {/* Contact */}
      <div className="text-xs text-gray-500 space-y-1 mb-2">
        <p>{lead.email}</p>
        {lead.phone && <p>{lead.phone}</p>}
      </div>

      {/* Estimated value */}
      {lead.estimatedValue !== undefined && lead.estimatedValue !== null && (
        <div className="text-sm font-medium text-green-600 mb-2">
          {formatCurrency(lead.estimatedValue)}
          {lead.probability !== undefined && lead.probability !== null && (
            <span className="text-xs text-gray-500 ml-1">
              ({lead.probability}%)
            </span>
          )}
        </div>
      )}

      {/* Status badge */}
      <div className="mb-2">
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-800`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Last contacted */}
      {lead.lastContactedAt && (
        <p className="text-xs text-gray-400 mb-2">
          {formatRelativeDate(lead.lastContactedAt)}
        </p>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-1 pt-2 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={() => onEdit(lead)}
              className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors"
            >
              Edit
            </button>
          )}
          {lead.status === 'won' && onConvert && (
            <button
              onClick={() => onConvert(lead.id)}
              className="flex-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded hover:bg-green-100 transition-colors"
            >
              → Klant
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Weet je zeker dat je lead "${lead.name}" wilt verwijderen?`)) {
                  onDelete(lead.id);
                }
              }}
              className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded hover:bg-red-100 transition-colors"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};
