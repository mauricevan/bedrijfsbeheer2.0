/**
 * WorkOrders Page
 * Main page for WorkOrders module (Werkorders beheer)
 */

import React, { useState } from 'react';
import { useWorkOrders } from '../features/workorders/hooks';
import { KanbanBoard } from '../components/workorders';
import { initialUsers } from '../data/initialData';
import type { WorkOrder } from '../types';

// Demo workorders data
const demoWorkOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    index: 1,
    title: 'Onderhoud airco systeem',
    description: 'Jaarlijks onderhoud en inspectie van het airco systeem in het hoofdkantoor.',
    status: 'in_progress',
    priority: 'high',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    estimatedHours: 4,
    actualHours: 2.5,
    dueDate: '2024-02-15T17:00:00.000Z',
    createdAt: '2024-02-10T09:00:00.000Z',
    updatedAt: '2024-02-12T14:30:00.000Z'
  },
  {
    id: 'wo-2',
    index: 2,
    title: 'Reparatie koelunit magazijn',
    description: 'Koelunit in magazijn geeft foutmelding E04. Diagnose en reparatie nodig.',
    status: 'pending',
    priority: 'high',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    estimatedHours: 3,
    actualHours: 0,
    dueDate: '2024-02-14T12:00:00.000Z',
    createdAt: '2024-02-11T10:30:00.000Z',
    updatedAt: '2024-02-11T10:30:00.000Z',
    materials: [
      {
        id: 'mat-1',
        name: 'Koelvloeistof R134a',
        quantity: 2,
        unit: 'liter',
        unitPrice: 45.50
      },
      {
        id: 'mat-2',
        name: 'Thermostaat sensor',
        quantity: 1,
        unit: 'stuk',
        unitPrice: 125.00
      }
    ]
  },
  {
    id: 'wo-3',
    index: 3,
    title: 'Inspectie elektrische installatie',
    description: 'Periodieke keuring elektrische installatie conform NEN1010.',
    status: 'todo',
    priority: 'medium',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    estimatedHours: 6,
    actualHours: 0,
    dueDate: '2024-02-20T17:00:00.000Z',
    createdAt: '2024-02-08T08:00:00.000Z',
    updatedAt: '2024-02-08T08:00:00.000Z'
  },
  {
    id: 'wo-4',
    index: 4,
    title: 'Installatie nieuwe LED verlichting',
    description: 'Vervangen van oude TL-verlichting door LED panelen in productiehal.',
    status: 'completed',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    estimatedHours: 8,
    actualHours: 7.5,
    dueDate: '2024-02-10T17:00:00.000Z',
    completedAt: '2024-02-09T16:30:00.000Z',
    createdAt: '2024-02-01T09:00:00.000Z',
    updatedAt: '2024-02-09T16:30:00.000Z',
    materials: [
      {
        id: 'mat-3',
        name: 'LED paneel 60x60cm',
        quantity: 24,
        unit: 'stuk',
        unitPrice: 35.00
      },
      {
        id: 'mat-4',
        name: 'Montagerails',
        quantity: 12,
        unit: 'meter',
        unitPrice: 8.50
      }
    ],
    notes: 'Klant zeer tevreden met het resultaat. Bespaart circa 60% op energiekosten.'
  },
  {
    id: 'wo-5',
    index: 5,
    title: 'Noodstroom generator test',
    description: 'Maandelijkse test van de noodstroom generator inclusief laadtest accu\'s.',
    status: 'todo',
    priority: 'low',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    estimatedHours: 2,
    actualHours: 0,
    dueDate: '2024-02-28T17:00:00.000Z',
    createdAt: '2024-02-01T08:00:00.000Z',
    updatedAt: '2024-02-01T08:00:00.000Z'
  }
];

export const WorkOrdersPage: React.FC = () => {
  const workorders = useWorkOrders(demoWorkOrders, initialUsers);
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Werkorders</h1>
          <p className="text-gray-600">
            Beheer werkorders, planning en voortgang
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Totaal</p>
            <p className="text-3xl font-bold text-gray-900">
              {workorders.stats.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Werkorders
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">In Uitvoering</p>
            <p className="text-3xl font-bold text-blue-600">
              {workorders.stats.byStatus.in_progress}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Actief bezig
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">In Wacht</p>
            <p className="text-3xl font-bold text-yellow-600">
              {workorders.stats.byStatus.pending}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Geparkeerd
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Afgerond</p>
            <p className="text-3xl font-bold text-green-600">
              {workorders.stats.byStatus.completed}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {workorders.stats.completionRate.toFixed(1)}% completion rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Verlopen</p>
            <p className="text-3xl font-bold text-red-600">
              {workorders.stats.totalOverdue}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Over deadline
            </p>
          </div>
        </div>

        {/* Hours Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Geschatte Uren</p>
            <p className="text-2xl font-bold text-gray-900">
              {workorders.stats.totalEstimatedHours.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Totaal gepland
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Werkelijke Uren</p>
            <p className="text-2xl font-bold text-blue-600">
              {workorders.stats.totalActualHours.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Daadwerkelijk gewerkt
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Gem. Doorlooptijd</p>
            <p className="text-2xl font-bold text-purple-600">
              {workorders.stats.averageCompletionTime.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Dagen om af te ronden
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('kanban')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'kanban'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📝 Lijst
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-4">
            <input
              type="text"
              placeholder="Zoek werkorders..."
              value={workorders.filters.search || ''}
              onChange={e =>
                workorders.setFilters({ ...workorders.filters, search: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        {activeView === 'kanban' && (
          <KanbanBoard
            workOrders={workorders.groupedByStatus}
            users={workorders.users}
            onDelete={workorders.removeWorkOrder}
            onStatusChange={workorders.updateStatus}
          />
        )}

        {activeView === 'list' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Alle Werkorders</h2>
              <div className="space-y-2">
                {workorders.filteredWorkOrders.map(wo => (
                  <div
                    key={wo.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{wo.title}</p>
                      <p className="text-sm text-gray-600">
                        Toegewezen aan:{' '}
                        {workorders.users.find(u => u.id === wo.assignedTo)?.name || 'Onbekend'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        {wo.actualHours}u / {wo.estimatedHours}u
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{wo.status}</p>
                    </div>
                  </div>
                ))}
              </div>

              {workorders.filteredWorkOrders.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Geen werkorders gevonden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkOrdersPage;
