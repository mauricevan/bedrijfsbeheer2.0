/**
 * WorkOrders Helpers
 * Helper functies voor werkorders module
 */

import type { WorkOrder, WorkOrderStatus, User } from '../../../types';

/**
 * Get status color for Kanban board
 */
export const getStatusColor = (status: WorkOrderStatus): string => {
  const colors: Record<WorkOrderStatus, string> = {
    todo: 'gray',
    pending: 'yellow',
    in_progress: 'blue',
    completed: 'green'
  };
  return colors[status];
};

/**
 * Get status label in Dutch
 */
export const getStatusLabel = (status: WorkOrderStatus): string => {
  const labels: Record<WorkOrderStatus, string> = {
    todo: 'Te Doen',
    pending: 'In Wacht',
    in_progress: 'In Uitvoering',
    completed: 'Afgerond'
  };
  return labels[status];
};

/**
 * Get priority color
 */
export const getPriorityColor = (priority?: 'low' | 'medium' | 'high'): string => {
  if (!priority) return 'gray';
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'red'
  };
  return colors[priority];
};

/**
 * Get priority label
 */
export const getPriorityLabel = (priority?: 'low' | 'medium' | 'high'): string => {
  if (!priority) return 'Normaal';
  const labels = {
    low: 'Laag',
    medium: 'Gemiddeld',
    high: 'Hoog'
  };
  return labels[priority];
};

/**
 * Get assigned user name
 */
export const getAssignedUserName = (userId: string, users: User[]): string => {
  const user = users.find(u => u.id === userId);
  return user?.name || 'Onbekend';
};

/**
 * Get creator name
 */
export const getCreatorName = (userId: string, users: User[]): string => {
  const user = users.find(u => u.id === userId);
  return user?.name || 'Onbekend';
};

/**
 * Check if workorder is overdue
 */
export const isOverdue = (workOrder: WorkOrder): boolean => {
  if (!workOrder.dueDate || workOrder.status === 'completed') return false;
  return new Date(workOrder.dueDate) < new Date();
};

/**
 * Calculate total material cost
 */
export const calculateMaterialCost = (workOrder: WorkOrder): number => {
  if (!workOrder.materials) return 0;
  return workOrder.materials.reduce((sum, material) => {
    return sum + (material.quantity * (material.unitPrice || 0));
  }, 0);
};

/**
 * Calculate total labor cost
 */
export const calculateLaborCost = (workOrder: WorkOrder, hourlyRate: number = 0): number => {
  return workOrder.actualHours * hourlyRate;
};

/**
 * Calculate total workorder value
 */
export const calculateWorkOrderValue = (
  workOrder: WorkOrder,
  hourlyRate: number = 0
): number => {
  const materialCost = calculateMaterialCost(workOrder);
  const laborCost = calculateLaborCost(workOrder, hourlyRate);
  return materialCost + laborCost;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (workOrder: WorkOrder): number => {
  if (workOrder.status === 'completed') return 100;
  if (workOrder.status === 'in_progress') {
    if (workOrder.estimatedHours === 0) return 50;
    return Math.min(
      Math.round((workOrder.actualHours / workOrder.estimatedHours) * 100),
      95
    );
  }
  return 0;
};

/**
 * Group workorders by status
 */
export const groupByStatus = (workOrders: WorkOrder[]): Record<WorkOrderStatus, WorkOrder[]> => {
  const grouped: Record<WorkOrderStatus, WorkOrder[]> = {
    todo: [],
    pending: [],
    in_progress: [],
    completed: []
  };

  workOrders.forEach(wo => {
    if (grouped[wo.status]) {
      grouped[wo.status].push(wo);
    }
  });

  return grouped;
};

/**
 * Group workorders by assigned user
 */
export const groupByUser = (
  workOrders: WorkOrder[],
  users: User[]
): Array<{ user: User; workOrders: WorkOrder[] }> => {
  const userGroups = new Map<string, WorkOrder[]>();

  workOrders.forEach(wo => {
    if (!userGroups.has(wo.assignedTo)) {
      userGroups.set(wo.assignedTo, []);
    }
    userGroups.get(wo.assignedTo)!.push(wo);
  });

  return Array.from(userGroups.entries()).map(([userId, wos]) => ({
    user: users.find(u => u.id === userId) || { id: userId, name: 'Onbekend' } as User,
    workOrders: wos
  }));
};

/**
 * Sort workorders by index number (for priority)
 */
export const sortByIndex = (workOrders: WorkOrder[]): WorkOrder[] => {
  return [...workOrders].sort((a, b) => {
    // Workorders without index go to bottom
    if (!a.index && !b.index) return 0;
    if (!a.index) return 1;
    if (!b.index) return -1;
    return a.index - b.index;
  });
};

/**
 * Get next available index number
 */
export const getNextIndex = (workOrders: WorkOrder[]): number => {
  if (workOrders.length === 0) return 1;
  const maxIndex = Math.max(...workOrders.map(wo => wo.index || 0));
  return maxIndex + 1;
};

/**
 * Check if workorder has materials assigned
 */
export const hasMaterials = (workOrder: WorkOrder): boolean => {
  return !!workOrder.materials && workOrder.materials.length > 0;
};
