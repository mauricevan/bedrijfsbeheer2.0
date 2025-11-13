/**
 * useWorkOrders Hook
 * State management voor workorders module
 */

import { useState, useMemo, useCallback } from 'react';
import type { WorkOrder, WorkOrderStatus, WorkOrderMaterial, User } from '../../../types';
import {
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  addMaterialToWorkOrder,
  updateMaterialInWorkOrder,
  removeMaterialFromWorkOrder,
  updateActualHours,
  addHoursToWorkOrder,
  updateWorkOrderNotes,
  reorderWorkOrders,
  duplicateWorkOrder,
  completeWorkOrder,
  reopenWorkOrder,
  batchUpdateStatus,
  calculateWorkOrderStats
} from '../services/workOrderService';
import {
  applyWorkOrderFilters,
  filterOverdue,
  type WorkOrderFilters
} from '../utils/filters';
import { groupByStatus, groupByUser } from '../utils/helpers';

export interface UseWorkOrdersReturn {
  // State
  workOrders: WorkOrder[];
  users: User[];
  filteredWorkOrders: WorkOrder[];
  overdueWorkOrders: WorkOrder[];
  groupedByStatus: Record<WorkOrderStatus, WorkOrder[]>;
  groupedByUser: Array<{ user: User; workOrders: WorkOrder[] }>;
  stats: ReturnType<typeof calculateWorkOrderStats>;

  // Filter state
  filters: WorkOrderFilters;
  setFilters: React.Dispatch<React.SetStateAction<WorkOrderFilters>>;

  // WorkOrder operations
  addWorkOrder: (workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkOrderData: (workOrderId: string, updates: Partial<WorkOrder>) => void;
  removeWorkOrder: (workOrderId: string) => void;
  duplicateWorkOrderData: (workOrderId: string) => void;

  // Status operations
  updateStatus: (workOrderId: string, newStatus: WorkOrderStatus) => void;
  completeWorkOrderData: (workOrderId: string, finalHours: number) => void;
  reopenWorkOrderData: (workOrderId: string) => void;
  batchUpdateStatusData: (workOrderIds: string[], newStatus: WorkOrderStatus) => void;

  // Material operations
  addMaterial: (workOrderId: string, material: Omit<WorkOrderMaterial, 'id'>) => void;
  updateMaterial: (
    workOrderId: string,
    materialId: string,
    updates: Partial<Omit<WorkOrderMaterial, 'id'>>
  ) => void;
  removeMaterial: (workOrderId: string, materialId: string) => void;

  // Hours operations
  setActualHours: (workOrderId: string, hours: number) => void;
  addHours: (workOrderId: string, additionalHours: number) => void;

  // Notes operations
  updateNotes: (workOrderId: string, notes: string) => void;

  // Reorder operations
  reorder: (workOrderId: string, newIndex: number) => void;
}

export const useWorkOrders = (
  initialWorkOrders: WorkOrder[],
  users: User[]
): UseWorkOrdersReturn => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [filters, setFilters] = useState<WorkOrderFilters>({});

  // Filtered workorders based on current filters
  const filteredWorkOrders = useMemo(() => {
    return applyWorkOrderFilters(workOrders, filters);
  }, [workOrders, filters]);

  // Overdue workorders
  const overdueWorkOrders = useMemo(() => {
    return filterOverdue(workOrders);
  }, [workOrders]);

  // Group by status
  const groupedByStatus = useMemo(() => {
    return groupByStatus(workOrders);
  }, [workOrders]);

  // Group by user
  const groupedByUser = useMemo(() => {
    return groupByUser(workOrders, users);
  }, [workOrders, users]);

  // Statistics
  const stats = useMemo(() => {
    return calculateWorkOrderStats(workOrders);
  }, [workOrders]);

  // Add new workorder
  const addWorkOrder = useCallback(
    (newWorkOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
      const workOrder = createWorkOrder(newWorkOrder, workOrders);
      setWorkOrders(prev => [...prev, workOrder]);
    },
    [workOrders]
  );

  // Update existing workorder
  const updateWorkOrderData = useCallback(
    (workOrderId: string, updates: Partial<WorkOrder>) => {
      setWorkOrders(prev => updateWorkOrder(workOrderId, updates, prev));
    },
    []
  );

  // Remove workorder
  const removeWorkOrder = useCallback((workOrderId: string) => {
    setWorkOrders(prev => deleteWorkOrder(workOrderId, prev));
  }, []);

  // Duplicate workorder
  const duplicateWorkOrderData = useCallback((workOrderId: string) => {
    setWorkOrders(prev => {
      const { workOrders: updated } = duplicateWorkOrder(workOrderId, prev);
      return updated;
    });
  }, []);

  // Update status
  const updateStatus = useCallback(
    (workOrderId: string, newStatus: WorkOrderStatus) => {
      setWorkOrders(prev => updateWorkOrderStatus(workOrderId, newStatus, prev));
    },
    []
  );

  // Complete workorder
  const completeWorkOrderData = useCallback((workOrderId: string, finalHours: number) => {
    setWorkOrders(prev => completeWorkOrder(workOrderId, finalHours, prev));
  }, []);

  // Reopen workorder
  const reopenWorkOrderData = useCallback((workOrderId: string) => {
    setWorkOrders(prev => reopenWorkOrder(workOrderId, prev));
  }, []);

  // Batch update status
  const batchUpdateStatusData = useCallback(
    (workOrderIds: string[], newStatus: WorkOrderStatus) => {
      setWorkOrders(prev => batchUpdateStatus(workOrderIds, newStatus, prev));
    },
    []
  );

  // Add material
  const addMaterial = useCallback(
    (workOrderId: string, material: Omit<WorkOrderMaterial, 'id'>) => {
      setWorkOrders(prev => addMaterialToWorkOrder(workOrderId, material, prev));
    },
    []
  );

  // Update material
  const updateMaterial = useCallback(
    (
      workOrderId: string,
      materialId: string,
      updates: Partial<Omit<WorkOrderMaterial, 'id'>>
    ) => {
      setWorkOrders(prev =>
        updateMaterialInWorkOrder(workOrderId, materialId, updates, prev)
      );
    },
    []
  );

  // Remove material
  const removeMaterial = useCallback((workOrderId: string, materialId: string) => {
    setWorkOrders(prev => removeMaterialFromWorkOrder(workOrderId, materialId, prev));
  }, []);

  // Set actual hours
  const setActualHours = useCallback((workOrderId: string, hours: number) => {
    setWorkOrders(prev => updateActualHours(workOrderId, hours, prev));
  }, []);

  // Add hours (incremental)
  const addHours = useCallback((workOrderId: string, additionalHours: number) => {
    setWorkOrders(prev => addHoursToWorkOrder(workOrderId, additionalHours, prev));
  }, []);

  // Update notes
  const updateNotes = useCallback((workOrderId: string, notes: string) => {
    setWorkOrders(prev => updateWorkOrderNotes(workOrderId, notes, prev));
  }, []);

  // Reorder
  const reorder = useCallback((workOrderId: string, newIndex: number) => {
    setWorkOrders(prev => reorderWorkOrders(workOrderId, newIndex, prev));
  }, []);

  return {
    // State
    workOrders,
    users,
    filteredWorkOrders,
    overdueWorkOrders,
    groupedByStatus,
    groupedByUser,
    stats,

    // Filter state
    filters,
    setFilters,

    // WorkOrder operations
    addWorkOrder,
    updateWorkOrderData,
    removeWorkOrder,
    duplicateWorkOrderData,

    // Status operations
    updateStatus,
    completeWorkOrderData,
    reopenWorkOrderData,
    batchUpdateStatusData,

    // Material operations
    addMaterial,
    updateMaterial,
    removeMaterial,

    // Hours operations
    setActualHours,
    addHours,

    // Notes operations
    updateNotes,

    // Reorder operations
    reorder
  };
};
