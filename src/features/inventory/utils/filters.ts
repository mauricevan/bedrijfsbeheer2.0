/**
 * Inventory Filters
 * Filter functies voor inventory lijsten
 */

import type { InventoryItem, Category } from '../../../types';
import { isLowStock } from './helpers';

export interface InventoryFilterOptions {
  search?: string;
  categoryId?: string;
  stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  sortBy?: 'name' | 'quantity' | 'price' | 'low_stock';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter inventory items based on search term
 */
export const filterBySearch = (
  items: InventoryItem[],
  searchTerm: string
): InventoryItem[] => {
  if (!searchTerm || searchTerm.trim() === '') return items;

  const term = searchTerm.toLowerCase().trim();

  return items.filter(
    item =>
      item.name.toLowerCase().includes(term) ||
      item.skuSupplier.toLowerCase().includes(term) ||
      item.skuAutomatic.toLowerCase().includes(term) ||
      (item.skuCustom && item.skuCustom.toLowerCase().includes(term)) ||
      (item.supplier && item.supplier.toLowerCase().includes(term)) ||
      (item.location && item.location.toLowerCase().includes(term))
  );
};

/**
 * Filter inventory items by category
 */
export const filterByCategory = (
  items: InventoryItem[],
  categoryId: string
): InventoryItem[] => {
  if (!categoryId || categoryId === 'all') return items;
  return items.filter(item => item.categoryId === categoryId);
};

/**
 * Filter inventory items by stock status
 */
export const filterByStockStatus = (
  items: InventoryItem[],
  status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
): InventoryItem[] => {
  if (status === 'all') return items;

  switch (status) {
    case 'out_of_stock':
      return items.filter(item => item.quantity === 0);
    case 'low_stock':
      return items.filter(item => isLowStock(item) && item.quantity > 0);
    case 'in_stock':
      return items.filter(item => item.quantity > item.reorderLevel);
    default:
      return items;
  }
};

/**
 * Sort inventory items
 */
export const sortInventoryItems = (
  items: InventoryItem[],
  sortBy: 'name' | 'quantity' | 'price' | 'low_stock',
  sortOrder: 'asc' | 'desc' = 'asc'
): InventoryItem[] => {
  const sorted = [...items].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'quantity':
        comparison = a.quantity - b.quantity;
        break;
      case 'price':
        comparison = a.unitPrice - b.unitPrice;
        break;
      case 'low_stock':
        const aRatio = a.quantity / a.reorderLevel;
        const bRatio = b.quantity / b.reorderLevel;
        comparison = aRatio - bRatio;
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  return sorted;
};

/**
 * Apply all filters and sorting
 */
export const filterInventoryItems = (
  items: InventoryItem[],
  options: InventoryFilterOptions
): InventoryItem[] => {
  let filtered = [...items];

  // Apply search filter
  if (options.search) {
    filtered = filterBySearch(filtered, options.search);
  }

  // Apply category filter
  if (options.categoryId) {
    filtered = filterByCategory(filtered, options.categoryId);
  }

  // Apply stock status filter
  if (options.stockStatus) {
    filtered = filterByStockStatus(filtered, options.stockStatus);
  }

  // Apply sorting
  if (options.sortBy) {
    filtered = sortInventoryItems(
      filtered,
      options.sortBy,
      options.sortOrder || 'asc'
    );
  }

  return filtered;
};

/**
 * Get low stock items
 */
export const getLowStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(isLowStock);
};

/**
 * Get out of stock items
 */
export const getOutOfStockItems = (items: InventoryItem[]): InventoryItem[] => {
  return items.filter(item => item.quantity === 0);
};

/**
 * Get items by category with counts
 */
export const getItemsByCategory = (
  items: InventoryItem[],
  categories: Category[]
): Array<{ category: Category; count: number; items: InventoryItem[] }> => {
  return categories.map(category => ({
    category,
    count: items.filter(item => item.categoryId === category.id).length,
    items: items.filter(item => item.categoryId === category.id)
  }));
};
