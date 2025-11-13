/**
 * HRM Filters
 * Filter functies voor personeelsbeheer module
 */

import type { Employee, EmployeeNote } from '../../../types';
import { getVacationDaysRemaining, isNewEmployee, hasWarnings } from './helpers';

export interface EmployeeFilters {
  search?: string;
  department?: string;
  jobTitle?: string;
  role?: 'admin' | 'user';
  showNewOnly?: boolean;
  showWithWarnings?: boolean;
  showLowVacation?: boolean;
  hireDateFrom?: string;
  hireDateTo?: string;
}

/**
 * Filter by search term (name, email, job title)
 */
export const filterBySearch = (
  employees: Employee[],
  searchTerm: string
): Employee[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return employees;
  }

  const term = searchTerm.toLowerCase().trim();

  return employees.filter(emp => {
    const nameMatch = emp.name.toLowerCase().includes(term);
    const emailMatch = emp.email.toLowerCase().includes(term);
    const jobTitleMatch = emp.jobTitle?.toLowerCase().includes(term);
    const departmentMatch = emp.department?.toLowerCase().includes(term);

    return nameMatch || emailMatch || jobTitleMatch || departmentMatch;
  });
};

/**
 * Filter by department
 */
export const filterByDepartment = (
  employees: Employee[],
  department?: string
): Employee[] => {
  if (!department) return employees;

  return employees.filter(emp => {
    if (department === 'none') {
      return !emp.department;
    }
    return emp.department?.toLowerCase() === department.toLowerCase();
  });
};

/**
 * Filter by job title
 */
export const filterByJobTitle = (
  employees: Employee[],
  jobTitle?: string
): Employee[] => {
  if (!jobTitle) return employees;

  return employees.filter(emp => {
    if (jobTitle === 'none') {
      return !emp.jobTitle;
    }
    return emp.jobTitle?.toLowerCase() === jobTitle.toLowerCase();
  });
};

/**
 * Filter by role (admin/user)
 */
export const filterByRole = (
  employees: Employee[],
  role?: 'admin' | 'user'
): Employee[] => {
  if (!role) return employees;
  return employees.filter(emp => emp.role === role);
};

/**
 * Filter new employees only (less than 3 months)
 */
export const filterNewEmployees = (employees: Employee[]): Employee[] => {
  return employees.filter(emp => isNewEmployee(emp.hireDate));
};

/**
 * Filter employees with warnings
 */
export const filterWithWarnings = (employees: Employee[]): Employee[] => {
  return employees.filter(emp => hasWarnings(emp));
};

/**
 * Filter employees low on vacation days (less than 20% remaining)
 */
export const filterLowVacationDays = (employees: Employee[]): Employee[] => {
  return employees.filter(emp => {
    const total = emp.vacationDays || 0;
    if (total === 0) return false;

    const remaining = getVacationDaysRemaining(emp);
    return remaining < total * 0.2;
  });
};

/**
 * Filter by hire date range
 */
export const filterByHireDateRange = (
  employees: Employee[],
  dateFrom?: string,
  dateTo?: string
): Employee[] => {
  let filtered = employees;

  if (dateFrom) {
    const from = new Date(dateFrom);
    filtered = filtered.filter(emp => {
      if (!emp.hireDate) return false;
      return new Date(emp.hireDate) >= from;
    });
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(emp => {
      if (!emp.hireDate) return false;
      return new Date(emp.hireDate) <= to;
    });
  }

  return filtered;
};

/**
 * Filter employees by vacation days available
 */
export const filterByVacationDaysAvailable = (
  employees: Employee[],
  minDays?: number
): Employee[] => {
  if (minDays === undefined) return employees;

  return employees.filter(emp => {
    return getVacationDaysRemaining(emp) >= minDays;
  });
};

/**
 * Apply all employee filters at once
 */
export const applyEmployeeFilters = (
  employees: Employee[],
  filters: EmployeeFilters
): Employee[] => {
  let filtered = employees;

  // Apply search filter
  if (filters.search) {
    filtered = filterBySearch(filtered, filters.search);
  }

  // Apply department filter
  if (filters.department) {
    filtered = filterByDepartment(filtered, filters.department);
  }

  // Apply job title filter
  if (filters.jobTitle) {
    filtered = filterByJobTitle(filtered, filters.jobTitle);
  }

  // Apply role filter
  if (filters.role) {
    filtered = filterByRole(filtered, filters.role);
  }

  // Apply new employees filter
  if (filters.showNewOnly) {
    filtered = filterNewEmployees(filtered);
  }

  // Apply warnings filter
  if (filters.showWithWarnings) {
    filtered = filterWithWarnings(filtered);
  }

  // Apply low vacation days filter
  if (filters.showLowVacation) {
    filtered = filterLowVacationDays(filtered);
  }

  // Apply hire date range filter
  if (filters.hireDateFrom || filters.hireDateTo) {
    filtered = filterByHireDateRange(filtered, filters.hireDateFrom, filters.hireDateTo);
  }

  return filtered;
};

/**
 * Get available filter options from employees
 */
export const getFilterOptions = (employees: Employee[]) => {
  const departments = new Set<string>();
  const jobTitles = new Set<string>();
  const roles = new Set<'admin' | 'user'>();

  employees.forEach(emp => {
    if (emp.department) departments.add(emp.department);
    if (emp.jobTitle) jobTitles.add(emp.jobTitle);
    roles.add(emp.role);
  });

  return {
    departments: Array.from(departments).sort(),
    jobTitles: Array.from(jobTitles).sort(),
    roles: Array.from(roles)
  };
};

/**
 * Filter notes by type
 */
export const filterNotesByType = (
  notes: EmployeeNote[],
  type?: EmployeeNote['type']
): EmployeeNote[] => {
  if (!type) return notes;
  return notes.filter(note => note.type === type);
};

/**
 * Sort notes by date (newest first)
 */
export const sortNotesByDate = (notes: EmployeeNote[]): EmployeeNote[] => {
  return [...notes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Count employees by filter
 */
export const countByFilter = (
  employees: Employee[],
  filter: Partial<EmployeeFilters>
): number => {
  return applyEmployeeFilters(employees, filter).length;
};
