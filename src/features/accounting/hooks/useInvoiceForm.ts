/**
 * useInvoiceForm Hook
 * Invoice-specific form logic with validation
 */

import { useCallback } from 'react';
import type { Invoice, InvoiceItem, InventoryItem, User } from '../../../types';
import type { InvoiceFormData } from '../types/accounting.types';
import { useForm } from './useForm';
import { validateInvoiceForm } from '../utils/validators';
import { calculateInvoiceTotals, calculateInvoiceItemTotal } from '../utils/calculations';

const createEmptyInvoiceForm = (): InvoiceFormData => ({
  customerId: '',
  customerName: '',
  items: [],
  laborHours: 0,
  hourlyRate: 75,
  vatRate: 21,
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 days
  notes: '',
});

export const useInvoiceForm = (initialInvoice?: Invoice) => {
  // Initialize form with invoice data or empty form
  const initialData: InvoiceFormData = initialInvoice
    ? {
        customerId: initialInvoice.customerId,
        customerName: initialInvoice.customerName,
        items: initialInvoice.items,
        laborHours: initialInvoice.laborHours,
        hourlyRate: initialInvoice.hourlyRate,
        vatRate: initialInvoice.vatRate,
        date: initialInvoice.date,
        dueDate: initialInvoice.dueDate,
        notes: initialInvoice.notes || '',
      }
    : createEmptyInvoiceForm();

  const form = useForm<InvoiceFormData>(initialData, validateInvoiceForm);

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  // Add inventory item to invoice
  const handleAddInventoryItem = useCallback((inventoryItem: InventoryItem, quantity: number = 1) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      description: inventoryItem.name,
      quantity,
      unitPrice: inventoryItem.unitPrice,
      total: calculateInvoiceItemTotal(quantity, inventoryItem.unitPrice),
      inventoryItemId: inventoryItem.id,
    };

    form.setFields({
      items: [...form.formData.items, newItem],
    });
  }, [form]);

  // Add custom item (not from inventory)
  const handleAddCustomItem = useCallback((description: string, quantity: number, unitPrice: number) => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random()}`,
      description,
      quantity,
      unitPrice,
      total: calculateInvoiceItemTotal(quantity, unitPrice),
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
          total: calculateInvoiceItemTotal(quantity, item.unitPrice),
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
          total: calculateInvoiceItemTotal(item.quantity, unitPrice),
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

    const newItem: InvoiceItem = {
      id: `labor-${Date.now()}-${Math.random()}`,
      description: laborDescription,
      quantity: hours,
      unitPrice: rate,
      total: calculateInvoiceItemTotal(hours, rate),
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
    return calculateInvoiceTotals(
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
