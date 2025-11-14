/**
 * useForm Hook (Generic Form Hook)
 * Reusable form state management with validation
 */

import { useState, useCallback } from 'react';
import type { ValidationResult } from '../types/accounting.types';

export interface UseFormReturn<T> {
  formData: T;
  errors: ValidationResult;
  isSubmitting: boolean;
  hasErrors: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleNestedChange: (field: keyof T, index: number, nestedField: string, value: any) => void;
  setFields: (updates: Partial<T>) => void;
  validate: () => ValidationResult;
  handleSubmit: (onSubmit: (data: T) => void | Promise<void>) => Promise<void>;
  reset: (initialData?: T) => void;
  setError: (field: string, message: string) => void;
  clearErrors: () => void;
  setFormData: (data: T) => void;
}

export const useForm = <T extends Record<string, any>>(
  initialData: T,
  validator?: (data: T) => ValidationResult
): UseFormReturn<T> => {
  const [formData, setFormDataState] = useState<T>(initialData);
  const [errors, setErrors] = useState<ValidationResult>({ isValid: true, errors: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle field change
  const handleChange = useCallback((field: keyof T, value: any) => {
    setFormDataState(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle nested field change (for arrays)
  const handleNestedChange = useCallback((field: keyof T, index: number, nestedField: string, value: any) => {
    setFormDataState(prev => {
      const array = prev[field] as any[];
      const updated = [...array];
      updated[index] = {
        ...updated[index],
        [nestedField]: value,
      };
      return {
        ...prev,
        [field]: updated,
      };
    });
  }, []);

  // Set multiple fields at once
  const setFields = useCallback((updates: Partial<T>) => {
    setFormDataState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Validate form
  const validate = useCallback((): ValidationResult => {
    if (!validator) {
      return { isValid: true, errors: [] };
    }

    const result = validator(formData);
    setErrors(result);
    return result;
  }, [formData, validator]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit: (data: T) => void | Promise<void>) => {
    setIsSubmitting(true);

    try {
      const validationResult = validate();
      if (!validationResult.isValid) {
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate]);

  // Reset form
  const reset = useCallback((initialDataOverride?: T) => {
    setFormDataState(initialDataOverride || initialData);
    setErrors({ isValid: true, errors: [] });
    setIsSubmitting(false);
  }, [initialData]);

  // Set single error
  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      isValid: false,
      errors: [
        ...prev.errors.filter(e => e.field !== field),
        { field, message, code: 'CUSTOM_ERROR' },
      ],
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({ isValid: true, errors: [] });
  }, []);

  // Set form data directly
  const setFormData = useCallback((data: T) => {
    setFormDataState(data);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    hasErrors: !errors.isValid,
    handleChange,
    handleNestedChange,
    setFields,
    validate,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setFormData,
  };
};
