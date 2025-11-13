/**
 * HRM Formatters
 * Format functies voor personeelsbeheer module
 */

import type { Employee } from '../../../types';

/**
 * Format hire date to Dutch format
 */
export const formatHireDate = (date?: string): string => {
  if (!date) return 'Onbekend';

  const d = new Date(date);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(d);
};

/**
 * Format date to short Dutch format
 */
export const formatDateShort = (date: string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

/**
 * Format relative time (e.g., "3 dagen geleden")
 */
export const formatRelativeTime = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Zojuist';
  if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minuut' : 'minuten'} geleden`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'uur' : 'uur'} geleden`;
  if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weken'} geleden`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'maand' : 'maanden'} geleden`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} ${years === 1 ? 'jaar' : 'jaar'} geleden`;
};

/**
 * Format years of service
 */
export const formatYearsOfService = (years: number): string => {
  if (years === 0) return 'Nieuw';
  if (years < 1) return 'Minder dan 1 jaar';
  return `${years} ${years === 1 ? 'jaar' : 'jaar'}`;
};

/**
 * Format months to readable string
 */
export const formatMonths = (months: number): string => {
  if (months === 0) return 'Nieuw';
  if (months < 12) return `${months} ${months === 1 ? 'maand' : 'maanden'}`;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'jaar' : 'jaar'}`;
  }

  return `${years} ${years === 1 ? 'jaar' : 'jaar'} en ${remainingMonths} ${
    remainingMonths === 1 ? 'maand' : 'maanden'
  }`;
};

/**
 * Format vacation days
 */
export const formatVacationDays = (days: number): string => {
  return `${days} ${days === 1 ? 'dag' : 'dagen'}`;
};

/**
 * Format vacation days summary
 */
export const formatVacationSummary = (employee: Employee): string => {
  const total = employee.vacationDays || 0;
  const used = employee.vacationDaysUsed || 0;
  const remaining = Math.max(0, total - used);

  return `${remaining} van ${total} dagen over`;
};

/**
 * Format phone number to Dutch format
 */
export const formatPhoneNumber = (phone?: string): string => {
  if (!phone) return '-';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Dutch mobile: 06-12345678
  if (cleaned.startsWith('06') && cleaned.length === 10) {
    return `${cleaned.substring(0, 2)}-${cleaned.substring(2)}`;
  }

  // Dutch landline: 010-1234567
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3)}`;
  }

  // International: +31 6 12345678
  if (cleaned.startsWith('316') && cleaned.length === 11) {
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 3)} ${cleaned.substring(3)}`;
  }

  // Return as-is if doesn't match patterns
  return phone;
};

/**
 * Format email (lowercase)
 */
export const formatEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Format department name
 */
export const formatDepartment = (department?: string): string => {
  if (!department) return 'Geen afdeling';

  // Capitalize first letter
  return department.charAt(0).toUpperCase() + department.slice(1);
};

/**
 * Format job title
 */
export const formatJobTitle = (jobTitle?: string): string => {
  if (!jobTitle) return 'Geen functie';
  return jobTitle;
};

/**
 * Format employee full info
 */
export const formatEmployeeInfo = (employee: Employee): string => {
  const parts: string[] = [employee.name];

  if (employee.jobTitle) {
    parts.push(employee.jobTitle);
  }

  if (employee.department) {
    parts.push(formatDepartment(employee.department));
  }

  return parts.join(' • ');
};

/**
 * Format note content preview
 */
export const formatNotePreview = (content: string, maxLength: number = 100): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3) + '...';
};
