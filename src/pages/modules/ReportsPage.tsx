/**
 * ReportsPage - Rapportages & Analyse
 * Dashboards en rapportages
 */

import React from 'react';
import type { User, WorkOrder, Invoice, Quote } from '../../types';

type ReportsPageProps = {
  currentUser: User | null;
  workOrders: WorkOrder[];
  invoices: Invoice[];
  quotes: Quote[];
};

export const ReportsPage: React.FC<ReportsPageProps> = ({
  currentUser,
  workOrders,
  invoices,
  quotes,
}) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">📊 Rapportages & Analyse</h1>
        <p className="text-gray-600">Dashboards en business intelligence</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Werkorders</div>
          <div className="text-2xl font-bold text-gray-900">{workOrders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Facturen</div>
          <div className="text-2xl font-bold text-gray-900">{invoices.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Offertes</div>
          <div className="text-2xl font-bold text-gray-900">{quotes.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <span className="text-6xl mb-4 block">📈</span>
        <h2 className="text-2xl font-bold mb-2">Uitgebreide Rapportages</h2>
        <p className="text-gray-600 mb-4">
          Verkoop rapportages, voorraad analyses, offerte conversies en werkorder statistieken
        </p>
        <p className="text-sm text-gray-500">Module wordt binnenkort toegevoegd</p>
      </div>
    </div>
  );
};
