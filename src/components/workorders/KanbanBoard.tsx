/**
 * KanbanBoard Component
 * Kanban board for workorders grouped by status
 */

import React from 'react';
import type { WorkOrder, WorkOrderStatus, User } from '../../types';
import { WorkOrderCard } from './WorkOrderCard';
import { getStatusLabel } from '../../features/workorders/utils/helpers';

interface KanbanBoardProps {
  workOrders: Record<WorkOrderStatus, WorkOrder[]>;
  users: User[];
  onEdit?: (workOrder: WorkOrder) => void;
  onDelete?: (workOrderId: string) => void;
  onView?: (workOrder: WorkOrder) => void;
  onStatusChange?: (workOrderId: string, newStatus: WorkOrderStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  workOrders,
  users,
  onEdit,
  onDelete,
  onView,
  onStatusChange
}) => {
  const statuses: WorkOrderStatus[] = ['todo', 'pending', 'in_progress', 'completed'];

  const statusStyles: Record<WorkOrderStatus, string> = {
    todo: 'bg-gray-100 border-gray-300',
    pending: 'bg-yellow-50 border-yellow-300',
    in_progress: 'bg-blue-50 border-blue-300',
    completed: 'bg-green-50 border-green-300'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statuses.map(status => (
        <div
          key={status}
          className={`rounded-lg border-2 p-3 ${statusStyles[status]}`}
        >
          {/* Column header */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 text-lg">
              {getStatusLabel(status)}
            </h3>
            <p className="text-sm text-gray-600">
              {workOrders[status].length} werkorder
              {workOrders[status].length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Cards */}
          <div className="space-y-3 min-h-[200px]">
            {workOrders[status].map(workOrder => (
              <WorkOrderCard
                key={workOrder.id}
                workOrder={workOrder}
                users={users}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
                onStatusChange={onStatusChange}
                compact
              />
            ))}

            {workOrders[status].length === 0 && (
              <div className="text-center text-gray-400 text-sm py-8">
                Geen werkorders
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
