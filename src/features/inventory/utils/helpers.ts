/**
 * Inventory Helpers
 * Helper functies voor inventory module
 */

import type { InventoryItem, Category } from '../../../types';

/**
 * Get category name by ID
 */
export const getCategoryName = (
  categoryId: string | undefined,
  categories: Category[]
): string => {
  if (!categoryId) return 'Geen categorie';
  const category = categories.find(c => c.id === categoryId);
  return category?.name || 'Onbekende categorie';
};

/**
 * Get category color by ID
 */
export const getCategoryColor = (
  categoryId: string | undefined,
  categories: Category[]
): string => {
  if (!categoryId) return '#9CA3AF'; // gray-400
  const category = categories.find(c => c.id === categoryId);
  return category?.color || '#9CA3AF';
};

/**
 * Check if inventory item is low on stock
 */
export const isLowStock = (item: InventoryItem): boolean => {
  return item.quantity <= item.reorderLevel;
};

/**
 * Get stock status badge color
 */
export const getStockStatusColor = (item: InventoryItem): string => {
  if (item.quantity === 0) return 'red';
  if (item.quantity <= item.reorderLevel) return 'yellow';
  return 'green';
};

/**
 * Get stock status text
 */
export const getStockStatusText = (item: InventoryItem): string => {
  if (item.quantity === 0) return 'Uitverkocht';
  if (item.quantity <= item.reorderLevel) return 'Lage voorraad';
  return 'Op voorraad';
};

/**
 * Calculate profit margin percentage
 */
export const calculateProfitMargin = (item: InventoryItem): number | null => {
  if (!item.costPrice || item.costPrice === 0) return null;
  return ((item.unitPrice - item.costPrice) / item.costPrice) * 100;
};

/**
 * Generate next automatic SKU
 */
export const generateNextSKU = (existingItems: InventoryItem[]): string => {
  const existingSKUs = existingItems
    .map(item => item.skuAutomatic)
    .filter(sku => sku && sku.startsWith('INV-'))
    .map(sku => parseInt(sku.replace('INV-', ''), 10))
    .filter(num => !isNaN(num));

  const maxNumber = existingSKUs.length > 0 ? Math.max(...existingSKUs) : 0;
  const nextNumber = maxNumber + 1;

  return `INV-${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Get inventory value (quantity * cost price)
 */
export const getInventoryValue = (item: InventoryItem): number => {
  return item.quantity * (item.costPrice || 0);
};

/**
 * Get total inventory value for all items
 */
export const getTotalInventoryValue = (items: InventoryItem[]): number => {
  return items.reduce((total, item) => total + getInventoryValue(item), 0);
};

/**
 * Sort inventory items by name (ascending)
 */
export const sortByName = (items: InventoryItem[]): InventoryItem[] => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Sort inventory items by quantity (descending)
 */
export const sortByQuantity = (items: InventoryItem[]): InventoryItem[] => {
  return [...items].sort((a, b) => b.quantity - a.quantity);
};

/**
 * Sort inventory items by low stock first
 */
export const sortByLowStock = (items: InventoryItem[]): InventoryItem[] => {
  return [...items].sort((a, b) => {
    const aRatio = a.quantity / a.reorderLevel;
    const bRatio = b.quantity / b.reorderLevel;
    return aRatio - bRatio;
  });
};
