/**
 * Notification Types - Extended type definitions
 * Uitgebreide type definities voor het notificaties systeem
 */

import type { Notification } from '../../../types';

export type { Notification };

export interface NotificationFilter {
  type?: Notification['type'] | 'all';
  priority?: Notification['priority'] | 'all';
  module?: string | 'all';
  read?: boolean | 'all';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<Notification['type'], number>;
  byPriority: Record<Notification['priority'], number>;
  byModule: Record<string, number>;
}

export interface NotificationActions {
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  filterByType: (type: Notification['type'] | 'all') => void;
  filterByPriority: (priority: Notification['priority'] | 'all') => void;
  filterByModule: (module: string | 'all') => void;
  toggleRead: (id: string) => void;
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}
