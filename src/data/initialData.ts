/**
 * Initial Demo Data
 * Voor development/demo doeleinden
 */

import type {
  User,
  Customer,
  InventoryItem,
  Category,
  WorkOrder,
  Quote,
  Invoice,
  Lead,
  Notification,
  ModuleSettings,
} from '../types';

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const initialUsers: User[] = [
  {
    id: 'user-1',
    email: 'sophie@bedrijf.nl',
    name: 'Sophie van Dam',
    password: '1234', // In production: bcrypt hashed
    isAdmin: true,
    role: 'admin',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'user-2',
    email: 'jan@bedrijf.nl',
    name: 'Jan Pietersen',
    password: '1234', // In production: bcrypt hashed
    isAdmin: false,
    role: 'user',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'user-3',
    email: 'lisa@bedrijf.nl',
    name: 'Lisa de Vries',
    password: '1234',
    isAdmin: false,
    role: 'user',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
];

// ============================================================================
// CATEGORIES
// ============================================================================

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Elektriciteit',
    description: 'Elektrische componenten en bedrading',
    color: '#3b82f6',
    createdAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Mechanisch',
    description: 'Mechanische onderdelen en bevestigingen',
    color: '#10b981',
    createdAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Gereedschap',
    description: 'Handgereedschap en machines',
    color: '#f59e0b',
    createdAt: '2024-01-01T08:00:00.000Z',
  },
];

// ============================================================================
// INVENTORY
// ============================================================================

export const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'M6 Bout RVS',
    skuSupplier: 'BOLT-M6-SS',
    skuAutomatic: 'INV-0001',
    skuCustom: 'B-M6',
    quantity: 250,
    unit: 'stuk',
    location: 'Schap A1',
    supplier: 'BouwMaat BV',
    categoryId: 'cat-2',
    unitPrice: 0.35,
    costPrice: 0.20,
    reorderLevel: 50,
    reorderQuantity: 200,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'inv-2',
    name: 'LED Lamp 12V',
    skuSupplier: 'LED-12V-5W',
    skuAutomatic: 'INV-0002',
    skuCustom: 'LED-12',
    quantity: 45,
    unit: 'stuk',
    location: 'Schap B3',
    supplier: 'TechLight NL',
    categoryId: 'cat-1',
    unitPrice: 12.50,
    costPrice: 7.80,
    reorderLevel: 20,
    reorderQuantity: 50,
    posAlertNote: 'Controleer voltage',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'inv-3',
    name: 'Schroevendraaier Set',
    skuSupplier: 'SCREWDRIVER-SET-PRO',
    skuAutomatic: 'INV-0003',
    quantity: 8,
    unit: 'stuk',
    location: 'Schap C2',
    supplier: 'ToolPro',
    categoryId: 'cat-3',
    unitPrice: 45.00,
    costPrice: 28.00,
    reorderLevel: 5,
    reorderQuantity: 10,
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
];

// ============================================================================
// CUSTOMERS
// ============================================================================

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'ABC Producties',
    email: 'info@abcproducties.nl',
    phone: '010-1234567',
    address: 'Industrieweg 12',
    postalCode: '3045 AB',
    city: 'Rotterdam',
    company: 'ABC Producties BV',
    vatNumber: 'NL123456789B01',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
  {
    id: 'cust-2',
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.nl',
    phone: '020-9876543',
    address: 'Technologielaan 45',
    postalCode: '1234 XY',
    city: 'Amsterdam',
    company: 'TechCorp Solutions',
    vatNumber: 'NL987654321B01',
    createdAt: '2024-01-01T08:00:00.000Z',
    updatedAt: '2024-01-01T08:00:00.000Z',
  },
];

// ============================================================================
// WORKORDERS
// ============================================================================

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'wo-1',
    title: 'LED Verlichting Installeren',
    description: 'Installatie van nieuwe LED verlichting in productiehal',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    status: 'in_progress',
    priority: 'high',
    estimatedHours: 8,
    actualHours: 4.5,
    materials: [
      {
        id: 'mat-1',
        inventoryItemId: 'inv-2',
        name: 'LED Paneel 60x60cm',
        quantity: 12,
        unit: 'stuk',
        unitPrice: 12.50,
      },
    ],
    customerId: 'cust-1',
    createdAt: '2025-01-10T09:00:00.000Z',
    updatedAt: '2025-01-13T14:30:00.000Z',
    startedAt: '2025-01-10T09:30:00.000Z',
    dueDate: '2025-01-15T17:00:00.000Z',
  },
  {
    id: 'wo-2',
    title: 'Onderhoud Machines',
    description: 'Periodiek onderhoud machines lijn 2',
    assignedTo: 'user-3',
    createdBy: 'user-1',
    status: 'todo',
    priority: 'medium',
    estimatedHours: 6,
    actualHours: 0,
    createdAt: '2025-01-12T10:00:00.000Z',
    updatedAt: '2025-01-12T10:00:00.000Z',
    dueDate: '2025-01-18T17:00:00.000Z',
  },
];

// ============================================================================
// QUOTES (Offertes)
// ============================================================================

export const initialQuotes: Quote[] = [
  {
    id: 'quote-1',
    quoteNumber: 'Q2025-001',
    customerId: 'cust-1',
    customerName: 'ABC Producties',
    items: [
      {
        id: 'qi-1',
        inventoryItemId: 'inv-2',
        description: 'LED Lamp 12V',
        quantity: 20,
        unitPrice: 12.50,
        total: 250.00,
        unit: 'stuk',
      },
    ],
    laborHours: 8,
    hourlyRate: 50,
    subtotal: 650.00, // 250 + (8 * 50)
    vatRate: 21,
    vatAmount: 136.50,
    total: 786.50,
    status: 'approved',
    workOrderId: 'wo-1',
    notes: 'Installatie gepland voor volgende week',
    validUntil: '2025-02-10T23:59:59.000Z',
    createdBy: 'user-1',
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-08T14:00:00.000Z',
  },
];

// ============================================================================
// INVOICES (Facturen)
// ============================================================================

export const initialInvoices: Invoice[] = [];

// ============================================================================
// LEADS
// ============================================================================

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'BuildCo Projects',
    email: 'info@buildco.nl',
    phone: '030-5551234',
    company: 'BuildCo Projects',
    status: 'qualified',
    estimatedValue: 15000,
    probability: 75,
    source: 'Website formulier',
    notes: 'Geïnteresseerd in grootschalige LED installatie',
    assignedTo: 'user-1',
    createdAt: '2025-01-11T11:00:00.000Z',
    updatedAt: '2025-01-12T15:00:00.000Z',
    lastContactedAt: '2025-01-12T15:00:00.000Z',
  },
];

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'warning',
    message: 'Voorraad LED Lamp 12V loopt laag (45 stuks)',
    timestamp: '2025-01-13T08:00:00.000Z',
    read: false,
    priority: 'medium',
    userId: 'user-1',
    module: 'inventory',
  },
  {
    id: 'notif-2',
    type: 'info',
    message: 'Nieuwe offerte Q2025-001 goedgekeurd',
    timestamp: '2025-01-08T14:00:00.000Z',
    read: false,
    priority: 'low',
    userId: 'user-1',
    module: 'accounting',
  },
  {
    id: 'notif-3',
    type: 'success',
    message: 'Werkorder WO-1 gestart door Jan Pietersen',
    timestamp: '2025-01-10T09:30:00.000Z',
    read: true,
    priority: 'low',
    userId: 'user-1',
    module: 'workorders',
  },
];

// ============================================================================
// MODULE SETTINGS
// ============================================================================

export const initialModuleSettings: ModuleSettings[] = [
  {
    id: 'mod-1',
    moduleName: 'dashboard',
    enabled: true,
    displayName: 'Dashboard',
    description: 'Overzicht van bedrijfsactiviteiten',
    icon: '📊',
  },
  {
    id: 'mod-2',
    moduleName: 'inventory',
    enabled: true,
    displayName: 'Voorraadbeheer',
    description: 'Beheer voorraad en materialen',
    icon: '📦',
  },
  {
    id: 'mod-3',
    moduleName: 'workorders',
    enabled: true,
    displayName: 'Werkorders',
    description: 'Beheer werkorders en taken',
    icon: '🔧',
  },
  {
    id: 'mod-4',
    moduleName: 'accounting',
    enabled: true,
    displayName: 'Boekhouding',
    description: 'Offertes en facturen',
    icon: '🧾',
  },
  {
    id: 'mod-5',
    moduleName: 'crm',
    enabled: true,
    displayName: 'CRM',
    description: 'Klanten en leads beheer',
    icon: '👥',
  },
  {
    id: 'mod-6',
    moduleName: 'hrm',
    enabled: true,
    displayName: 'Personeelsbeheer',
    description: 'Medewerkers beheer',
    icon: '👤',
  },
  {
    id: 'mod-7',
    moduleName: 'pos',
    enabled: true,
    displayName: 'Kassasysteem',
    description: 'Verkopen aan balie',
    icon: '💰',
  },
  {
    id: 'mod-8',
    moduleName: 'planning',
    enabled: true,
    displayName: 'Planning',
    description: 'Agenda en afspraken',
    icon: '📅',
  },
  {
    id: 'mod-9',
    moduleName: 'reports',
    enabled: true,
    displayName: 'Rapportages',
    description: 'Analyses en rapporten',
    icon: '📈',
  },
  {
    id: 'mod-10',
    moduleName: 'webshop',
    enabled: false,
    displayName: 'Webshop',
    description: 'Online verkoop',
    icon: '🛒',
  },
  {
    id: 'mod-11',
    moduleName: 'admin',
    enabled: true,
    displayName: 'Instellingen',
    description: 'Systeem instellingen',
    icon: '⚙️',
  },
  {
    id: 'mod-12',
    moduleName: 'notifications',
    enabled: true,
    displayName: 'Notificaties',
    description: 'Meldingen en alerts',
    icon: '🔔',
  },
];
