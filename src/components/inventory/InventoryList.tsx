/**
 * InventoryList Component
 * Displays grid of inventory items with filters
 */

import React, { useState } from 'react';
import type { InventoryItem, Category } from '../../types';
import type { InventoryFilterOptions } from '../../features/inventory/utils/filters';
import { InventoryCard } from './InventoryCard';

interface InventoryListProps {
  items: InventoryItem[];
  categories: Category[];
  filters: InventoryFilterOptions;
  onFiltersChange: (filters: InventoryFilterOptions) => void;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (itemId: string) => void;
  onDuplicate?: (itemId: string) => void;
  onAdjustQuantity?: (itemId: string, change: number) => void;
  onAddNew?: () => void;
  readOnly?: boolean;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  categories,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustQuantity,
  onAddNew,
  readOnly = false
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onFiltersChange({ ...filters, search: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      categoryId: value === 'all' ? undefined : value
    });
  };

  const handleStockStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as any;
    onFiltersChange({
      ...filters,
      stockStatus: value === 'all' ? undefined : value
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as any;
    onFiltersChange({
      ...filters,
      sortBy: value === 'none' ? undefined : value
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Zoek op naam, SKU, leverancier..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Add button */}
          {!readOnly && onAddNew && (
            <button
              onClick={onAddNew}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Nieuw Item
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Category filter */}
          <select
            value={filters.categoryId || 'all'}
            onChange={handleCategoryChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle categorieën</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Stock status filter */}
          <select
            value={filters.stockStatus || 'all'}
            onChange={handleStockStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Alle voorraad statussen</option>
            <option value="in_stock">Op voorraad</option>
            <option value="low_stock">Lage voorraad</option>
            <option value="out_of_stock">Uitverkocht</option>
          </select>

          {/* Sort */}
          <select
            value={filters.sortBy || 'none'}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="none">Sorteren op...</option>
            <option value="name">Naam (A-Z)</option>
            <option value="quantity">Aantal (hoog-laag)</option>
            <option value="price">Prijs (hoog-laag)</option>
            <option value="low_stock">Lage voorraad eerst</option>
          </select>
        </div>

        {/* Results count */}
        <div className="mt-3 text-sm text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'} gevonden
        </div>
      </div>

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <p className="text-lg mb-2">Geen items gevonden</p>
          <p className="text-sm">Pas je filters aan of voeg een nieuw item toe</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => (
            <InventoryCard
              key={item.id}
              item={item}
              categories={categories}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onAdjustQuantity={onAdjustQuantity}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};
