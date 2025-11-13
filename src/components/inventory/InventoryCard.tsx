/**
 * InventoryCard Component
 * Displays a single inventory item in card format
 */

import React from 'react';
import type { InventoryItem, Category } from '../../types';
import {
  formatCurrency,
  formatQuantityWithUnit,
  formatSKUDisplay
} from '../../features/inventory/utils/formatters';
import {
  getStockStatusColor,
  getStockStatusText,
  getCategoryName,
  isLowStock
} from '../../features/inventory/utils/helpers';

interface InventoryCardProps {
  item: InventoryItem;
  categories: Category[];
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (itemId: string) => void;
  onDuplicate?: (itemId: string) => void;
  onAdjustQuantity?: (itemId: string, change: number) => void;
  readOnly?: boolean;
}

export const InventoryCard: React.FC<InventoryCardProps> = ({
  item,
  categories,
  onEdit,
  onDelete,
  onDuplicate,
  onAdjustQuantity,
  readOnly = false
}) => {
  const stockStatus = getStockStatusColor(item);
  const stockText = getStockStatusText(item);
  const categoryName = getCategoryName(item.categoryId, categories);
  const lowStock = isLowStock(item);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Header with status badge */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-500">
            SKU: {formatSKUDisplay(item.skuCustom, item.skuSupplier, item.skuAutomatic)}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            stockStatus === 'red'
              ? 'bg-red-100 text-red-800'
              : stockStatus === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {stockText}
        </span>
      </div>

      {/* Category badge */}
      {item.categoryId && (
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mb-3">
          {categoryName}
        </span>
      )}

      {/* Stock info */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Voorraad</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatQuantityWithUnit(item.quantity, item.unit)}
          </p>
          {lowStock && (
            <p className="text-xs text-yellow-600 mt-1">
              Bestel vanaf: {item.reorderLevel} {item.unit}
            </p>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Verkoopprijs</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatCurrency(item.unitPrice)}
          </p>
          {item.costPrice && (
            <p className="text-xs text-gray-500 mt-1">
              Inkoop: {formatCurrency(item.costPrice)}
            </p>
          )}
        </div>
      </div>

      {/* Location & Supplier */}
      <div className="text-xs text-gray-600 space-y-1 mb-3">
        <p>
          <span className="font-medium">Locatie:</span> {item.location}
        </p>
        {item.supplier && (
          <p>
            <span className="font-medium">Leverancier:</span> {item.supplier}
          </p>
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Bewerken
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(item.id)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              title="Dupliceer item"
            >
              📋
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Weet je zeker dat je "${item.name}" wilt verwijderen?`)) {
                  onDelete(item.id);
                }
              }}
              className="px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
              title="Verwijder item"
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Quick quantity adjustment */}
      {!readOnly && onAdjustQuantity && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onAdjustQuantity(item.id, -1)}
            className="flex-1 px-2 py-1 bg-red-50 text-red-600 text-sm rounded hover:bg-red-100 transition-colors"
            disabled={item.quantity === 0}
          >
            - 1
          </button>
          <button
            onClick={() => onAdjustQuantity(item.id, 1)}
            className="flex-1 px-2 py-1 bg-green-50 text-green-600 text-sm rounded hover:bg-green-100 transition-colors"
          >
            + 1
          </button>
        </div>
      )}
    </div>
  );
};
