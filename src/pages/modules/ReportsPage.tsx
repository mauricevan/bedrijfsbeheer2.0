/**
 * ReportsPage - Rapportages & Analyse
 * Dashboards, grafieken en business intelligence
 */

import React, { useState } from 'react';
import type { User, WorkOrder, Invoice, Quote } from '../../types';

type ReportsPageProps = {
  currentUser: User | null;
  workOrders: WorkOrder[];
  invoices: Invoice[];
  quotes: Quote[];
};

type ReportType = 'sales' | 'inventory' | 'quotes' | 'workorders';

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentUser, workOrders, invoices, quotes }) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('sales');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  const salesTotal = invoices.reduce((sum, inv) => sum + inv.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
  const quotesTotal = quotes.reduce((sum, q) => sum + q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
  const completedOrders = workOrders.filter(w => w.status === 'completed').length;
  const conversionRate = quotes.length > 0 ? ((invoices.length / quotes.length) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📊 Rapportages & Analyse</h1>
          <p className="text-sm text-gray-600 mt-1">Business intelligence en data analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={timeframe} onChange={e => setTimeframe(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="week">Deze Week</option>
            <option value="month">Deze Maand</option>
            <option value="year">Dit Jaar</option>
          </select>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">📥 Export PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="text-sm text-gray-600">💰 Totale Omzet</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">€{salesTotal.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">↑ +12.5% vs vorige maand</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="text-sm text-gray-600">📝 Offertes Waarde</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">€{quotesTotal.toLocaleString()}</div>
          <div className="text-xs text-blue-600 mt-1">{quotes.length} actieve offertes</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="text-sm text-gray-600">✅ Werkorders Voltooid</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{completedOrders}</div>
          <div className="text-xs text-gray-600 mt-1">van {workOrders.length} totaal</div>
        </div>
        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          <div className="text-sm text-gray-600">🎯 Conversie Ratio</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{conversionRate}%</div>
          <div className="text-xs text-green-600 mt-1">Offerte → Factuur</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['sales', 'inventory', 'quotes', 'workorders'] as ReportType[]).map(type => (
          <button key={type} onClick={() => setSelectedReport(type)} className={`p-4 rounded-lg border-2 transition ${selectedReport === type ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-300'}`}>
            <div className="text-2xl mb-2">{type === 'sales' ? '💰' : type === 'inventory' ? '📦' : type === 'quotes' ? '📝' : '🔧'}</div>
            <div className="font-semibold text-gray-900">{type === 'sales' ? 'Verkoop' : type === 'inventory' ? 'Voorraad' : type === 'quotes' ? 'Offertes' : 'Werkorders'}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 {selectedReport === 'sales' ? 'Verkoop Analyse' : selectedReport === 'inventory' ? 'Voorraad Analyse' : selectedReport === 'quotes' ? 'Offerte Conversies' : 'Werkorder Statistieken'}</h2>
        
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-600 font-medium">Grafiek Visualisatie</p>
            <p className="text-sm text-gray-500 mt-2">Chart.js of Recharts integratie komt hier</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">🏆 Top Klanten</h3>
          <div className="space-y-3">
            {invoices.slice(0, 5).map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div>
                  <div className="font-medium text-gray-900">{invoice.customerName}</div>
                  <div className="text-xs text-gray-500">{invoice.items.length} facturen</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">€{invoice.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-300 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">📦 Voorraad Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Lage voorraad items</span>
              <span className="font-semibold text-orange-600">12 items</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Uit voorraad</span>
              <span className="font-semibold text-red-600">3 items</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Optimaal voorraad</span>
              <span className="font-semibold text-green-600">45 items</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Totale voorraad waarde</span>
              <span className="font-semibold text-gray-900">€24,580</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

