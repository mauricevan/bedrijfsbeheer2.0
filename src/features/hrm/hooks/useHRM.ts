/**
 * useHRM Hook
 * State management voor personeelsbeheer module
 */

import { useState, useMemo, useCallback } from 'react';
import type { Employee, EmployeeNote } from '../../../types';
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  addVacationDays,
  useVacationDays,
  resetVacationDaysUsed,
  setVacationDaysTotal,
  addNote,
  updateNote,
  deleteNote,
  updateEmployeeRole,
  updateEmployeeDepartment,
  batchUpdateVacationDays,
  resetAllVacationDaysUsed,
  calculateHRMStats
} from '../services/hrmService';
import {
  applyEmployeeFilters,
  filterNewEmployees,
  filterWithWarnings,
  filterLowVacationDays,
  type EmployeeFilters
} from '../utils/filters';
import { groupByDepartment, sortByName } from '../utils/helpers';

export interface UseHRMReturn {
  // State
  employees: Employee[];
  filteredEmployees: Employee[];
  newEmployees: Employee[];
  employeesWithWarnings: Employee[];
  employeesLowOnVacation: Employee[];
  groupedByDepartment: Record<string, Employee[]>;
  stats: ReturnType<typeof calculateHRMStats>;

  // Filter state
  filters: EmployeeFilters;
  setFilters: React.Dispatch<React.SetStateAction<EmployeeFilters>>;

  // Employee operations
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEmployeeData: (
    employeeId: string,
    updates: Partial<Employee>
  ) => void;
  removeEmployee: (employeeId: string) => void;

  // Vacation operations
  addVacationDaysData: (employeeId: string, additionalDays: number) => void;
  useVacationDaysData: (employeeId: string, daysUsed: number) => void;
  resetVacationDaysUsedData: (employeeId: string) => void;
  setVacationDaysTotalData: (employeeId: string, totalDays: number) => void;
  batchUpdateVacationDaysData: (
    updates: Array<{ employeeId: string; totalDays: number }>
  ) => void;
  resetAllVacationDaysUsedData: () => void;

  // Note operations
  addNoteData: (
    employeeId: string,
    note: Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>
  ) => void;
  updateNoteData: (
    employeeId: string,
    noteId: string,
    updates: Partial<Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>>
  ) => void;
  removeNote: (employeeId: string, noteId: string) => void;

  // Role & department operations
  updateRole: (employeeId: string, role: 'admin' | 'user') => void;
  updateDepartment: (employeeId: string, department: string) => void;
}

export const useHRM = (initialEmployees: Employee[]): UseHRMReturn => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [filters, setFilters] = useState<EmployeeFilters>({});

  // Filtered employees based on current filters
  const filteredEmployees = useMemo(() => {
    return applyEmployeeFilters(employees, filters);
  }, [employees, filters]);

  // New employees (less than 3 months)
  const newEmployees = useMemo(() => {
    return filterNewEmployees(employees);
  }, [employees]);

  // Employees with warnings
  const employeesWithWarnings = useMemo(() => {
    return filterWithWarnings(employees);
  }, [employees]);

  // Employees low on vacation days
  const employeesLowOnVacation = useMemo(() => {
    return filterLowVacationDays(employees);
  }, [employees]);

  // Group by department
  const groupedByDepartment = useMemo(() => {
    return groupByDepartment(sortByName(employees));
  }, [employees]);

  // Statistics
  const stats = useMemo(() => {
    return calculateHRMStats(employees);
  }, [employees]);

  // Add new employee
  const addEmployee = useCallback(
    (newEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
      const employee = createEmployee(newEmployee);
      setEmployees(prev => [...prev, employee]);
    },
    []
  );

  // Update existing employee
  const updateEmployeeData = useCallback(
    (employeeId: string, updates: Partial<Employee>) => {
      setEmployees(prev => updateEmployee(employeeId, updates, prev));
    },
    []
  );

  // Remove employee
  const removeEmployee = useCallback((employeeId: string) => {
    setEmployees(prev => deleteEmployee(employeeId, prev));
  }, []);

  // Add vacation days
  const addVacationDaysData = useCallback(
    (employeeId: string, additionalDays: number) => {
      setEmployees(prev => addVacationDays(employeeId, additionalDays, prev));
    },
    []
  );

  // Use vacation days
  const useVacationDaysData = useCallback((employeeId: string, daysUsed: number) => {
    setEmployees(prev => useVacationDays(employeeId, daysUsed, prev));
  }, []);

  // Reset vacation days used
  const resetVacationDaysUsedData = useCallback((employeeId: string) => {
    setEmployees(prev => resetVacationDaysUsed(employeeId, prev));
  }, []);

  // Set vacation days total
  const setVacationDaysTotalData = useCallback(
    (employeeId: string, totalDays: number) => {
      setEmployees(prev => setVacationDaysTotal(employeeId, totalDays, prev));
    },
    []
  );

  // Batch update vacation days
  const batchUpdateVacationDaysData = useCallback(
    (updates: Array<{ employeeId: string; totalDays: number }>) => {
      setEmployees(prev => batchUpdateVacationDays(updates, prev));
    },
    []
  );

  // Reset all vacation days used
  const resetAllVacationDaysUsedData = useCallback(() => {
    setEmployees(prev => resetAllVacationDaysUsed(prev));
  }, []);

  // Add note
  const addNoteData = useCallback(
    (
      employeeId: string,
      note: Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>
    ) => {
      setEmployees(prev => addNote(employeeId, note, prev));
    },
    []
  );

  // Update note
  const updateNoteData = useCallback(
    (
      employeeId: string,
      noteId: string,
      updates: Partial<Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>>
    ) => {
      setEmployees(prev => updateNote(employeeId, noteId, updates, prev));
    },
    []
  );

  // Delete note
  const removeNote = useCallback((employeeId: string, noteId: string) => {
    setEmployees(prev => deleteNote(employeeId, noteId, prev));
  }, []);

  // Update role
  const updateRole = useCallback((employeeId: string, role: 'admin' | 'user') => {
    setEmployees(prev => updateEmployeeRole(employeeId, role, prev));
  }, []);

  // Update department
  const updateDepartment = useCallback((employeeId: string, department: string) => {
    setEmployees(prev => updateEmployeeDepartment(employeeId, department, prev));
  }, []);

  return {
    // State
    employees,
    filteredEmployees,
    newEmployees,
    employeesWithWarnings,
    employeesLowOnVacation,
    groupedByDepartment,
    stats,

    // Filter state
    filters,
    setFilters,

    // Employee operations
    addEmployee,
    updateEmployeeData,
    removeEmployee,

    // Vacation operations
    addVacationDaysData,
    useVacationDaysData,
    resetVacationDaysUsedData,
    setVacationDaysTotalData,
    batchUpdateVacationDaysData,
    resetAllVacationDaysUsedData,

    // Note operations
    addNoteData,
    updateNoteData,
    removeNote,

    // Role & department operations
    updateRole,
    updateDepartment
  };
};
