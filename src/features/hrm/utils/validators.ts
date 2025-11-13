/**
 * HRM Validators
 * Validatie functies voor personeelsbeheer formulieren
 */

import type { Employee, EmployeeNote } from '../../../types';

export interface ValidationError {
  field: string;
  message: string;
}

export interface EmployeeValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate employee name
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Naam is verplicht' };
  }
  if (name.length < 2) {
    return { field: 'name', message: 'Naam moet minimaal 2 tekens bevatten' };
  }
  if (name.length > 100) {
    return { field: 'name', message: 'Naam mag maximaal 100 tekens bevatten' };
  }
  return null;
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email || email.trim().length === 0) {
    return { field: 'email', message: 'E-mailadres is verplicht' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Ongeldig e-mailadres' };
  }

  return null;
};

/**
 * Validate phone number (Dutch format)
 */
export const validatePhone = (phone?: string): ValidationError | null => {
  if (!phone) return null; // Optional field

  const cleaned = phone.replace(/\D/g, '');

  // Dutch mobile: 06xxxxxxxx (10 digits)
  // Dutch landline: 0xxxxxxxxx (10 digits)
  // International: +31xxxxxxxxx (11+ digits)
  if (cleaned.length < 10) {
    return { field: 'phone', message: 'Telefoonnummer moet minimaal 10 cijfers bevatten' };
  }

  if (cleaned.length > 15) {
    return { field: 'phone', message: 'Telefoonnummer is te lang' };
  }

  return null;
};

/**
 * Validate job title
 */
export const validateJobTitle = (jobTitle?: string): ValidationError | null => {
  if (!jobTitle) return null; // Optional field

  if (jobTitle.length > 100) {
    return { field: 'jobTitle', message: 'Functietitel mag maximaal 100 tekens bevatten' };
  }

  return null;
};

/**
 * Validate department
 */
export const validateDepartment = (department?: string): ValidationError | null => {
  if (!department) return null; // Optional field

  if (department.length > 50) {
    return { field: 'department', message: 'Afdelingsnaam mag maximaal 50 tekens bevatten' };
  }

  return null;
};

/**
 * Validate hire date
 */
export const validateHireDate = (hireDate?: string): ValidationError | null => {
  if (!hireDate) return null; // Optional field

  const date = new Date(hireDate);
  if (isNaN(date.getTime())) {
    return { field: 'hireDate', message: 'Ongeldige datum' };
  }

  const now = new Date();
  if (date > now) {
    return { field: 'hireDate', message: 'Startdatum kan niet in de toekomst liggen' };
  }

  // Check if date is not too far in the past (e.g., 100 years)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  if (date < hundredYearsAgo) {
    return { field: 'hireDate', message: 'Startdatum lijkt onrealistisch ver in het verleden' };
  }

  return null;
};

/**
 * Validate vacation days
 */
export const validateVacationDays = (days?: number): ValidationError | null => {
  if (days === undefined) return null; // Optional field

  if (days < 0) {
    return { field: 'vacationDays', message: 'Aantal verlofdagen kan niet negatief zijn' };
  }

  if (days > 100) {
    return { field: 'vacationDays', message: 'Aantal verlofdagen lijkt onrealistisch hoog' };
  }

  return null;
};

/**
 * Validate vacation days used
 */
export const validateVacationDaysUsed = (
  used?: number,
  total?: number
): ValidationError | null => {
  if (used === undefined) return null; // Optional field

  if (used < 0) {
    return {
      field: 'vacationDaysUsed',
      message: 'Gebruikte verlofdagen kan niet negatief zijn'
    };
  }

  if (total !== undefined && used > total) {
    return {
      field: 'vacationDaysUsed',
      message: 'Gebruikte verlofdagen kan niet meer zijn dan totaal beschikbaar'
    };
  }

  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password: string, isNew: boolean = false): ValidationError | null => {
  // Only validate if creating new employee
  if (!isNew) return null;

  if (!password || password.trim().length === 0) {
    return { field: 'password', message: 'Wachtwoord is verplicht voor nieuwe medewerkers' };
  }

  if (password.length < 4) {
    return { field: 'password', message: 'Wachtwoord moet minimaal 4 tekens bevatten' };
  }

  if (password.length > 100) {
    return { field: 'password', message: 'Wachtwoord is te lang' };
  }

  return null;
};

/**
 * Validate note content
 */
export const validateNoteContent = (content: string): ValidationError | null => {
  if (!content || content.trim().length === 0) {
    return { field: 'content', message: 'Notitie inhoud is verplicht' };
  }

  if (content.length > 5000) {
    return { field: 'content', message: 'Notitie mag maximaal 5000 tekens bevatten' };
  }

  return null;
};

/**
 * Validate complete employee
 */
export const validateEmployee = (
  employee: Partial<Employee>,
  isNew: boolean = false
): EmployeeValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  if (employee.name !== undefined) {
    const nameError = validateName(employee.name);
    if (nameError) errors.push(nameError);
  } else {
    errors.push({ field: 'name', message: 'Naam is verplicht' });
  }

  if (employee.email !== undefined) {
    const emailError = validateEmail(employee.email);
    if (emailError) errors.push(emailError);
  } else {
    errors.push({ field: 'email', message: 'E-mailadres is verplicht' });
  }

  // Password only for new employees
  if (isNew) {
    const passwordError = validatePassword(employee.password || '', isNew);
    if (passwordError) errors.push(passwordError);
  }

  // Optional fields with validation
  if (employee.phone !== undefined) {
    const phoneError = validatePhone(employee.phone);
    if (phoneError) errors.push(phoneError);
  }

  if (employee.jobTitle !== undefined) {
    const jobTitleError = validateJobTitle(employee.jobTitle);
    if (jobTitleError) errors.push(jobTitleError);
  }

  if (employee.department !== undefined) {
    const departmentError = validateDepartment(employee.department);
    if (departmentError) errors.push(departmentError);
  }

  if (employee.hireDate !== undefined) {
    const hireDateError = validateHireDate(employee.hireDate);
    if (hireDateError) errors.push(hireDateError);
  }

  if (employee.vacationDays !== undefined) {
    const vacationDaysError = validateVacationDays(employee.vacationDays);
    if (vacationDaysError) errors.push(vacationDaysError);
  }

  if (employee.vacationDaysUsed !== undefined) {
    const vacationDaysUsedError = validateVacationDaysUsed(
      employee.vacationDaysUsed,
      employee.vacationDays
    );
    if (vacationDaysUsedError) errors.push(vacationDaysUsedError);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate employee note
 */
export const validateNote = (
  note: Partial<EmployeeNote>
): EmployeeValidationResult => {
  const errors: ValidationError[] = [];

  if (!note.type) {
    errors.push({ field: 'type', message: 'Notitie type is verplicht' });
  }

  if (note.content !== undefined) {
    const contentError = validateNoteContent(note.content);
    if (contentError) errors.push(contentError);
  } else {
    errors.push({ field: 'content', message: 'Notitie inhoud is verplicht' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if email is unique
 */
export const isEmailUnique = (
  email: string,
  employees: Employee[],
  excludeId?: string
): boolean => {
  return !employees.some(
    emp => emp.email.toLowerCase() === email.toLowerCase() && emp.id !== excludeId
  );
};

/**
 * Validate email uniqueness
 */
export const validateEmailUnique = (
  email: string,
  employees: Employee[],
  excludeId?: string
): ValidationError | null => {
  if (!isEmailUnique(email, employees, excludeId)) {
    return { field: 'email', message: 'Dit e-mailadres is al in gebruik' };
  }
  return null;
};
