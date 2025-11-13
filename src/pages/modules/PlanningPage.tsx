/**
 * PlanningPage - Planning & Agenda module
 * Kalender voor werkorders, meetings, vakantie en overige evenementen
 */

import React, { useState } from 'react';
import type { User, Customer, Event, EventType } from '../../types';
import { usePlanning, CalendarView } from '../../features/planning';

type PlanningPageProps = {
  currentUser: User;
  users: User[];
  customers: Customer[];
  initialEvents?: Event[];
};

export const PlanningPage: React.FC<PlanningPageProps> = ({
  currentUser,
  users,
  customers,
  initialEvents = [],
}) => {
  const {
    events: _events,
    currentDate,
    view,
    setView,
    selectedUserId,
    setSelectedUserId,
    showEventModal,
    selectedEvent,
    openEventModal,
    closeEventModal,
    goToToday,
    goToPrevious,
    goToNext,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDay,
    getEventColor,
    getEventTypeLabel,
    formatDateDisplay,
  } = usePlanning(initialEvents, currentUser.id);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('workorder');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventAllDay, setEventAllDay] = useState(false);
  const [eventAssignedTo, setEventAssignedTo] = useState<string[]>([]);
  const [eventCustomerId, setEventCustomerId] = useState<string>('');

  // Reset form
  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventType('workorder');
    setEventStartDate('');
    setEventEndDate('');
    setEventAllDay(false);
    setEventAssignedTo([]);
    setEventCustomerId('');
  };

  // Handle event form submit
  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTitle || !eventStartDate || !eventEndDate) {
      alert('Titel, start datum en eind datum zijn verplicht');
      return;
    }

    if (eventAssignedTo.length === 0) {
      alert('Wijs minimaal één medewerker toe');
      return;
    }

    if (selectedEvent) {
      // Update existing event
      updateEvent(selectedEvent.id, {
        title: eventTitle,
        description: eventDescription,
        type: eventType,
        startDate: eventStartDate,
        endDate: eventEndDate,
        allDay: eventAllDay,
        assignedTo: eventAssignedTo,
        customerId: eventCustomerId || undefined,
      });
    } else {
      // Create new event
      createEvent({
        title: eventTitle,
        description: eventDescription,
        type: eventType,
        startDate: eventStartDate,
        endDate: eventEndDate,
        allDay: eventAllDay,
        assignedTo: eventAssignedTo,
        customerId: eventCustomerId || undefined,
      });
    }

    closeEventModal();
    resetForm();
  };

  // Handle opening modal for new event
  const handleNewEvent = () => {
    resetForm();
    // Set default to today
    const today = new Date().toISOString().slice(0, 16);
    setEventStartDate(today);
    setEventEndDate(today);
    openEventModal();
  };

  // Handle opening modal for editing event
  const handleEditEvent = (event: Event) => {
    setEventTitle(event.title);
    setEventDescription(event.description || '');
    setEventType(event.type);
    setEventStartDate(event.startDate);
    setEventEndDate(event.endDate);
    setEventAllDay(event.allDay);
    setEventAssignedTo(event.assignedTo || []);
    setEventCustomerId(event.customerId || '');
    openEventModal(event);
  };

  // Get days in month view
  const getMonthDays = (): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from previous Monday
    const startDay = new Date(firstDay);
    startDay.setDate(startDay.getDate() - ((startDay.getDay() + 6) % 7));

    // End on next Sunday
    const endDay = new Date(lastDay);
    endDay.setDate(endDay.getDate() + (7 - endDay.getDay()) % 7);

    const days: Date[] = [];
    const current = new Date(startDay);

    while (current <= endDay) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  // Get week days
  const getWeekDays = (): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7)); // Monday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  // Render month view
  const renderMonthView = () => {
    const days = getMonthDays();
    const currentMonth = currentDate.getMonth();

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2 text-sm">
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday =
            day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`min-h-[100px] border border-gray-200 p-2 ${
                !isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div
                className={`text-sm font-medium mb-1 ${
                  isToday
                    ? 'text-blue-600 font-bold'
                    : isCurrentMonth
                    ? 'text-gray-900'
                    : 'text-gray-400'
                }`}
              >
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEditEvent(event)}
                    className={`w-full text-left text-xs px-1 py-0.5 rounded border truncate ${getEventColor(
                      event.type
                    )}`}
                    title={event.title}
                  >
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 3} meer
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const days = getWeekDays();

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div key={index} className="min-h-[400px] border border-gray-200 rounded-lg overflow-hidden">
              <div
                className={`p-2 text-center border-b border-gray-200 ${
                  isToday ? 'bg-blue-600 text-white' : 'bg-gray-50'
                }`}
              >
                <div className="text-xs">
                  {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">{day.getDate()}</div>
              </div>
              <div className="p-2 space-y-2">
                {dayEvents.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Geen afspraken</p>
                ) : (
                  dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => handleEditEvent(event)}
                      className={`w-full text-left text-xs px-2 py-1.5 rounded border ${getEventColor(
                        event.type
                      )}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-75">
                        {new Date(event.startDate).toLocaleTimeString('nl-NL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className={`p-4 border-b border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
          <h3 className="text-lg font-bold">
            {currentDate.toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
        </div>
        <div className="p-4">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Geen afspraken voor vandaag</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => handleEditEvent(event)}
                  className={`w-full text-left p-4 rounded-lg border-2 ${getEventColor(
                    event.type
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{event.title}</h4>
                    <span className="text-xs">{getEventTypeLabel(event.type)}</span>
                  </div>
                  {event.description && (
                    <p className="text-sm mb-2">{event.description}</p>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Tijd:</span>{' '}
                    {new Date(event.startDate).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(event.endDate).toLocaleTimeString('nl-NL', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {event.assignedTo && event.assignedTo.length > 0 && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Medewerkers:</span>{' '}
                      {event.assignedTo
                        .map((userId) => users.find((u) => u.id === userId)?.name || 'Onbekend')
                        .join(', ')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Planning & Agenda</h1>
        <p className="text-gray-600 mt-2">
          Kalender voor werkorders, meetings en andere evenementen
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* View toggle */}
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as CalendarView[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {v === 'day' ? 'Dag' : v === 'week' ? 'Week' : 'Maand'}
              </button>
            ))}
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevious}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ◀ Vorige
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Vandaag
            </button>
            <button
              onClick={goToNext}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              Volgende ▶
            </button>
          </div>

          {/* User filter (admin only) */}
          {currentUser.isAdmin && (
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alle medewerkers</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}

          {/* New event button */}
          <button
            onClick={handleNewEvent}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            + Nieuw Evenement
          </button>
        </div>

        {/* Current date display */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {formatDateDisplay(currentDate)}
          </h2>
        </div>
      </div>

      {/* Calendar view */}
      <div className="bg-white rounded-lg shadow p-4">
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">
                  {selectedEvent ? 'Evenement Bewerken' : 'Nieuw Evenement'}
                </h2>
                <button
                  onClick={closeEventModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEventSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titel *
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="workorder">🔧 Werkorder</option>
                    <option value="meeting">🤝 Meeting</option>
                    <option value="vacation">🏖️ Vakantie</option>
                    <option value="other">📅 Overig</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beschrijving
                  </label>
                  <textarea
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Datum & Tijd *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eind Datum & Tijd *
                  </label>
                  <input
                    type="datetime-local"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* All Day */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={eventAllDay}
                    onChange={(e) => setEventAllDay(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                    Hele dag evenement
                  </label>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medewerkers *
                  </label>
                  <select
                    multiple
                    value={eventAssignedTo}
                    onChange={(e) =>
                      setEventAssignedTo(
                        Array.from(e.target.selectedOptions, (option) => option.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Houd Ctrl/Cmd ingedrukt om meerdere te selecteren
                  </p>
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Klant (optioneel)
                  </label>
                  <select
                    value={eventCustomerId}
                    onChange={(e) => setEventCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Geen klant</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.company ? `- ${customer.company}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    {selectedEvent ? 'Opslaan' : 'Aanmaken'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEventModal}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                  >
                    Annuleren
                  </button>
                  {selectedEvent && currentUser.isAdmin && (
                    <button
                      type="button"
                      onClick={() => deleteEvent(selectedEvent.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Verwijderen
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
