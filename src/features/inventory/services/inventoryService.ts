/**
 * Inventory Service
 * Business logic voor inventory operations (pure functions)
 */

import type { InventoryItem, Category } from '../../../types';
import { generateNextSKU } from '../utils/helpers';

/**
 * Create new inventory item
 */
export const createInventoryItem = (
  newItem: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingItems: InventoryItem[]
): InventoryItem => {
  const now = new Date().toISOString();

  // Generate automatic SKU if not provided
  const skuAutomatic = newItem.skuAutomatic || generateNextSKU(existingItems);

  const item: InventoryItem = {
    ...newItem,
    id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    skuAutomatic,
    createdAt: now,
    updatedAt: now
  };

  return item;
};

/**
 * Update existing inventory item
 */
export const updateInventoryItem = (
  itemId: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'createdAt'>>,
  existingItems: InventoryItem[]
): InventoryItem[] => {
  return existingItems.map(item =>
    item.id === itemId
      ? {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      : item
  );
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = (
  itemId: string,
  existingItems: InventoryItem[]
): InventoryItem[] => {
  return existingItems.filter(item => item.id !== itemId);
};

/**
 * Update inventory quantity (add/subtract)
 */
export const updateInventoryQuantity = (
  itemId: string,
  quantityChange: number,
  existingItems: InventoryItem[]
): InventoryItem[] => {
  return existingItems.map(item =>
    item.id === itemId
      ? {
          ...item,
          quantity: Math.max(0, item.quantity + quantityChange), // Don't allow negative
          updatedAt: new Date().toISOString()
        }
      : item
  );
};

/**
 * Batch update quantities (for POS sales or WorkOrder completion)
 */
export const batchUpdateQuantities = (
  updates: Array<{ itemId: string; quantityChange: number }>,
  existingItems: InventoryItem[]
): InventoryItem[] => {
  let updatedItems = [...existingItems];

  for (const update of updates) {
    updatedItems = updateInventoryQuantity(
      update.itemId,
      update.quantityChange,
      updatedItems
    );
  }

  return updatedItems;
};

/**
 * Create new category
 */
export const createCategory = (
  newCategory: Omit<Category, 'id' | 'createdAt'>
): Category => {
  const category: Category = {
    ...newCategory,
    id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  return category;
};

/**
 * Update category
 */
export const updateCategory = (
  categoryId: string,
  updates: Partial<Omit<Category, 'id' | 'createdAt'>>,
  existingCategories: Category[]
): Category[] => {
  return existingCategories.map(cat =>
    cat.id === categoryId ? { ...cat, ...updates } : cat
  );
};

/**
 * Delete category (and optionally reassign items)
 */
export const deleteCategory = (
  categoryId: string,
  existingCategories: Category[],
  existingItems: InventoryItem[],
  reassignToCategoryId?: string
): { categories: Category[]; items: InventoryItem[] } => {
  const categories = existingCategories.filter(cat => cat.id !== categoryId);

  // Reassign or remove category from items
  const items = existingItems.map(item => {
    if (item.categoryId === categoryId) {
      return {
        ...item,
        categoryId: reassignToCategoryId || undefined,
        updatedAt: new Date().toISOString()
      };
    }
    return item;
  });

  return { categories, items };
};

/**
 * Duplicate inventory item
 */
export const duplicateInventoryItem = (
  itemId: string,
  existingItems: InventoryItem[]
): InventoryItem | null => {
  const originalItem = existingItems.find(item => item.id === itemId);
  if (!originalItem) return null;

  const now = new Date().toISOString();

  const duplicatedItem: InventoryItem = {
    ...originalItem,
    id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${originalItem.name} (Kopie)`,
    skuAutomatic: generateNextSKU(existingItems),
    skuSupplier: `${originalItem.skuSupplier}-COPY`,
    skuCustom: originalItem.skuCustom
      ? `${originalItem.skuCustom}-COPY`
      : undefined,
    quantity: 0, // Start with 0 quantity
    createdAt: now,
    updatedAt: now
  };

  return duplicatedItem;
};

/**
 * Import inventory items from CSV data
 */
export interface CSVInventoryItem {
  name: string;
  skuSupplier: string;
  quantity: number;
  unit: string;
  location: string;
  unitPrice: number;
  costPrice?: number;
  reorderLevel: number;
  categoryId?: string;
  supplier?: string;
}

export const importInventoryItems = (
  csvData: CSVInventoryItem[],
  existingItems: InventoryItem[]
): InventoryItem[] => {
  const importedItems: InventoryItem[] = [];

  for (const data of csvData) {
    const now = new Date().toISOString();

    const item: InventoryItem = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      skuSupplier: data.skuSupplier,
      skuAutomatic: generateNextSKU([...existingItems, ...importedItems]),
      skuCustom: undefined,
      quantity: data.quantity,
      unit: data.unit as any, // Type assertion
      location: data.location,
      unitPrice: data.unitPrice,
      costPrice: data.costPrice,
      reorderLevel: data.reorderLevel,
      reorderQuantity: undefined,
      categoryId: data.categoryId,
      supplier: data.supplier,
      posAlertNote: undefined,
      createdAt: now,
      updatedAt: now
    };

    importedItems.push(item);
  }

  return importedItems;
};

/**
 * Get inventory statistics
 */
export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoriesCount: number;
}

export const calculateInventoryStats = (
  items: InventoryItem[],
  categories: Category[]
): InventoryStats => {
  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * (item.costPrice || 0),
    0
  );

  const lowStockCount = items.filter(
    item => item.quantity > 0 && item.quantity <= item.reorderLevel
  ).length;

  const outOfStockCount = items.filter(item => item.quantity === 0).length;

  return {
    totalItems: items.length,
    totalValue,
    lowStockCount,
    outOfStockCount,
    categoriesCount: categories.length
  };
};
