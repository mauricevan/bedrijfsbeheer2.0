/**
 * useCRM Hook
 * Business logic voor Customers & Leads (7-fase pipeline)
 */

import { useState, useCallback, useMemo } from 'react';
import type { Customer, Lead, LeadStatus } from '../../../types';

export const useCRM = (
  initialCustomers: Customer[],
  initialLeads: Lead[]
) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedTab, setSelectedTab] = useState<'customers' | 'leads'>('customers');

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Leads grouped by status (7-fase pipeline)
  const leadsByStatus = useMemo(() => {
    const grouped: Record<LeadStatus, Lead[]> = {
      new: [],
      contacted: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won: [],
      lost: [],
    };

    leads.forEach((lead) => {
      grouped[lead.status].push(lead);
    });

    return grouped;
  }, [leads]);

  // Stats
  const stats = useMemo(() => {
    return {
      totalCustomers: customers.length,
      totalLeads: leads.length,
      activeLeads: leads.filter((l) => !['won', 'lost'].includes(l.status)).length,
      wonLeads: leadsByStatus.won.length,
      lostLeads: leadsByStatus.lost.length,
      pipelineValue: leads
        .filter((l) => !['won', 'lost'].includes(l.status))
        .reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      wonValue: leadsByStatus.won.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
    };
  }, [customers, leads, leadsByStatus]);

  // ============================================================================
  // CUSTOMERS CRUD
  // ============================================================================

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`,
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

  // ============================================================================
  // LEADS CRUD
  // ============================================================================

  const addLead = useCallback((lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLeads((prev) => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      )
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // Move lead to next/previous status in pipeline
  const moveLeadStatus = useCallback((id: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: newStatus, updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, []);

  // Convert lead to customer
  const convertLeadToCustomer = useCallback((leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return null;

    const newCustomer = addCustomer({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      notes: lead.notes,
    });

    // Update lead with customer ID
    updateLead(leadId, { customerId: newCustomer.id, status: 'won' });

    return newCustomer;
  }, [leads, addCustomer, updateLead]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    customers,
    leads,
    leadsByStatus,
    stats,

    // UI State
    selectedTab,
    setSelectedTab,

    // Customers CRUD
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // Leads CRUD
    addLead,
    updateLead,
    deleteLead,
    moveLeadStatus,
    convertLeadToCustomer,
  };
};
