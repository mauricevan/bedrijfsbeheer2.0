/**
 * Authentication Middleware
 * JWT verification and user authorization
 */

import { verifyToken } from '../utils/jwt.js';

/**
 * Authenticate JWT token
 * Verifies token and adds user to request
 */
export const authenticate = (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Geen toegang - login vereist'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = verifyToken(token);

    // Add user to request
    req.user = decoded; // { id, email, isAdmin }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token verlopen - login opnieuw'
      });
    }
    return res.status(401).json({
      error: 'Ongeldige token'
    });
  }
};

/**
 * Require admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authenticatie vereist'
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: 'Alleen admins hebben toegang tot deze actie'
    });
  }

  next();
};

/**
 * Require resource ownership or admin
 * @param {string} resourceUserIdField - Field name containing user ID
 */
export const requireOwnership = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authenticatie vereist'
      });
    }

    // Admin can access everything
    if (req.user.isAdmin) {
      return next();
    }

    // User can only access their own resources
    const resource = req.resource; // Set by controller

    if (!resource) {
      return res.status(404).json({
        error: 'Resource niet gevonden'
      });
    }

    if (resource[resourceUserIdField] !== req.user.id) {
      return res.status(403).json({
        error: 'Je hebt geen toegang tot deze resource'
      });
    }

    next();
  };
};
