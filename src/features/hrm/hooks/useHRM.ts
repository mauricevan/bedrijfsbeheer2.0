/**
 * useHRM Hook
 * Business logic voor medewerkers beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type { User, Employee, EmployeeNote } from '../../../types';

export const useHRM = (users: User[]) => {
  const [employees, setEmployees] = useState<Employee[]>(
    users.map((u) => ({ ...u, notes: [] }))
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    return {
      totalEmployees: employees.length,
      admins: employees.filter((e) => e.isAdmin).length,
      users: employees.filter((e) => !e.isAdmin).length,
    };
  }, [employees]);

  // ============================================================================
  // EMPLOYEE CRUD
  // ============================================================================

  const addEmployee = useCallback((employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmployee: Employee = {
      ...employee,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
    };
    setEmployees((prev) => [...prev, newEmployee]);
    return newEmployee;
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ============================================================================
  // NOTES CRUD
  // ============================================================================

  const addNote = useCallback((employeeId: string, note: Omit<EmployeeNote, 'id' | 'createdAt'>) => {
    const newNote: EmployeeNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, notes: [...(e.notes || []), newNote], updatedAt: new Date().toISOString() }
          : e
      )
    );

    return newNote;
  }, []);

  const deleteNote = useCallback((employeeId: string, noteId: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              notes: (e.notes || []).filter((n) => n.id !== noteId),
              updatedAt: new Date().toISOString(),
            }
          : e
      )
    );
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    employees,
    stats,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addNote,
    deleteNote,
  };
};
