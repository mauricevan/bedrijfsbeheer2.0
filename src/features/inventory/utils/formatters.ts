/**
 * Inventory Formatters
 * Format functies voor inventory weergave
 */

import type { InventoryUnit } from '../../../types';

/**
 * Format currency (€)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format number with thousands separator
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('nl-NL').format(value);
};

/**
 * Format unit label (singular/plural)
 */
export const formatUnit = (_quantity: number, unit: InventoryUnit): string => {
  // Most units stay the same in Dutch
  return unit;
};

/**
 * Format quantity with unit
 */
export const formatQuantityWithUnit = (
  quantity: number,
  unit: InventoryUnit
): string => {
  return `${formatNumber(quantity)} ${formatUnit(quantity, unit)}`;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Format SKU display (show custom > supplier > automatic)
 */
export const formatSKUDisplay = (
  skuCustom?: string,
  skuSupplier?: string,
  skuAutomatic?: string
): string => {
  return skuCustom || skuSupplier || skuAutomatic || 'N/A';
};

/**
 * Format date to Dutch format
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

/**
 * Format datetime to Dutch format
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
