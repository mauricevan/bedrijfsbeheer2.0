/**
 * Planning Types - Kalender en Evenementen
 */

export type EventType = 'appointment' | 'meeting' | 'deadline' | 'task' | 'reminder';
export type EventStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';
export type CalendarView = 'day' | 'week' | 'month';
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  startTime: string; // ISO date string
  endTime: string;
  allDay: boolean;
  location?: string;
  assignedUserId?: string;
  customerId?: string;
  color?: string;
  recurrence: RecurrencePattern;
  reminders: number[]; // Minutes before event
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  events: Event[];
  isToday: boolean;
  isWeekend: boolean;
  isCurrentMonth: boolean;
}

export interface EventFilter {
  type?: EventType | 'all';
  status?: EventStatus | 'all';
  assignedUserId?: string | 'all';
  customerId?: string | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface EventStats {
  total: number;
  byType: Record<EventType, number>;
  byStatus: Record<EventStatus, number>;
  upcoming: number;
  overdue: number;
}
