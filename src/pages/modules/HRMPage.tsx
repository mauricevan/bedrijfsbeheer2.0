/**
 * HRMPage - Human Resource Management (Personeelsbeheer)
 * Features: Employee management, Leave tracking, Notes system, Personal files
 * Version: MVP 1.0
 */

import React, { useState, useMemo } from 'react';
import type { User } from '../../types';

export interface EmployeeNote {
  id: string;
  employeeId: string;
  type: 'late' | 'absent' | 'milestone' | 'performance' | 'warning' | 'compliment' | 'attendance' | 'general';
  title: string;
  description: string;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface Employee extends User {
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  phone?: string;
  vacationDays?: number;
  vacationDaysUsed?: number;
  notes?: EmployeeNote[];
  status?: 'available' | 'unavailable' | 'vacation';
}

interface HRMPageProps {
  currentUser: User | null;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

export const HRMPage: React.FC<HRMPageProps> = ({
  currentUser,
  employees,
  setEmployees,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const [employeeFormData, setEmployeeFormData] = useState({
    name: '',
    email: '',
    password: '',
    jobTitle: '',
    department: '',
    phone: '',
    hireDate: new Date().toISOString().split('T')[0],
    vacationDays: 25,
    isAdmin: false,
  });

  const [noteFormData, setNoteFormData] = useState({
    type: 'general' as EmployeeNote['type'],
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  const statistics = useMemo(() => {
    const totalEmployees = employees.length;
    const uniqueJobTitles = new Set(employees.map(e => e.jobTitle).filter(Boolean)).size;
    
    const totalServiceYears = employees.reduce((sum, emp) => {
      if (emp.hireDate) {
        const years = (new Date().getTime() - new Date(emp.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
        return sum + years;
      }
      return sum;
    }, 0);
    
    const avgServiceYears = totalEmployees > 0 ? totalServiceYears / totalEmployees : 0;

    const admins = employees.filter(e => e.isAdmin).length;
    const available = employees.filter(e => e.status === 'available' || !e.status).length;
    const onVacation = employees.filter(e => e.status === 'vacation').length;

    return {
      totalEmployees,
      uniqueJobTitles,
      avgServiceYears: avgServiceYears.toFixed(1),
      admins,
      available,
      onVacation,
    };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const searchLower = searchTerm.toLowerCase();
      return (
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        (emp.jobTitle && emp.jobTitle.toLowerCase().includes(searchLower))
      );
    });
  }, [employees, searchTerm]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      name: '',
      email: '',
      password: '',
      jobTitle: '',
      department: '',
      phone: '',
      hireDate: new Date().toISOString().split('T')[0],
      vacationDays: 25,
      isAdmin: false,
    });
    setShowEmployeeForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Don't pre-fill password
      jobTitle: employee.jobTitle || '',
      department: employee.department || '',
      phone: employee.phone || '',
      hireDate: employee.hireDate || new Date().toISOString().split('T')[0],
      vacationDays: employee.vacationDays || 25,
      isAdmin: employee.isAdmin,
    });
    setShowEmployeeForm(true);
  };

  const handleSaveEmployee = () => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen medewerkers beheren');
      return;
    }

    if (!employeeFormData.name || !employeeFormData.email) {
      alert('Naam en email zijn verplicht');
      return;
    }

    if (!editingEmployee && !employeeFormData.password) {
      alert('Wachtwoord is verplicht voor nieuwe medewerkers');
      return;
    }

    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp =>
        emp.id === editingEmployee.id
          ? {
              ...emp,
              name: employeeFormData.name,
              email: employeeFormData.email,
              ...(employeeFormData.password && { password: employeeFormData.password }), // Only update if provided
              jobTitle: employeeFormData.jobTitle,
              department: employeeFormData.department,
              phone: employeeFormData.phone,
              hireDate: employeeFormData.hireDate,
              vacationDays: employeeFormData.vacationDays,
              isAdmin: employeeFormData.isAdmin,
              role: employeeFormData.isAdmin ? 'admin' : 'user',
              updatedAt: new Date().toISOString(),
            }
          : emp
      ));
    } else {
      // Create new employee
      const newEmployee: Employee = {
        id: `user-${Date.now()}`,
        name: employeeFormData.name,
        email: employeeFormData.email,
        password: employeeFormData.password,
        isAdmin: employeeFormData.isAdmin,
        role: employeeFormData.isAdmin ? 'admin' : 'user',
        jobTitle: employeeFormData.jobTitle,
        department: employeeFormData.department,
        phone: employeeFormData.phone,
        hireDate: employeeFormData.hireDate,
        vacationDays: employeeFormData.vacationDays,
        vacationDaysUsed: 0,
        notes: [],
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEmployees(prev => [...prev, newEmployee]);
    }

    setShowEmployeeForm(false);
    setEditingEmployee(null);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!currentUser?.isAdmin) {
      alert('Alleen admins kunnen medewerkers verwijderen');
      return;
    }

    if (employeeId === currentUser.id) {
      alert('Je kunt jezelf niet verwijderen');
      return;
    }

    if (!confirm('Weet je zeker dat je deze medewerker wilt verwijderen?')) {
      return;
    }

    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleAddNote = () => {
    if (!selectedEmployee) return;

    if (!noteFormData.title) {
      alert('Titel is verplicht');
      return;
    }

    const newNote: EmployeeNote = {
      id: `note-${Date.now()}`,
      employeeId: selectedEmployee.id,
      type: noteFormData.type,
      title: noteFormData.title,
      description: noteFormData.description,
      date: noteFormData.date,
      createdBy: currentUser!.id,
      createdAt: new Date().toISOString(),
    };

    setEmployees(prev => prev.map(emp =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            notes: [...(emp.notes || []), newNote],
            updatedAt: new Date().toISOString(),
          }
        : emp
    ));

    // Update selected employee
    setSelectedEmployee(prev => prev ? {
      ...prev,
      notes: [...(prev.notes || []), newNote],
    } : null);

    setShowNoteForm(false);
    setNoteFormData({
      type: 'general',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!selectedEmployee) return;

    if (!confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) {
      return;
    }

    setEmployees(prev => prev.map(emp =>
      emp.id === selectedEmployee.id
        ? {
            ...emp,
            notes: emp.notes?.filter(n => n.id !== noteId) || [],
            updatedAt: new Date().toISOString(),
          }
        : emp
    ));

    // Update selected employee
    setSelectedEmployee(prev => prev ? {
      ...prev,
      notes: prev.notes?.filter(n => n.id !== noteId) || [],
    } : null);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getServiceYears = (hireDate?: string) => {
    if (!hireDate) return 0;
    const years = (new Date().getTime() - new Date(hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years * 10) / 10; // Round to 1 decimal
  };

  const getNoteIcon = (type: EmployeeNote['type']) => {
    const icons = {
      late: '⏰',
      absent: '❌',
      milestone: '🎯',
      performance: '📊',
      warning: '⚠️',
      compliment: '⭐',
      attendance: '✅',
      general: '📝',
    };
    return icons[type];
  };

  const getNoteTypeLabel = (type: EmployeeNote['type']) => {
    const labels = {
      late: 'Te laat',
      absent: 'Afwezig',
      milestone: 'Mijlpaal',
      performance: 'Prestatie',
      warning: 'Waarschuwing',
      compliment: 'Compliment',
      attendance: 'Aanwezigheid',
      general: 'Algemeen',
    };
    return labels[type];
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'available') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Beschikbaar</span>;
    }
    if (status === 'vacation') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Met verlof</span>;
    }
    if (status === 'unavailable') {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Niet beschikbaar</span>;
    }
    return null;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentUser) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Gelieve in te loggen om deze module te gebruiken.</p>
      </div>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">Deze module is alleen toegankelijk voor administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">👤 HRM - Personeelsbeheer</h1>
        <p className="text-gray-600 mt-1">Beheer medewerkers, verlof en persoonlijke dossiers</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Totaal Medewerkers</div>
          <div className="text-3xl font-bold text-gray-900">{statistics.totalEmployees}</div>
          <div className="text-sm text-gray-500 mt-1">{statistics.admins} admins</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Beschikbaar</div>
          <div className="text-3xl font-bold text-green-600">{statistics.available}</div>
          <div className="text-sm text-gray-500 mt-1">Momenteel actief</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Met Verlof</div>
          <div className="text-3xl font-bold text-blue-600">{statistics.onVacation}</div>
          <div className="text-sm text-gray-500 mt-1">Afwezig</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-1">Gem. Diensttijd</div>
          <div className="text-3xl font-bold text-purple-600">{statistics.avgServiceYears}</div>
          <div className="text-sm text-gray-500 mt-1">jaren</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <input
          type="text"
          placeholder="Zoek medewerkers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleCreateEmployee}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Nieuwe Medewerker
        </button>
      </div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Geen medewerkers gevonden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map(employee => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedEmployee(employee)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                    {employee.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      {employee.isAdmin && <span className="text-lg">👑</span>}
                    </div>
                    {employee.jobTitle && (
                      <p className="text-sm text-gray-600">{employee.jobTitle}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center text-gray-600">
                  <span className="w-5">📧</span>
                  <span className="ml-2">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-5">📞</span>
                    <span className="ml-2">{employee.phone}</span>
                  </div>
                )}
                {employee.hireDate && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-5">📅</span>
                    <span className="ml-2">
                      {getServiceYears(employee.hireDate)} jaar in dienst
                    </span>
                  </div>
                )}
              </div>

              {/* Vacation Info */}
              {employee.vacationDays !== undefined && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Verlofdagen:</span>
                    <span className="font-semibold">
                      {(employee.vacationDays || 0) - (employee.vacationDaysUsed || 0)} / {employee.vacationDays}
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${((employee.vacationDays || 0) - (employee.vacationDaysUsed || 0)) / (employee.vacationDays || 1) * 100}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="mb-4">
                {getStatusBadge(employee.status)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEmployee(employee);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Bewerken
                </button>
                {employee.id !== currentUser.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEmployee(employee.id);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Verwijderen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee Form Modal */}
      {showEmployeeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingEmployee ? 'Medewerker Bewerken' : 'Nieuwe Medewerker'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naam *
                  </label>
                  <input
                    type="text"
                    value={employeeFormData.name}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord {!editingEmployee && '*'}
                  {editingEmployee && <span className="text-xs text-gray-500"> (laat leeg om ongewijzigd te laten)</span>}
                </label>
                <input
                  type="password"
                  value={employeeFormData.password}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, password: e.target.value})}
                  placeholder={editingEmployee ? 'Laat leeg voor geen wijziging' : 'Wachtwoord'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Functie
                  </label>
                  <input
                    type="text"
                    value={employeeFormData.jobTitle}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, jobTitle: e.target.value})}
                    placeholder="Bijv. Monteur, Manager"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Afdeling
                  </label>
                  <input
                    type="text"
                    value={employeeFormData.department}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, department: e.target.value})}
                    placeholder="Bijv. Productie, Verkoop"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefoon
                  </label>
                  <input
                    type="tel"
                    value={employeeFormData.phone}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Startdatum
                  </label>
                  <input
                    type="date"
                    value={employeeFormData.hireDate}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, hireDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verlofdagen per jaar
                </label>
                <input
                  type="number"
                  value={employeeFormData.vacationDays}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, vacationDays: parseInt(e.target.value) || 25})}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={employeeFormData.isAdmin}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, isAdmin: e.target.checked})}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <span>Admin rechten toekennen</span>
                  <span className="text-lg">👑</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Detail Modal (Personal File) */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  {selectedEmployee.isAdmin && <span className="text-2xl">👑</span>}
                </div>
                {selectedEmployee.jobTitle && (
                  <p className="text-gray-600">{selectedEmployee.jobTitle}</p>
                )}
                {selectedEmployee.department && (
                  <p className="text-sm text-gray-500">{selectedEmployee.department}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Employee Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Contact & Dienst Informatie</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div>
                    <span className="text-gray-600">In dienst sinds:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedEmployee.hireDate).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Diensttijd:</span>
                  <span className="ml-2 font-medium">{getServiceYears(selectedEmployee.hireDate)} jaar</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2">{getStatusBadge(selectedEmployee.status)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Account type:</span>
                  <span className="ml-2 font-medium">{selectedEmployee.isAdmin ? 'Administrator' : 'Medewerker'}</span>
                </div>
              </div>
            </div>

            {/* Vacation Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Verlof Informatie</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Resterende verlofdagen:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(selectedEmployee.vacationDays || 0) - (selectedEmployee.vacationDaysUsed || 0)}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{
                    width: `${((selectedEmployee.vacationDays || 0) - (selectedEmployee.vacationDaysUsed || 0)) / (selectedEmployee.vacationDays || 1) * 100}%`
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Gebruikt: {selectedEmployee.vacationDaysUsed || 0} dagen</span>
                <span>Totaal: {selectedEmployee.vacationDays || 0} dagen</span>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Notities ({selectedEmployee.notes?.length || 0})</h3>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  + Notitie Toevoegen
                </button>
              </div>

              {selectedEmployee.notes && selectedEmployee.notes.length > 0 ? (
                <div className="space-y-3">
                  {selectedEmployee.notes
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(note => (
                      <div key={note.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{getNoteIcon(note.type)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{note.title}</h4>
                              <span className="text-xs text-gray-500">
                                {getNoteTypeLabel(note.type)} • {new Date(note.date).toLocaleDateString('nl-NL')}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Verwijderen
                          </button>
                        </div>
                        {note.description && (
                          <p className="text-sm text-gray-700 mt-2">{note.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">Geen notities gevonden</p>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  handleEditEmployee(selectedEmployee);
                  setSelectedEmployee(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Bewerken
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Form Modal */}
      {showNoteForm && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-4">Nieuwe Notitie</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  value={noteFormData.type}
                  onChange={(e) => setNoteFormData({...noteFormData, type: e.target.value as EmployeeNote['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">📝 Algemeen</option>
                  <option value="late">⏰ Te laat</option>
                  <option value="absent">❌ Afwezig</option>
                  <option value="milestone">🎯 Mijlpaal</option>
                  <option value="performance">📊 Prestatie</option>
                  <option value="warning">⚠️ Waarschuwing</option>
                  <option value="compliment">⭐ Compliment</option>
                  <option value="attendance">✅ Aanwezigheid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel *
                </label>
                <input
                  type="text"
                  value={noteFormData.title}
                  onChange={(e) => setNoteFormData({...noteFormData, title: e.target.value})}
                  placeholder="Korte beschrijving"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  value={noteFormData.date}
                  onChange={(e) => setNoteFormData({...noteFormData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <textarea
                  value={noteFormData.description}
                  onChange={(e) => setNoteFormData({...noteFormData, description: e.target.value})}
                  rows={4}
                  placeholder="Uitgebreide beschrijving (optioneel)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteFormData({
                    type: 'general',
                    title: '',
                    description: '',
                    date: new Date().toISOString().split('T')[0],
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Toevoegen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
