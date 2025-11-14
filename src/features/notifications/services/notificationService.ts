/**
 * Notification Service
 * Business logic voor notificaties beheer
 */

import type { Notification } from '../../../types';
import type { NotificationStats, NotificationFilter, NotificationGroup } from '../types/notification.types';

/**
 * Filter notificaties op basis van criteria
 */
export function filterNotifications(
  notifications: Notification[],
  filter: NotificationFilter
): Notification[] {
  return notifications.filter((notification) => {
    // Filter op type
    if (filter.type && filter.type !== 'all' && notification.type !== filter.type) {
      return false;
    }

    // Filter op priority
    if (filter.priority && filter.priority !== 'all' && notification.priority !== filter.priority) {
      return false;
    }

    // Filter op module
    if (filter.module && filter.module !== 'all' && notification.module !== filter.module) {
      return false;
    }

    // Filter op gelezen/ongelezen
    if (filter.read !== undefined && filter.read !== 'all' && notification.read !== filter.read) {
      return false;
    }

    return true;
  });
}

/**
 * Sorteer notificaties op timestamp (nieuwste eerst)
 */
export function sortNotificationsByDate(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

/**
 * Groepeer notificaties per datum
 */
export function groupNotificationsByDate(notifications: Notification[]): NotificationGroup[] {
  const sorted = sortNotificationsByDate(notifications);
  const groups: Record<string, Notification[]> = {};

  sorted.forEach((notification) => {
    const date = formatDateGroup(notification.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
  });

  return Object.entries(groups).map(([date, notifs]) => ({
    date,
    notifications: notifs,
  }));
}

/**
 * Formatteer datum voor grouping
 */
function formatDateGroup(timestamp: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if today
  if (isSameDay(date, today)) {
    return 'Vandaag';
  }

  // Check if yesterday
  if (isSameDay(date, yesterday)) {
    return 'Gisteren';
  }

  // Check if this week
  const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff < 7) {
    const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    return days[date.getDay()];
  }

  // Otherwise format as date
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Bereken statistieken voor notificaties
 */
export function calculateNotificationStats(notifications: Notification[]): NotificationStats {
  const stats: NotificationStats = {
    total: notifications.length,
    unread: 0,
    byType: { success: 0, warning: 0, error: 0, info: 0 },
    byPriority: { low: 0, medium: 0, high: 0 },
    byModule: {},
  };

  notifications.forEach((notification) => {
    // Count unread
    if (!notification.read) {
      stats.unread++;
    }

    // Count by type
    stats.byType[notification.type]++;

    // Count by priority
    stats.byPriority[notification.priority]++;

    // Count by module
    if (notification.module) {
      stats.byModule[notification.module] = (stats.byModule[notification.module] || 0) + 1;
    }
  });

  return stats;
}

/**
 * Formatteer timestamp voor weergave
 */
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Zojuist';
  if (diffMins < 60) return `${diffMins} min geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  if (diffDays === 1) return 'Gisteren';
  if (diffDays < 7) return `${diffDays} dagen geleden`;

  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Get notification icon based on type
 */
export function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return '✅';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'info':
    default:
      return 'ℹ️';
  }
}

/**
 * Get notification color classes based on type
 */
export function getNotificationColor(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return 'bg-green-100 border-green-300 text-green-900';
    case 'warning':
      return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    case 'error':
      return 'bg-red-100 border-red-300 text-red-900';
    case 'info':
    default:
      return 'bg-blue-100 border-blue-300 text-blue-900';
  }
}

/**
 * Get priority color classes
 */
export function getPriorityColor(priority: Notification['priority']): string {
  switch (priority) {
    case 'high':
      return 'text-red-600';
    case 'medium':
      return 'text-yellow-600';
    case 'low':
    default:
      return 'text-gray-600';
  }
}

/**
 * Get module display name
 */
export function getModuleDisplayName(module?: string): string {
  if (!module) return 'Systeem';

  const moduleNames: Record<string, string> = {
    inventory: 'Voorraad',
    accounting: 'Boekhouding',
    workorders: 'Werkorders',
    pos: 'Kassasysteem',
    crm: 'CRM',
    hrm: 'Personeelsbeheer',
    planning: 'Planning',
    reports: 'Rapportages',
    webshop: 'Webshop',
    admin: 'Beheer',
    dashboard: 'Dashboard',
  };

  return moduleNames[module] || module;
}
