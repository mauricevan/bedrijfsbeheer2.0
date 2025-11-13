/**
 * CRM Helpers
 * Helper functies voor CRM module
 */

import type { Customer, Lead, LeadStatus, Task } from '../../../types';

/**
 * Get lead status color
 */
export const getLeadStatusColor = (status: LeadStatus): string => {
  const colors: Record<LeadStatus, string> = {
    new: 'blue',
    contacted: 'purple',
    qualified: 'indigo',
    proposal: 'yellow',
    negotiation: 'orange',
    won: 'green',
    lost: 'red'
  };
  return colors[status];
};

/**
 * Get lead status label
 */
export const getLeadStatusLabel = (status: LeadStatus): string => {
  const labels: Record<LeadStatus, string> = {
    new: 'Nieuw',
    contacted: 'Gecontacteerd',
    qualified: 'Gekwalificeerd',
    proposal: 'Offerte',
    negotiation: 'Onderhandeling',
    won: 'Gewonnen',
    lost: 'Verloren'
  };
  return labels[status];
};

/**
 * Get task priority color
 */
export const getTaskPriorityColor = (priority: 'low' | 'medium' | 'high'): string => {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };
  return colors[priority];
};

/**
 * Get interaction type icon
 */
export const getInteractionTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    call: '📞',
    email: '📧',
    meeting: '🤝',
    note: '📝',
    sms: '💬'
  };
  return icons[type] || '📝';
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date(task.dueDate) < new Date();
};

/**
 * Get customer type (zakelijk/particulier)
 */
export const getCustomerType = (customer: Customer): 'zakelijk' | 'particulier' => {
  return customer.company ? 'zakelijk' : 'particulier';
};

/**
 * Get customer initials for avatar
 */
export const getCustomerInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Calculate customer lifetime value
 */
export const calculateCustomerValue = (
  customerId: string,
  invoices: Array<{ customerId: string; total: number; status: string }>
): number => {
  return invoices
    .filter(inv => inv.customerId === customerId && inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
};

/**
 * Get lead conversion probability based on status
 */
export const getDefaultProbability = (status: LeadStatus): number => {
  const probabilities: Record<LeadStatus, number> = {
    new: 10,
    contacted: 20,
    qualified: 40,
    proposal: 60,
    negotiation: 80,
    won: 100,
    lost: 0
  };
  return probabilities[status];
};

/**
 * Sort leads by pipeline order
 */
export const sortLeadsByPipeline = (leads: Lead[]): Lead[] => {
  const pipelineOrder: LeadStatus[] = [
    'new',
    'contacted',
    'qualified',
    'proposal',
    'negotiation',
    'won',
    'lost'
  ];

  return [...leads].sort((a, b) => {
    return pipelineOrder.indexOf(a.status) - pipelineOrder.indexOf(b.status);
  });
};

/**
 * Group leads by status
 */
export const groupLeadsByStatus = (leads: Lead[]): Record<LeadStatus, Lead[]> => {
  const grouped: Record<string, Lead[]> = {
    new: [],
    contacted: [],
    qualified: [],
    proposal: [],
    negotiation: [],
    won: [],
    lost: []
  };

  leads.forEach(lead => {
    if (grouped[lead.status]) {
      grouped[lead.status].push(lead);
    }
  });

  return grouped as Record<LeadStatus, Lead[]>;
};

/**
 * Calculate pipeline value
 */
export const calculatePipelineValue = (leads: Lead[]): number => {
  return leads
    .filter(lead => lead.status !== 'won' && lead.status !== 'lost')
    .reduce((sum, lead) => {
      const value = lead.estimatedValue || 0;
      const probability = (lead.probability || getDefaultProbability(lead.status)) / 100;
      return sum + value * probability;
    }, 0);
};
