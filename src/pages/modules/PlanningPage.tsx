/**
 * PlanningPage - Planning & Agenda Systeem
 * Volledige kalender met dag/week/maand views
 */

import React, { useState } from 'react';
import type { User } from '../../types';

type PlanningPageProps = {
  currentUser: User | null;
};

type ViewMode = 'month' | 'week' | 'day';

export const PlanningPage: React.FC<PlanningPageProps> = ({ currentUser }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
  const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (number | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const now = new Date();
    return day === now.getDate() && 
           currentDate.getMonth() === now.getMonth() && 
           currentDate.getFullYear() === now.getFullYear();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Planning & Agenda</h1>
          <p className="text-sm text-gray-600 mt-1">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-300 p-1">
            <button onClick={() => setViewMode('month')} className={`px-3 py-1.5 text-sm rounded transition ${viewMode === 'month' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📅 Maand</button>
            <button onClick={() => setViewMode('week')} className={`px-3 py-1.5 text-sm rounded transition ${viewMode === 'week' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📆 Week</button>
            <button onClick={() => setViewMode('day')} className={`px-3 py-1.5 text-sm rounded transition ${viewMode === 'day' ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>📋 Dag</button>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300 p-1">
            <button onClick={previousMonth} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition">◀</button>
            <button onClick={today} className="px-4 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition">Vandaag</button>
            <button onClick={nextMonth} className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition">▶</button>
          </div>

          {currentUser?.isAdmin && (
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium">➕ Nieuw Event</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((day, index) => (
            <div key={index} className={`min-h-[100px] border rounded-lg p-2 transition ${ day ? 'bg-white hover:bg-blue-50 cursor-pointer border-gray-200' : 'bg-gray-50 border-gray-100' } ${isToday(day) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
              {day && (
                <div>
                  <div className={`text-sm font-semibold ${ isToday(day) ? 'text-blue-600' : 'text-gray-900' }`}>{day}</div>
                  <div className="mt-1 space-y-1">
                    <div className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 truncate">📅 Meeting 10:00</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">🔔 Aankomende Events</h3>
          <div className="text-sm text-gray-600">
            <div className="py-2 border-b border-gray-200">
              <div className="font-medium">Team Meeting</div>
              <div className="text-xs text-gray-500">Morgen om 10:00</div>
            </div>
            <div className="py-2">
              <div className="font-medium">Project Deadline</div>
              <div className="text-xs text-gray-500">Vrijdag om 17:00</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">📊 Statistieken</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Deze maand:</span><span className="font-semibold">12 events</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Aankomend:</span><span className="font-semibold text-blue-600">5 events</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Voltooid:</span><span className="font-semibold text-green-600">7 events</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">🎯 Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">➕ Nieuw Event</button>
            <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">📋 Mijn Agenda</button>
            <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">👥 Team Agenda</button>
          </div>
        </div>
      </div>
    </div>
  );
};

