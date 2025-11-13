/**
 * Inventory Page
 * Main page for inventory management module
 */

import React, { useState } from 'react';
import { useInventory } from '../features/inventory/hooks';
import { InventoryList, InventoryForm } from '../components/inventory';
import type { InventoryItem } from '../types';
import { initialInventory, initialCategories } from '../data/initialData';

export const InventoryPage: React.FC = () => {
  const inventory = useInventory(initialInventory, initialCategories);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>();

  // Handle add new item
  const handleAddNew = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  // Handle edit item
  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle form submit
  const handleFormSubmit = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      // Update existing
      inventory.updateItem(editingItem.id, item);
    } else {
      // Add new
      inventory.addItem(item);
    }
    setShowForm(false);
    setEditingItem(undefined);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Voorraadbeheer
          </h1>
          <p className="text-gray-600">
            Beheer je voorraad, categorieën en voorraadniveaus
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Totaal Items</p>
            <p className="text-3xl font-bold text-gray-900">
              {inventory.stats.totalItems}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Totale Waarde</p>
            <p className="text-3xl font-bold text-gray-900">
              €{inventory.stats.totalValue.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Lage Voorraad</p>
            <p className="text-3xl font-bold text-yellow-600">
              {inventory.stats.lowStockCount}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Uitverkocht</p>
            <p className="text-3xl font-bold text-red-600">
              {inventory.stats.outOfStockCount}
            </p>
          </div>
        </div>

        {/* Inventory List */}
        <InventoryList
          items={inventory.filteredItems}
          categories={inventory.categories}
          filters={inventory.filters}
          onFiltersChange={inventory.setFilters}
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          onDelete={inventory.removeItem}
          onDuplicate={inventory.duplicateItem}
          onAdjustQuantity={inventory.adjustQuantity}
        />

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-2xl my-8">
              <InventoryForm
                item={editingItem}
                categories={inventory.categories}
                existingItems={inventory.items}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
