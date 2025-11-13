/**
 * InventoryPage
 * Voorraadbeheer met 3 SKU types & categorieën
 */

import React, { useState } from 'react';
import type { User, InventoryItem, Category } from '../../types';
import { useInventory } from '../../features/inventory';
import { getStockStatus, getStatusLabel } from '../../features/inventory/services/inventoryService';

type InventoryPageProps = {
  currentUser: User;
  initialInventory: InventoryItem[];
  initialCategories: Category[];
};

export const InventoryPage: React.FC<InventoryPageProps> = ({
  currentUser,
  initialInventory,
  initialCategories,
}) => {
  const {
    filteredInventory,
    categories,
    lowStockItems,
    stats,
    searchTerm,
    selectedCategoryId,
    handleSearch,
    handleCategoryFilter,
    clearFilters,
    adjustQuantity,
    addCategory,
    deleteCategory,
  } = useInventory(initialInventory, initialCategories);

  const [selectedTab, setSelectedTab] = useState<'inventory' | 'categories'>('inventory');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  const isAdmin = currentUser.isAdmin;

  // Handle add category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      description: '',
    });

    setNewCategoryName('');
    setNewCategoryColor('#3b82f6');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Voorraadbeheer</h1>
        <p className="text-gray-600 mt-2">
          Beheer voorraad met 3 SKU types per item
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Totaal Items</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Totale Waarde</p>
          <p className="text-2xl font-bold text-gray-900">€{stats.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Lage Voorraad</p>
          <p className="text-2xl font-bold text-red-600">{stats.lowStockCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Categorieën</p>
          <p className="text-2xl font-bold text-gray-900">{stats.categoriesCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('inventory')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'inventory'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Voorraad Items ({filteredInventory.length})
            </button>
            <button
              onClick={() => setSelectedTab('categories')}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                selectedTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🏷️ Categorieën ({categories.length})
            </button>
          </nav>
        </div>

        {/* Inventory Tab */}
        {selectedTab === 'inventory' && (
          <div className="p-6">
            {/* Search & Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Zoek op naam, SKU, locatie, leverancier..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <select
                value={selectedCategoryId}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Alle Categorieën</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {(searchTerm || selectedCategoryId) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Wis Filters
                </button>
              )}
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ {lowStockItems.length} item(s) hebben lage voorraad
                </p>
              </div>
            )}

            {/* Items Table */}
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen items gevonden</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                      <th className="pb-3 font-medium">Naam</th>
                      <th className="pb-3 font-medium">SKU Leverancier</th>
                      <th className="pb-3 font-medium">SKU Auto</th>
                      <th className="pb-3 font-medium">SKU Custom</th>
                      <th className="pb-3 font-medium text-right">Voorraad</th>
                      <th className="pb-3 font-medium text-right">Prijs</th>
                      <th className="pb-3 font-medium">Status</th>
                      {isAdmin && <th className="pb-3 font-medium">Acties</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const status = getStockStatus(item);
                      const category = categories.find((c) => c.id === item.categoryId);

                      return (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {category && (
                                <span
                                  className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium text-white"
                                  style={{ backgroundColor: category.color }}
                                >
                                  {category.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-sm text-gray-600">{item.skuSupplier}</td>
                          <td className="py-3 text-sm text-gray-600">{item.skuAutomatic}</td>
                          <td className="py-3 text-sm text-gray-600">{item.skuCustom || '-'}</td>
                          <td className="py-3 text-right">
                            <span className="font-medium text-gray-900">
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-900">
                            €{item.unitPrice.toFixed(2)}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                status === 'ok'
                                  ? 'bg-green-100 text-green-800'
                                  : status === 'low'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {getStatusLabel(status)}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => adjustQuantity(item.id, 10)}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                  title="Voeg 10 toe"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => adjustQuantity(item.id, -10)}
                                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                  title="Trek 10 af"
                                >
                                  -10
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {selectedTab === 'categories' && (
          <div className="p-6">
            {/* Add Category Form (Admin Only) */}
            {isAdmin && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Nieuwe Categorie</h3>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Naam"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Toevoegen
                  </button>
                </div>
              </div>
            )}

            {/* Categories List */}
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Geen categorieën gevonden</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const itemCount = initialInventory.filter(
                    (item) => item.categoryId === category.id
                  ).length;

                  return (
                    <div
                      key={category.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg"
                            style={{ backgroundColor: category.color }}
                          />
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-600">{itemCount} items</p>
                          </div>
                        </div>
                        {isAdmin && itemCount === 0 && (
                          <button
                            onClick={() => {
                              if (confirm(`Categorie "${category.name}" verwijderen?`)) {
                                deleteCategory(category.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Verwijder
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Only Notice */}
      {!isAdmin && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ Je hebt alleen leesrechten. Contact een administrator voor wijzigingen.
          </p>
        </div>
      )}
    </div>
  );
};
