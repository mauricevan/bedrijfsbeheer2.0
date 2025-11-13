/**
 * WorkOrderCard Component
 * Displays a single workorder in card format
 */

import React from 'react';
import type { WorkOrder, User } from '../../types';
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
  getPriorityLabel,
  getAssignedUserName,
  isOverdue,
  calculateProgress
} from '../../features/workorders/utils/helpers';
import {
  formatWorkOrderNumber,
  formatDate,
  formatRelativeTime,
  formatHours,
  formatSummary
} from '../../features/workorders/utils/formatters';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  users: User[];
  onEdit?: (workOrder: WorkOrder) => void;
  onDelete?: (workOrderId: string) => void;
  onView?: (workOrder: WorkOrder) => void;
  onStatusChange?: (workOrderId: string, newStatus: WorkOrder['status']) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  users,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
  readOnly = false,
  compact = false
}) => {
  const statusColor = getStatusColor(workOrder.status);
  const statusLabel = getStatusLabel(workOrder.status);
  const priorityColor = getPriorityColor(workOrder.priority);
  const priorityLabel = getPriorityLabel(workOrder.priority);
  const assignedUser = getAssignedUserName(workOrder.assignedTo, users);
  const overdue = isOverdue(workOrder);
  const progress = calculateProgress(workOrder);

  const statusColors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800'
  };

  const priorityColors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700'
  };

  if (compact) {
    return (
      <div
        className={`bg-white rounded-lg shadow p-3 hover:shadow-md transition-shadow cursor-pointer ${
          overdue ? 'border-l-4 border-red-500' : ''
        }`}
        onClick={() => onView?.(workOrder)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-mono">
              {formatWorkOrderNumber(workOrder.index)}
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {workOrder.title}
            </p>
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              statusColors[statusColor]
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{assignedUser}</span>
          {workOrder.priority && (
            <span className={`px-1.5 py-0.5 rounded ${priorityColors[priorityColor]}`}>
              {priorityLabel}
            </span>
          )}
        </div>

        {progress > 0 && progress < 100 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow ${
        overdue ? 'border-l-4 border-red-500' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm text-gray-500 font-mono mb-1">
            {formatWorkOrderNumber(workOrder.index)}
          </p>
          <h3 className="text-lg font-semibold text-gray-900">
            {workOrder.title}
          </h3>
        </div>
        <span
          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
            statusColors[statusColor]
          }`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3">
        {formatSummary(workOrder.description, 120)}
      </p>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div>
          <span className="font-medium">Toegewezen aan:</span>
          <p className="text-gray-900">{assignedUser}</p>
        </div>
        {workOrder.priority && (
          <div>
            <span className="font-medium">Prioriteit:</span>
            <p>
              <span className={`px-2 py-0.5 rounded ${priorityColors[priorityColor]}`}>
                {priorityLabel}
              </span>
            </p>
          </div>
        )}
        <div>
          <span className="font-medium">Geschat:</span>
          <p className="text-gray-900">{formatHours(workOrder.estimatedHours)}</p>
        </div>
        <div>
          <span className="font-medium">Werkelijk:</span>
          <p className="text-gray-900">{formatHours(workOrder.actualHours)}</p>
        </div>
        {workOrder.dueDate && (
          <div>
            <span className="font-medium">Deadline:</span>
            <p className={overdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
              {formatDate(workOrder.dueDate)}
              {overdue && ' (verlopen)'}
            </p>
          </div>
        )}
        <div>
          <span className="font-medium">Aangemaakt:</span>
          <p className="text-gray-900">{formatRelativeTime(workOrder.createdAt)}</p>
        </div>
      </div>

      {/* Progress bar */}
      {progress > 0 && progress < 100 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Voortgang</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Materials badge */}
      {workOrder.materials && workOrder.materials.length > 0 && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
            📦 {workOrder.materials.length} materiaal
            {workOrder.materials.length !== 1 ? 'items' : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onView && (
            <button
              onClick={() => onView(workOrder)}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Details
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(workOrder)}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Bewerken
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Weet je zeker dat je werkorder "${workOrder.title}" wilt verwijderen?`
                  )
                ) {
                  onDelete(workOrder.id);
                }
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
              title="Verwijder werkorder"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Quick status change buttons */}
      {!readOnly && onStatusChange && workOrder.status !== 'completed' && (
        <div className="flex gap-2 mt-2">
          {workOrder.status !== 'in_progress' && (
            <button
              onClick={() => onStatusChange(workOrder.id, 'in_progress')}
              className="flex-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors"
            >
              ▶️ Start
            </button>
          )}
          {workOrder.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(workOrder.id, 'pending')}
              className="flex-1 px-2 py-1 bg-yellow-50 text-yellow-700 text-xs rounded hover:bg-yellow-100 transition-colors"
            >
              ⏸️ Pauzeer
            </button>
          )}
        </div>
      )}
    </div>
  );
};
