/**
 * Quote Controller
 * CRUD operations for quotes (offertes)
 */

import prisma from '../config/database.js';

/**
 * List quotes
 * GET /api/quotes
 */
export const listQuotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, customerId } = req.query;

    // Build where clause
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    // Non-admin can only see their own quotes
    if (!req.user.isAdmin) {
      where.userId = req.user.id;
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Query
    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: true,
          items: true,
          workOrder: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.quote.count({ where })
    ]);

    res.json({
      data: quotes,
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

/**
 * Get single quote
 * GET /api/quotes/:id
 */
export const getQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        workOrder: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    // Check ownership
    if (!req.user.isAdmin && quote.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

/**
 * Create quote
 * POST /api/quotes
 */
export const createQuote = async (req, res, next) => {
  try {
    const { customerId, title, description, items, laborHours, hourlyRate, notes, validUntil } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) =>
      sum + (item.quantity * item.unitPrice), 0
    );
    const laborCost = (laborHours || 0) * (hourlyRate || 50);
    const totalBeforeVat = subtotal + laborCost;
    const vatRate = 21; // NL BTW
    const vatAmount = totalBeforeVat * (vatRate / 100);
    const total = totalBeforeVat + vatAmount;

    // Generate ID
    const count = await prisma.quote.count();
    const id = `Q${String(count + 1).padStart(4, '0')}`;

    // Create quote with items
    const quote = await prisma.quote.create({
      data: {
        id,
        customerId,
        userId: req.user.id,
        title,
        description,
        status: 'draft',
        laborHours: laborHours || 0,
        hourlyRate: hourlyRate || 50,
        subtotal,
        vatRate,
        vatAmount,
        total,
        notes,
        validUntil,
        items: {
          create: items.map(item => ({
            inventoryItemId: item.inventoryItemId,
            name: item.name,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice
          }))
        }
      },
      include: {
        items: true,
        customer: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.status(201).json(quote);
  } catch (error) {
    next(error);
  }
};

/**
 * Update quote
 * PUT /api/quotes/:id
 */
export const updateQuote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, items, laborHours, hourlyRate, notes, validUntil } = req.body;

    // Check exists & ownership
    const existing = await prisma.quote.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    // Calculate totals if items provided
    let updateData = {
      title,
      description,
      status,
      laborHours,
      hourlyRate,
      notes,
      validUntil
    };

    if (items) {
      const subtotal = items.reduce((sum, item) =>
        sum + (item.quantity * item.unitPrice), 0
      );
      const laborCost = (laborHours || existing.laborHours || 0) * (hourlyRate || existing.hourlyRate || 50);
      const totalBeforeVat = subtotal + laborCost;
      const vatAmount = totalBeforeVat * 0.21;
      const total = totalBeforeVat + vatAmount;

      updateData = {
        ...updateData,
        subtotal,
        vatAmount,
        total
      };

      // Delete old items and create new ones
      await prisma.quoteItem.deleteMany({
        where: { quoteId: id }
      });

      await prisma.quoteItem.createMany({
        data: items.map(item => ({
          quoteId: id,
          inventoryItemId: item.inventoryItemId,
          name: item.name,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      });
    }

    // Update quote
    const quote = await prisma.quote.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json(quote);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete quote
 * DELETE /api/quotes/:id
 */
export const deleteQuote = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check exists & ownership
    const existing = await prisma.quote.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Offerte niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze offerte'
      });
    }

    // Delete (cascade delete items)
    await prisma.quote.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
