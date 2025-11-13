/**
 * HRMPage
 * Personeelsbeheer (Admin only)
 */

import React, { useState } from 'react';
import type { User } from '../../types';
import { useHRM } from '../../features/hrm';

type HRMPageProps = {
  currentUser: User;
  users: User[];
};

export const HRMPage: React.FC<HRMPageProps> = ({ currentUser: _currentUser, users }) => {
  const { employees, stats, addNote } = useHRM(users);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteType, setNewNoteType] = useState<'general' | 'milestone' | 'warning' | 'late'>('general');

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const handleAddNote = () => {
    if (!selectedEmployeeId || !newNoteContent.trim()) return;

    addNote(selectedEmployeeId, {
      employeeId: selectedEmployeeId,
      type: newNoteType,
      content: newNoteContent.trim(),
      createdBy: _currentUser.id,
    });

    setNewNoteContent('');
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'milestone': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'late': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getNoteTypeLabel = (type: string) => {
    switch (type) {
      case 'milestone': return '🎯 Milestone';
      case 'warning': return '⚠️ Waarschuwing';
      case 'late': return '⏰ Te Laat';
      default: return '📝 Notitie';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Personeelsbeheer</h1>
        <p className="text-gray-600 mt-2">Medewerkers en persoonlijke dossiers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Totaal Medewerkers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Administrators</p>
          <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Medewerkers</p>
          <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employees List */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Medewerkers</h2>
          </div>
          <div className="p-4 space-y-2">
            {employees.map((employee) => (
              <button
                key={employee.id}
                onClick={() => setSelectedEmployeeId(employee.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition ${
                  selectedEmployeeId === employee.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-xs text-gray-600">{employee.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    employee.isAdmin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.isAdmin ? 'Admin' : 'User'}
                  </span>
                  {employee.notes && employee.notes.length > 0 && (
                    <span className="text-xs text-gray-600">
                      📝 {employee.notes.length} notities
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Employee Details & Notes */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          {selectedEmployee ? (
            <>
              {/* Employee Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                    <p className="text-gray-600 mt-1">{selectedEmployee.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    selectedEmployee.isAdmin
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedEmployee.isAdmin ? 'Administrator' : 'Medewerker'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedEmployee.jobTitle && (
                    <div>
                      <p className="text-gray-600">Functie</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.jobTitle}</p>
                    </div>
                  )}
                  {selectedEmployee.department && (
                    <div>
                      <p className="text-gray-600">Afdeling</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.department}</p>
                    </div>
                  )}
                  {selectedEmployee.phone && (
                    <div>
                      <p className="text-gray-600">Telefoon</p>
                      <p className="font-medium text-gray-900">{selectedEmployee.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">In dienst sinds</p>
                    <p className="font-medium text-gray-900">
                      {new Date(selectedEmployee.createdAt).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Note Section */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Notitie Toevoegen</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <select
                      value={newNoteType}
                      onChange={(e) => setNewNoteType(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="general">📝 Algemeen</option>
                      <option value="milestone">🎯 Milestone</option>
                      <option value="warning">⚠️ Waarschuwing</option>
                      <option value="late">⏰ Te Laat</option>
                    </select>
                  </div>
                  <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Voer notitie in..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Notitie Toevoegen
                  </button>
                </div>
              </div>

              {/* Notes List */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Notities ({selectedEmployee.notes?.length || 0})
                </h3>
                {!selectedEmployee.notes || selectedEmployee.notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nog geen notities</p>
                ) : (
                  <div className="space-y-3">
                    {selectedEmployee.notes
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((note) => (
                        <div
                          key={note.id}
                          className={`p-4 rounded-lg border-l-4 ${getNoteTypeColor(note.type)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-medium">
                              {getNoteTypeLabel(note.type)}
                            </span>
                            <span className="text-xs text-gray-600">
                              {new Date(note.createdAt).toLocaleDateString('nl-NL')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{note.content}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">Selecteer een medewerker om details te zien</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
