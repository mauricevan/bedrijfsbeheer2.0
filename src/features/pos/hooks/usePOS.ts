/**
 * usePOS Hook
 * Business logic voor Kassasysteem (Point of Sale)
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  InventoryItem,
  CartItem,
  Sale,
  PaymentMethod,
  Customer,
  Invoice,
} from '../../../types';

const VAT_RATE = 21; // BTW percentage (21%)

export const usePOS = (
  inventory: InventoryItem[],
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>,
  customers: Customer[],
  invoices: Invoice[],
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>,
  currentUserId: string
) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pin');
  const [sales, setSales] = useState<Sale[]>([]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const vatAmount = subtotal * (VAT_RATE / 100);
    const total = subtotal + vatAmount;

    return { subtotal, vatAmount, total };
  }, [cart]);

  const availableInventory = useMemo(() => {
    // Only show items with stock > 0
    return inventory.filter((item) => item.quantity > 0);
  }, [inventory]);

  // ============================================================================
  // CART MANAGEMENT
  // ============================================================================

  const addToCart = useCallback(
    (item: InventoryItem, quantity: number = 1) => {
      // Check if item has enough stock
      if (item.quantity < quantity) {
        alert(`Onvoldoende voorraad! Beschikbaar: ${item.quantity} ${item.unit}`);
        return false;
      }

      // Check if item already in cart
      const existingItem = cart.find((ci) => ci.inventoryItemId === item.id);

      if (existingItem) {
        // Update quantity if item already in cart
        const newQuantity = existingItem.quantity + quantity;
        if (item.quantity < newQuantity) {
          alert(`Onvoldoende voorraad! Beschikbaar: ${item.quantity} ${item.unit}`);
          return false;
        }
        updateCartItemQuantity(item.id, newQuantity);
      } else {
        // Add new item to cart
        const cartItem: CartItem = {
          inventoryItemId: item.id,
          inventoryItem: item,
          quantity,
          unitPrice: item.unitPrice,
          total: item.unitPrice * quantity,
        };
        setCart((prev) => [...prev, cartItem]);
      }

      return true;
    },
    [cart]
  );

  const removeFromCart = useCallback((inventoryItemId: string) => {
    setCart((prev) => prev.filter((item) => item.inventoryItemId !== inventoryItemId));
  }, []);

  const updateCartItemQuantity = useCallback(
    (inventoryItemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(inventoryItemId);
        return;
      }

      setCart((prev) =>
        prev.map((item) => {
          if (item.inventoryItemId === inventoryItemId) {
            // Check stock availability
            if (item.inventoryItem.quantity < newQuantity) {
              alert(
                `Onvoldoende voorraad! Beschikbaar: ${item.inventoryItem.quantity} ${item.inventoryItem.unit}`
              );
              return item;
            }

            return {
              ...item,
              quantity: newQuantity,
              total: item.unitPrice * newQuantity,
            };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    if (cart.length === 0) return;

    if (confirm('Weet je zeker dat je de winkelwagen wilt legen?')) {
      setCart([]);
      setSelectedCustomerId(null);
    }
  }, [cart]);

  // ============================================================================
  // SALE PROCESSING
  // ============================================================================

  const completeSale = useCallback(() => {
    if (cart.length === 0) {
      alert('Winkelwagen is leeg');
      return null;
    }

    // Verify stock availability one more time before completing
    for (const cartItem of cart) {
      const inventoryItem = inventory.find((i) => i.id === cartItem.inventoryItemId);
      if (!inventoryItem || inventoryItem.quantity < cartItem.quantity) {
        alert(
          `Product "${cartItem.inventoryItem.name}" heeft onvoldoende voorraad. Verwijder het uit de winkelwagen of pas de hoeveelheid aan.`
        );
        return null;
      }
    }

    // Generate sale number
    const saleNumber = `POS-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`;

    // Create sale record
    const sale: Sale = {
      id: `sale-${Date.now()}`,
      saleNumber,
      items: cart.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      subtotal: cartTotals.subtotal,
      vatAmount: cartTotals.vatAmount,
      total: cartTotals.total,
      paymentMethod,
      amountPaid: cartTotals.total,
      change: 0,
      cashierId: currentUserId,
      customerId: selectedCustomerId || undefined,
      createdAt: new Date().toISOString(),
    };

    // Update inventory (reduce quantities)
    setInventory((prev) =>
      prev.map((item) => {
        const cartItem = cart.find((ci) => ci.inventoryItemId === item.id);
        if (cartItem) {
          return {
            ...item,
            quantity: item.quantity - cartItem.quantity,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      })
    );

    // Create invoice in accounting module
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    const selectedCustomer = selectedCustomerId
      ? customers.find((c) => c.id === selectedCustomerId)
      : null;
    const customerName = selectedCustomer ? selectedCustomer.name : 'Particulier (Kassa)';

    const invoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      customerId: selectedCustomerId || 'walk-in', // Use 'walk-in' for non-customer sales
      customerName,
      items: cart.map((item, index) => ({
        id: `invitem-${Date.now()}-${index}`,
        inventoryItemId: item.inventoryItemId,
        description: item.inventoryItem.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      laborHours: 0, // POS sales don't include labor
      hourlyRate: 0,
      subtotal: cartTotals.subtotal,
      vatRate: VAT_RATE,
      vatAmount: cartTotals.vatAmount,
      total: cartTotals.total,
      status: 'paid', // POS sales are always immediately paid
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0], // Same day for POS
      paidDate: new Date().toISOString().split('T')[0],
      notes: `Kassa verkoop (${saleNumber})`,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInvoices((prev) => [...prev, invoice]);

    // Save sale
    setSales((prev) => [...prev, sale]);

    // Clear cart
    setCart([]);
    setSelectedCustomerId(null);

    alert(`Verkoop voltooid!\n${saleNumber}\nTotaal: €${cartTotals.total.toFixed(2)}`);

    return sale;
  }, [
    cart,
    inventory,
    cartTotals,
    paymentMethod,
    currentUserId,
    selectedCustomerId,
    sales,
    invoices,
    setInventory,
    setInvoices,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Cart
    cart,
    cartTotals,
    availableInventory,

    // Customer
    selectedCustomerId,
    setSelectedCustomerId,

    // Payment
    paymentMethod,
    setPaymentMethod,

    // Sales
    sales,

    // Cart actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,

    // Sale actions
    completeSale,
  };
};
