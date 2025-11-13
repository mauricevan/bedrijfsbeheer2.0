/**
 * Invoice Controller
 * CRUD operations for invoices (facturen)
 */

import prisma from '../config/database.js';

export const listInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, customerId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;

    // Non-admin can only see their own invoices
    if (!req.user.isAdmin) {
      where.userId = req.user.id;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          customer: true,
          items: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.invoice.count({ where })
    ]);

    res.json({
      data: invoices,
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

export const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
        quote: true,
        workOrder: true,
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Factuur niet gevonden' });
    }

    // Check ownership
    if (!req.user.isAdmin && invoice.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze factuur'
      });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req, res, next) => {
  try {
    const { customerId, quoteId, workOrderId, items, laborHours, hourlyRate, dueDate, notes } = req.body;

    // Calculate totals
    const subtotal = items.reduce((sum, item) =>
      sum + (item.quantity * item.unitPrice), 0
    );
    const laborCost = (laborHours || 0) * (hourlyRate || 50);
    const totalBeforeVat = subtotal + laborCost;
    const vatRate = 21;
    const vatAmount = totalBeforeVat * (vatRate / 100);
    const total = totalBeforeVat + vatAmount;

    // Generate ID
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        id: {
          startsWith: String(year)
        }
      }
    });
    const id = `${year}-${String(count + 1).padStart(4, '0')}`;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        id,
        customerId,
        userId: req.user.id,
        quoteId,
        workOrderId,
        status: 'draft',
        date: new Date().toISOString().split('T')[0],
        dueDate,
        laborHours: laborHours || 0,
        hourlyRate: hourlyRate || 50,
        subtotal,
        vatRate,
        vatAmount,
        total,
        notes,
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

    // Update quote if provided
    if (quoteId) {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { invoiceId: id }
      });
    }

    // Update work order if provided
    if (workOrderId) {
      await prisma.workOrder.update({
        where: { id: workOrderId },
        data: { invoiceId: id }
      });
    }

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const existing = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Factuur niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze factuur'
      });
    }

    const updateData = { status, notes };

    if (status === 'paid' && !existing.paidAt) {
      updateData.paidAt = new Date();
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true
      }
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Factuur niet gevonden' });
    }

    if (!req.user.isAdmin && existing.userId !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze factuur'
      });
    }

    await prisma.invoice.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
