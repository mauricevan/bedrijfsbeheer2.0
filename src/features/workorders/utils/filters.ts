/**
 * WorkOrders Filters
 * Filter functies voor werkorders module
 */

import type { WorkOrder, WorkOrderStatus } from '../../../types';

export interface WorkOrderFilters {
  search?: string;
  status?: WorkOrderStatus;
  assignedTo?: string;
  createdBy?: string;
  priority?: 'low' | 'medium' | 'high';
  dateFrom?: string;
  dateTo?: string;
  showOverdue?: boolean;
  showCompleted?: boolean;
}

/**
 * Filter by search term (title, description, index)
 */
export const filterBySearch = (
  workOrders: WorkOrder[],
  searchTerm: string
): WorkOrder[] => {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return workOrders;
  }

  const term = searchTerm.toLowerCase().trim();

  return workOrders.filter(wo => {
    const titleMatch = wo.title.toLowerCase().includes(term);
    const descMatch = wo.description.toLowerCase().includes(term);
    const indexMatch = wo.index?.toString().includes(term);
    const woNumberMatch = `wo-${String(wo.index).padStart(4, '0')}`.includes(term);

    return titleMatch || descMatch || indexMatch || woNumberMatch;
  });
};

/**
 * Filter by status
 */
export const filterByStatus = (
  workOrders: WorkOrder[],
  status?: WorkOrderStatus
): WorkOrder[] => {
  if (!status) return workOrders;
  return workOrders.filter(wo => wo.status === status);
};

/**
 * Filter by assigned user
 */
export const filterByAssignedTo = (
  workOrders: WorkOrder[],
  userId?: string
): WorkOrder[] => {
  if (!userId) return workOrders;
  return workOrders.filter(wo => wo.assignedTo === userId);
};

/**
 * Filter by creator
 */
export const filterByCreatedBy = (
  workOrders: WorkOrder[],
  userId?: string
): WorkOrder[] => {
  if (!userId) return workOrders;
  return workOrders.filter(wo => wo.createdBy === userId);
};

/**
 * Filter by priority
 */
export const filterByPriority = (
  workOrders: WorkOrder[],
  priority?: 'low' | 'medium' | 'high'
): WorkOrder[] => {
  if (!priority) return workOrders;
  return workOrders.filter(wo => wo.priority === priority);
};

/**
 * Filter by date range
 */
export const filterByDateRange = (
  workOrders: WorkOrder[],
  dateFrom?: string,
  dateTo?: string
): WorkOrder[] => {
  let filtered = workOrders;

  if (dateFrom) {
    const from = new Date(dateFrom);
    filtered = filtered.filter(wo => new Date(wo.createdAt) >= from);
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999); // End of day
    filtered = filtered.filter(wo => new Date(wo.createdAt) <= to);
  }

  return filtered;
};

/**
 * Filter overdue workorders
 */
export const filterOverdue = (workOrders: WorkOrder[]): WorkOrder[] => {
  const now = new Date();
  return workOrders.filter(wo => {
    if (!wo.dueDate || wo.status === 'completed') return false;
    return new Date(wo.dueDate) < now;
  });
};

/**
 * Filter by has materials
 */
export const filterByHasMaterials = (workOrders: WorkOrder[]): WorkOrder[] => {
  return workOrders.filter(wo => wo.materials && wo.materials.length > 0);
};

/**
 * Filter by has notes
 */
export const filterByHasNotes = (workOrders: WorkOrder[]): WorkOrder[] => {
  return workOrders.filter(wo => wo.notes && wo.notes.trim().length > 0);
};

/**
 * Apply all filters at once
 */
export const applyWorkOrderFilters = (
  workOrders: WorkOrder[],
  filters: WorkOrderFilters
): WorkOrder[] => {
  let filtered = workOrders;

  // Apply search filter
  if (filters.search) {
    filtered = filterBySearch(filtered, filters.search);
  }

  // Apply status filter
  if (filters.status) {
    filtered = filterByStatus(filtered, filters.status);
  }

  // Apply assigned user filter
  if (filters.assignedTo) {
    filtered = filterByAssignedTo(filtered, filters.assignedTo);
  }

  // Apply creator filter
  if (filters.createdBy) {
    filtered = filterByCreatedBy(filtered, filters.createdBy);
  }

  // Apply priority filter
  if (filters.priority) {
    filtered = filterByPriority(filtered, filters.priority);
  }

  // Apply date range filter
  if (filters.dateFrom || filters.dateTo) {
    filtered = filterByDateRange(filtered, filters.dateFrom, filters.dateTo);
  }

  // Apply overdue filter
  if (filters.showOverdue) {
    filtered = filterOverdue(filtered);
  }

  // Apply completed filter
  if (filters.showCompleted === false) {
    filtered = filtered.filter(wo => wo.status !== 'completed');
  }

  return filtered;
};

/**
 * Get available filter options from workorders
 */
export const getFilterOptions = (workOrders: WorkOrder[]) => {
  const statuses = new Set<WorkOrderStatus>();
  const assignedUsers = new Set<string>();
  const creators = new Set<string>();
  const priorities = new Set<'low' | 'medium' | 'high'>();

  workOrders.forEach(wo => {
    statuses.add(wo.status);
    assignedUsers.add(wo.assignedTo);
    creators.add(wo.createdBy);
    if (wo.priority) priorities.add(wo.priority);
  });

  return {
    statuses: Array.from(statuses),
    assignedUsers: Array.from(assignedUsers),
    creators: Array.from(creators),
    priorities: Array.from(priorities)
  };
};

/**
 * Count workorders by filter
 */
export const countByFilter = (
  workOrders: WorkOrder[],
  filter: Partial<WorkOrderFilters>
): number => {
  return applyWorkOrderFilters(workOrders, filter).length;
};
