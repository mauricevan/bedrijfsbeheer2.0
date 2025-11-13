/**
 * Type Definitions - Bedrijfsbeheer Dashboard
 *
 * Centrale type definities voor alle modules
 * Volg conventions: zie CONVENTIONS.md en docs/AI_GUIDE.md
 */

// ============================================================================
// USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In-memory only (later hashed in backend)
  isAdmin: boolean;
  role: string;
  phone?: string;
  createdAt: string;
  notes?: string[];
}

// ============================================================================
// INVENTORY (VOORRAADBEHEER)
// ============================================================================

export type SKUType = 'leverancier' | 'automatisch' | 'aangepast';
export type InventoryUnit = 'stuk' | 'meter' | 'kg' | 'liter' | 'm²' | 'doos';
export type InventoryStatus = 'ok' | 'low' | 'out_of_stock';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color for badge
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;

  // 3 SKU Types (V5.7)
  skuLeverancier?: string;  // SKU from supplier
  skuAutomatisch: string;    // Auto-generated (INV-0001, etc.)
  skuAangepast?: string;     // Custom SKU

  quantity: number;
  unit: InventoryUnit;
  price: number;              // Sale price per unit
  location: string;
  supplier?: string;
  reorderLevel: number;       // Threshold for low stock warning
  categoryId?: string;
  posAlertNote?: string;      // Note shown in POS alerts
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CUSTOMERS (CRM)
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Lead {
  id: string;
  customerName: string;
  email?: string;
  phone?: string;
  company?: string;
  status: LeadStatus;
  value?: number;
  source?: string;
  notes?: string;
  assignedTo?: string; // User ID
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WORKORDERS (WERKORDERS)
// ============================================================================

export type WorkOrderStatus = 'todo' | 'pending' | 'in_progress' | 'completed';

export interface WorkOrderMaterial {
  inventoryItemId: string;
  quantity: number;
}

export interface WorkOrderHistoryEntry {
  id: string;
  timestamp: string;
  action: 'created' | 'assigned' | 'status_changed' | 'started' | 'completed' | 'edited';
  userId?: string;
  userName?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
}

export interface WorkOrder {
  id: string;
  indexNumber?: number;        // Sorting priority (V5.6)
  title: string;
  description?: string;
  assignedTo: string;           // User ID
  status: WorkOrderStatus;
  estimatedHours: number;
  actualHours: number;
  materials?: WorkOrderMaterial[];
  customerId?: string;
  location?: string;
  scheduledDate?: string;
  pendingReason?: string;       // Reason for pending status

  // Links to other modules
  quoteId?: string;
  invoiceId?: string;

  // Timestamps
  createdAt: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;

  // History tracking
  history?: WorkOrderHistoryEntry[];
}

// ============================================================================
// ACCOUNTING (BOEKHOUDING)
// ============================================================================

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected' | 'expired';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface QuoteItem {
  id: string;
  inventoryItemId?: string;     // Optional: link to inventory
  name: string;
  quantity: number;
  price: number;                // Price per unit
  total: number;                // quantity * price
}

export interface Quote {
  id: string;
  customerId: string;
  customerName: string;
  title?: string;
  description?: string;
  items: QuoteItem[];
  laborHours?: number;
  hourlyRate?: number;
  subtotal: number;             // Excl. BTW
  vatRate: number;              // Default 21%
  vatAmount: number;
  total: number;                // Incl. BTW
  status: QuoteStatus;
  validUntil?: string;
  notes?: string;

  // Links
  workOrderId?: string;
  invoiceId?: string;

  // Timestamps
  createdAt: string;
  sentAt?: string;
  approvedAt?: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;        // e.g., "2025-001"
  customerId: string;
  customerName: string;
  items: QuoteItem[];           // Same structure as Quote
  laborHours?: number;
  hourlyRate?: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: InvoiceStatus;
  paymentTerms: number;         // Days (14/30)
  notes?: string;

  // Links
  quoteId?: string;
  workOrderId?: string;

  // Timestamps
  issueDate: string;            // Invoice date
  dueDate: string;              // Payment due date
  paidDate?: string;            // Actual payment date
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  invoiceId?: string;
  date: string;
  createdAt: string;
}

// ============================================================================
// POS (KASSASYSTEEM)
// ============================================================================

export interface POSCartItem {
  inventoryItemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface POSTransaction {
  id: string;
  items: POSCartItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  customerId?: string;
  userId: string;              // Cashier
  timestamp: string;
}

// ============================================================================
// PLANNING (AGENDA)
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay?: boolean;
  assignedTo?: string[];       // User IDs
  customerId?: string;
  location?: string;
  type?: 'meeting' | 'appointment' | 'task' | 'reminder';
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  userId?: string;             // Optional: specific user, or null for all admins
  read: boolean;
  link?: string;               // Optional: link to related item
  timestamp: string;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface SalesReport {
  period: string;
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  topProducts: {
    itemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  topMovingItems: {
    itemId: string;
    name: string;
    soldQuantity: number;
  }[];
}

// ============================================================================
// ADMIN SETTINGS
// ============================================================================

export interface ModuleConfig {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
}

export interface SystemSettings {
  modules: ModuleConfig[];
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress?: string;
  defaultVatRate: number;
  defaultPaymentTerms: number;
  currency: string;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ViewMode = 'compact' | 'detailed';
export type FilterStatus = 'all' | WorkOrderStatus;
export type DateRangeFilter = 'today' | 'week' | 'month' | 'year' | 'custom';
