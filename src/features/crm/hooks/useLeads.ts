/**
 * useLeads Hook
 * Business logic voor Lead management met 7-fase pipeline
 */

import { useState, useCallback, useMemo } from 'react';
import type { Lead, LeadStatus, Customer } from '../../../types';

export const useLeads = (initialLeads: Lead[]) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Group leads by status (Pipeline columns)
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
    const activeLeads = leads.filter(
      (l) => !['won', 'lost'].includes(l.status)
    );
    const wonLeads = leads.filter((l) => l.status === 'won');
    const lostLeads = leads.filter((l) => l.status === 'lost');

    // Pipeline value per stage
    const pipelineValue = {
      total: leads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      new: leadsByStatus.new.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      contacted: leadsByStatus.contacted.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      qualified: leadsByStatus.qualified.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      proposal: leadsByStatus.proposal.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      negotiation: leadsByStatus.negotiation.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
      won: leadsByStatus.won.reduce((sum, l) => sum + (l.estimatedValue || 0), 0),
    };

    // Conversion rate
    const conversionRate =
      leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0;

    return {
      total: leads.length,
      active: activeLeads.length,
      won: wonLeads.length,
      lost: lostLeads.length,
      conversionRate,
      pipelineValue,
    };
  }, [leads, leadsByStatus]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLeads((prev) => [...prev, newLead]);
    return newLead;
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, ...updates, updatedAt: new Date().toISOString() }
          : l
      )
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }, []);

  // ============================================================================
  // STATUS MANAGEMENT
  // ============================================================================

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status,
              lastContactedAt:
                status !== 'new' ? new Date().toISOString() : l.lastContactedAt,
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
  }, []);

  const moveToNextStage = useCallback((id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    const statusFlow: LeadStatus[] = [
      'new',
      'contacted',
      'qualified',
      'proposal',
      'negotiation',
      'won',
    ];

    const currentIndex = statusFlow.indexOf(lead.status);
    if (currentIndex < statusFlow.length - 1) {
      updateLeadStatus(id, statusFlow[currentIndex + 1]);
    }
  }, [leads, updateLeadStatus]);

  const markAsWon = useCallback((id: string) => {
    updateLeadStatus(id, 'won');
  }, [updateLeadStatus]);

  const markAsLost = useCallback((id: string) => {
    updateLeadStatus(id, 'lost');
  }, [updateLeadStatus]);

  // ============================================================================
  // CONVERSION
  // ============================================================================

  const convertToCustomer = useCallback(
    (leadId: string): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> | null => {
      const lead = leads.find((l) => l.id === leadId);
      if (!lead || lead.status !== 'won') return null;

      // Create customer data from lead
      const customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
      };

      // Mark lead as converted
      updateLead(leadId, { customerId: 'pending' });

      return customerData;
    },
    [leads, updateLead]
  );

  return {
    leads,
    leadsByStatus,
    stats,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    moveToNextStage,
    markAsWon,
    markAsLost,
    convertToCustomer,
  };
};
