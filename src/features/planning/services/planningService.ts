/**
 * Planning Service - Calendar and Event Logic
 */

import type { Event, CalendarDay, EventFilter, EventStats, EventType, EventStatus } from '../types/planning.types';

/**
 * Get calendar days for a month
 */
export function getMonthCalendar(year: number, month: number, events: Event[]): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  
  // Start from previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days: CalendarDay[] = [];
  const currentDate = new Date(startDate);
  
  // Generate 6 weeks (42 days) for consistent calendar
  for (let i = 0; i < 42; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayEvents = events.filter(event => {
      const eventDate = event.startTime.split('T')[0];
      return eventDate === dateStr;
    });
    
    days.push({
      date: dateStr,
      events: dayEvents,
      isToday: dateStr === new Date().toISOString().split('T')[0],
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      isCurrentMonth: currentDate.getMonth() === month,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

export function filterEvents(events: Event[], filter: EventFilter): Event[] {
  return events.filter(event => {
    if (filter.type && filter.type !== 'all' && event.type !== filter.type) return false;
    if (filter.status && filter.status !== 'all' && event.status !== filter.status) return false;
    if (filter.assignedUserId && filter.assignedUserId !== 'all' && event.assignedUserId !== filter.assignedUserId) return false;
    if (filter.dateFrom && event.startTime < filter.dateFrom) return false;
    if (filter.dateTo && event.startTime > filter.dateTo) return false;
    return true;
  });
}

export function calculateEventStats(events: Event[]): EventStats {
  const now = new Date().toISOString();
  const stats: EventStats = {
    total: events.length,
    byType: { appointment: 0, meeting: 0, deadline: 0, task: 0, reminder: 0 },
    byStatus: { scheduled: 0, confirmed: 0, cancelled: 0, completed: 0 },
    upcoming: 0,
    overdue: 0,
  };
  
  events.forEach(event => {
    stats.byType[event.type]++;
    stats.byStatus[event.status]++;
    if (event.status !== 'completed' && event.status !== 'cancelled') {
      if (event.startTime > now) stats.upcoming++;
      else stats.overdue++;
    }
  });
  
  return stats;
}

export function formatEventTime(startTime: string, endTime: string, allDay: boolean): string {
  if (allDay) return 'Hele dag';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const fmt = (d: Date) => d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  return fmt(start) + ' - ' + fmt(end);
}

export function getEventTypeIcon(type: EventType): string {
  const icons = { appointment: '📅', meeting: '👥', deadline: '⏰', task: '✅', reminder: '🔔' };
  return icons[type];
}

export function getEventStatusColor(status: EventStatus): string {
  const colors = {
    scheduled: 'bg-blue-100 border-blue-300 text-blue-900',
    confirmed: 'bg-green-100 border-green-300 text-green-900',
    cancelled: 'bg-red-100 border-red-300 text-red-900',
    completed: 'bg-gray-100 border-gray-300 text-gray-600',
  };
  return colors[status];
}

