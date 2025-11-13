/**
 * HRMPage - Human Resource Management
 * Personeelsbeheer, medewerkers en verlof
 */

import React, { useMemo } from 'react';
import type { User } from '../../types';

type HRMPageProps = {
  currentUser: User | null;
  users: User[];
};

export const HRMPage: React.FC<HRMPageProps> = ({ currentUser, users }) => {
  const stats = useMemo(() => ({
    totalEmployees: users.length,
    admins: users.filter(u => u.isAdmin).length,
    regularUsers: users.filter(u => !u.isAdmin).length,
  }), [users]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">HRM - Personeelsbeheer</h1>
        <p className="text-gray-600">Beheer medewerkers en personeel</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Totaal Medewerkers</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Administrators</div>
          <div className="text-2xl font-bold text-blue-600">{stats.admins}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Medewerkers</div>
          <div className="text-2xl font-bold text-green-600">{stats.regularUsers}</div>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Medewerkers</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="p-4 border-2 border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
