/**
 * useQuoteForm Hook
 * Quote-specific form logic with validation
 */

import { useCallback } from 'react';
import type { Quote, QuoteItem, InventoryItem, User } from '../../../types';
import type { QuoteFormData } from '../types/accounting.types';
import { useForm } from './useForm';
import { validateQuoteForm } from '../utils/validators';
import { calculateQuoteTotals, calculateQuoteItemTotal } from '../utils/calculations';

const createEmptyQuoteForm = (): QuoteFormData => ({
  customerId: '',
  customerName: '',
  items: [],
  laborHours: 0,
  hourlyRate: 75,
  vatRate: 21,
  notes: '',
  validUntil: '',
  createdBy: '',
});

export const useQuoteForm = (initialQuote?: Quote) => {
  // Initialize form with quote data or empty form
  const initialData: QuoteFormData = initialQuote
    ? {
        customerId: initialQuote.customerId,
        customerName: initialQuote.customerName,
        items: initialQuote.items,
        laborHours: initialQuote.laborHours,
        hourlyRate: initialQuote.hourlyRate,
        vatRate: initialQuote.vatRate,
        notes: initialQuote.notes || '',
        validUntil: initialQuote.validUntil,
        createdBy: initialQuote.createdBy,
      }
    : createEmptyQuoteForm();

  const form = useForm<QuoteFormData>(initialData, validateQuoteForm);

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  // Add inventory item to quote
  const handleAddInventoryItem = useCallback((inventoryItem: InventoryItem, quantity: number = 1) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      description: inventoryItem.name,
      quantity,
      unitPrice: inventoryItem.price,
      total: calculateQuoteItemTotal(quantity, inventoryItem.price),
      inventoryItemId: inventoryItem.id,
    };

    form.setFields({
      items: [...form.formData.items, newItem],
    });
  }, [form]);

  // Add custom item (not from inventory)
  const handleAddCustomItem = useCallback((description: string, quantity: number, unitPrice: number) => {
    const newItem: QuoteItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      description,
      quantity,
      unitPrice,
      total: calculateQuoteItemTotal(quantity, unitPrice),
    };

    form.setFields({
      items: [...form.formData.items, newItem],
    });
  }, [form]);

  // Update item quantity
  const handleUpdateItemQuantity = useCallback((itemId: string, quantity: number) => {
    const updatedItems = form.formData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity,
          total: calculateQuoteItemTotal(quantity, item.unitPrice),
        };
      }
      return item;
    });

    form.setFields({ items: updatedItems });
  }, [form]);

  // Update item price
  const handleUpdateItemPrice = useCallback((itemId: string, unitPrice: number) => {
    const updatedItems = form.formData.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          unitPrice,
          total: calculateQuoteItemTotal(item.quantity, unitPrice),
        };
      }
      return item;
    });

    form.setFields({ items: updatedItems });
  }, [form]);

  // Remove item
  const handleRemoveItem = useCallback((itemId: string) => {
    const updatedItems = form.formData.items.filter(item => item.id !== itemId);
    form.setFields({ items: updatedItems });
  }, [form]);

  // ============================================================================
  // LABOR MANAGEMENT
  // ============================================================================

  const handleAddLabor = useCallback((employee: User, hours: number, rate: number) => {
    const laborDescription = `Arbeid: ${employee.name} (${hours}u @ €${rate}/u)`;

    const newItem: QuoteItem = {
      id: `labor-${Date.now()}-${Math.random()}`,
      description: laborDescription,
      quantity: hours,
      unitPrice: rate,
      total: calculateQuoteItemTotal(hours, rate),
    };

    form.setFields({
      items: [...form.formData.items, newItem],
      laborHours: form.formData.laborHours + hours,
      hourlyRate: rate,
    });
  }, [form]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const calculateTotals = useCallback(() => {
    return calculateQuoteTotals(
      form.formData.items,
      form.formData.laborHours,
      form.formData.hourlyRate,
      form.formData.vatRate
    );
  }, [form.formData]);

  return {
    ...form,
    handleAddInventoryItem,
    handleAddCustomItem,
    handleUpdateItemQuantity,
    handleUpdateItemPrice,
    handleRemoveItem,
    handleAddLabor,
    calculateTotals,
  };
};
