/**
 * useInventory Hook
 * Business logic voor Inventory module
 */

import { useState, useCallback, useMemo } from 'react';
import type { InventoryItem, Category } from '../../../types';

export const useInventory = (
  initialInventory: InventoryItem[],
  initialCategories: Category[]
) => {
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filtered inventory based on search and category
  const filteredInventory = useMemo(() => {
    let result = inventory;

    // Filter by search term (zoek in alle velden)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.skuSupplier.toLowerCase().includes(term) ||
          item.skuAutomatic.toLowerCase().includes(term) ||
          (item.skuCustom && item.skuCustom.toLowerCase().includes(term)) ||
          (item.location && item.location.toLowerCase().includes(term)) ||
          (item.supplier && item.supplier.toLowerCase().includes(term))
      );
    }

    // Filter by category
    if (selectedCategoryId) {
      result = result.filter((item) => item.categoryId === selectedCategoryId);
    }

    return result;
  }, [inventory, searchTerm, selectedCategoryId]);

  // Low stock items (bij of onder reorder level)
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= item.reorderLevel);
  }, [inventory]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      lowStockCount: lowStockItems.length,
      categoriesCount: categories.length,
    };
  }, [inventory, lowStockItems, categories]);

  // ============================================================================
  // INVENTORY CRUD
  // ============================================================================

  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setInventory((prev) => [...prev, newItem]);
    return newItem;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    setInventory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Quick adjust quantity (+10/-10)
  const adjustQuantity = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  // ============================================================================
  // CATEGORY CRUD
  // ============================================================================

  const addCategory = useCallback((category: Omit<Category, 'id' | 'createdAt'>) => {
    const newCategory: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    // Check if category is in use
    const inUse = inventory.some((item) => item.categoryId === id);
    if (inUse) {
      return {
        success: false,
        error: 'Categorie is in gebruik en kan niet verwijderd worden',
      };
    }
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    return { success: true };
  }, [inventory]);

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategoryId('');
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    inventory,
    filteredInventory,
    categories,
    lowStockItems,
    stats,

    // Search & Filter
    searchTerm,
    selectedCategoryId,
    handleSearch,
    handleCategoryFilter,
    clearFilters,

    // Inventory CRUD
    addItem,
    updateItem,
    deleteItem,
    adjustQuantity,

    // Category CRUD
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
