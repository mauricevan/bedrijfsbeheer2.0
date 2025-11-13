/**
 * usePlanning Hook
 * Business logic voor Planning & Agenda module
 */

import { useState, useCallback, useMemo } from 'react';
import type { Event, EventType } from '../../../types';

export type CalendarView = 'day' | 'week' | 'month';

export const usePlanning = (
  initialEvents: Event[],
  currentUserId: string
) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getEventColor = useCallback((type: EventType): string => {
    const colors: Record<EventType, string> = {
      workorder: 'bg-blue-100 text-blue-700 border-blue-300',
      meeting: 'bg-green-100 text-green-700 border-green-300',
      vacation: 'bg-purple-100 text-purple-700 border-purple-300',
      other: 'bg-gray-100 text-gray-700 border-gray-300',
    };
    return colors[type] || colors.other;
  }, []);

  const getEventTypeLabel = useCallback((type: EventType): string => {
    const labels: Record<EventType, string> = {
      workorder: '🔧 Werkorder',
      meeting: '🤝 Meeting',
      vacation: '🏖️ Vakantie',
      other: '📅 Overig',
    };
    return labels[type] || labels.other;
  }, []);

  // ============================================================================
  // DATE NAVIGATION
  // ============================================================================

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      return newDate;
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  }, [view]);

  // ============================================================================
  // FILTERING
  // ============================================================================

  const filteredEvents = useMemo(() => {
    let result = events;

    // Filter by selected user
    if (selectedUserId) {
      result = result.filter((event) =>
        event.assignedTo?.includes(selectedUserId)
      );
    }

    return result;
  }, [events, selectedUserId]);

  // Get events for specific date range
  const getEventsForDateRange = useCallback(
    (startDate: Date, endDate: Date): Event[] => {
      return filteredEvents.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);

        // Check if event overlaps with date range
        return eventStart <= endDate && eventEnd >= startDate;
      });
    },
    [filteredEvents]
  );

  // Get events for a specific day
  const getEventsForDay = useCallback(
    (date: Date): Event[] => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return getEventsForDateRange(startOfDay, endOfDay);
    },
    [getEventsForDateRange]
  );

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const createEvent = useCallback(
    (eventData: Omit<Event, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>) => {
      const newEvent: Event = {
        ...eventData,
        id: `event-${Date.now()}`,
        createdBy: currentUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    },
    [currentUserId]
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<Event>) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, ...updates, updatedAt: new Date().toISOString() }
            : event
        )
      );
    },
    []
  );

  const deleteEvent = useCallback((eventId: string) => {
    if (confirm('Weet je zeker dat je dit evenement wilt verwijderen?')) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSelectedEvent(null);
      setShowEventModal(false);
    }
  }, []);

  // ============================================================================
  // MODAL HANDLERS
  // ============================================================================

  const openEventModal = useCallback((event?: Event) => {
    if (event) {
      setSelectedEvent(event);
    } else {
      setSelectedEvent(null);
    }
    setShowEventModal(true);
  }, []);

  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  // ============================================================================
  // DATE FORMATTING
  // ============================================================================

  const formatDateDisplay = useCallback((date: Date): string => {
    if (view === 'day') {
      return date.toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } else if (view === 'week') {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

      return `${startOfWeek.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      })} - ${endOfWeek.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    } else {
      return date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
      });
    }
  }, [view]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Events
    events: filteredEvents,
    allEvents: events,

    // Date & View
    currentDate,
    view,
    setView,

    // User filter
    selectedUserId,
    setSelectedUserId,

    // Modal
    showEventModal,
    selectedEvent,
    openEventModal,
    closeEventModal,

    // Navigation
    goToToday,
    goToPrevious,
    goToNext,

    // CRUD
    createEvent,
    updateEvent,
    deleteEvent,

    // Helpers
    getEventsForDay,
    getEventsForDateRange,
    getEventColor,
    getEventTypeLabel,
    formatDateDisplay,
  };
};
