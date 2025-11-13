/**
 * POSPage - Point of Sale / Kassasysteem
 * Verkopen en kassa beheer
 */

import React, { useMemo } from 'react';
import type { User, InventoryItem } from '../../types';

type POSPageProps = {
  currentUser: User | null;
  inventory: InventoryItem[];
};

export const POSPage: React.FC<POSPageProps> = ({ currentUser, inventory }) => {
  const stats = useMemo(() => ({
    totalProducts: inventory.length,
    lowStock: inventory.filter(i => i.quantity <= i.reorderLevel).length,
  }), [inventory]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">💵 POS - Kassasysteem</h1>
        <p className="text-gray-600">Verkopen en kassa beheer</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Beschikbare Producten</div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lage Voorraad</div>
          <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
        </div>
      </div>

      {/* POS Interface Placeholder */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <span className="text-6xl mb-4 block">🛒</span>
        <h2 className="text-2xl font-bold mb-2">POS Interface</h2>
        <p className="text-gray-600 mb-4">Kassasysteem met productenraster en winkelwagen</p>
        <p className="text-sm text-gray-500">Module wordt binnenkort toegevoegd</p>
      </div>
    </div>
  );
};
