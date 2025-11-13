/**
 * HRM Service
 * Pure functions voor personeelsbeheer CRUD operaties en business logic
 */

import type { Employee, EmployeeNote } from '../../../types';

/**
 * Create a new employee
 */
export const createEmployee = (
  newEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
): Employee => {
  const now = new Date().toISOString();

  return {
    ...newEmployee,
    id: `emp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    notes: []
  };
};

/**
 * Update an existing employee
 */
export const updateEmployee = (
  employeeId: string,
  updates: Partial<Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>>,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Delete an employee
 */
export const deleteEmployee = (
  employeeId: string,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.filter(emp => emp.id !== employeeId);
};

/**
 * Add vacation days
 */
export const addVacationDays = (
  employeeId: string,
  additionalDays: number,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        vacationDays: (emp.vacationDays || 0) + additionalDays,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Use vacation days
 */
export const useVacationDays = (
  employeeId: string,
  daysUsed: number,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      const currentUsed = emp.vacationDaysUsed || 0;
      const total = emp.vacationDays || 0;
      const newUsed = Math.min(currentUsed + daysUsed, total); // Can't use more than available

      return {
        ...emp,
        vacationDaysUsed: newUsed,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Reset vacation days used (for new year)
 */
export const resetVacationDaysUsed = (
  employeeId: string,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        vacationDaysUsed: 0,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Set vacation days total
 */
export const setVacationDaysTotal = (
  employeeId: string,
  totalDays: number,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        vacationDays: totalDays,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Add note to employee
 */
export const addNote = (
  employeeId: string,
  note: Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>,
  existingEmployees: Employee[]
): Employee[] => {
  const now = new Date().toISOString();

  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      const newNote: EmployeeNote = {
        ...note,
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: employeeId,
        createdAt: now
      };

      return {
        ...emp,
        notes: [...(emp.notes || []), newNote],
        updatedAt: now
      };
    }
    return emp;
  });
};

/**
 * Update note
 */
export const updateNote = (
  employeeId: string,
  noteId: string,
  updates: Partial<Omit<EmployeeNote, 'id' | 'employeeId' | 'createdAt'>>,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        notes: emp.notes?.map(note =>
          note.id === noteId ? { ...note, ...updates } : note
        ),
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Delete note
 */
export const deleteNote = (
  employeeId: string,
  noteId: string,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        notes: emp.notes?.filter(note => note.id !== noteId),
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Update employee role (admin/user)
 */
export const updateEmployeeRole = (
  employeeId: string,
  role: 'admin' | 'user',
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        role,
        isAdmin: role === 'admin',
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Update employee department
 */
export const updateEmployeeDepartment = (
  employeeId: string,
  department: string,
  existingEmployees: Employee[]
): Employee[] => {
  return existingEmployees.map(emp => {
    if (emp.id === employeeId) {
      return {
        ...emp,
        department,
        updatedAt: new Date().toISOString()
      };
    }
    return emp;
  });
};

/**
 * Batch update vacation days for multiple employees
 */
export const batchUpdateVacationDays = (
  updates: Array<{ employeeId: string; totalDays: number }>,
  existingEmployees: Employee[]
): Employee[] => {
  const updatesMap = new Map(updates.map(u => [u.employeeId, u.totalDays]));
  const now = new Date().toISOString();

  return existingEmployees.map(emp => {
    if (updatesMap.has(emp.id)) {
      return {
        ...emp,
        vacationDays: updatesMap.get(emp.id)!,
        updatedAt: now
      };
    }
    return emp;
  });
};

/**
 * Reset all vacation days used (for new year)
 */
export const resetAllVacationDaysUsed = (
  existingEmployees: Employee[]
): Employee[] => {
  const now = new Date().toISOString();

  return existingEmployees.map(emp => ({
    ...emp,
    vacationDaysUsed: 0,
    updatedAt: now
  }));
};

/**
 * Calculate HRM statistics
 */
export interface HRMStats {
  totalEmployees: number;
  byDepartment: Record<string, number>;
  byRole: Record<'admin' | 'user', number>;
  newEmployees: number; // Hired in last 3 months
  totalVacationDays: number;
  totalVacationDaysUsed: number;
  totalVacationDaysRemaining: number;
  employeesWithWarnings: number;
  employeesLowOnVacation: number;
  averageYearsOfService: number;
}

export const calculateHRMStats = (employees: Employee[]): HRMStats => {
  const stats: HRMStats = {
    totalEmployees: employees.length,
    byDepartment: {},
    byRole: { admin: 0, user: 0 },
    newEmployees: 0,
    totalVacationDays: 0,
    totalVacationDaysUsed: 0,
    totalVacationDaysRemaining: 0,
    employeesWithWarnings: 0,
    employeesLowOnVacation: 0,
    averageYearsOfService: 0
  };

  if (employees.length === 0) return stats;

  let totalMonthsOfService = 0;
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  employees.forEach(emp => {
    // Count by department
    const dept = emp.department || 'Geen afdeling';
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

    // Count by role
    stats.byRole[emp.role]++;

    // Count new employees (hired in last 3 months)
    if (emp.hireDate && new Date(emp.hireDate) >= threeMonthsAgo) {
      stats.newEmployees++;
    }

    // Sum vacation days
    stats.totalVacationDays += emp.vacationDays || 0;
    stats.totalVacationDaysUsed += emp.vacationDaysUsed || 0;

    // Check low vacation days
    const total = emp.vacationDays || 0;
    const used = emp.vacationDaysUsed || 0;
    const remaining = total - used;
    if (total > 0 && remaining < total * 0.2) {
      stats.employeesLowOnVacation++;
    }

    // Check warnings
    if (emp.notes && emp.notes.some(note => note.type === 'warning' || note.type === 'late')) {
      stats.employeesWithWarnings++;
    }

    // Calculate service time
    if (emp.hireDate) {
      const hire = new Date(emp.hireDate);
      const years = now.getFullYear() - hire.getFullYear();
      const months = now.getMonth() - hire.getMonth();
      totalMonthsOfService += years * 12 + months;
    }
  });

  stats.totalVacationDaysRemaining = stats.totalVacationDays - stats.totalVacationDaysUsed;

  // Calculate average years of service
  if (employees.length > 0) {
    stats.averageYearsOfService = totalMonthsOfService / employees.length / 12;
  }

  return stats;
};
