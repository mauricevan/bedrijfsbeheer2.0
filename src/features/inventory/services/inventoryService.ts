/**
 * Inventory Service
 * Pure functions voor inventory berekeningen
 */

import type { InventoryItem } from '../../../types';

/**
 * Generate automatic SKU
 * Format: INV-0001, INV-0002, etc.
 */
export const generateAutomaticSKU = (existingItems: InventoryItem[]): string => {
  const maxNumber = existingItems.reduce((max, item) => {
    const match = item.skuAutomatic.match(/INV-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return Math.max(max, num);
    }
    return max;
  }, 0);

  const nextNumber = maxNumber + 1;
  return `INV-${nextNumber.toString().padStart(4, '0')}`;
};

/**
 * Calculate inventory value
 */
export const calculateInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
};

/**
 * Calculate cost value (inkoopwaarde)
 */
export const calculateCostValue = (items: InventoryItem[]): number => {
  return items.reduce((sum, item) => {
    const cost = item.costPrice || item.unitPrice;
    return sum + item.quantity * cost;
  }, 0);
};

/**
 * Get stock status
 */
export const getStockStatus = (
  item: InventoryItem
): 'ok' | 'low' | 'out' => {
  if (item.quantity === 0) return 'out';
  if (item.quantity <= item.reorderLevel) return 'low';
  return 'ok';
};

/**
 * Get status color
 */
export const getStatusColor = (status: 'ok' | 'low' | 'out'): string => {
  switch (status) {
    case 'ok':
      return 'green';
    case 'low':
      return 'yellow';
    case 'out':
      return 'red';
  }
};

/**
 * Get status label
 */
export const getStatusLabel = (status: 'ok' | 'low' | 'out'): string => {
  switch (status) {
    case 'ok':
      return 'Op Voorraad';
    case 'low':
      return 'Laag';
    case 'out':
      return 'Niet Op Voorraad';
  }
};
