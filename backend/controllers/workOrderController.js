/**
 * WorkOrder Controller
 * CRUD operations for work orders (werkorders)
 */

import prisma from '../config/database.js';

export const listWorkOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, assignedTo } = req.query;

    const where = {};
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    // Non-admin can only see assigned work orders
    if (!req.user.isAdmin) {
      where.assignedTo = req.user.id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [workOrders, total] = await Promise.all([
      prisma.workOrder.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: true,
          assignedUser: {
            select: { id: true, name: true, email: true }
          },
          materials: {
            include: {
              inventoryItem: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.workOrder.count({ where })
    ]);

    res.json({
      data: workOrders,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workOrder = await prisma.workOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        createdByUser: {
          select: { id: true, name: true, email: true }
        },
        materials: {
          include: {
            inventoryItem: true
          }
        },
        quote: true,
        invoice: true
      }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Werkorder niet gevonden' });
    }

    // Check access
    if (!req.user.isAdmin && workOrder.assignedTo !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze werkorder'
      });
    }

    res.json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const createWorkOrder = async (req, res, next) => {
  try {
    const { title, description, customerId, assignedTo, quoteId, priority, estimatedHours, dueDate, materials } = req.body;

    // Generate ID
    const count = await prisma.workOrder.count();
    const id = `WO${String(count + 1).padStart(4, '0')}`;

    const workOrder = await prisma.workOrder.create({
      data: {
        id,
        title,
        description,
        customerId,
        assignedTo,
        assignedBy: req.user.id,
        quoteId,
        priority,
        estimatedHours,
        dueDate,
        status: 'todo',
        materials: {
          create: materials?.map(m => ({
            inventoryItemId: m.inventoryItemId,
            quantity: m.quantity
          })) || []
        }
      },
      include: {
        customer: true,
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        materials: {
          include: {
            inventoryItem: true
          }
        }
      }
    });

    // Update quote if provided
    if (quoteId) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { workOrderId: id }
      });
    }

    res.status(201).json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const updateWorkOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, actualHours, estimatedHours, dueDate } = req.body;

    // Check exists & access
    const existing = await prisma.workOrder.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Werkorder niet gevonden' });
    }

    if (!req.user.isAdmin && existing.assignedTo !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze werkorder'
      });
    }

    // Update timestamps based on status
    const updateData = {
      title,
      description,
      status,
      priority,
      actualHours,
      estimatedHours,
      dueDate
    };

    if (status === 'in_progress' && !existing.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'completed' && !existing.completedAt) {
      updateData.completedAt = new Date();
    }

    const workOrder = await prisma.workOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        assignedUser: {
          select: { id: true, name: true, email: true }
        },
        materials: {
          include: {
            inventoryItem: true
          }
        }
      }
    });

    res.json(workOrder);
  } catch (error) {
    next(error);
  }
};

export const deleteWorkOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.workOrder.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
