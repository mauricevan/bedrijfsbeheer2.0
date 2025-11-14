/**
 * NotificationsPage - Notificaties Systeem
 * Complete notificaties beheer met filtering, prioriteit en acties
 */

import React from 'react';
import type { User, Notification } from '../../types';
import { useNotifications } from '../../features/notifications';
import {
  formatNotificationTime,
  getNotificationIcon,
  getNotificationColor,
  getPriorityColor,
  getModuleDisplayName,
} from '../../features/notifications/services/notificationService';

type NotificationsPageProps = {
  currentUser: User;
  initialNotifications: Notification[];
};

type ViewMode = 'list' | 'grouped';

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  initialNotifications,
}) => {
  const {
    notifications,
    groupedNotifications,
    stats,
    availableModules,
    filter,
    searchTerm,
    selectedNotification,
    markAsRead,
    markAsUnread,
    toggleRead,
    markAllAsRead,
    deleteNotification,
    clearRead,
    setTypeFilter,
    setPriorityFilter,
    setModuleFilter,
    setReadFilter,
    clearFilters,
    showUnreadOnly,
    setSearchTerm,
    setSelectedNotification,
  } = useNotifications(initialNotifications);

  const [viewMode, setViewMode] = React.useState<ViewMode>('grouped');
  const isAdmin = currentUser.isAdmin;

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  // Render notification item
  const renderNotification = (notification: Notification) => {
    const isSelected = selectedNotification?.id === notification.id;
    const colorClasses = getNotificationColor(notification.type);
    const priorityColor = getPriorityColor(notification.priority);

    return (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`
          rounded-lg border-2 p-4 mb-2 cursor-pointer transition-all
          ${colorClasses}
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}
          ${!notification.read ? 'font-semibold' : 'opacity-75'}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            <span className="text-2xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {!notification.read && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                )}
                <span className={`text-xs font-medium ${priorityColor}`}>
                  {notification.priority.toUpperCase()}
                </span>
                {notification.module && (
                  <span className="text-xs text-gray-600">
                    • {getModuleDisplayName(notification.module)}
                  </span>
                )}
              </div>

              <p className="text-sm break-words">{notification.message}</p>

              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <span>{formatNotificationTime(notification.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRead(notification.id);
                }}
                className="px-2 py-1 text-xs bg-white/50 hover:bg-white rounded border border-gray-400 transition"
                title={notification.read ? 'Markeer als ongelezen' : 'Markeer als gelezen'}
              >
                {notification.read ? '📖' : '✅'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Notificatie verwijderen?')) {
                    deleteNotification(notification.id);
                  }
                }}
                className="px-2 py-1 text-xs bg-white/50 hover:bg-red-100 rounded border border-gray-400 transition"
                title="Verwijderen"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📬 Notificaties</h2>
          <p className="text-sm text-gray-600 mt-1">
            {stats.total} totaal • {stats.unread} ongelezen
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={showUnreadOnly}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              disabled={filter.read === false}
            >
              📭 Ongelezen
            </button>
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              disabled={stats.unread === 0}
            >
              ✅ Alles gelezen
            </button>
            <button
              onClick={() => {
                if (confirm('Alle gelezen notificaties verwijderen?')) {
                  clearRead();
                }
              }}
              className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              🗑️ Wis gelezen
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4">
          <div className="text-sm text-blue-700 font-medium">ℹ️ Info</div>
          <div className="text-2xl font-bold text-blue-900">{stats.byType.info}</div>
        </div>
        <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
          <div className="text-sm text-green-700 font-medium">✅ Succes</div>
          <div className="text-2xl font-bold text-green-900">{stats.byType.success}</div>
        </div>
        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
          <div className="text-sm text-yellow-700 font-medium">⚠️ Waarschuwing</div>
          <div className="text-2xl font-bold text-yellow-900">{stats.byType.warning}</div>
        </div>
        <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
          <div className="text-sm text-red-700 font-medium">❌ Fout</div>
          <div className="text-2xl font-bold text-red-900">{stats.byType.error}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🔍 Filters</h3>
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Wis filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Type filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type || 'all'}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle types</option>
              <option value="info">ℹ️ Info</option>
              <option value="success">✅ Succes</option>
              <option value="warning">⚠️ Waarschuwing</option>
              <option value="error">❌ Fout</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Prioriteit</label>
            <select
              value={filter.priority || 'all'}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle prioriteiten</option>
              <option value="high">🔴 Hoog</option>
              <option value="medium">🟡 Gemiddeld</option>
              <option value="low">⚪ Laag</option>
            </select>
          </div>

          {/* Module filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Module</label>
            <select
              value={filter.module || 'all'}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle modules</option>
              {availableModules.map((module) => (
                <option key={module} value={module}>
                  {getModuleDisplayName(module)}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.read === 'all' ? 'all' : filter.read ? 'read' : 'unread'}
              onChange={(e) => {
                const value = e.target.value;
                setReadFilter(value === 'all' ? 'all' : value === 'read');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Alle</option>
              <option value="unread">📭 Ongelezen</option>
              <option value="read">📖 Gelezen</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-1">Zoeken</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek in berichten..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          📋 Overzicht ({notifications.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              viewMode === 'grouped'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 Gegroepeerd
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📄 Lijst
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-50 rounded-lg border-2 border-gray-300 p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 font-medium">Geen notificaties gevonden</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter.type !== 'all' || filter.priority !== 'all' || filter.module !== 'all' || filter.read !== 'all'
                ? 'Probeer andere filters'
                : 'Er zijn momenteel geen meldingen'}
            </p>
          </div>
        ) : viewMode === 'grouped' ? (
          <div className="space-y-6">
            {groupedNotifications.map((group) => (
              <div key={group.date}>
                <h4 className="font-semibold text-gray-900 mb-3 sticky top-0 bg-gray-50 py-2">
                  📅 {group.date} ({group.notifications.length})
                </h4>
                <div className="space-y-2">
                  {group.notifications.map(renderNotification)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(renderNotification)}
          </div>
        )}
      </div>

      {/* Priority Legend */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Prioriteit Legenda</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="font-medium text-red-600 mb-1">🔴 Hoog - Onmiddellijk</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Niet op voorraad</li>
              <li>• Kritieke voorraad (&lt;5)</li>
              <li>• Factuur &gt;30 dagen verlopen</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-yellow-600 mb-1">🟡 Gemiddeld - Binnen 24 uur</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lage voorraad</li>
              <li>• Factuur vervalt binnen 3 dagen</li>
              <li>• Werkorder in wacht &gt;7 dagen</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-gray-600 mb-1">⚪ Laag - Informatie</div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Werkorder voltooid</li>
              <li>• Offerte verzonden</li>
              <li>• Nieuwe klant toegevoegd</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
