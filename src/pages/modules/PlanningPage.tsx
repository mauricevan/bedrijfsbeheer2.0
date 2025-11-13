/**
 * PlanningPage - Planning & Agenda
 * Kalender, afspraken en planning
 */

import React from 'react';
import type { User } from '../../types';

type PlanningPageProps = {
  currentUser: User | null;
};

export const PlanningPage: React.FC<PlanningPageProps> = ({ currentUser }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📅 Planning & Agenda</h1>
        <p className="text-gray-600">Kalender, afspraken en planning</p>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <span className="text-6xl mb-4 block">📅</span>
        <h2 className="text-2xl font-bold mb-2">Kalender Module</h2>
        <p className="text-gray-600 mb-4">
          Volledige kalender met dag/week/maand views, evenementen en medewerker toewijzing
        </p>
        <p className="text-sm text-gray-500">Module wordt binnenkort toegevoegd</p>
      </div>
    </div>
  );
};
