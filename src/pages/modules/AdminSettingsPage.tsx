/**
 * AdminSettingsPage - Admin Instellingen
 * Systeem configuratie en instellingen
 */

import React from 'react';
import type { User, ModuleSettings } from '../../types';

type AdminSettingsPageProps = {
  currentUser: User | null;
  moduleSettings: ModuleSettings[];
};

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
  currentUser,
  moduleSettings,
}) => {
  if (!currentUser?.isAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h2 className="text-xl font-bold text-red-900 mb-2">Geen Toegang</h2>
          <p className="text-red-700">Deze module is alleen toegankelijk voor administrators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">⚙️ Admin Instellingen</h1>
        <p className="text-gray-600">Systeem configuratie en module beheer</p>
      </div>

      {/* Module Settings */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Module Instellingen</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {moduleSettings.map((mod) => (
              <div
                key={mod.id}
                className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{mod.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{mod.displayName}</h3>
                    <p className="text-sm text-gray-600">{mod.moduleName}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    mod.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {mod.enabled ? 'Actief' : 'Uitgeschakeld'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Systeem Informatie</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Versie:</span>
            <span className="font-semibold">6.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Actieve Modules:</span>
            <span className="font-semibold">{moduleSettings.filter(m => m.enabled).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Database:</span>
            <span className="font-semibold">In-Memory</span>
          </div>
        </div>
      </div>
    </div>
  );
};
