/**
 * CRM Validators
 * Validatie functies voor CRM formulieren
 */

import type { Customer, Lead } from '../../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Dutch)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+31|0)[1-9][0-9]{8}$/;
  const cleaned = phone.replace(/[\s-]/g, '');
  return phoneRegex.test(cleaned);
};

/**
 * Validate VAT number (Dutch)
 */
export const isValidVATNumber = (vat: string): boolean => {
  const vatRegex = /^NL[0-9]{9}B[0-9]{2}$/;
  return vatRegex.test(vat);
};

/**
 * Validate customer data
 */
export const validateCustomer = (
  customer: Partial<Customer>
): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!customer.name || customer.name.trim() === '') {
    errors.name = 'Naam is verplicht';
  } else if (customer.name.length < 2) {
    errors.name = 'Naam moet minimaal 2 karakters zijn';
  }

  // Email validation
  if (!customer.email || customer.email.trim() === '') {
    errors.email = 'Email is verplicht';
  } else if (!isValidEmail(customer.email)) {
    errors.email = 'Ongeldig email adres';
  }

  // Phone validation (optional but must be valid if provided)
  if (customer.phone && !isValidPhone(customer.phone)) {
    errors.phone = 'Ongeldig telefoonnummer (gebruik Nederlands formaat)';
  }

  // VAT number validation (optional but must be valid if provided)
  if (customer.vatNumber && !isValidVATNumber(customer.vatNumber)) {
    errors.vatNumber = 'Ongeldig BTW nummer (NL123456789B01 formaat)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate lead data
 */
export const validateLead = (lead: Partial<Lead>): ValidationResult => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!lead.name || lead.name.trim() === '') {
    errors.name = 'Naam is verplicht';
  }

  // Email validation
  if (!lead.email || lead.email.trim() === '') {
    errors.email = 'Email is verplicht';
  } else if (!isValidEmail(lead.email)) {
    errors.email = 'Ongeldig email adres';
  }

  // Phone validation (optional)
  if (lead.phone && !isValidPhone(lead.phone)) {
    errors.phone = 'Ongeldig telefoonnummer';
  }

  // Estimated value validation (optional but must be positive if provided)
  if (
    lead.estimatedValue !== undefined &&
    lead.estimatedValue !== null &&
    lead.estimatedValue < 0
  ) {
    errors.estimatedValue = 'Geschatte waarde kan niet negatief zijn';
  }

  // Probability validation (0-100)
  if (lead.probability !== undefined && lead.probability !== null) {
    if (lead.probability < 0 || lead.probability > 100) {
      errors.probability = 'Kans moet tussen 0 en 100% zijn';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
