/**
 * CRM Filters
 * Filter functies voor CRM lijsten
 */

import type { Customer, Lead, LeadStatus } from '../../../types';

export interface CustomerFilterOptions {
  search?: string;
  type?: 'all' | 'zakelijk' | 'particulier';
  sortBy?: 'name' | 'createdAt' | 'value';
  sortOrder?: 'asc' | 'desc';
}

export interface LeadFilterOptions {
  search?: string;
  status?: LeadStatus | 'all';
  assignedTo?: string;
  sortBy?: 'name' | 'value' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter customers by search term
 */
export const filterCustomersBySearch = (
  customers: Customer[],
  searchTerm: string
): Customer[] => {
  if (!searchTerm || searchTerm.trim() === '') return customers;

  const term = searchTerm.toLowerCase().trim();

  return customers.filter(
    customer =>
      customer.name.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone && customer.phone.includes(term)) ||
      (customer.company && customer.company.toLowerCase().includes(term)) ||
      (customer.city && customer.city.toLowerCase().includes(term))
  );
};

/**
 * Filter customers by type
 */
export const filterCustomersByType = (
  customers: Customer[],
  type: 'all' | 'zakelijk' | 'particulier'
): Customer[] => {
  if (type === 'all') return customers;

  return customers.filter(customer => {
    if (type === 'zakelijk') return !!customer.company;
    return !customer.company;
  });
};

/**
 * Sort customers
 */
export const sortCustomers = (
  customers: Customer[],
  sortBy: 'name' | 'createdAt' | 'value',
  sortOrder: 'asc' | 'desc' = 'asc'
): Customer[] => {
  return [...customers].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'value':
        // Would need invoice data - placeholder
        comparison = 0;
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Apply all customer filters
 */
export const filterCustomers = (
  customers: Customer[],
  options: CustomerFilterOptions
): Customer[] => {
  let filtered = [...customers];

  if (options.search) {
    filtered = filterCustomersBySearch(filtered, options.search);
  }

  if (options.type) {
    filtered = filterCustomersByType(filtered, options.type);
  }

  if (options.sortBy) {
    filtered = sortCustomers(filtered, options.sortBy, options.sortOrder);
  }

  return filtered;
};

/**
 * Filter leads by search term
 */
export const filterLeadsBySearch = (
  leads: Lead[],
  searchTerm: string
): Lead[] => {
  if (!searchTerm || searchTerm.trim() === '') return leads;

  const term = searchTerm.toLowerCase().trim();

  return leads.filter(
    lead =>
      lead.name.toLowerCase().includes(term) ||
      lead.email.toLowerCase().includes(term) ||
      (lead.phone && lead.phone.includes(term)) ||
      (lead.company && lead.company.toLowerCase().includes(term))
  );
};

/**
 * Filter leads by status
 */
export const filterLeadsByStatus = (
  leads: Lead[],
  status: LeadStatus | 'all'
): Lead[] => {
  if (status === 'all') return leads;
  return leads.filter(lead => lead.status === status);
};

/**
 * Filter leads by assigned user
 */
export const filterLeadsByAssignedTo = (
  leads: Lead[],
  userId: string
): Lead[] => {
  if (!userId) return leads;
  return leads.filter(lead => lead.assignedTo === userId);
};

/**
 * Sort leads
 */
export const sortLeads = (
  leads: Lead[],
  sortBy: 'name' | 'value' | 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc'
): Lead[] => {
  return [...leads].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'value':
        comparison = (a.estimatedValue || 0) - (b.estimatedValue || 0);
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Apply all lead filters
 */
export const filterLeads = (
  leads: Lead[],
  options: LeadFilterOptions
): Lead[] => {
  let filtered = [...leads];

  if (options.search) {
    filtered = filterLeadsBySearch(filtered, options.search);
  }

  if (options.status) {
    filtered = filterLeadsByStatus(filtered, options.status);
  }

  if (options.assignedTo) {
    filtered = filterLeadsByAssignedTo(filtered, options.assignedTo);
  }

  if (options.sortBy) {
    filtered = sortLeads(filtered, options.sortBy, options.sortOrder);
  }

  return filtered;
};
