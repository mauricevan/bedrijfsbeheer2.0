/**
 * Bedrijfsbeheer Dashboard - Type Definitions
 * Versie: 6.0.0
 *
 * Volledig type systeem voor alle 12 modules
 */

// ============================================================================
// 1. USER & AUTHENTICATION
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  password: string; // Hashed in production
  isAdmin: boolean;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

// ============================================================================
// 2. DASHBOARD MODULE
// ============================================================================

export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
  module?: string;
}

// ============================================================================
// 3. INVENTORY MODULE (Voorraadbeheer)
// ============================================================================

export type InventoryUnit =
  | 'stuk'
  | 'meter'
  | 'kg'
  | 'liter'
  | 'm²'
  | 'doos';

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex color code
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;

  // 3 SKU Types (V5.7)
  skuSupplier: string;      // SKU van leverancier
  skuAutomatic: string;     // Auto-generated (INV-0001)
  skuCustom?: string;       // Vrij invulbare SKU

  quantity: number;
  unit: InventoryUnit;
  location: string;
  supplier?: string;
  categoryId?: string;

  // Prijzen
  unitPrice: number;        // Verkoopprijs per eenheid
  costPrice?: number;       // Inkoopprijs

  // Voorraad alerts
  reorderLevel: number;     // Bestel drempel
  reorderQuantity?: number; // Standaard bestel hoeveelheid

  // POS alert
  posAlertNote?: string;    // Notitie voor POS alerts

  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 4. WORKORDERS MODULE
// ============================================================================

export type WorkOrderStatus =
  | 'todo'
  | 'pending'
  | 'in_progress'
  | 'completed';

export interface WorkOrderMaterial {
  inventoryItemId: string;
  quantity: number;
  unitPrice?: number;
}

export interface WorkOrder {
  id: string;
  title: string;
  description: string;

  // Toewijzing
  assignedTo: string;       // User ID
  createdBy: string;        // User ID (admin)

  // Status
  status: WorkOrderStatus;
  priority?: 'low' | 'medium' | 'high';

  // Uren
  estimatedHours: number;
  actualHours: number;

  // Materialen
  materials?: WorkOrderMaterial[];

  // Relaties
  quoteId?: string;         // Link naar offerte
  invoiceId?: string;       // Link naar factuur
  customerId?: string;      // Link naar klant

  // Timestamps
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  dueDate?: string;
}

// ============================================================================
// 5. ACCOUNTING MODULE (Boekhouding)
// ============================================================================

export type QuoteStatus =
  | 'draft'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'expired';

export type InvoiceStatus =
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface QuoteItem {
  id: string;
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: InventoryUnit;
}

export interface Quote {
  id: string;
  quoteNumber: string;      // Q2025-001

  // Klant
  customerId: string;
  customerName: string;

  // Items
  items: QuoteItem[];

  // Arbeid
  laborHours: number;
  hourlyRate: number;

  // Totalen
  subtotal: number;
  vatRate: number;          // BTW percentage (21%)
  vatAmount: number;
  total: number;

  // Status
  status: QuoteStatus;

  // Relaties
  workOrderId?: string;
  invoiceId?: string;

  // Metadata
  notes?: string;
  validUntil?: string;      // Offerte geldig tot
  createdBy: string;        // User ID
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  inventoryItemId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: InventoryUnit;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;    // 2025-001

  // Klant
  customerId: string;
  customerName: string;

  // Items
  items: InvoiceItem[];

  // Arbeid
  laborHours: number;
  hourlyRate: number;

  // Totalen
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;

  // Status en betaling
  status: InvoiceStatus;
  date: string;             // Factuur datum
  dueDate: string;          // Betaal datum
  paidDate?: string;        // Betaald op datum

  // Relaties
  quoteId?: string;
  workOrderId?: string;

  // Metadata
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  invoiceId?: string;
  createdAt: string;
}

// ============================================================================
// 6. CRM MODULE
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;

  // Adres
  address?: string;
  postalCode?: string;
  city?: string;

  // Metadata
  company?: string;
  vatNumber?: string;      // BTW nummer
  notes?: string;

  // Relaties
  quoteIds?: string[];
  invoiceIds?: string[];
  workOrderIds?: string[];

  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | 'new'           // 1. Nieuw
  | 'contacted'     // 2. Gecontacteerd
  | 'qualified'     // 3. Gekwalificeerd
  | 'proposal'      // 4. Offerte verstuurd
  | 'negotiation'   // 5. Onderhandeling
  | 'won'           // 6. Gewonnen
  | 'lost';         // 7. Verloren

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;

  // Status (7-fase pipeline)
  status: LeadStatus;

  // Geschatte waarde
  estimatedValue?: number;
  probability?: number;     // 0-100%

  // Metadata
  source?: string;          // Waar komt lead vandaan
  notes?: string;

  // Toewijzing
  assignedTo?: string;      // User ID

  // Relaties
  customerId?: string;      // Converteerd naar klant

  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;

  // Toewijzing
  assignedTo: string;       // User ID
  createdBy: string;

  // Status
  status: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';

  // Relaties
  customerId?: string;
  leadId?: string;

  // Timestamps
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'sms';

export interface Interaction {
  id: string;
  type: InteractionType;

  // Content
  subject: string;
  description?: string;

  // Relaties
  customerId?: string;
  leadId?: string;
  userId: string;           // Wie heeft interactie gehad

  // Follow-up
  followUpDate?: string;
  followUpCompleted?: boolean;

  // Timestamps
  interactionDate: string;  // Wanneer vond interactie plaats
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 7. HRM MODULE (Personeelsbeheer)
// ============================================================================

export interface Employee extends User {
  // Extra employee fields
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  phone?: string;

  // Verlof
  vacationDays?: number;
  vacationDaysUsed?: number;

  // Notities
  notes?: EmployeeNote[];
}

export interface EmployeeNote {
  id: string;
  employeeId: string;
  type: 'general' | 'milestone' | 'warning' | 'late';
  content: string;
  createdBy: string;
  createdAt: string;
}

// ============================================================================
// 8. POS MODULE (Kassasysteem)
// ============================================================================

export interface SaleItem {
  inventoryItemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Sale {
  id: string;
  saleNumber: string;       // POS-2025-001

  // Items
  items: SaleItem[];

  // Totalen
  subtotal: number;
  vatAmount: number;
  total: number;

  // Betaling
  paymentMethod: 'cash' | 'card' | 'pin';
  amountPaid: number;
  change: number;

  // Metadata
  cashierId: string;        // User ID
  customerId?: string;      // Optioneel: klant koppelen

  createdAt: string;
}

// ============================================================================
// 9. PLANNING MODULE (Agenda)
// ============================================================================

export interface Event {
  id: string;
  title: string;
  description?: string;

  // Tijd
  startDate: string;
  endDate: string;
  allDay: boolean;

  // Toewijzing
  assignedTo?: string[];    // User IDs

  // Relaties
  customerId?: string;
  workOrderId?: string;

  // Metadata
  location?: string;
  color?: string;

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment extends Event {
  // Appointment-specific fields
  attendees?: string[];     // Email addresses
  reminderMinutes?: number; // Herinnering x minuten vooraf
}

// ============================================================================
// 10. REPORTS MODULE (Rapportages)
// ============================================================================

export type ReportType =
  | 'sales'
  | 'inventory'
  | 'quotes'
  | 'workorders'
  | 'financial';

export interface Report {
  id: string;
  type: ReportType;
  title: string;

  // Filters
  dateFrom: string;
  dateTo: string;
  filters?: Record<string, any>;

  // Data
  data: any;                // Report-specific data structure

  // Metadata
  generatedBy: string;      // User ID
  generatedAt: string;
}

// ============================================================================
// 11. WEBSHOP MODULE
// ============================================================================

export interface WebshopProduct {
  id: string;
  inventoryItemId?: string; // Link naar voorraad

  name: string;
  description: string;
  price: number;

  // Webshop specifiek
  images?: string[];
  category?: string;
  tags?: string[];
  featured: boolean;

  // Voorraad
  inStock: boolean;
  stockQuantity?: number;

  // SEO
  slug?: string;
  metaDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;

  // Klant
  customerId?: string;
  customerName: string;
  customerEmail: string;

  // Items
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];

  // Totalen
  subtotal: number;
  shippingCost: number;
  vatAmount: number;
  total: number;

  // Status
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

  // Verzending
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };

  // Betaling
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';

  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// ============================================================================
// 12. ADMIN SETTINGS MODULE
// ============================================================================

export interface ModuleSettings {
  id: string;
  moduleName: string;
  enabled: boolean;
  displayName: string;
  description?: string;
  icon?: string;
}

export interface SystemSettings {
  id: string;

  // Bedrijfsgegevens
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress?: string;

  // Financieel
  defaultVatRate: number;
  defaultHourlyRate: number;
  currency: string;

  // Voorraad
  lowStockThreshold: number;

  // Notificaties
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;

  updatedAt: string;
  updatedBy: string;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type SortOrder = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export type FormMode = 'create' | 'edit' | 'view';

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

// Legacy types (backwards compatibility)
export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  image?: string;
}

export interface Platform {
  id: string;
  name: string;
  type: 'budget' | 'mid-range' | 'premium';
  description: string;
  features: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface ContactInfo {
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  yearsInBusiness: number;
  keyTypes: number;
  brandCount: number;
  rating: number;
  contactInfo: ContactInfo;
}
