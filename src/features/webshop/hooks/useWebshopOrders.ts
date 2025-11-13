/**
 * useWebshopOrders Hook
 * Business logic voor Webshop Bestelling Beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type { WebshopOrder, WebshopOrderStatus, WebshopPaymentStatus } from '../../../types';

export const useWebshopOrders = (initialOrders: WebshopOrder[]) => {
  const [orders, setOrders] = useState<WebshopOrder[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<WebshopOrderStatus | 'all'>('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<
    WebshopPaymentStatus | 'all'
  >('all');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Stats
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const processing = orders.filter((o) => o.status === 'processing').length;
    const shipped = orders.filter((o) => o.status === 'shipped').length;
    const delivered = orders.filter((o) => o.status === 'delivered').length;
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const refunded = orders.filter((o) => o.status === 'refunded').length;

    const unpaid = orders.filter((o) => o.paymentStatus === 'unpaid').length;
    const paid = orders.filter((o) => o.paymentStatus === 'paid').length;

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'paid' && o.status !== 'refunded')
      .reduce((sum, o) => sum + o.total, 0);

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
    );

    const todayRevenue = todayOrders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      refunded,
      unpaid,
      paid,
      totalRevenue,
      todayOrders: todayOrders.length,
      todayRevenue,
    };
  }, [orders]);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === 'pending'),
      processing: orders.filter((o) => o.status === 'processing'),
      shipped: orders.filter((o) => o.status === 'shipped'),
      delivered: orders.filter((o) => o.status === 'delivered'),
      cancelled: orders.filter((o) => o.status === 'cancelled'),
      refunded: orders.filter((o) => o.status === 'refunded'),
    };
  }, [orders]);

  // Filtered & Searched orders
  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((o) => o.status === filterStatus);
    }

    // Filter by payment status
    if (filterPaymentStatus !== 'all') {
      result = result.filter((o) => o.paymentStatus === filterPaymentStatus);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.customerEmail.toLowerCase().includes(term) ||
          o.customerPhone?.toLowerCase().includes(term)
      );
    }

    // Sort by newest first
    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orders, searchTerm, filterStatus, filterPaymentStatus]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addOrder = useCallback(
    (orderData: Omit<WebshopOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const year = new Date().getFullYear();

      // Generate order number: ORD-2025-001
      const orderCount = orders.filter((o) =>
        o.orderNumber.startsWith(`ORD-${year}`)
      ).length;

      const newOrder: WebshopOrder = {
        ...orderData,
        id: `order-${Date.now()}`,
        orderNumber: `ORD-${year}-${String(orderCount + 1).padStart(3, '0')}`,
        createdAt: now,
        updatedAt: now,
      };

      setOrders((prev) => [...prev, newOrder]);
      return newOrder;
    },
    [orders]
  );

  const updateOrder = useCallback((id: string, updates: Partial<WebshopOrder>) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  }, []);

  // ============================================================================
  // STATUS WORKFLOW
  // ============================================================================

  const updateOrderStatus = useCallback((id: string, status: WebshopOrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        const updates: Partial<WebshopOrder> = {
          status,
          updatedAt: new Date().toISOString(),
        };

        // Set timestamps for specific statuses
        if (status === 'shipped' && !order.shippedAt) {
          updates.shippedAt = new Date().toISOString();
        }

        if (status === 'delivered' && !order.deliveredAt) {
          updates.deliveredAt = new Date().toISOString();
        }

        return { ...order, ...updates };
      })
    );
  }, []);

  const markAsProcessing = useCallback(
    (id: string) => {
      updateOrderStatus(id, 'processing');
    },
    [updateOrderStatus]
  );

  const markAsShipped = useCallback(
    (id: string, trackingNumber?: string, carrier?: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status: 'shipped' as WebshopOrderStatus,
                shippedAt: new Date().toISOString(),
                trackingNumber: trackingNumber || order.trackingNumber,
                carrier: carrier || order.carrier,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    },
    []
  );

  const markAsDelivered = useCallback(
    (id: string) => {
      updateOrderStatus(id, 'delivered');
    },
    [updateOrderStatus]
  );

  const cancelOrder = useCallback(
    (id: string, reason?: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status: 'cancelled' as WebshopOrderStatus,
                adminNotes: reason
                  ? `${order.adminNotes || ''}\nAnnulering: ${reason}`.trim()
                  : order.adminNotes,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    },
    []
  );

  const refundOrder = useCallback(
    (id: string, reason?: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
                ...order,
                status: 'refunded' as WebshopOrderStatus,
                paymentStatus: 'failed' as WebshopPaymentStatus,
                adminNotes: reason
                  ? `${order.adminNotes || ''}\nTerugbetaling: ${reason}`.trim()
                  : order.adminNotes,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    },
    []
  );

  // ============================================================================
  // PAYMENT OPERATIONS
  // ============================================================================

  const markAsPaid = useCallback((id: string, paymentReference?: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              paymentStatus: 'paid' as WebshopPaymentStatus,
              paidAt: new Date().toISOString(),
              paymentReference: paymentReference || order.paymentReference,
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );
  }, []);

  const markAsUnpaid = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              paymentStatus: 'unpaid' as WebshopPaymentStatus,
              paidAt: undefined,
              updatedAt: new Date().toISOString(),
            }
          : order
      )
    );
  }, []);

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const setStatusFilter = useCallback((status: WebshopOrderStatus | 'all') => {
    setFilterStatus(status);
  }, []);

  const setPaymentFilter = useCallback((status: WebshopPaymentStatus | 'all') => {
    setFilterPaymentStatus(status);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setFilterPaymentStatus('all');
    setSearchTerm('');
  }, []);

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  const getOrderById = useCallback(
    (id: string) => {
      return orders.find((o) => o.id === id);
    },
    [orders]
  );

  const getOrdersByCustomer = useCallback(
    (customerId: string) => {
      return orders.filter((o) => o.customerId === customerId);
    },
    [orders]
  );

  const getRecentOrders = useCallback(
    (limit: number = 10) => {
      return orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },
    [orders]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    orders,
    filteredOrders,
    ordersByStatus,
    stats,

    // Search & Filter
    searchTerm,
    filterStatus,
    filterPaymentStatus,
    handleSearch,
    clearSearch,
    setStatusFilter,
    setPaymentFilter,
    clearFilters,

    // CRUD
    addOrder,
    updateOrder,
    deleteOrder,

    // Status workflow
    updateOrderStatus,
    markAsProcessing,
    markAsShipped,
    markAsDelivered,
    cancelOrder,
    refundOrder,

    // Payment
    markAsPaid,
    markAsUnpaid,

    // Query helpers
    getOrderById,
    getOrdersByCustomer,
    getRecentOrders,
  };
};
