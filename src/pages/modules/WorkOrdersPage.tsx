/**
 * WorkOrdersPage
 * Kanban-style workboard met uren registratie
 */

import React from 'react';
import type { User, WorkOrder } from '../../types';
import { useWorkOrders } from '../../features/workorders';

type WorkOrdersPageProps = {
  currentUser: User;
  initialWorkOrders: WorkOrder[];
  availableUsers: User[];
};

export const WorkOrdersPage: React.FC<WorkOrdersPageProps> = ({
  currentUser,
  initialWorkOrders,
  availableUsers,
}) => {
  const {
    workOrdersByStatus,
    stats,
    selectedUser,
    handleUserFilter,
    startWorkOrder,
    pauseWorkOrder,
    completeWorkOrder,
    reopenWorkOrder,
  } = useWorkOrders(initialWorkOrders, currentUser);

  const isAdmin = currentUser.isAdmin;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 border-gray-300';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300';
      case 'completed':
        return 'bg-green-100 border-green-300';
      default:
        return 'bg-gray-100';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Werkorders</h1>
        <p className="text-gray-600 mt-2">Kanban workboard met uren registratie</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Totaal</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Te Doen</p>
          <p className="text-2xl font-bold text-gray-600">{stats.todo}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">In Wacht</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Actief</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Afgerond</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* User Filter (Admin only) */}
      {isAdmin && (
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter per medewerker:</label>
          <select
            value={selectedUser}
            onChange={(e) => handleUserFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">Alle medewerkers</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TO DO Column */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Te Doen ({stats.todo})</h3>
          <div className="space-y-3">
            {workOrdersByStatus.todo.map((wo) => (
              <div key={wo.id} className={`p-4 rounded-lg border-2 ${getStatusColor('todo')} bg-white`}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900 text-sm">{wo.title}</p>
                  <span className={`text-xs font-medium ${getPriorityColor(wo.priority)}`}>
                    {wo.priority === 'high' ? '🔴' : wo.priority === 'medium' ? '🟡' : '⚪'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-3">{wo.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{wo.estimatedHours}u</span>
                  <span>{wo.actualHours}u gewerkt</span>
                </div>
                <button
                  onClick={() => startWorkOrder(wo.id)}
                  className="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ▶ Start
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PENDING Column */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">⏸️ In Wacht ({stats.pending})</h3>
          <div className="space-y-3">
            {workOrdersByStatus.pending.map((wo) => (
              <div key={wo.id} className={`p-4 rounded-lg border-2 ${getStatusColor('pending')} bg-white`}>
                <p className="font-medium text-gray-900 text-sm mb-2">{wo.title}</p>
                <p className="text-xs text-gray-600 mb-3">{wo.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{wo.estimatedHours}u</span>
                  <span>{wo.actualHours}u</span>
                </div>
                <button
                  onClick={() => startWorkOrder(wo.id)}
                  className="w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ▶ Hervatten
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">⚡ In Uitvoering ({stats.inProgress})</h3>
          <div className="space-y-3">
            {workOrdersByStatus.in_progress.map((wo) => (
              <div key={wo.id} className={`p-4 rounded-lg border-2 ${getStatusColor('in_progress')} bg-white`}>
                <p className="font-medium text-gray-900 text-sm mb-2">{wo.title}</p>
                <p className="text-xs text-gray-600 mb-3">{wo.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{wo.estimatedHours}u</span>
                  <span className="font-medium text-blue-600">{wo.actualHours}u</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => pauseWorkOrder(wo.id)}
                    className="flex-1 px-2 py-1.5 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    ⏸ Wacht
                  </button>
                  <button
                    onClick={() => completeWorkOrder(wo.id)}
                    className="flex-1 px-2 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✓ Klaar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMPLETED Column */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">✅ Afgerond ({stats.completed})</h3>
          <div className="space-y-3">
            {workOrdersByStatus.completed.map((wo) => (
              <div key={wo.id} className={`p-4 rounded-lg border-2 ${getStatusColor('completed')} bg-white`}>
                <p className="font-medium text-gray-900 text-sm mb-2">{wo.title}</p>
                <p className="text-xs text-gray-600 mb-3">{wo.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{wo.estimatedHours}u gep.</span>
                  <span className="font-medium text-green-600">{wo.actualHours}u</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => reopenWorkOrder(wo.id)}
                    className="w-full px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    ↺ Heropen
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hours Summary */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Uren Overzicht</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Totaal Gewerkt</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalHours}u</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Totaal Geschat</p>
            <p className="text-2xl font-bold text-gray-900">{stats.estimatedHours}u</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Verschil</p>
            <p className={`text-2xl font-bold ${stats.totalHours > stats.estimatedHours ? 'text-red-600' : 'text-green-600'}`}>
              {stats.totalHours > stats.estimatedHours ? '+' : ''}{stats.totalHours - stats.estimatedHours}u
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
