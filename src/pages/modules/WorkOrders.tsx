import React, { useMemo, useState } from 'react';
import type { User, WorkOrder, Customer, InventoryItem } from '../../types/index';

interface WorkOrdersProps {
  currentUser: User;
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  users: User[];
  customers: Customer[];
  inventory: InventoryItem[];
}

/**
 * WorkOrders Component - Kanban Board voor werkorders
 *
 * Features:
 * - Kanban board met 4 kolommen (To Do, Pending, In Progress, Completed)
 * - Role-based filtering (User ziet alleen eigen WO's, Admin ziet alles)
 * - Status updates via drag-and-drop style interface
 * - Uren registratie
 * - Materialen tracking
 */

export const WorkOrders: React.FC<WorkOrdersProps> = ({
  currentUser,
  workOrders,
  setWorkOrders,
  users,
  customers,
  inventory,
}) => {
  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    currentUser.isAdmin ? 'all' : currentUser.id
  );
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('detailed');

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  const filteredWorkOrders = useMemo(() => {
    if (!currentUser.isAdmin) {
      // Users zien alleen eigen werkorders
      return workOrders.filter(wo => wo.assignedTo === currentUser.id);
    }

    if (selectedEmployee === 'all') {
      return workOrders;
    }

    return workOrders.filter(wo => wo.assignedTo === selectedEmployee);
  }, [workOrders, currentUser, selectedEmployee]);

  // Groepeer werkorders per status
  const workOrdersByStatus = useMemo(() => {
    return {
      todo: filteredWorkOrders.filter(wo => wo.status === 'todo'),
      pending: filteredWorkOrders.filter(wo => wo.status === 'pending'),
      in_progress: filteredWorkOrders.filter(wo => wo.status === 'in_progress'),
      completed: filteredWorkOrders.filter(wo => wo.status === 'completed'),
    };
  }, [filteredWorkOrders]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStatusChange = (woId: string, newStatus: WorkOrder['status']) => {
    setWorkOrders(prev => prev.map(wo => {
      if (wo.id !== woId) return wo;

      const updates: Partial<WorkOrder> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };

      // Add timestamps based on status
      if (newStatus === 'in_progress' && !wo.startedAt) {
        updates.startedAt = new Date().toISOString();
      } else if (newStatus === 'completed' && !wo.completedAt) {
        updates.completedAt = new Date().toISOString();
      }

      return { ...wo, ...updates };
    }));
  };

  const handleAddHours = (woId: string, hours: number) => {
    if (hours <= 0) return;

    setWorkOrders(prev => prev.map(wo =>
      wo.id === woId
        ? {
            ...wo,
            actualHours: wo.actualHours + hours,
            updatedAt: new Date().toISOString()
          }
        : wo
    ));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Werkorders</h1>
        <p className="text-gray-600 mt-1">
          {currentUser.isAdmin ? 'Beheer alle werkorders' : 'Je persoonlijke werkorders'}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Employee Filter (Admin only) */}
          {currentUser.isAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medewerker
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">Alle medewerkers</option>
                {users.filter(u => !u.isAdmin).map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* View Mode Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weergave
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('compact')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => setViewMode('detailed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'detailed'
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Uitgebreid
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{filteredWorkOrders.length}</p>
            <p className="text-sm text-gray-600">Totaal werkorders</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* To Do Column */}
        <KanbanColumn
          title="Te Doen"
          count={workOrdersByStatus.todo.length}
          color="gray"
          workOrders={workOrdersByStatus.todo}
          users={users}
          customers={customers}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onAddHours={handleAddHours}
          currentUser={currentUser}
        />

        {/* Pending Column */}
        <KanbanColumn
          title="In Wacht"
          count={workOrdersByStatus.pending.length}
          color="yellow"
          workOrders={workOrdersByStatus.pending}
          users={users}
          customers={customers}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onAddHours={handleAddHours}
          currentUser={currentUser}
        />

        {/* In Progress Column */}
        <KanbanColumn
          title="In Uitvoering"
          count={workOrdersByStatus.in_progress.length}
          color="blue"
          workOrders={workOrdersByStatus.in_progress}
          users={users}
          customers={customers}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onAddHours={handleAddHours}
          currentUser={currentUser}
        />

        {/* Completed Column */}
        <KanbanColumn
          title="Afgerond"
          count={workOrdersByStatus.completed.length}
          color="green"
          workOrders={workOrdersByStatus.completed}
          users={users}
          customers={customers}
          viewMode={viewMode}
          onStatusChange={handleStatusChange}
          onAddHours={handleAddHours}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
};

// ============================================================================
// KANBAN COLUMN COMPONENT
// ============================================================================

interface KanbanColumnProps {
  title: string;
  count: number;
  color: 'gray' | 'yellow' | 'blue' | 'green';
  workOrders: WorkOrder[];
  users: User[];
  customers: Customer[];
  viewMode: 'compact' | 'detailed';
  onStatusChange: (woId: string, newStatus: WorkOrder['status']) => void;
  onAddHours: (woId: string, hours: number) => void;
  currentUser: User;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  count,
  color,
  workOrders,
  users,
  customers,
  viewMode,
  onStatusChange,
  onAddHours,
  currentUser,
}) => {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-900',
    yellow: 'bg-yellow-100 text-yellow-900',
    blue: 'bg-blue-100 text-blue-900',
    green: 'bg-green-100 text-green-900',
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {/* Column Header */}
      <div className={`${colorClasses[color]} rounded-lg px-4 py-3 mb-4`}>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm opacity-75">{count} werkorders</p>
      </div>

      {/* Work Orders */}
      <div className="space-y-3">
        {workOrders.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">
            Geen werkorders
          </p>
        ) : (
          workOrders.map(wo => (
            <WorkOrderCard
              key={wo.id}
              workOrder={wo}
              users={users}
              customers={customers}
              viewMode={viewMode}
              onStatusChange={onStatusChange}
              onAddHours={onAddHours}
              currentUser={currentUser}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// WORK ORDER CARD COMPONENT
// ============================================================================

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  users: User[];
  customers: Customer[];
  viewMode: 'compact' | 'detailed';
  onStatusChange: (woId: string, newStatus: WorkOrder['status']) => void;
  onAddHours: (woId: string, hours: number) => void;
  currentUser: User;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  users,
  customers,
  viewMode,
  onStatusChange,
  onAddHours,
  currentUser,
}) => {
  const assignedUser = users.find(u => u.id === workOrder.assignedTo);
  const customer = customers.find(c => c.id === workOrder.customerId);

  const canEdit = currentUser.isAdmin || workOrder.assignedTo === currentUser.id;

  if (viewMode === 'compact') {
    return (
      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <h4 className="font-medium text-gray-900 text-sm">{workOrder.title}</h4>
        <p className="text-xs text-gray-500 mt-1">{assignedUser?.name}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Title */}
      <h4 className="font-semibold text-gray-900">{workOrder.title}</h4>

      {/* Description */}
      {workOrder.description && (
        <p className="text-sm text-gray-600 mt-2">{workOrder.description}</p>
      )}

      {/* Meta Info */}
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span>👤</span>
          <span>{assignedUser?.name || 'Niet toegewezen'}</span>
        </div>

        {customer && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🏢</span>
            <span>{customer.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-600">
          <span>⏱️</span>
          <span>{workOrder.actualHours}h / {workOrder.estimatedHours}h</span>
        </div>
      </div>

      {/* Actions */}
      {canEdit && workOrder.status !== 'completed' && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          {workOrder.status === 'todo' && (
            <button
              onClick={() => onStatusChange(workOrder.id, 'in_progress')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ▶ Start
            </button>
          )}

          {workOrder.status === 'in_progress' && (
            <>
              <button
                onClick={() => onStatusChange(workOrder.id, 'pending')}
                className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
              >
                ⏸ Wacht
              </button>
              <button
                onClick={() => {
                  const hours = prompt('Hoeveel uur wil je toevoegen?');
                  if (hours) onAddHours(workOrder.id, parseFloat(hours));
                }}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                + Uren
              </button>
            </>
          )}

          {workOrder.status === 'pending' && (
            <button
              onClick={() => onStatusChange(workOrder.id, 'in_progress')}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ▶ Hervatten
            </button>
          )}

          {(workOrder.status === 'in_progress' || workOrder.status === 'pending') && (
            <button
              onClick={() => onStatusChange(workOrder.id, 'completed')}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ✓ Voltooi
            </button>
          )}
        </div>
      )}
    </div>
  );
};
