/**
 * useWorkOrders Hook
 * Business logic voor WorkOrders module (Kanban)
 */

import { useState, useCallback, useMemo } from 'react';
import type { WorkOrder, WorkOrderStatus, User } from '../../../types';

export const useWorkOrders = (initialWorkOrders: WorkOrder[], currentUser: User) => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [selectedUser, setSelectedUser] = useState<string>(
    currentUser.isAdmin ? 'all' : currentUser.id
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Filter workorders by selected user
  const filteredWorkOrders = useMemo(() => {
    if (selectedUser === 'all') {
      return workOrders;
    }
    return workOrders.filter((wo) => wo.assignedTo === selectedUser);
  }, [workOrders, selectedUser]);

  // Group by status (Kanban columns)
  const workOrdersByStatus = useMemo(() => {
    const grouped: Record<WorkOrderStatus, WorkOrder[]> = {
      todo: [],
      pending: [],
      in_progress: [],
      completed: [],
    };

    filteredWorkOrders.forEach((wo) => {
      grouped[wo.status].push(wo);
    });

    return grouped;
  }, [filteredWorkOrders]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: filteredWorkOrders.length,
      todo: workOrdersByStatus.todo.length,
      pending: workOrdersByStatus.pending.length,
      inProgress: workOrdersByStatus.in_progress.length,
      completed: workOrdersByStatus.completed.length,
      totalHours: filteredWorkOrders.reduce((sum, wo) => sum + wo.actualHours, 0),
      estimatedHours: filteredWorkOrders.reduce((sum, wo) => sum + wo.estimatedHours, 0),
    };
  }, [filteredWorkOrders, workOrdersByStatus]);

  // ============================================================================
  // CRUD
  // ============================================================================

  const addWorkOrder = useCallback(
    (wo: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newWO: WorkOrder = {
        ...wo,
        id: `wo-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setWorkOrders((prev) => [...prev, newWO]);
      return newWO;
    },
    []
  );

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id ? { ...wo, ...updates, updatedAt: new Date().toISOString() } : wo
      )
    );
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) => prev.filter((wo) => wo.id !== id));
  }, []);

  // ============================================================================
  // STATUS UPDATES
  // ============================================================================

  const startWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              status: 'in_progress',
              startedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : wo
      )
    );
  }, []);

  const pauseWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'pending', updatedAt: new Date().toISOString() }
          : wo
      )
    );
  }, []);

  const completeWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              status: 'completed',
              completedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : wo
      )
    );
  }, []);

  const reopenWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? { ...wo, status: 'todo', updatedAt: new Date().toISOString() }
          : wo
      )
    );
  }, []);

  // ============================================================================
  // TIME TRACKING
  // ============================================================================

  const addHours = useCallback((id: string, hours: number) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              actualHours: wo.actualHours + hours,
              updatedAt: new Date().toISOString(),
            }
          : wo
      )
    );
  }, []);

  // ============================================================================
  // USER FILTER
  // ============================================================================

  const handleUserFilter = useCallback((userId: string) => {
    setSelectedUser(userId);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Data
    workOrders,
    filteredWorkOrders,
    workOrdersByStatus,
    stats,

    // Filters
    selectedUser,
    handleUserFilter,

    // CRUD
    addWorkOrder,
    updateWorkOrder,
    deleteWorkOrder,

    // Status updates
    startWorkOrder,
    pauseWorkOrder,
    completeWorkOrder,
    reopenWorkOrder,

    // Time tracking
    addHours,
  };
};
