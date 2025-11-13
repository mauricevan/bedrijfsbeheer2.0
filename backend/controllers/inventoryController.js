/**
 * Inventory Controller
 * CRUD operations for inventory items (voorraad)
 */

import prisma from '../config/database.js';

export const listInventoryItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, category, status, search } = req.query;

    const where = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.inventoryItem.count({ where })
    ]);

    res.json({
      data: items,
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

export const getInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ error: 'Voorraad item niet gevonden' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const createInventoryItem = async (req, res, next) => {
  try {
    const item = await prisma.inventoryItem.create({
      data: req.body
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

export const updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: req.body
    });

    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.inventoryItem.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get low stock items
export const getLowStockItems = async (req, res, next) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minStock
        },
        status: 'active'
      },
      orderBy: { quantity: 'asc' }
    });

    res.json({ data: items });
  } catch (error) {
    next(error);
  }
};
