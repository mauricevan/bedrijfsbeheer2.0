/**
 * WorkOrders Validators
 * Validatie functies voor werkorders formulieren
 */

import type { WorkOrder, WorkOrderStatus } from '../../../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface WorkOrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate workorder title
 */
export const validateTitle = (title: string): ValidationError | null => {
  if (!title || title.trim().length === 0) {
    return { field: 'title', message: 'Titel is verplicht' };
  }
  if (title.length > 200) {
    return { field: 'title', message: 'Titel mag maximaal 200 tekens bevatten' };
  }
  return null;
};

/**
 * Validate workorder description
 */
export const validateDescription = (description: string): ValidationError | null => {
  if (!description || description.trim().length === 0) {
    return { field: 'description', message: 'Omschrijving is verplicht' };
  }
  if (description.length > 5000) {
    return { field: 'description', message: 'Omschrijving mag maximaal 5000 tekens bevatten' };
  }
  return null;
};

/**
 * Validate assigned user
 */
export const validateAssignedTo = (assignedTo: string): ValidationError | null => {
  if (!assignedTo || assignedTo.trim().length === 0) {
    return { field: 'assignedTo', message: 'Toegewezen aan is verplicht' };
  }
  return null;
};

/**
 * Validate estimated hours
 */
export const validateEstimatedHours = (hours: number): ValidationError | null => {
  if (hours < 0) {
    return { field: 'estimatedHours', message: 'Geschatte uren kan niet negatief zijn' };
  }
  if (hours > 1000) {
    return { field: 'estimatedHours', message: 'Geschatte uren lijkt onrealistisch hoog' };
  }
  return null;
};

/**
 * Validate actual hours
 */
export const validateActualHours = (hours: number): ValidationError | null => {
  if (hours < 0) {
    return { field: 'actualHours', message: 'Werkelijke uren kan niet negatief zijn' };
  }
  if (hours > 1000) {
    return { field: 'actualHours', message: 'Werkelijke uren lijkt onrealistisch hoog' };
  }
  return null;
};

/**
 * Validate due date
 */
export const validateDueDate = (dueDate?: string): ValidationError | null => {
  if (!dueDate) return null; // Optional field

  const date = new Date(dueDate);
  if (isNaN(date.getTime())) {
    return { field: 'dueDate', message: 'Ongeldige datum' };
  }

  return null;
};

/**
 * Validate status transition
 */
export const validateStatusTransition = (
  currentStatus: WorkOrderStatus,
  newStatus: WorkOrderStatus
): ValidationError | null => {
  // Valid transitions
  const validTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
    todo: ['pending', 'in_progress', 'completed'],
    pending: ['todo', 'in_progress', 'completed'],
    in_progress: ['pending', 'completed', 'todo'],
    completed: ['in_progress'] // Can reopen
  };

  if (!validTransitions[currentStatus].includes(newStatus)) {
    return {
      field: 'status',
      message: `Kan niet van ${currentStatus} naar ${newStatus}`
    };
  }

  return null;
};

/**
 * Validate material quantity
 */
export const validateMaterialQuantity = (quantity: number): ValidationError | null => {
  if (quantity <= 0) {
    return { field: 'quantity', message: 'Aantal moet groter dan 0 zijn' };
  }
  if (!Number.isInteger(quantity)) {
    return { field: 'quantity', message: 'Aantal moet een geheel getal zijn' };
  }
  return null;
};

/**
 * Validate material unit price
 */
export const validateMaterialUnitPrice = (price: number): ValidationError | null => {
  if (price < 0) {
    return { field: 'unitPrice', message: 'Prijs kan niet negatief zijn' };
  }
  return null;
};

/**
 * Validate complete workorder
 */
export const validateWorkOrder = (
  workOrder: Partial<WorkOrder>
): WorkOrderValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (workOrder.title !== undefined) {
    const titleError = validateTitle(workOrder.title);
    if (titleError) errors.push(titleError);
  } else {
    errors.push({ field: 'title', message: 'Titel is verplicht' });
  }

  if (workOrder.description !== undefined) {
    const descError = validateDescription(workOrder.description);
    if (descError) errors.push(descError);
  } else {
    errors.push({ field: 'description', message: 'Omschrijving is verplicht' });
  }

  if (workOrder.assignedTo !== undefined) {
    const assignedError = validateAssignedTo(workOrder.assignedTo);
    if (assignedError) errors.push(assignedError);
  } else {
    errors.push({ field: 'assignedTo', message: 'Toegewezen aan is verplicht' });
  }

  // Optional fields with validation
  if (workOrder.estimatedHours !== undefined) {
    const estError = validateEstimatedHours(workOrder.estimatedHours);
    if (estError) errors.push(estError);
  }

  if (workOrder.actualHours !== undefined) {
    const actError = validateActualHours(workOrder.actualHours);
    if (actError) errors.push(actError);
  }

  if (workOrder.dueDate !== undefined) {
    const dateError = validateDueDate(workOrder.dueDate);
    if (dateError) errors.push(dateError);
  }

  // Validate materials if present
  if (workOrder.materials && workOrder.materials.length > 0) {
    workOrder.materials.forEach((material, index) => {
      const qtyError = validateMaterialQuantity(material.quantity);
      if (qtyError) {
        errors.push({
          field: `materials[${index}].quantity`,
          message: qtyError.message
        });
      }

      if (material.unitPrice !== undefined) {
        const priceError = validateMaterialUnitPrice(material.unitPrice);
        if (priceError) {
          errors.push({
            field: `materials[${index}].unitPrice`,
            message: priceError.message
          });
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if workorder can be completed
 */
export const canCompleteWorkOrder = (workOrder: WorkOrder): ValidationError | null => {
  if (workOrder.status === 'completed') {
    return { field: 'status', message: 'Werkorder is al afgerond' };
  }

  if (workOrder.actualHours === 0) {
    return { field: 'actualHours', message: 'Vul werkelijke uren in voordat je afrondt' };
  }

  return null;
};

/**
 * Check if workorder can be deleted
 */
export const canDeleteWorkOrder = (workOrder: WorkOrder): ValidationError | null => {
  // Can always delete, but warn for completed work orders
  if (workOrder.status === 'completed') {
    return {
      field: 'status',
      message: 'Dit is een afgeronde werkorder. Weet je zeker dat je deze wilt verwijderen?'
    };
  }

  return null;
};
