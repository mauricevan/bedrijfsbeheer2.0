/**
 * usePOS Hook
 * Business logic voor POS (Point of Sale) / Kassasysteem
 */

import { useState, useCallback, useMemo } from 'react';
import type { Sale, SaleItem, InventoryItem, Customer } from '../../../types';

export interface CartItem extends SaleItem {
  name: string;
  unit: string;
}

export const usePOS = (inventory: InventoryItem[], customers: Customer[]) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Cart totals
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const vatRate = 21; // 21% BTW
    const vatAmount = subtotal * (vatRate / 100);
    const total = subtotal + vatAmount;

    return {
      subtotal,
      vatRate,
      vatAmount,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  // Sales stats
  const salesStats = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const todaySales = sales.filter(
      (s) => new Date(s.saleDate).toDateString() === new Date().toDateString()
    );
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalSales,
      totalRevenue,
      todaySales: todaySales.length,
      todayRevenue,
    };
  }, [sales]);

  // Available inventory (with stock check)
  const availableInventory = useMemo(() => {
    return inventory.filter((item) => item.quantity > 0);
  }, [inventory]);

  // ============================================================================
  // CART OPERATIONS
  // ============================================================================

  const addToCart = useCallback(
    (inventoryItem: InventoryItem, quantity: number = 1) => {
      // Check stock
      if (inventoryItem.quantity < quantity) {
        throw new Error(`Onvoldoende voorraad. Beschikbaar: ${inventoryItem.quantity}`);
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.inventoryItemId === inventoryItem.id);

        if (existing) {
          // Update quantity if item already in cart
          const newQuantity = existing.quantity + quantity;

          if (inventoryItem.quantity < newQuantity) {
            throw new Error(
              `Maximale voorraad bereikt. Beschikbaar: ${inventoryItem.quantity}`
            );
          }

          return prev.map((item) =>
            item.inventoryItemId === inventoryItem.id
              ? {
                  ...item,
                  quantity: newQuantity,
                  total: newQuantity * item.unitPrice,
                }
              : item
          );
        } else {
          // Add new item to cart
          const newItem: CartItem = {
            inventoryItemId: inventoryItem.id,
            name: inventoryItem.name,
            unit: inventoryItem.unit,
            quantity,
            unitPrice: inventoryItem.unitPrice,
            total: quantity * inventoryItem.unitPrice,
          };
          return [...prev, newItem];
        }
      });
    },
    []
  );

  const updateCartItemQuantity = useCallback(
    (inventoryItemId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(inventoryItemId);
        return;
      }

      const inventoryItem = inventory.find((i) => i.id === inventoryItemId);
      if (!inventoryItem) return;

      if (inventoryItem.quantity < quantity) {
        throw new Error(`Onvoldoende voorraad. Beschikbaar: ${inventoryItem.quantity}`);
      }

      setCart((prev) =>
        prev.map((item) =>
          item.inventoryItemId === inventoryItemId
            ? {
                ...item,
                quantity,
                total: quantity * item.unitPrice,
              }
            : item
        )
      );
    },
    [inventory]
  );

  const removeFromCart = useCallback((inventoryItemId: string) => {
    setCart((prev) => prev.filter((item) => item.inventoryItemId !== inventoryItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCustomer(null);
  }, []);

  // ============================================================================
  // CUSTOMER SELECTION
  // ============================================================================

  const selectCustomer = useCallback((customer: Customer | null) => {
    setSelectedCustomer(customer);
  }, []);

  // ============================================================================
  // CHECKOUT / COMPLETE SALE
  // ============================================================================

  const completeSale = useCallback(
    (paymentMethod: 'cash' | 'card' | 'pin', amountPaid?: number): Sale => {
      if (cart.length === 0) {
        throw new Error('Winkelwagen is leeg');
      }

      const saleNumber = `POS-${new Date().getFullYear()}-${String(sales.length + 1).padStart(
        3,
        '0'
      )}`;

      const newSale: Sale = {
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
        amountPaid: amountPaid || cartTotals.total,
        customerId: selectedCustomer?.id,
        saleDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      setSales((prev) => [...prev, newSale]);

      // Clear cart after successful sale
      clearCart();

      return newSale;
    },
    [cart, cartTotals, selectedCustomer, sales.length, clearCart]
  );

  // ============================================================================
  // RETURN / REFUND (Future feature)
  // ============================================================================

  const refundSale = useCallback((saleId: string) => {
    // TODO: Implement refund logic
    // - Mark sale as refunded
    // - Return items to inventory
    // - Create negative transaction
    console.log('Refund sale:', saleId);
  }, []);

  return {
    // Cart state
    cart,
    cartTotals,
    selectedCustomer,

    // Inventory
    availableInventory,

    // Sales
    sales,
    salesStats,

    // Cart operations
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,

    // Customer
    selectCustomer,

    // Checkout
    completeSale,
    refundSale,
  };
};
