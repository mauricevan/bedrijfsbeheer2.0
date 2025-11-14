/**
 * Accounting Module Types
 * Extra helper types voor accounting business logic
 *
 * Basis types (Quote, Invoice, Transaction) zijn in src/types/index.ts
 */

import type { Quote, Invoice, Transaction, QuoteItem, InvoiceItem, QuoteStatus, InvoiceStatus } from '../../../types';

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface QuoteFilterOptions {
  status?: QuoteStatus | 'all';
  customerId?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface InvoiceFilterOptions {
  status?: InvoiceStatus | 'all';
  customerId?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  overdueOnly?: boolean;
}

export interface TransactionFilterOptions {
  type?: 'income' | 'expense' | 'all';
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

// ============================================================================
// CALCULATION RESULT TYPES
// ============================================================================

export interface QuoteTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemsSubtotal: number;
  laborSubtotal: number;
}

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  total: number;
  itemsSubtotal: number;
  laborSubtotal: number;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}

export interface InvoiceStats {
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
}

export interface QuoteStats {
  totalAmount: number;
  approvedAmount: number;
  sentAmount: number;
  draftCount: number;
  sentCount: number;
  approvedCount: number;
  rejectedCount: number;
  expiredCount: number;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  quotes: QuoteStats;
  invoices: InvoiceStats;
  transactions: TransactionStats;
  conversionRate: number; // Quotes → Invoices
  averageQuoteValue: number;
  averageInvoiceValue: number;
  averagePaymentDays: number;
}

export interface MonthlyRevenue {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface OutstandingByCustomer {
  customerId: string;
  customerName: string;
  amount: number;
  invoiceCount: number;
}

export interface ChartData {
  monthlyRevenue: MonthlyRevenue[];
  outstandingByCustomer: OutstandingByCustomer[];
  invoiceStatusDistribution: Array<{ status: InvoiceStatus; count: number; amount: number }>;
  quoteStatusDistribution: Array<{ status: QuoteStatus; count: number; amount: number }>;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface QuoteFormData {
  customerId: string;
  customerName: string;
  items: QuoteItem[];
  laborHours: number;
  hourlyRate: number;
  vatRate: number;
  notes?: string;
  validUntil?: string;
}

export interface InvoiceFormData {
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  laborHours: number;
  hourlyRate: number;
  vatRate: number;
  date: string;
  dueDate: string;
  notes?: string;
}

// ============================================================================
// SERVICE OPERATION TYPES
// ============================================================================

export interface CreateQuoteInput extends QuoteFormData {
  createdBy: string;
}

export interface UpdateQuoteInput {
  id: string;
  updates: Partial<Quote>;
}

export interface CreateInvoiceInput extends InvoiceFormData {
  createdBy: string;
}

export interface UpdateInvoiceInput {
  id: string;
  updates: Partial<Invoice>;
}

export interface ConvertQuoteToInvoiceOptions {
  quoteId: string;
  adjustments?: {
    items?: InvoiceItem[];
    laborHours?: number;
    hourlyRate?: number;
    notes?: string;
  };
}

// ============================================================================
// SORTING TYPES
// ============================================================================

export type QuoteSortField = 'date' | 'customer' | 'total' | 'status';
export type InvoiceSortField = 'date' | 'customer' | 'total' | 'status' | 'dueDate';
export type TransactionSortField = 'date' | 'amount' | 'category' | 'type';

export type SortDirection = 'asc' | 'desc';

export interface SortOptions<T = string> {
  field: T;
  direction: SortDirection;
}

// Re-export core types voor convenience
export type {
  Quote,
  Invoice,
  Transaction,
  QuoteItem,
  InvoiceItem,
  QuoteStatus,
  InvoiceStatus,
} from '../../../types';
