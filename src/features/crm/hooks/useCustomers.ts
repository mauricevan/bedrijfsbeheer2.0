/**
 * useCustomers Hook
 * Business logic voor Customer (Klant) beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type { Customer } from '../../../types';

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;

    const term = searchTerm.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term) ||
        c.phone?.includes(term)
    );
  }, [customers, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const businessCustomers = customers.filter((c) => c.company);
    const privateCustomers = customers.filter((c) => !c.company);

    return {
      total: customers.length,
      business: businessCustomers.length,
      private: privateCustomers.length,
    };
  }, [customers]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addCustomer = useCallback((customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Add note to customer
  const addNote = useCallback((id: string, note: string) => {
    updateCustomer(id, {
      notes: note,
    });
  }, [updateCustomer]);

  // Link quote to customer
  const linkQuote = useCallback((customerId: string, quoteId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              quoteIds: [...(c.quoteIds || []), quoteId],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  // Link invoice to customer
  const linkInvoice = useCallback((customerId: string, invoiceId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              invoiceIds: [...(c.invoiceIds || []), invoiceId],
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );
  }, []);

  // Link work order to customer
  const linkWorkOrder = useCallback((customerId: string, workOrderId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              workOrderIds: [...(c.workOrderIds || []), workOrderId],
              updatedAt: new Date().toISOString(),
            }
          : c
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

  return {
    customers,
    filteredCustomers,
    stats,
    searchTerm,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addNote,
    linkQuote,
    linkInvoice,
    linkWorkOrder,
    handleSearch,
    clearSearch,
  };
};
