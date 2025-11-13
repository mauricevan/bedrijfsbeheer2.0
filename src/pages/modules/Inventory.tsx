import React, { useState, useMemo } from 'react';
import type { User, InventoryItem, Category } from '../../types/index';

interface InventoryProps {
  currentUser: User;
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

/**
 * Inventory Management Component - Voorraadbeheer
 *
 * Features:
 * - 3 SKU types (Leverancier, Automatisch, Aangepast)
 * - Categorieën met kleuren
 * - Zoeken & filteren
 * - Low stock warnings
 * - Add/Edit/Delete (admin only)
 */

export const Inventory: React.FC<InventoryProps> = ({
  currentUser,
  inventory,
  setInventory,
  categories,
  setCategories,
}) => {
  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // ============================================================================
  // FILTERED & SORTED DATA
  // ============================================================================

  const filteredInventory = useMemo(() => {
    let filtered = inventory;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.skuSupplier.toLowerCase().includes(term) ||
        item.skuAutomatic.toLowerCase().includes(term) ||
        (item.skuCustom && item.skuCustom.toLowerCase().includes(term)) ||
        (item.location && item.location.toLowerCase().includes(term)) ||
        (item.supplier && item.supplier.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory, searchTerm, selectedCategory]);

  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.quantity <= item.reorderLevel);
  }, [inventory]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddItem = (newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen items toevoegen');
      return;
    }

    const id = `inv-${inventory.length + 1}`;
    const now = new Date().toISOString();

    setInventory(prev => [...prev, {
      ...newItem,
      id,
      createdAt: now,
      updatedAt: now,
    }]);

    setShowAddModal(false);
  };

  const handleEditItem = (id: string, updates: Partial<InventoryItem>) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen items bewerken');
      return;
    }

    setInventory(prev => prev.map(item =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date().toISOString() }
        : item
    ));

    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen items verwijderen');
      return;
    }

    if (!confirm('Weet je zeker dat je dit item wilt verwijderen?')) {
      return;
    }

    setInventory(prev => prev.filter(item => item.id !== id));
  };

  const handleQuickAdjust = (id: string, adjustment: number) => {
    if (!currentUser.isAdmin) {
      alert('Alleen admins kunnen voorraad aanpassen');
      return;
    }

    setInventory(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            quantity: Math.max(0, item.quantity + adjustment),
            updatedAt: new Date().toISOString()
          }
        : item
    ));
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voorraadbeheer</h1>
          <p className="text-gray-600 mt-1">{inventory.length} items in voorraad</p>
        </div>

        {currentUser.isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-sky-600 text-white px-6 py-3 rounded-lg hover:bg-sky-700 transition-colors font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            Nieuw Item
          </button>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Lage Voorraad Waarschuwing</h3>
              <p className="text-yellow-700 text-sm">
                {lowStockItems.length} item(s) hebben lage voorraad en moeten mogelijk bijbesteld worden
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoeken
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Zoek op naam, SKU, locatie, leverancier..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorie
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="all">Alle Categorieën</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {searchTerm || selectedCategory !== 'all' ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {filteredInventory.length} resultaten gevonden
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              Wis filters
            </button>
          </div>
        ) : null}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU Leverancier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU Auto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voorraad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locatie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prijs
                </th>
                {currentUser.isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    Geen items gevonden
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const category = categories.find(c => c.id === item.categoryId);
                  const isLowStock = item.quantity <= item.reorderLevel;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-gray-50 ${isLowStock ? 'bg-yellow-50' : ''}`}
                      onDoubleClick={() => currentUser.isAdmin && setEditingItem(item)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          {category && (
                            <span
                              className="inline-block mt-1 px-2 py-1 text-xs rounded-full text-white"
                              style={{ backgroundColor: category.color }}
                            >
                              {category.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.skuSupplier}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.skuAutomatic}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isLowStock ? 'text-yellow-700' : 'text-gray-900'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          {isLowStock && <span className="text-yellow-500">⚠️</span>}
                        </div>
                        {currentUser.isAdmin && (
                          <div className="flex gap-1 mt-2">
                            <button
                              onClick={() => handleQuickAdjust(item.id, -10)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            >
                              -10
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(item.id, 10)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              +10
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        €{item.unitPrice.toFixed(2)}
                      </td>
                      {currentUser.isAdmin && (
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="text-sky-600 hover:text-sky-900 mr-3"
                          >
                            Bewerk
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Verwijder
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals would go here - simplified for now */}
      {showAddModal && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Nieuw Item Toevoegen</h2>
            <p className="text-gray-600 mb-4">
              Formulier voor nieuw item (wordt verder uitgewerkt)
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && currentUser.isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Item Bewerken</h2>
            <p className="text-gray-600 mb-4">
              Bewerken: {editingItem.name}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
