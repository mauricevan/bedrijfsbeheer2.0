/**
 * HRMPage - Human Resource Management
 * Volledig personeelsbeheer met medewerkers en notities systeem
 */

import React, { useState } from 'react';
import type { User, Employee, EmployeeNote, EmployeeAvailability, EmployeeNoteType } from '../../types';
import { useEmployees, useEmployeeNotes } from '../../features/hrm';

type HRMPageProps = {
  currentUser: User;
  users: User[];
};

export const HRMPage: React.FC<HRMPageProps> = ({ currentUser, users }) => {
  // Convert users to employees (Employee extends User)
  const employees = users as Employee[];

  const {
    enrichedEmployees,
    filteredEmployees,
    stats,
    searchTerm,
    filterAvailability,
    handleSearch,
    clearSearch,
    setAvailabilityFilter,
    setAvailability,
    calculateTenure,
    calculateAvailableVacation,
  } = useEmployees(employees);

  // State for employee dossier modal
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState<{
    type: EmployeeNoteType;
    date: string;
    title: string;
    description: string;
  }>({
    type: 'general',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
  });

  const isAdmin = currentUser.isAdmin;

  // Notes hook (only initialized when employee is selected)
  const notesHook = selectedEmployee
    ? useEmployeeNotes(selectedEmployee.notes || [], selectedEmployee.id)
    : null;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getAvailabilityBadge = (availability?: EmployeeAvailability) => {
    const statusConfig: Record<EmployeeAvailability, { label: string; class: string }> = {
      available: { label: 'Beschikbaar', class: 'bg-green-100 text-green-800' },
      unavailable: { label: 'Niet beschikbaar', class: 'bg-yellow-100 text-yellow-800' },
      vacation: { label: 'Met verlof', class: 'bg-blue-100 text-blue-800' },
    };

    const status = availability || 'available';
    const config = statusConfig[status];

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const handleAddNote = () => {
    if (!selectedEmployee || !notesHook || !isAdmin) return;

    if (!noteForm.title.trim()) {
      alert('Titel is verplicht');
      return;
    }

    notesHook.addNote({
      type: noteForm.type,
      date: noteForm.date,
      title: noteForm.title,
      description: noteForm.description,
      createdBy: currentUser.id,
    });

    // Reset form
    setNoteForm({
      type: 'general',
      date: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
    });
    setShowAddNoteModal(false);
  };

  const handleDeleteNote = (noteId: string) => {
    if (!notesHook || !isAdmin) return;

    const confirmed = window.confirm('Weet je zeker dat je deze notitie wilt verwijderen?');
    if (confirmed) {
      notesHook.deleteNote(noteId);
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👥 HRM - Personeelsbeheer</h1>
        <p className="text-gray-600 mt-2">Beheer medewerkers, verlof en notities</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Totaal Medewerkers</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500">{stats.roles} verschillende functies</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Gem. Diensttijd</div>
          <div className="text-2xl font-bold text-blue-600">{stats.avgTenure} jaar</div>
          <div className="text-xs text-gray-500">Gemiddelde</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Beschikbaar</div>
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-xs text-gray-500">Actief werkzaam</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Met Verlof</div>
          <div className="text-2xl font-bold text-orange-600">{stats.onVacation}</div>
          <div className="text-xs text-gray-500">{stats.unavailable} niet beschikbaar</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Zoek medewerkers (naam, email, functie)..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterAvailability}
            onChange={(e) => setAvailabilityFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">Alle statussen</option>
            <option value="available">Beschikbaar</option>
            <option value="unavailable">Niet beschikbaar</option>
            <option value="vacation">Met verlof</option>
          </select>

          {searchTerm && (
            <button
              onClick={clearSearch}
              className="px-3 py-2 text-gray-600 hover:text-gray-900"
            >
              ✗ Clear
            </button>
          )}

          {isAdmin && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              + Nieuwe Medewerker
            </button>
          )}
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => {
          const enriched = enrichedEmployees.find((e) => e.id === employee.id);
          const tenure = enriched?.tenure || 0;
          const availableVacation = enriched?.availableVacation || 0;

          return (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow p-4 border-2 border-gray-200 hover:border-blue-300 transition cursor-pointer"
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    {employee.name}
                    {employee.isAdmin && <span className="ml-2">👑</span>}
                  </h3>
                  <p className="text-sm text-gray-600">{employee.jobTitle || employee.role}</p>
                </div>
                {getAvailabilityBadge(employee.availability)}
              </div>

              <div className="space-y-1 text-sm mb-3">
                <p className="text-gray-600 truncate">📧 {employee.email}</p>
                {employee.phone && <p className="text-gray-600 truncate">📞 {employee.phone}</p>}
                {employee.hireDate && (
                  <p className="text-gray-600">📅 {tenure} jaar in dienst</p>
                )}
              </div>

              {employee.vacationDays !== undefined && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Verlof:</span>
                    <span className="font-medium">
                      {availableVacation} / {employee.vacationDays} dagen
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (availableVacation / (employee.vacationDays || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {(employee.notes?.length || 0) > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  {employee.notes!.length} notitie(s)
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-600">
            {searchTerm ? 'Geen medewerkers gevonden' : 'Nog geen medewerkers aangemaakt'}
          </p>
        </div>
      )}

      {/* Employee Dossier Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  {selectedEmployee.name}
                  {selectedEmployee.isAdmin && <span className="ml-2">👑</span>}
                </h2>
                <p className="text-gray-600">{selectedEmployee.jobTitle || selectedEmployee.role}</p>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-3">Persoonlijke Gegevens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium">{selectedEmployee.email}</span>
                  </div>
                  {selectedEmployee.phone && (
                    <div>
                      <span className="text-gray-600">Telefoon:</span>
                      <span className="ml-2 font-medium">{selectedEmployee.phone}</span>
                    </div>
                  )}
                  {selectedEmployee.hireDate && (
                    <>
                      <div>
                        <span className="text-gray-600">In dienst sinds:</span>
                        <span className="ml-2 font-medium">
                          {new Date(selectedEmployee.hireDate).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Diensttijd:</span>
                        <span className="ml-2 font-medium">{calculateTenure(selectedEmployee.hireDate)} jaar</span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2">{getAvailabilityBadge(selectedEmployee.availability)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rol:</span>
                    <span className={`ml-2 font-medium ${selectedEmployee.isAdmin ? 'text-blue-600' : 'text-gray-900'}`}>
                      {selectedEmployee.isAdmin ? 'Administrator' : 'Medewerker'}
                    </span>
                  </div>
                </div>

                {/* Vacation */}
                {selectedEmployee.vacationDays !== undefined && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-2">Verlof</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Totaal dagen:</span>
                        <span className="font-medium">{selectedEmployee.vacationDays} dagen</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Gebruikt:</span>
                        <span className="font-medium">{selectedEmployee.vacationDaysUsed || 0} dagen</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Beschikbaar:</span>
                        <span className="font-bold text-blue-600">
                          {calculateAvailableVacation(selectedEmployee)} dagen
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (calculateAvailableVacation(selectedEmployee) / (selectedEmployee.vacationDays || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Notities ({notesHook?.notes.length || 0})</h3>
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddNoteModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                    >
                      + Notitie Toevoegen
                    </button>
                  )}
                </div>

                {/* Add Note Form */}
                {showAddNoteModal && isAdmin && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold mb-3">Nieuwe Notitie</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={noteForm.type}
                            onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value as EmployeeNoteType })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="general">📝 Algemeen</option>
                            <option value="late">⏰ Te laat</option>
                            <option value="absent">❌ Afwezig</option>
                            <option value="milestone">🎯 Milestone</option>
                            <option value="performance">📊 Prestatie</option>
                            <option value="warning">⚠️ Waarschuwing</option>
                            <option value="compliment">⭐ Compliment</option>
                            <option value="attendance">✅ Aanwezigheid</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Datum</label>
                          <input
                            type="date"
                            value={noteForm.date}
                            onChange={(e) => setNoteForm({ ...noteForm, date: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Titel</label>
                        <input
                          type="text"
                          value={noteForm.title}
                          onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                          placeholder="Korte samenvatting..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Beschrijving</label>
                        <textarea
                          value={noteForm.description}
                          onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                          placeholder="Uitgebreide details..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleAddNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          Opslaan
                        </button>
                        <button
                          onClick={() => setShowAddNoteModal(false)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                        >
                          Annuleer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes List */}
                <div className="space-y-3">
                  {notesHook && notesHook.notes.length > 0 ? (
                    notesHook.notes.map((note) => (
                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{notesHook.getNoteIcon(note.type)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{note.title}</h4>
                              <p className="text-xs text-gray-500">
                                {notesHook.getNoteLabel(note.type)} •{' '}
                                {new Date(note.date).toLocaleDateString('nl-NL')}
                              </p>
                            </div>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Verwijder
                            </button>
                          )}
                        </div>
                        {note.description && (
                          <p className="text-sm text-gray-700 mt-2">{note.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Toegevoegd op {new Date(note.createdAt).toLocaleString('nl-NL')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-3xl mb-2 block">📝</span>
                      <p className="text-sm">Nog geen notities toegevoegd</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
