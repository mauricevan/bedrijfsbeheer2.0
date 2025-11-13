/**
 * CRM Service
 * Business logic voor CRM operations (pure functions)
 */

import type { Customer, Lead, LeadStatus } from '../../../types';

/**
 * Create new customer
 */
export const createCustomer = (
  newCustomer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>
): Customer => {
  const now = new Date().toISOString();

  return {
    ...newCustomer,
    id: `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Update customer
 */
export const updateCustomer = (
  customerId: string,
  updates: Partial<Omit<Customer, 'id' | 'createdAt'>>,
  existingCustomers: Customer[]
): Customer[] => {
  return existingCustomers.map(customer =>
    customer.id === customerId
      ? {
          ...customer,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      : customer
  );
};

/**
 * Delete customer
 */
export const deleteCustomer = (
  customerId: string,
  existingCustomers: Customer[]
): Customer[] => {
  return existingCustomers.filter(customer => customer.id !== customerId);
};

/**
 * Create new lead
 */
export const createLead = (
  newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
): Lead => {
  const now = new Date().toISOString();

  return {
    ...newLead,
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
    lastContactedAt: now
  };
};

/**
 * Update lead
 */
export const updateLead = (
  leadId: string,
  updates: Partial<Omit<Lead, 'id' | 'createdAt'>>,
  existingLeads: Lead[]
): Lead[] => {
  return existingLeads.map(lead =>
    lead.id === leadId
      ? {
          ...lead,
          ...updates,
          updatedAt: new Date().toISOString()
        }
      : lead
  );
};

/**
 * Update lead status
 */
export const updateLeadStatus = (
  leadId: string,
  newStatus: LeadStatus,
  existingLeads: Lead[]
): Lead[] => {
  return updateLead(
    leadId,
    {
      status: newStatus,
      lastContactedAt: new Date().toISOString()
    },
    existingLeads
  );
};

/**
 * Delete lead
 */
export const deleteLead = (
  leadId: string,
  existingLeads: Lead[]
): Lead[] => {
  return existingLeads.filter(lead => lead.id !== leadId);
};

/**
 * Convert lead to customer
 */
export const convertLeadToCustomer = (
  lead: Lead
): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    notes: lead.notes
  };
};

/**
 * Calculate CRM statistics
 */
export interface CRMStats {
  totalCustomers: number;
  zakelijkCustomers: number;
  particulierCustomers: number;
  totalLeads: number;
  activeLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  pipelineValue: number;
}

export const calculateCRMStats = (
  customers: Customer[],
  leads: Lead[]
): CRMStats => {
  const zakelijk = customers.filter(c => c.company).length;
  const particulier = customers.length - zakelijk;

  const activeLeads = leads.filter(
    l => l.status !== 'won' && l.status !== 'lost'
  ).length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const lostLeads = leads.filter(l => l.status === 'lost').length;

  const totalConverted = wonLeads + lostLeads;
  const conversionRate = totalConverted > 0 ? (wonLeads / totalConverted) * 100 : 0;

  const pipelineValue = leads
    .filter(l => l.status !== 'won' && l.status !== 'lost')
    .reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  return {
    totalCustomers: customers.length,
    zakelijkCustomers: zakelijk,
    particulierCustomers: particulier,
    totalLeads: leads.length,
    activeLeads,
    wonLeads,
    lostLeads,
    conversionRate,
    pipelineValue
  };
};
