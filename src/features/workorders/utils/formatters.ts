/**
 * WorkOrders Formatters
 * Format functies voor werkorders module
 */

import type { WorkOrder } from '../../../types';

/**
 * Format workorder number with prefix
 */
export const formatWorkOrderNumber = (index?: number): string => {
  if (!index) return 'Nieuw';
  return `WO-${String(index).padStart(4, '0')}`;
};

/**
 * Format currency (Euro)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

/**
 * Format date to Dutch format
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

/**
 * Format datetime to Dutch format with time
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

/**
 * Format relative time (e.g., "2 dagen geleden")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
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
 * Format hours to readable format
 */
export const formatHours = (hours: number): string => {
  if (hours === 0) return '0 uur';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours === Math.floor(hours)) return `${hours} uur`;

  const fullHours = Math.floor(hours);
  const minutes = Math.round((hours - fullHours) * 60);

  if (minutes === 0) return `${fullHours} uur`;
  return `${fullHours}u ${minutes}m`;
};

/**
 * Format workorder summary (first line of description)
 */
export const formatSummary = (description: string, maxLength: number = 80): string => {
  if (!description) return 'Geen omschrijving';
  const firstLine = description.split('\n')[0];
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.substring(0, maxLength - 3) + '...';
};

/**
 * Format material list
 */
export const formatMaterialsList = (workOrder: WorkOrder): string => {
  if (!workOrder.materials || workOrder.materials.length === 0) {
    return 'Geen materialen';
  }

  return workOrder.materials
    .map(m => `${m.name} (${m.quantity}x)`)
    .join(', ');
};

/**
 * Format workorder timeline (created to completed)
 */
export const formatTimeline = (workOrder: WorkOrder): string => {
  const created = formatDate(workOrder.createdAt);

  if (workOrder.status === 'completed' && workOrder.completedAt) {
    const completed = formatDate(workOrder.completedAt);
    return `${created} → ${completed}`;
  }

  return created;
};

/**
 * Format efficiency percentage (estimated vs actual hours)
 */
export const formatEfficiency = (estimatedHours: number, actualHours: number): string => {
  if (estimatedHours === 0) return 'N/A';
  const efficiency = (estimatedHours / actualHours) * 100;

  if (efficiency > 100) {
    return `${Math.round(efficiency - 100)}% sneller`;
  } else if (efficiency < 100) {
    return `${Math.round(100 - efficiency)}% trager`;
  } else {
    return 'Precies op tijd';
  }
};
