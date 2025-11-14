/**
 * useEmployees Hook
 * Business logic voor Personeelsbeheer (HRM)
 */

import { useState, useCallback, useMemo } from 'react';
import type { Employee, EmployeeAvailability } from '../../../types';

export const useEmployees = (initialEmployees: Employee[]) => {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<
    EmployeeAvailability | 'all'
  >('all');

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Calculate years of service (tenure)
  const calculateTenure = (hireDate?: string): number => {
    if (!hireDate) return 0;

    const hire = new Date(hireDate);
    const now = new Date();
    const years = now.getFullYear() - hire.getFullYear();
    const monthDiff = now.getMonth() - hire.getMonth();

    // Adjust if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < hire.getDate())) {
      return Math.max(0, years - 1);
    }

    return Math.max(0, years);
  };

  // Calculate available vacation days
  const calculateAvailableVacation = (employee: Employee): number => {
    const total = employee.vacationDays || 0;
    const used = employee.vacationDaysUsed || 0;
    return Math.max(0, total - used);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Stats
  const stats = useMemo(() => {
    const total = employees.length;
    const roles = new Set(employees.map((e) => e.jobTitle).filter(Boolean)).size;

    // Calculate average tenure
    const tenures = employees
      .filter((e) => e.hireDate)
      .map((e) => calculateTenure(e.hireDate));
    const avgTenure =
      tenures.length > 0 ? tenures.reduce((sum, t) => sum + t, 0) / tenures.length : 0;

    const available = employees.filter((e) => e.availability === 'available').length;
    const unavailable = employees.filter((e) => e.availability === 'unavailable').length;
    const onVacation = employees.filter((e) => e.availability === 'vacation').length;

    return {
      total,
      roles,
      avgTenure: Math.round(avgTenure * 10) / 10, // Round to 1 decimal
      available,
      unavailable,
      onVacation,
    };
  }, [employees]);

  // Filtered & Searched employees
  const filteredEmployees = useMemo(() => {
    let result = employees;

    // Filter by availability
    if (filterAvailability !== 'all') {
      result = result.filter((e) => e.availability === filterAvailability);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.email.toLowerCase().includes(term) ||
          e.jobTitle?.toLowerCase().includes(term) ||
          e.phone?.toLowerCase().includes(term) ||
          e.department?.toLowerCase().includes(term)
      );
    }

    // Sort by name
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchTerm, filterAvailability]);

  // Employees with enriched data
  const enrichedEmployees = useMemo(() => {
    return employees.map((emp) => ({
      ...emp,
      tenure: calculateTenure(emp.hireDate),
      availableVacation: calculateAvailableVacation(emp),
    }));
  }, [employees]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addEmployee = useCallback(
    (employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newEmployee: Employee = {
        ...employeeData,
        id: `user-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        availability: employeeData.availability || 'available',
        vacationDays: employeeData.vacationDays || 25, // Default 25 days
        vacationDaysUsed: employeeData.vacationDaysUsed || 0,
        notes: [],
      };

      setEmployees((prev) => [...prev, newEmployee]);
      return newEmployee;
    },
    []
  );

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : employee
      )
    );
  }, []);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((employee) => employee.id !== id));
  }, []);

  // ============================================================================
  // AVAILABILITY OPERATIONS
  // ============================================================================

  const setAvailability = useCallback((id: string, availability: EmployeeAvailability) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              availability,
              updatedAt: new Date().toISOString(),
            }
          : employee
      )
    );
  }, []);

  const markAsAvailable = useCallback(
    (id: string) => {
      setAvailability(id, 'available');
    },
    [setAvailability]
  );

  const markAsUnavailable = useCallback(
    (id: string) => {
      setAvailability(id, 'unavailable');
    },
    [setAvailability]
  );

  const markOnVacation = useCallback(
    (id: string) => {
      setAvailability(id, 'vacation');
    },
    [setAvailability]
  );

  // ============================================================================
  // VACATION OPERATIONS
  // ============================================================================

  const updateVacationDays = useCallback((id: string, totalDays: number, usedDays: number) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              vacationDays: totalDays,
              vacationDaysUsed: usedDays,
              updatedAt: new Date().toISOString(),
            }
          : employee
      )
    );
  }, []);

  const addVacationDaysUsed = useCallback((id: string, days: number) => {
    setEmployees((prev) =>
      prev.map((employee) => {
        if (employee.id !== id) return employee;

        const newUsed = (employee.vacationDaysUsed || 0) + days;
        return {
          ...employee,
          vacationDaysUsed: Math.min(newUsed, employee.vacationDays || 0),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const setAvailabilityFilter = useCallback((availability: EmployeeAvailability | 'all') => {
    setFilterAvailability(availability);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterAvailability('all');
    setSearchTerm('');
  }, []);

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  const getEmployeeById = useCallback(
    (id: string) => {
      const employee = employees.find((e) => e.id === id);
      if (!employee) return null;

      return {
        ...employee,
        tenure: calculateTenure(employee.hireDate),
        availableVacation: calculateAvailableVacation(employee),
      };
    },
    [employees]
  );

  const getEmployeesByRole = useCallback(
    (jobTitle: string) => {
      return employees.filter((e) => e.jobTitle === jobTitle);
    },
    [employees]
  );

  const getEmployeesByDepartment = useCallback(
    (department: string) => {
      return employees.filter((e) => e.department === department);
    },
    [employees]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    employees,
    enrichedEmployees,
    filteredEmployees,
    stats,

    // Search & Filter
    searchTerm,
    filterAvailability,
    handleSearch,
    clearSearch,
    setAvailabilityFilter,
    clearFilters,

    // CRUD
    addEmployee,
    updateEmployee,
    deleteEmployee,

    // Availability
    setAvailability,
    markAsAvailable,
    markAsUnavailable,
    markOnVacation,

    // Vacation
    updateVacationDays,
    addVacationDaysUsed,

    // Query helpers
    getEmployeeById,
    getEmployeesByRole,
    getEmployeesByDepartment,

    // Utilities
    calculateTenure,
    calculateAvailableVacation,
  };
};
