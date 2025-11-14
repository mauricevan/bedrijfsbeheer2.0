/**
 * useNotifications Hook
 * State management voor notificaties module
 */

import { useState, useMemo, useCallback } from 'react';
import type { Notification } from '../../../types';
import type { NotificationFilter } from '../types/notification.types';
import {
  filterNotifications,
  sortNotificationsByDate,
  groupNotificationsByDate,
  calculateNotificationStats,
} from '../services/notificationService';

export function useNotifications(initialNotifications: Notification[]) {
  // State
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState<NotificationFilter>({
    type: 'all',
    priority: 'all',
    module: 'all',
    read: 'all',
  });
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  // Gefilterde en gesorteerde notificaties
  const filteredNotifications = useMemo(() => {
    const filtered = filterNotifications(notifications, filter);
    return sortNotificationsByDate(filtered);
  }, [notifications, filter]);

  // Gegroepeerde notificaties per datum
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  // Statistieken
  const stats = useMemo(() => {
    return calculateNotificationStats(notifications);
  }, [notifications]);

  // Unieke modules voor filtering
  const availableModules = useMemo(() => {
    const modules = new Set<string>();
    notifications.forEach((n) => {
      if (n.module) modules.add(n.module);
    });
    return Array.from(modules).sort();
  }, [notifications]);

  // Actions
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    );
  }, []);

  const toggleRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: !notification.read } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    if (selectedNotification?.id === id) {
      setSelectedNotification(null);
    }
  }, [selectedNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setSelectedNotification(null);
  }, []);

  const clearRead = useCallback(() => {
    setNotifications((prev) => prev.filter((notification) => !notification.read));
  }, []);

  // Filter actions
  const setTypeFilter = useCallback((type: Notification['type'] | 'all') => {
    setFilter((prev) => ({ ...prev, type }));
  }, []);

  const setPriorityFilter = useCallback((priority: Notification['priority'] | 'all') => {
    setFilter((prev) => ({ ...prev, priority }));
  }, []);

  const setModuleFilter = useCallback((module: string | 'all') => {
    setFilter((prev) => ({ ...prev, module }));
  }, []);

  const setReadFilter = useCallback((read: boolean | 'all') => {
    setFilter((prev) => ({ ...prev, read }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({
      type: 'all',
      priority: 'all',
      module: 'all',
      read: 'all',
    });
  }, []);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  const searchedNotifications = useMemo(() => {
    if (!searchTerm.trim()) return filteredNotifications;

    const term = searchTerm.toLowerCase();
    return filteredNotifications.filter(
      (notification) =>
        notification.message.toLowerCase().includes(term) ||
        notification.module?.toLowerCase().includes(term)
    );
  }, [filteredNotifications, searchTerm]);

  const searchedGrouped = useMemo(() => {
    return groupNotificationsByDate(searchedNotifications);
  }, [searchedNotifications]);

  // Quick filters
  const showUnreadOnly = useCallback(() => {
    setFilter((prev) => ({ ...prev, read: false }));
  }, []);

  const showHighPriorityOnly = useCallback(() => {
    setFilter((prev) => ({ ...prev, priority: 'high' }));
  }, []);

  const showErrorsAndWarnings = useCallback(() => {
    setFilter((prev) => ({ ...prev, type: 'all', priority: 'all' }));
    setNotifications((prev) => prev.filter((n) => n.type === 'error' || n.type === 'warning'));
  }, []);

  return {
    // Data
    notifications: searchedNotifications,
    groupedNotifications: searchedGrouped,
    allNotifications: notifications,
    stats,
    availableModules,
    selectedNotification,

    // Filters
    filter,
    searchTerm,

    // Actions
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    clearRead,

    // Filter actions
    setTypeFilter,
    setPriorityFilter,
    setModuleFilter,
    setReadFilter,
    clearFilters,
    showUnreadOnly,
    showHighPriorityOnly,
    showErrorsAndWarnings,

    // Search
    setSearchTerm,

    // Selection
    setSelectedNotification,
  };
}
