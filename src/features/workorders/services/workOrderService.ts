/**
 * WorkOrder Service
 * Pure functions voor werkorders CRUD operaties en business logic
 */

import type { WorkOrder, WorkOrderStatus, WorkOrderMaterial } from '../../../types';
import { getNextIndex } from '../utils/helpers';

/**
 * Create a new workorder
 */
export const createWorkOrder = (
  newWorkOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>,
  existingWorkOrders: WorkOrder[]
): WorkOrder => {
  const now = new Date().toISOString();
  const nextIndex = getNextIndex(existingWorkOrders);

  return {
    ...newWorkOrder,
    id: `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    index: nextIndex,
    createdAt: now,
    updatedAt: now
  };
};

/**
 * Update an existing workorder
 */
export const updateWorkOrder = (
  workOrderId: string,
  updates: Partial<Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>>,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Delete a workorder
 */
export const deleteWorkOrder = (
  workOrderId: string,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.filter(wo => wo.id !== workOrderId);
};

/**
 * Update workorder status
 */
export const updateWorkOrderStatus = (
  workOrderId: string,
  newStatus: WorkOrderStatus,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  const now = new Date().toISOString();

  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      const updates: Partial<WorkOrder> = {
        status: newStatus,
        updatedAt: now
      };

      // If completing, set completedAt
      if (newStatus === 'completed') {
        updates.completedAt = now;
      }

      // If reopening from completed, clear completedAt
      if (wo.status === 'completed' && newStatus !== 'completed') {
        updates.completedAt = undefined;
      }

      return {
        ...wo,
        ...updates
      };
    }
    return wo;
  });
};

/**
 * Add material to workorder
 */
export const addMaterialToWorkOrder = (
  workOrderId: string,
  material: Omit<WorkOrderMaterial, 'id'>,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      const newMaterial: WorkOrderMaterial = {
        ...material,
        id: `mat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return {
        ...wo,
        materials: [...(wo.materials || []), newMaterial],
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Update material in workorder
 */
export const updateMaterialInWorkOrder = (
  workOrderId: string,
  materialId: string,
  updates: Partial<Omit<WorkOrderMaterial, 'id'>>,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        materials: wo.materials?.map(mat =>
          mat.id === materialId ? { ...mat, ...updates } : mat
        ),
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Remove material from workorder
 */
export const removeMaterialFromWorkOrder = (
  workOrderId: string,
  materialId: string,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        materials: wo.materials?.filter(mat => mat.id !== materialId),
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Update actual hours
 */
export const updateActualHours = (
  workOrderId: string,
  hours: number,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        actualHours: hours,
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Add hours to workorder (incremental)
 */
export const addHoursToWorkOrder = (
  workOrderId: string,
  additionalHours: number,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        actualHours: wo.actualHours + additionalHours,
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Update workorder notes
 */
export const updateWorkOrderNotes = (
  workOrderId: string,
  notes: string,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        notes,
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Reorder workorders (update index)
 */
export const reorderWorkOrders = (
  workOrderId: string,
  newIndex: number,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  const workOrder = existingWorkOrders.find(wo => wo.id === workOrderId);
  if (!workOrder) return existingWorkOrders;

  const oldIndex = workOrder.index || 0;

  return existingWorkOrders.map(wo => {
    // Update the moved workorder
    if (wo.id === workOrderId) {
      return {
        ...wo,
        index: newIndex,
        updatedAt: new Date().toISOString()
      };
    }

    // Shift other workorders
    if (wo.index === undefined) return wo;

    if (oldIndex < newIndex) {
      // Moving down: shift items up
      if (wo.index > oldIndex && wo.index <= newIndex) {
        return {
          ...wo,
          index: wo.index - 1
        };
      }
    } else {
      // Moving up: shift items down
      if (wo.index >= newIndex && wo.index < oldIndex) {
        return {
          ...wo,
          index: wo.index + 1
        };
      }
    }

    return wo;
  });
};

/**
 * Duplicate a workorder
 */
export const duplicateWorkOrder = (
  workOrderId: string,
  existingWorkOrders: WorkOrder[]
): { workOrders: WorkOrder[]; newWorkOrder: WorkOrder | null } => {
  const original = existingWorkOrders.find(wo => wo.id === workOrderId);
  if (!original) return { workOrders: existingWorkOrders, newWorkOrder: null };

  const now = new Date().toISOString();
  const nextIndex = getNextIndex(existingWorkOrders);

  const duplicated: WorkOrder = {
    ...original,
    id: `wo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    index: nextIndex,
    title: `${original.title} (kopie)`,
    status: 'todo',
    actualHours: 0,
    completedAt: undefined,
    createdAt: now,
    updatedAt: now
  };

  return {
    workOrders: [...existingWorkOrders, duplicated],
    newWorkOrder: duplicated
  };
};

/**
 * Complete a workorder
 */
export const completeWorkOrder = (
  workOrderId: string,
  finalHours: number,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  const now = new Date().toISOString();

  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        status: 'completed',
        actualHours: finalHours,
        completedAt: now,
        updatedAt: now
      };
    }
    return wo;
  });
};

/**
 * Reopen a completed workorder
 */
export const reopenWorkOrder = (
  workOrderId: string,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  return existingWorkOrders.map(wo => {
    if (wo.id === workOrderId) {
      return {
        ...wo,
        status: 'in_progress',
        completedAt: undefined,
        updatedAt: new Date().toISOString()
      };
    }
    return wo;
  });
};

/**
 * Batch update workorder status
 */
export const batchUpdateStatus = (
  workOrderIds: string[],
  newStatus: WorkOrderStatus,
  existingWorkOrders: WorkOrder[]
): WorkOrder[] => {
  const now = new Date().toISOString();
  const idsSet = new Set(workOrderIds);

  return existingWorkOrders.map(wo => {
    if (idsSet.has(wo.id)) {
      const updates: Partial<WorkOrder> = {
        status: newStatus,
        updatedAt: now
      };

      if (newStatus === 'completed') {
        updates.completedAt = now;
      }

      return { ...wo, ...updates };
    }
    return wo;
  });
};

/**
 * Calculate WorkOrder statistics
 */
export interface WorkOrderStats {
  total: number;
  byStatus: Record<WorkOrderStatus, number>;
  totalEstimatedHours: number;
  totalActualHours: number;
  totalOverdue: number;
  totalWithMaterials: number;
  averageCompletionTime: number; // in days
  completionRate: number; // percentage
}

export const calculateWorkOrderStats = (
  workOrders: WorkOrder[]
): WorkOrderStats => {
  const stats: WorkOrderStats = {
    total: workOrders.length,
    byStatus: {
      todo: 0,
      pending: 0,
      in_progress: 0,
      completed: 0
    },
    totalEstimatedHours: 0,
    totalActualHours: 0,
    totalOverdue: 0,
    totalWithMaterials: 0,
    averageCompletionTime: 0,
    completionRate: 0
  };

  if (workOrders.length === 0) return stats;

  const now = new Date();
  let totalCompletionDays = 0;
  let completedCount = 0;

  workOrders.forEach(wo => {
    // Count by status
    stats.byStatus[wo.status]++;

    // Sum hours
    stats.totalEstimatedHours += wo.estimatedHours;
    stats.totalActualHours += wo.actualHours;

    // Count overdue
    if (wo.dueDate && wo.status !== 'completed' && new Date(wo.dueDate) < now) {
      stats.totalOverdue++;
    }

    // Count with materials
    if (wo.materials && wo.materials.length > 0) {
      stats.totalWithMaterials++;
    }

    // Calculate completion time
    if (wo.status === 'completed' && wo.completedAt) {
      const created = new Date(wo.createdAt);
      const completed = new Date(wo.completedAt);
      const days = (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      totalCompletionDays += days;
      completedCount++;
    }
  });

  // Average completion time
  if (completedCount > 0) {
    stats.averageCompletionTime = totalCompletionDays / completedCount;
  }

  // Completion rate
  stats.completionRate = (stats.byStatus.completed / stats.total) * 100;

  return stats;
};
