/**
 * Global Error Handler Middleware
 * Centralized error handling for all routes
 */

import { Prisma } from '@prisma/client';

export const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`[ERROR] ${req.method} ${req.path}:`, err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Dit record bestaat al',
        field: err.meta?.target
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record niet gevonden'
      });
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Ongeldige referentie - gerelateerd record bestaat niet'
      });
    }
  }

  // Validation errors (from Joi)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validatie mislukt',
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Ongeldige token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token verlopen'
    });
  }

  // Default error
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Er is een fout opgetreden';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
