import React, { useState, useMemo } from 'react';
import type { User } from '../../types';
import type { Employee } from './HRMPage';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EventType = 'workorder' | 'meeting' | 'vacation' | 'other';
export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  startDate: string; // ISO datetime
  endDate: string; // ISO datetime
  allDay: boolean;
  employeeIds: string[];
  customerId?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface PlanningPageProps {
  currentUser: User | null;
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  employees: Employee[];
  customers: { id: string; name: string }[];
}

interface EventFormData {
  title: string;
  description: string;
  type: EventType;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  employeeIds: string[];
  customerId: string;
  location: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PlanningPage: React.FC<PlanningPageProps> = ({
  currentUser,
  events,
  setEvents,
  employees,
  customers,
}) => {
  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // View and navigation state
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Modal and form state
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form data
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'other',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    allDay: false,
    employeeIds: [],
    customerId: '',
    location: '',
  });

  // ==========================================================================
  // COMPUTED DATA
  // ==========================================================================

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      const eventStartDay = new Date(eventStart);
      eventStartDay.setHours(0, 0, 0, 0);

      const eventEndDay = new Date(eventEnd);
      eventEndDay.setHours(0, 0, 0, 0);

      return checkDate >= eventStartDay && checkDate <= eventEndDay;
    });
  };

  // Get events for current view
  const currentViewEvents = useMemo(() => {
    if (view === 'day') {
      return getEventsForDate(currentDate);
    } else if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEvents: CalendarEvent[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        weekEvents.push(...getEventsForDate(date));
      }
      return Array.from(new Set(weekEvents.map(e => e.id))).map(id =>
        weekEvents.find(e => e.id === id)!
      );
    } else {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      const monthEvents: CalendarEvent[] = [];

      for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
        monthEvents.push(...getEventsForDate(new Date(d)));
      }

      return Array.from(new Set(monthEvents.map(e => e.id))).map(id =>
        monthEvents.find(e => e.id === id)!
      );
    }
  }, [events, currentDate, view]);

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const getWeekDays = (date: Date): Date[] => {
    const weekStart = getWeekStart(date);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);

    const startDate = getWeekStart(firstDay);
    const days: Date[] = [];

    let currentDay = new Date(startDate);
    // Get 6 weeks to cover all possible month layouts
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const getEventColor = (type: EventType): string => {
    switch (type) {
      case 'workorder':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'meeting':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'vacation':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'other':
        return 'bg-gray-100 border-gray-300 text-gray-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getEventIcon = (type: EventType): string => {
    switch (type) {
      case 'workorder':
        return '🔧';
      case 'meeting':
        return '👥';
      case 'vacation':
        return '🏖️';
      case 'other':
        return '📌';
      default:
        return '📌';
    }
  };

  const getEventTypeLabel = (type: EventType): string => {
    switch (type) {
      case 'workorder':
        return 'Werkorder';
      case 'meeting':
        return 'Vergadering';
      case 'vacation':
        return 'Vakantie';
      case 'other':
        return 'Overig';
      default:
        return 'Overig';
    }
  };

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (view !== 'day') {
      setCurrentDate(date);
      setView('day');
    } else {
      // Open new event form with this date
      const dateStr = date.toISOString().split('T')[0];
      setFormData({
        title: '',
        description: '',
        type: 'other',
        startDate: dateStr,
        startTime: '09:00',
        endDate: dateStr,
        endTime: '10:00',
        allDay: false,
        employeeIds: [],
        customerId: '',
        location: '',
      });
      setEditingEvent(null);
      setShowEventForm(true);
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const handleNewEvent = () => {
    const dateStr = currentDate.toISOString().split('T')[0];
    setFormData({
      title: '',
      description: '',
      type: 'other',
      startDate: dateStr,
      startTime: '09:00',
      endDate: dateStr,
      endTime: '10:00',
      allDay: false,
      employeeIds: [],
      customerId: '',
      location: '',
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    setFormData({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: startDate.toISOString().split('T')[0],
      startTime: event.allDay ? '09:00' : formatTime(startDate),
      endDate: endDate.toISOString().split('T')[0],
      endTime: event.allDay ? '10:00' : formatTime(endDate),
      allDay: event.allDay,
      employeeIds: event.employeeIds,
      customerId: event.customerId || '',
      location: event.location || '',
    });
    setEditingEvent(event);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Weet je zeker dat je deze afspraak wilt verwijderen?')) {
      setEvents(events.filter((e) => e.id !== eventId));
      setSelectedEvent(null);
    }
  };

  const handleSubmitEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Titel is verplicht');
      return;
    }

    const startDateTime = formData.allDay
      ? new Date(`${formData.startDate}T00:00:00`)
      : new Date(`${formData.startDate}T${formData.startTime}`);

    const endDateTime = formData.allDay
      ? new Date(`${formData.endDate}T23:59:59`)
      : new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime < startDateTime) {
      alert('Einddatum moet na startdatum liggen');
      return;
    }

    const now = new Date().toISOString();

    if (editingEvent) {
      // Update existing event
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                title: formData.title,
                description: formData.description,
                type: formData.type,
                startDate: startDateTime.toISOString(),
                endDate: endDateTime.toISOString(),
                allDay: formData.allDay,
                employeeIds: formData.employeeIds,
                customerId: formData.customerId || undefined,
                location: formData.location || undefined,
                updatedAt: now,
              }
            : event
        )
      );
    } else {
      // Create new event
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        allDay: formData.allDay,
        employeeIds: formData.employeeIds,
        customerId: formData.customerId || undefined,
        location: formData.location || undefined,
        createdBy: currentUser?.id || 'unknown',
        createdAt: now,
        updatedAt: now,
      };
      setEvents([...events, newEvent]);
    }

    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleFormChange = (
    field: keyof EventFormData,
    value: string | boolean | string[]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleEmployeeAssignment = (employeeId: string) => {
    const currentIds = formData.employeeIds;
    if (currentIds.includes(employeeId)) {
      handleFormChange(
        'employeeIds',
        currentIds.filter((id) => id !== employeeId)
      );
    } else {
      handleFormChange('employeeIds', [...currentIds, employeeId]);
    }
  };

  // ==========================================================================
  // RENDER HELPERS
  // ==========================================================================

  const renderEventCard = (event: CalendarEvent, compact: boolean = false) => {
    const assignedEmployees = employees.filter((emp) =>
      event.employeeIds.includes(emp.id)
    );
    const customer = customers.find((c) => c.id === event.customerId);

    return (
      <div
        key={event.id}
        onClick={(e) => handleEventClick(event, e)}
        className={`${getEventColor(
          event.type
        )} border-l-4 rounded px-2 py-1 mb-1 cursor-pointer hover:shadow-md transition-shadow text-xs ${
          compact ? 'truncate' : ''
        }`}
      >
        <div className="flex items-center gap-1">
          <span>{getEventIcon(event.type)}</span>
          <span className="font-semibold truncate">{event.title}</span>
        </div>
        {!compact && (
          <>
            {!event.allDay && (
              <div className="text-xs opacity-75 mt-1">
                {formatTime(new Date(event.startDate))} -{' '}
                {formatTime(new Date(event.endDate))}
              </div>
            )}
            {assignedEmployees.length > 0 && (
              <div className="text-xs opacity-75 mt-1">
                👤 {assignedEmployees.map((e) => e.name).join(', ')}
              </div>
            )}
            {customer && (
              <div className="text-xs opacity-75 mt-1">🏢 {customer.name}</div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(currentDate).sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-semibold text-lg">
            {currentDate.toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h3>
        </div>
        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
          <div className="p-4">
            {/* All-day events */}
            {dayEvents.filter((e) => e.allDay).length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="font-semibold text-sm mb-2">Hele dag</div>
                {dayEvents
                  .filter((e) => e.allDay)
                  .map((event) => renderEventCard(event, false))}
              </div>
            )}

            {/* Hourly timeline */}
            <div className="space-y-2">
              {hours.map((hour) => {
                const hourEvents = dayEvents.filter((event) => {
                  if (event.allDay) return false;
                  const eventStart = new Date(event.startDate);
                  const eventEnd = new Date(event.endDate);
                  const hourStart = new Date(currentDate);
                  hourStart.setHours(hour, 0, 0, 0);
                  const hourEnd = new Date(currentDate);
                  hourEnd.setHours(hour, 59, 59, 999);
                  return eventStart <= hourEnd && eventEnd >= hourStart;
                });

                return (
                  <div key={hour} className="flex gap-2">
                    <div className="w-16 text-sm text-gray-600 font-mono">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 border-t border-gray-200 pt-1">
                      {hourEvents.map((event) => renderEventCard(event, false))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 border-b">
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-r last:border-r-0 ${
                isToday(day) ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <div className="text-xs text-gray-600">
                {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isToday(day) ? 'text-blue-600' : ''
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 overflow-auto" style={{ maxHeight: '550px' }}>
          {weekDays.map((day) => {
            const dayEvents = getEventsForDate(day).sort(
              (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`border-r last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 min-h-[400px] ${
                  isToday(day) ? 'bg-blue-50' : ''
                }`}
              >
                {dayEvents.map((event) => renderEventCard(event, true))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);
    const currentMonth = currentDate.getMonth();

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50">
          {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
            <div key={day} className="p-2 text-center font-semibold text-sm border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((day, _index) => {
            const dayEvents = getEventsForDate(day).sort(
              (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            );
            const isCurrentMonth = day.getMonth() === currentMonth;

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`border-r border-b last:border-r-0 p-2 cursor-pointer hover:bg-gray-50 min-h-[100px] ${
                  !isCurrentMonth ? 'bg-gray-50 opacity-50' : ''
                } ${isToday(day) ? 'bg-blue-50' : ''}`}
              >
                <div
                  className={`text-sm font-semibold mb-1 ${
                    isToday(day) ? 'text-blue-600' : isCurrentMonth ? '' : 'text-gray-400'
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => renderEventCard(event, true))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 font-semibold">
                      +{dayEvents.length - 3} meer
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventFormModal = () => {
    if (!showEventForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">
              {editingEvent ? 'Afspraak bewerken' : 'Nieuwe afspraak'}
            </h2>
          </div>

          <form onSubmit={handleSubmitEvent} className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Titel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Beschrijving</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value as EventType)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="workorder">🔧 Werkorder</option>
                <option value="meeting">👥 Vergadering</option>
                <option value="vacation">🏖️ Vakantie</option>
                <option value="other">📌 Overig</option>
              </select>
            </div>

            {/* All Day Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => handleFormChange('allDay', e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="allDay" className="text-sm font-medium">
                Hele dag
              </label>
            </div>

            {/* Start Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Startdatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleFormChange('startDate', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium mb-1">Starttijd</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleFormChange('startTime', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>

            {/* End Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Einddatum <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleFormChange('endDate', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium mb-1">Eindtijd</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleFormChange('endTime', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
            </div>

            {/* Employee Assignment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Toegewezen medewerkers
              </label>
              <div className="border rounded p-3 max-h-40 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-sm text-gray-500">Geen medewerkers beschikbaar</p>
                ) : (
                  employees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id={`emp-${employee.id}`}
                        checked={formData.employeeIds.includes(employee.id)}
                        onChange={() => toggleEmployeeAssignment(employee.id)}
                        className="w-4 h-4"
                      />
                      <label htmlFor={`emp-${employee.id}`} className="text-sm">
                        {employee.name} - {employee.role}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Customer */}
            <div>
              <label className="block text-sm font-medium mb-1">Klant (optioneel)</label>
              <select
                value={formData.customerId}
                onChange={(e) => handleFormChange('customerId', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Geen klant</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">Locatie (optioneel)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="bijv. Vergaderruimte A, Kantoor klant"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowEventForm(false);
                  setEditingEvent(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingEvent ? 'Opslaan' : 'Toevoegen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEventDetailModal = () => {
    if (!selectedEvent) return null;

    const assignedEmployees = employees.filter((emp) =>
      selectedEvent.employeeIds.includes(emp.id)
    );
    const customer = customers.find((c) => c.id === selectedEvent.customerId);
    const canDelete = currentUser?.role === 'admin';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className={`p-6 border-b ${getEventColor(selectedEvent.type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getEventIcon(selectedEvent.type)}</span>
                <div>
                  <h2 className="text-2xl font-bold">{selectedEvent.title}</h2>
                  <p className="text-sm opacity-75 mt-1">
                    {getEventTypeLabel(selectedEvent.type)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Description */}
            {selectedEvent.description && (
              <div>
                <h3 className="font-semibold mb-1">Beschrijving</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Date and Time */}
            <div>
              <h3 className="font-semibold mb-1">Datum en tijd</h3>
              {selectedEvent.allDay ? (
                <p className="text-gray-700">
                  📅 {formatDate(new Date(selectedEvent.startDate))}
                  {!isSameDay(
                    new Date(selectedEvent.startDate),
                    new Date(selectedEvent.endDate)
                  ) && ` - ${formatDate(new Date(selectedEvent.endDate))}`}
                  <span className="ml-2 text-sm text-gray-500">(Hele dag)</span>
                </p>
              ) : (
                <p className="text-gray-700">
                  📅 {formatDateTime(selectedEvent.startDate)} -{' '}
                  {formatDateTime(selectedEvent.endDate)}
                </p>
              )}
            </div>

            {/* Assigned Employees */}
            {assignedEmployees.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1">Toegewezen medewerkers</h3>
                <div className="space-y-1">
                  {assignedEmployees.map((emp) => (
                    <div key={emp.id} className="text-gray-700">
                      👤 {emp.name} - {emp.role}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customer */}
            {customer && (
              <div>
                <h3 className="font-semibold mb-1">Klant</h3>
                <p className="text-gray-700">🏢 {customer.name}</p>
              </div>
            )}

            {/* Location */}
            {selectedEvent.location && (
              <div>
                <h3 className="font-semibold mb-1">Locatie</h3>
                <p className="text-gray-700">📍 {selectedEvent.location}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t text-xs text-gray-500">
              <p>Aangemaakt: {formatDateTime(selectedEvent.createdAt)}</p>
              <p>Laatst bijgewerkt: {formatDateTime(selectedEvent.updatedAt)}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Sluiten
              </button>
              <button
                onClick={() => handleEditEvent(selectedEvent)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Bewerken
              </button>
              {canDelete && (
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Verwijderen
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  const getViewTitle = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } else if (view === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `Week ${weekStart.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
      })} - ${weekEnd.toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}`;
    } else {
      return currentDate.toLocaleDateString('nl-NL', {
        month: 'long',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Planning & Agenda</h1>
          <p className="text-gray-600 mt-1">
            Beheer afspraken, werkorders en vakanties
          </p>
        </div>
        <button
          onClick={handleNewEvent}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Nieuwe afspraak</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          {/* View Selector */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded ${
                view === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Dag
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Maand
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="px-3 py-2 border rounded hover:bg-gray-50"
            >
              ‹ Vorige
            </button>
            <button
              onClick={handleToday}
              className="px-4 py-2 border rounded hover:bg-gray-50 font-semibold"
            >
              Vandaag
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-2 border rounded hover:bg-gray-50"
            >
              Volgende ›
            </button>
          </div>

          {/* Current View Title */}
          <div className="text-lg font-semibold text-gray-700 min-w-[200px] text-right">
            {getViewTitle()}
          </div>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Totaal afspraken</div>
          <div className="text-2xl font-bold mt-1">{currentViewEvents.length}</div>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <div className="text-sm text-blue-600">🔧 Werkorders</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {currentViewEvents.filter((e) => e.type === 'workorder').length}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <div className="text-sm text-green-600">👥 Vergaderingen</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {currentViewEvents.filter((e) => e.type === 'meeting').length}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg shadow p-4">
          <div className="text-sm text-purple-600">🏖️ Vakanties</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">
            {currentViewEvents.filter((e) => e.type === 'vacation').length}
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'day' && renderDayView()}
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      {/* Modals */}
      {renderEventFormModal()}
      {renderEventDetailModal()}
    </div>
  );
};

export default PlanningPage;
