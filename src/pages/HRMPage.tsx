/**
 * HRM Page
 * Main page for HRM module (Personeelsbeheer)
 */

import React, { useState } from 'react';
import { useHRM } from '../features/hrm/hooks';
import { EmployeeCard } from '../components/hrm';
import type { Employee } from '../types';

// Demo employees data (extending initialUsers)
const demoEmployees: Employee[] = [
  {
    id: 'emp-1',
    email: 'sophie@bedrijf.nl',
    name: 'Sophie van Dam',
    password: '1234',
    isAdmin: true,
    role: 'admin',
    jobTitle: 'Directeur',
    department: 'Management',
    phone: '06-12345678',
    hireDate: '2020-01-15T08:00:00.000Z',
    vacationDays: 25,
    vacationDaysUsed: 10,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
    notes: [
      {
        id: 'note-1',
        employeeId: 'emp-1',
        type: 'milestone',
        content: '5 jaar in dienst - jubileum gevierd',
        createdBy: 'emp-1',
        createdAt: '2024-01-15T10:00:00.000Z'
      }
    ]
  },
  {
    id: 'emp-2',
    email: 'jan@bedrijf.nl',
    name: 'Jan Pietersen',
    password: '1234',
    isAdmin: false,
    role: 'user',
    jobTitle: 'Technisch Medewerker',
    department: 'Technisch',
    phone: '06-87654321',
    hireDate: '2021-03-10T08:00:00.000Z',
    vacationDays: 24,
    vacationDaysUsed: 18,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
    notes: []
  },
  {
    id: 'emp-3',
    email: 'lisa@bedrijf.nl',
    name: 'Lisa de Vries',
    password: '1234',
    isAdmin: false,
    role: 'user',
    jobTitle: 'Administratief Medewerker',
    department: 'Administratie',
    phone: '06-11223344',
    hireDate: '2022-06-01T08:00:00.000Z',
    vacationDays: 23,
    vacationDaysUsed: 8,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
    notes: []
  },
  {
    id: 'emp-4',
    email: 'mark@bedrijf.nl',
    name: 'Mark Jansen',
    password: '1234',
    isAdmin: false,
    role: 'user',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    phone: '06-55667788',
    hireDate: '2023-09-15T08:00:00.000Z',
    vacationDays: 22,
    vacationDaysUsed: 5,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
    notes: [
      {
        id: 'note-2',
        employeeId: 'emp-4',
        type: 'milestone',
        content: 'Beste verkoper van Q1 2024',
        createdBy: 'emp-1',
        createdAt: '2024-04-01T10:00:00.000Z'
      }
    ]
  },
  {
    id: 'emp-5',
    email: 'emma@bedrijf.nl',
    name: 'Emma Bakker',
    password: '1234',
    isAdmin: false,
    role: 'user',
    jobTitle: 'Support Medewerker',
    department: 'Support',
    phone: '06-99887766',
    hireDate: '2024-11-01T08:00:00.000Z',
    vacationDays: 22,
    vacationDaysUsed: 0,
    createdAt: '2024-11-01T08:00:00.000Z',
    updatedAt: '2024-11-01T08:00:00.000Z',
    notes: [
      {
        id: 'note-3',
        employeeId: 'emp-5',
        type: 'general',
        content: 'Nieuwe medewerker - onboarding gepland voor week 1',
        createdBy: 'emp-1',
        createdAt: '2024-11-01T09:00:00.000Z'
      }
    ]
  }
];

export const HRMPage: React.FC = () => {
  const hrm = useHRM(demoEmployees);
  const [activeView, setActiveView] = useState<'all' | 'departments'>('all');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Personeelsbeheer</h1>
          <p className="text-gray-600">
            Beheer medewerkers, verlofdagen en notities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Totaal Medewerkers</p>
            <p className="text-3xl font-bold text-gray-900">
              {hrm.stats.totalEmployees}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {hrm.stats.byRole.admin} admin, {hrm.stats.byRole.user} gebruikers
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Nieuwe Medewerkers</p>
            <p className="text-3xl font-bold text-blue-600">
              {hrm.stats.newEmployees}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Laatste 3 maanden
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Verlofdagen Resterend</p>
            <p className="text-3xl font-bold text-green-600">
              {hrm.stats.totalVacationDaysRemaining}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Van {hrm.stats.totalVacationDays} totaal
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Met Waarschuwingen</p>
            <p className="text-3xl font-bold text-yellow-600">
              {hrm.stats.employeesWithWarnings}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Aandacht vereist
            </p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Gem. Dienstverband</p>
            <p className="text-2xl font-bold text-purple-600">
              {hrm.stats.averageYearsOfService.toFixed(1)} jaar
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Afdelingen</p>
            <p className="text-2xl font-bold text-indigo-600">
              {Object.keys(hrm.stats.byDepartment).length}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Weinig Verlofdagen</p>
            <p className="text-2xl font-bold text-red-600">
              {hrm.stats.employeesLowOnVacation}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Minder dan 20% over
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 Alle Medewerkers
            </button>
            <button
              onClick={() => setActiveView('departments')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'departments'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏢 Per Afdeling
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md ml-4">
            <input
              type="text"
              placeholder="Zoek medewerkers..."
              value={hrm.filters.search || ''}
              onChange={e =>
                hrm.setFilters({ ...hrm.filters, search: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Afdeling
              </label>
              <select
                value={hrm.filters.department || ''}
                onChange={e =>
                  hrm.setFilters({
                    ...hrm.filters,
                    department: e.target.value || undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle afdelingen</option>
                {Object.keys(hrm.stats.byDepartment).map(dept => (
                  <option key={dept} value={dept}>
                    {dept} ({hrm.stats.byDepartment[dept]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <select
                value={hrm.filters.role || ''}
                onChange={e =>
                  hrm.setFilters({
                    ...hrm.filters,
                    role: e.target.value as 'admin' | 'user' | undefined
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Alle rollen</option>
                <option value="admin">Admin</option>
                <option value="user">Gebruiker</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hrm.filters.showNewOnly || false}
                  onChange={e =>
                    hrm.setFilters({
                      ...hrm.filters,
                      showNewOnly: e.target.checked || undefined
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Alleen nieuwe medewerkers</span>
              </label>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={hrm.filters.showLowVacation || false}
                  onChange={e =>
                    hrm.setFilters({
                      ...hrm.filters,
                      showLowVacation: e.target.checked || undefined
                    })
                  }
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Weinig verlofdagen</span>
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeView === 'all' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hrm.filteredEmployees.map(employee => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onDelete={hrm.removeEmployee}
                />
              ))}
            </div>

            {hrm.filteredEmployees.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Geen medewerkers gevonden
              </div>
            )}
          </div>
        )}

        {activeView === 'departments' && (
          <div className="space-y-6">
            {Object.entries(hrm.groupedByDepartment).map(([department, employees]) => (
              <div key={department} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {department} ({employees.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employees.map(employee => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onDelete={hrm.removeEmployee}
                    />
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(hrm.groupedByDepartment).length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Geen afdelingen gevonden
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HRMPage;
