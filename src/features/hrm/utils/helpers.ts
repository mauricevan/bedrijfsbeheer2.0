/**
 * HRM Helpers
 * Helper functies voor personeelsbeheer module
 */

import type { Employee, EmployeeNote } from '../../../types';

/**
 * Get employee initials
 */
export const getEmployeeInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Get department color
 */
export const getDepartmentColor = (department?: string): string => {
  if (!department) return 'gray';

  const colors: Record<string, string> = {
    'technisch': 'blue',
    'administratie': 'purple',
    'sales': 'green',
    'management': 'red',
    'hr': 'yellow',
    'support': 'indigo'
  };

  return colors[department.toLowerCase()] || 'gray';
};

/**
 * Get note type color
 */
export const getNoteTypeColor = (type: EmployeeNote['type']): string => {
  const colors: Record<EmployeeNote['type'], string> = {
    general: 'gray',
    milestone: 'green',
    warning: 'yellow',
    late: 'red'
  };

  return colors[type];
};

/**
 * Get note type label
 */
export const getNoteTypeLabel = (type: EmployeeNote['type']): string => {
  const labels: Record<EmployeeNote['type'], string> = {
    general: 'Algemeen',
    milestone: 'Mijlpaal',
    warning: 'Waarschuwing',
    late: 'Te Laat'
  };

  return labels[type];
};

/**
 * Calculate vacation days remaining
 */
export const getVacationDaysRemaining = (employee: Employee): number => {
  const total = employee.vacationDays || 0;
  const used = employee.vacationDaysUsed || 0;
  return Math.max(0, total - used);
};

/**
 * Calculate vacation days percentage used
 */
export const getVacationDaysPercentage = (employee: Employee): number => {
  const total = employee.vacationDays || 0;
  if (total === 0) return 0;

  const used = employee.vacationDaysUsed || 0;
  return Math.round((used / total) * 100);
};

/**
 * Check if employee is running low on vacation days
 */
export const isLowOnVacationDays = (employee: Employee): boolean => {
  const remaining = getVacationDaysRemaining(employee);
  const total = employee.vacationDays || 0;

  if (total === 0) return false;
  return remaining < total * 0.2; // Less than 20% remaining
};

/**
 * Calculate years of service
 */
export const getYearsOfService = (hireDate?: string): number => {
  if (!hireDate) return 0;

  const hire = new Date(hireDate);
  const now = new Date();
  const diffMs = now.getTime() - hire.getTime();
  const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  return Math.floor(years);
};

/**
 * Calculate months of service
 */
export const getMonthsOfService = (hireDate?: string): number => {
  if (!hireDate) return 0;

  const hire = new Date(hireDate);
  const now = new Date();

  const years = now.getFullYear() - hire.getFullYear();
  const months = now.getMonth() - hire.getMonth();

  return years * 12 + months;
};

/**
 * Check if employee is new (less than 3 months)
 */
export const isNewEmployee = (hireDate?: string): boolean => {
  return getMonthsOfService(hireDate) < 3;
};

/**
 * Group employees by department
 */
export const groupByDepartment = (
  employees: Employee[]
): Record<string, Employee[]> => {
  const grouped: Record<string, Employee[]> = {};

  employees.forEach(emp => {
    const dept = emp.department || 'Geen afdeling';
    if (!grouped[dept]) {
      grouped[dept] = [];
    }
    grouped[dept].push(emp);
  });

  return grouped;
};

/**
 * Sort employees by name
 */
export const sortByName = (employees: Employee[]): Employee[] => {
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Sort employees by hire date
 */
export const sortByHireDate = (employees: Employee[]): Employee[] => {
  return [...employees].sort((a, b) => {
    if (!a.hireDate) return 1;
    if (!b.hireDate) return -1;
    return new Date(a.hireDate).getTime() - new Date(b.hireDate).getTime();
  });
};

/**
 * Sort employees by vacation days remaining
 */
export const sortByVacationDays = (employees: Employee[]): Employee[] => {
  return [...employees].sort((a, b) => {
    return getVacationDaysRemaining(a) - getVacationDaysRemaining(b);
  });
};

/**
 * Get employee by ID
 */
export const getEmployeeById = (
  employeeId: string,
  employees: Employee[]
): Employee | undefined => {
  return employees.find(emp => emp.id === employeeId);
};

/**
 * Get employee name by ID
 */
export const getEmployeeNameById = (
  employeeId: string,
  employees: Employee[]
): string => {
  const employee = getEmployeeById(employeeId, employees);
  return employee?.name || 'Onbekend';
};

/**
 * Count notes by type
 */
export const countNotesByType = (
  employee: Employee
): Record<EmployeeNote['type'], number> => {
  const counts: Record<EmployeeNote['type'], number> = {
    general: 0,
    milestone: 0,
    warning: 0,
    late: 0
  };

  if (!employee.notes) return counts;

  employee.notes.forEach(note => {
    counts[note.type]++;
  });

  return counts;
};

/**
 * Check if employee has warnings
 */
export const hasWarnings = (employee: Employee): boolean => {
  if (!employee.notes) return false;
  return employee.notes.some(note => note.type === 'warning' || note.type === 'late');
};

/**
 * Get latest note
 */
export const getLatestNote = (employee: Employee): EmployeeNote | undefined => {
  if (!employee.notes || employee.notes.length === 0) return undefined;

  return [...employee.notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];
};
