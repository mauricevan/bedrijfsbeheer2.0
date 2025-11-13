/**
 * EmployeeCard Component
 * Displays a single employee in card format
 */

import React from 'react';
import type { Employee } from '../../types';
import {
  getEmployeeInitials,
  getDepartmentColor,
  getVacationDaysPercentage,
  getYearsOfService,
  hasWarnings
} from '../../features/hrm/utils/helpers';
import {
  formatHireDate,
  formatJobTitle,
  formatDepartment,
  formatVacationSummary,
  formatPhoneNumber,
  formatYearsOfService
} from '../../features/hrm/utils/formatters';

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  onView?: (employee: Employee) => void;
  readOnly?: boolean;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onDelete,
  onView,
  readOnly = false
}) => {
  const initials = getEmployeeInitials(employee.name);
  const departmentColor = getDepartmentColor(employee.department);
  const vacationPercentage = getVacationDaysPercentage(employee);
  const yearsOfService = getYearsOfService(employee.hireDate);
  const showWarning = hasWarnings(employee);

  const departmentColors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${showWarning ? 'border-l-4 border-yellow-500' : ''}`}>
      {/* Header with avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg">
          {initials}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {employee.name}
          </h3>
          <p className="text-sm text-gray-600">
            {formatJobTitle(employee.jobTitle)}
          </p>
          <div className="flex gap-2 mt-1">
            {employee.department && (
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  departmentColors[departmentColor]
                }`}
              >
                {formatDepartment(employee.department)}
              </span>
            )}
            {employee.isAdmin && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            )}
            {showWarning && (
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                ⚠️ Waarschuwing
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        <p>
          <span className="font-medium">Email:</span> {employee.email}
        </p>
        {employee.phone && (
          <p>
            <span className="font-medium">Telefoon:</span>{' '}
            {formatPhoneNumber(employee.phone)}
          </p>
        )}
        {employee.hireDate && (
          <p>
            <span className="font-medium">In dienst:</span> {formatHireDate(employee.hireDate)}
            {' '}({formatYearsOfService(yearsOfService)})
          </p>
        )}
      </div>

      {/* Vacation days */}
      {employee.vacationDays !== undefined && employee.vacationDays > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">Verlofdagen</span>
            <span className="text-gray-600">
              {formatVacationSummary(employee)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                vacationPercentage > 80
                  ? 'bg-red-500'
                  : vacationPercentage > 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${vacationPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {vacationPercentage}% gebruikt
          </p>
        </div>
      )}

      {/* Notes count */}
      {employee.notes && employee.notes.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            📝 {employee.notes.length} {employee.notes.length === 1 ? 'notitie' : 'notities'}
          </p>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onView && (
            <button
              onClick={() => onView(employee)}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Details
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(employee)}
              className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Bewerken
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (
                  confirm(
                    `Weet je zeker dat je "${employee.name}" wilt verwijderen?`
                  )
                ) {
                  onDelete(employee.id);
                }
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
              title="Verwijder medewerker"
            >
              🗑️
            </button>
          )}
        </div>
      )}
    </div>
  );
};
