/**
 * Validation Middleware
 * Joi-based request validation
 */

import Joi from 'joi';

/**
 * Validate request body against Joi schema
 * @param {Joi.Schema} schema - Joi validation schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        error: 'Validatie mislukt',
        details: error.details.map(d => ({
          field: d.path.join('.'),
          message: d.message
        }))
      });
    }

    req.body = value;
    next();
  };
};

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

// Auth schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Ongeldig email adres',
    'any.required': 'Email is verplicht'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Wachtwoord moet minimaal 8 karakters zijn',
    'any.required': 'Wachtwoord is verplicht'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Naam moet minimaal 2 karakters zijn',
    'string.max': 'Naam mag maximaal 100 karakters zijn',
    'any.required': 'Naam is verplicht'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Quote schema
export const quoteSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  title: Joi.string().max(200).allow(''),
  description: Joi.string().max(5000).allow(''),
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().uuid().allow(null),
      name: Joi.string().max(200).required(),
      description: Joi.string().max(500).allow(''),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required(),
  laborHours: Joi.number().min(0).default(0),
  hourlyRate: Joi.number().min(0).default(50),
  notes: Joi.string().max(5000).allow(''),
  validUntil: Joi.string().allow(null)
});

// Invoice schema
export const invoiceSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  quoteId: Joi.string().allow(null),
  workOrderId: Joi.string().allow(null),
  items: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().uuid().allow(null),
      name: Joi.string().max(200).required(),
      description: Joi.string().max(500).allow(''),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required()
    })
  ).min(1).required(),
  laborHours: Joi.number().min(0).default(0),
  hourlyRate: Joi.number().min(0).default(50),
  dueDate: Joi.string().required(),
  notes: Joi.string().max(5000).allow('')
});

// WorkOrder schema
export const workOrderSchema = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(5000).allow(''),
  customerId: Joi.string().uuid().required(),
  assignedTo: Joi.string().uuid().required(),
  quoteId: Joi.string().allow(null),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  estimatedHours: Joi.number().min(0).allow(null),
  dueDate: Joi.string().allow(null),
  materials: Joi.array().items(
    Joi.object({
      inventoryItemId: Joi.string().uuid().required(),
      quantity: Joi.number().min(1).required()
    })
  ).default([])
});

// Customer schema
export const customerSchema = Joi.object({
  name: Joi.string().max(200).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(50).allow('', null),
  address: Joi.string().max(200).allow('', null),
  city: Joi.string().max(100).allow('', null),
  postalCode: Joi.string().max(20).allow('', null),
  country: Joi.string().max(100).default('Nederland'),
  vatNumber: Joi.string().max(50).allow('', null),
  notes: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('active', 'inactive', 'lead').default('active'),
  source: Joi.string().max(100).allow('', null)
});

// Inventory schema
export const inventorySchema = Joi.object({
  sku: Joi.string().max(50).required(),
  name: Joi.string().max(200).required(),
  description: Joi.string().max(5000).allow('', null),
  category: Joi.string().max(100).allow('', null),
  quantity: Joi.number().min(0).default(0),
  minStock: Joi.number().min(0).default(0),
  maxStock: Joi.number().min(0).allow(null),
  unitPrice: Joi.number().min(0).required(),
  supplier: Joi.string().max(200).allow('', null),
  location: Joi.string().max(200).allow('', null),
  status: Joi.string().valid('active', 'discontinued', 'out_of_stock').default('active')
});
