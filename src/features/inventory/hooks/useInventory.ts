/**
 * useInventory Hook
 * State management voor inventory module
 */

import { useState, useMemo, useCallback } from 'react';
import type { InventoryItem, Category } from '../../../types';
import {
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryQuantity,
  batchUpdateQuantities,
  duplicateInventoryItem,
  calculateInventoryStats,
  createCategory,
  updateCategory,
  deleteCategory
} from '../services/inventoryService';
import {
  filterInventoryItems,
  type InventoryFilterOptions,
  getLowStockItems,
  getOutOfStockItems
} from '../utils/filters';

export interface UseInventoryReturn {
  // State
  items: InventoryItem[];
  categories: Category[];
  filteredItems: InventoryItem[];
  lowStockItems: InventoryItem[];
  outOfStockItems: InventoryItem[];
  stats: ReturnType<typeof calculateInventoryStats>;

  // Filter state
  filters: InventoryFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<InventoryFilterOptions>>;

  // Item operations
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (itemId: string, updates: Partial<InventoryItem>) => void;
  removeItem: (itemId: string) => void;
  duplicateItem: (itemId: string) => void;
  adjustQuantity: (itemId: string, quantityChange: number) => void;
  batchAdjustQuantities: (
    updates: Array<{ itemId: string; quantityChange: number }>
  ) => void;

  // Category operations
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
  updateCategoryData: (categoryId: string, updates: Partial<Category>) => void;
  removeCategory: (categoryId: string, reassignToCategoryId?: string) => void;
}

export const useInventory = (
  initialItems: InventoryItem[],
  initialCategories: Category[]
): UseInventoryReturn => {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [filters, setFilters] = useState<InventoryFilterOptions>({});

  // Filtered items based on current filters
  const filteredItems = useMemo(() => {
    return filterInventoryItems(items, filters);
  }, [items, filters]);

  // Low stock items
  const lowStockItems = useMemo(() => {
    return getLowStockItems(items);
  }, [items]);

  // Out of stock items
  const outOfStockItems = useMemo(() => {
    return getOutOfStockItems(items);
  }, [items]);

  // Statistics
  const stats = useMemo(() => {
    return calculateInventoryStats(items, categories);
  }, [items, categories]);

  // Add new item
  const addItem = useCallback(
    (newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const item = createInventoryItem(newItem, items);
      setItems(prev => [...prev, item]);
    },
    [items]
  );

  // Update existing item
  const updateItem = useCallback(
    (itemId: string, updates: Partial<InventoryItem>) => {
      setItems(prev => updateInventoryItem(itemId, updates, prev));
    },
    []
  );

  // Remove item
  const removeItem = useCallback((itemId: string) => {
    setItems(prev => deleteInventoryItem(itemId, prev));
  }, []);

  // Duplicate item
  const duplicateItem = useCallback(
    (itemId: string) => {
      const duplicated = duplicateInventoryItem(itemId, items);
      if (duplicated) {
        setItems(prev => [...prev, duplicated]);
      }
    },
    [items]
  );

  // Adjust quantity
  const adjustQuantity = useCallback(
    (itemId: string, quantityChange: number) => {
      setItems(prev => updateInventoryQuantity(itemId, quantityChange, prev));
    },
    []
  );

  // Batch adjust quantities
  const batchAdjustQuantities = useCallback(
    (updates: Array<{ itemId: string; quantityChange: number }>) => {
      setItems(prev => batchUpdateQuantities(updates, prev));
    },
    []
  );

  // Add new category
  const addCategory = useCallback(
    (newCategory: Omit<Category, 'id' | 'createdAt'>) => {
      const category = createCategory(newCategory);
      setCategories(prev => [...prev, category]);
    },
    []
  );

  // Update category
  const updateCategoryData = useCallback(
    (categoryId: string, updates: Partial<Category>) => {
      setCategories(prev => updateCategory(categoryId, updates, prev));
    },
    []
  );

  // Remove category
  const removeCategory = useCallback(
    (categoryId: string, reassignToCategoryId?: string) => {
      const result = deleteCategory(categoryId, categories, items, reassignToCategoryId);
      setCategories(result.categories);
      setItems(result.items);
    },
    [categories, items]
  );

  return {
    // State
    items,
    categories,
    filteredItems,
    lowStockItems,
    outOfStockItems,
    stats,

    // Filter state
    filters,
    setFilters,

    // Item operations
    addItem,
    updateItem,
    removeItem,
    duplicateItem,
    adjustQuantity,
    batchAdjustQuantities,

    // Category operations
    addCategory,
    updateCategoryData,
    removeCategory
  };
};
