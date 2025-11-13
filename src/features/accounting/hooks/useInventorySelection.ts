/**
 * useInventorySelection Hook
 * Inventory search and filter logic for quote/invoice forms
 */

import { useState, useMemo, useCallback } from 'react';
import type { InventoryItem } from '../../../types';

export const useInventorySelection = (inventory: InventoryItem[]) => {
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<string>('all');
  const [inventoryCategorySearchTerm, setInventoryCategorySearchTerm] = useState('');
  const [showInventoryCategoryDropdown, setShowInventoryCategoryDropdown] = useState(false);

  // Get unique categories
  const allCategories = useMemo(() => {
    const categoriesSet = new Set<string>();
    inventory.forEach(item => {
      if (item.category) {
        categoriesSet.add(item.category);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [inventory]);

  // Filtered categories for dropdown (based on search)
  const filteredInventoryCategories = useMemo(() => {
    if (inventoryCategorySearchTerm.trim() === '') {
      return allCategories;
    }

    const searchLower = inventoryCategorySearchTerm.toLowerCase();
    return allCategories.filter(cat => cat.toLowerCase().includes(searchLower));
  }, [allCategories, inventoryCategorySearchTerm]);

  // Filtered inventory for selection
  const filteredInventoryForSelection = useMemo(() => {
    let filtered = [...inventory];

    // Filter by category
    if (inventoryCategoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === inventoryCategoryFilter);
    }

    // Filter by search term
    if (inventorySearchTerm.trim() !== '') {
      const searchLower = inventorySearchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.sku && item.sku.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [inventory, inventoryCategoryFilter, inventorySearchTerm]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setInventorySearchTerm('');
    setInventoryCategoryFilter('all');
    setInventoryCategorySearchTerm('');
  }, []);

  return {
    inventorySearchTerm,
    setInventorySearchTerm,
    inventoryCategoryFilter,
    setInventoryCategoryFilter,
    inventoryCategorySearchTerm,
    setInventoryCategorySearchTerm,
    showInventoryCategoryDropdown,
    setShowInventoryCategoryDropdown,
    allCategories,
    filteredInventoryCategories,
    filteredInventoryForSelection,
    resetFilters,
  };
};
