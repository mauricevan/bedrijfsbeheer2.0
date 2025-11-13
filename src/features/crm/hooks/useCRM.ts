/**
 * useCRM Hook
 * State management voor CRM module (Customers & Leads)
 */

import { useState, useMemo, useCallback } from 'react';
import type { Customer, Lead, LeadStatus } from '../../../types';
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createLead,
  updateLead,
  updateLeadStatus,
  deleteLead,
  convertLeadToCustomer,
  calculateCRMStats
} from '../services/crmService';
import {
  filterCustomers,
  filterLeads,
  type CustomerFilterOptions,
  type LeadFilterOptions
} from '../utils/filters';

export interface UseCRMReturn {
  // State
  customers: Customer[];
  leads: Lead[];
  filteredCustomers: Customer[];
  filteredLeads: Lead[];
  stats: ReturnType<typeof calculateCRMStats>;

  // Filter state
  customerFilters: CustomerFilterOptions;
  leadFilters: LeadFilterOptions;
  setCustomerFilters: React.Dispatch<React.SetStateAction<CustomerFilterOptions>>;
  setLeadFilters: React.Dispatch<React.SetStateAction<LeadFilterOptions>>;

  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomerData: (customerId: string, updates: Partial<Customer>) => void;
  removeCustomer: (customerId: string) => void;

  // Lead operations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLeadData: (leadId: string, updates: Partial<Lead>) => void;
  updateLeadStatusData: (leadId: string, newStatus: LeadStatus) => void;
  removeLead: (leadId: string) => void;
  convertLead: (leadId: string) => void;
}

export const useCRM = (
  initialCustomers: Customer[],
  initialLeads: Lead[]
): UseCRMReturn => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [customerFilters, setCustomerFilters] = useState<CustomerFilterOptions>({});
  const [leadFilters, setLeadFilters] = useState<LeadFilterOptions>({});

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return filterCustomers(customers, customerFilters);
  }, [customers, customerFilters]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return filterLeads(leads, leadFilters);
  }, [leads, leadFilters]);

  // Statistics
  const stats = useMemo(() => {
    return calculateCRMStats(customers, leads);
  }, [customers, leads]);

  // Add customer
  const addCustomer = useCallback(
    (newCustomer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
      const customer = createCustomer(newCustomer);
      setCustomers(prev => [...prev, customer]);
    },
    []
  );

  // Update customer
  const updateCustomerData = useCallback(
    (customerId: string, updates: Partial<Customer>) => {
      setCustomers(prev => updateCustomer(customerId, updates, prev));
    },
    []
  );

  // Remove customer
  const removeCustomer = useCallback((customerId: string) => {
    setCustomers(prev => deleteCustomer(customerId, prev));
  }, []);

  // Add lead
  const addLead = useCallback(
    (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      const lead = createLead(newLead);
      setLeads(prev => [...prev, lead]);
    },
    []
  );

  // Update lead
  const updateLeadData = useCallback(
    (leadId: string, updates: Partial<Lead>) => {
      setLeads(prev => updateLead(leadId, updates, prev));
    },
    []
  );

  // Update lead status
  const updateLeadStatusData = useCallback(
    (leadId: string, newStatus: LeadStatus) => {
      setLeads(prev => updateLeadStatus(leadId, newStatus, prev));
    },
    []
  );

  // Remove lead
  const removeLead = useCallback((leadId: string) => {
    setLeads(prev => deleteLead(leadId, prev));
  }, []);

  // Convert lead to customer
  const convertLead = useCallback(
    (leadId: string) => {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      // Create customer from lead
      const customerData = convertLeadToCustomer(lead);
      const customer = createCustomer(customerData);
      setCustomers(prev => [...prev, customer]);

      // Update lead status to won and link to customer
      setLeads(prev =>
        updateLead(
          leadId,
          {
            status: 'won',
            customerId: customer.id
          },
          prev
        )
      );
    },
    [leads]
  );

  return {
    // State
    customers,
    leads,
    filteredCustomers,
    filteredLeads,
    stats,

    // Filter state
    customerFilters,
    leadFilters,
    setCustomerFilters,
    setLeadFilters,

    // Customer operations
    addCustomer,
    updateCustomerData,
    removeCustomer,

    // Lead operations
    addLead,
    updateLeadData,
    updateLeadStatusData,
    removeLead,
    convertLead
  };
};
