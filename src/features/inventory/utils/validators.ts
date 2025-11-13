/**
 * Inventory Validators
 * Validatie functies voor inventory formulieren
 */

import type { InventoryItem, InventoryUnit } from '../../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate inventory item data
 */
export const validateInventoryItem = (
  item: Partial<InventoryItem>
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!item.name || item.name.trim() === '') {
    errors.name = 'Naam is verplicht';
  } else if (item.name.length < 2) {
    errors.name = 'Naam moet minimaal 2 karakters zijn';
  } else if (item.name.length > 200) {
    errors.name = 'Naam mag maximaal 200 karakters zijn';
  }

  // SKU Supplier validation
  if (!item.skuSupplier || item.skuSupplier.trim() === '') {
    errors.skuSupplier = 'Leveranciers SKU is verplicht';
  }

  // Quantity validation
  if (item.quantity === undefined || item.quantity === null) {
    errors.quantity = 'Aantal is verplicht';
  } else if (item.quantity < 0) {
    errors.quantity = 'Aantal kan niet negatief zijn';
  }

  // Unit validation
  if (!item.unit) {
    errors.unit = 'Eenheid is verplicht';
  }

  // Location validation
  if (!item.location || item.location.trim() === '') {
    errors.location = 'Locatie is verplicht';
  }

  // Unit price validation
  if (item.unitPrice === undefined || item.unitPrice === null) {
    errors.unitPrice = 'Verkoopprijs is verplicht';
  } else if (item.unitPrice < 0) {
    errors.unitPrice = 'Verkoopprijs kan niet negatief zijn';
  }

  // Cost price validation (optional but must be valid if provided)
  if (item.costPrice !== undefined && item.costPrice !== null && item.costPrice < 0) {
    errors.costPrice = 'Inkoopprijs kan niet negatief zijn';
  }

  // Reorder level validation
  if (item.reorderLevel === undefined || item.reorderLevel === null) {
    errors.reorderLevel = 'Bestel drempel is verplicht';
  } else if (item.reorderLevel < 0) {
    errors.reorderLevel = 'Bestel drempel kan niet negatief zijn';
  }

  // Reorder quantity validation (optional but must be valid if provided)
  if (
    item.reorderQuantity !== undefined &&
    item.reorderQuantity !== null &&
    item.reorderQuantity < 0
  ) {
    errors.reorderQuantity = 'Bestel hoeveelheid kan niet negatief zijn';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate SKU uniqueness
 */
export const validateSKUUniqueness = (
  sku: string,
  skuType: 'supplier' | 'custom',
  existingItems: InventoryItem[],
  excludeItemId?: string
): boolean => {
  return !existingItems.some(item => {
    if (excludeItemId && item.id === excludeItemId) return false;

    if (skuType === 'supplier') {
      return item.skuSupplier === sku;
    } else {
      return item.skuCustom === sku;
    }
  });
};

/**
 * Validate category assignment
 */
export const validateCategoryExists = (
  categoryId: string | undefined,
  categories: { id: string }[]
): boolean => {
  if (!categoryId) return true; // Optional field
  return categories.some(cat => cat.id === categoryId);
};

/**
 * Validate unit type
 */
export const isValidUnit = (unit: string): unit is InventoryUnit => {
  const validUnits: InventoryUnit[] = ['stuk', 'meter', 'kg', 'liter', 'm²', 'doos'];
  return validUnits.includes(unit as InventoryUnit);
};
