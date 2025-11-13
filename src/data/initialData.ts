/**
 * Initial Data - Demo/Default Data
 *
 * Dit bestand bevat alle demo data voor development en testing
 * In productie wordt dit vervangen door database queries
 */

import type {
  User,
  Customer,
  InventoryItem,
  InventoryCategory,
  WorkOrder,
  Quote,
  Invoice,
  Notification,
} from '../types';

// ============================================================================
// USERS
// ============================================================================

export const initialUsers: User[] = [
  {
    id: 'user-001',
    name: 'Sophie van den Berg',
    email: 'sophie@bedrijf.nl',
    password: '1234', // Plain text for demo only!
    isAdmin: true,
    role: 'Manager Productie',
    phone: '+31 6 12345678',
    createdAt: '2024-01-15T08:00:00Z',
    notes: [],
  },
  {
    id: 'user-002',
    name: 'Jan Jansen',
    email: 'jan@bedrijf.nl',
    password: '1234',
    isAdmin: false,
    role: 'Monteur',
    phone: '+31 6 87654321',
    createdAt: '2024-01-15T08:00:00Z',
    notes: [],
  },
  {
    id: 'user-003',
    name: 'Emma de Vries',
    email: 'emma@bedrijf.nl',
    password: '1234',
    isAdmin: false,
    role: 'Monteur',
    phone: '+31 6 11223344',
    createdAt: '2024-02-01T08:00:00Z',
    notes: [],
  },
  {
    id: 'user-004',
    name: 'Lucas Bakker',
    email: 'lucas@bedrijf.nl',
    password: '1234',
    isAdmin: false,
    role: 'Magazijnmedewerker',
    phone: '+31 6 99887766',
    createdAt: '2024-02-15T08:00:00Z',
    notes: [],
  },
];

// ============================================================================
// INVENTORY CATEGORIES
// ============================================================================

export const initialCategories: InventoryCategory[] = [
  {
    id: 'cat-001',
    name: 'Grondstoffen',
    description: 'Ruw materiaal voor productie',
    color: '#3b82f6', // Blue
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'cat-002',
    name: 'Halffabricaten',
    description: 'Gedeeltelijk verwerkte producten',
    color: '#f59e0b', // Orange
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'cat-003',
    name: 'Eindproducten',
    description: 'Kant-en-klare producten',
    color: '#10b981', // Green
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'cat-004',
    name: 'Gereedschap',
    description: 'Machines en gereedschappen',
    color: '#6366f1', // Indigo
    createdAt: '2024-01-01T08:00:00Z',
  },
  {
    id: 'cat-005',
    name: 'Verbruiksartikelen',
    description: 'Verbruiksartikelen en kleine onderdelen',
    color: '#8b5cf6', // Purple
    createdAt: '2024-01-01T08:00:00Z',
  },
];

// ============================================================================
// INVENTORY ITEMS
// ============================================================================

export const initialInventory: InventoryItem[] = [
  {
    id: 'INV-0001',
    name: 'Stalen Plaat 2mm',
    skuLeverancier: 'SUP-SP-2MM',
    skuAutomatisch: 'INV-0001',
    skuAangepast: 'STEEL-PLATE-2',
    quantity: 150,
    unit: 'm²',
    price: 45.50,
    location: 'Magazijn A1',
    supplier: 'Staal Leverancier BV',
    reorderLevel: 50,
    categoryId: 'cat-001',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'INV-0002',
    name: 'Boormachine Professioneel',
    skuLeverancier: 'BOSCH-GBM-350',
    skuAutomatisch: 'INV-0002',
    quantity: 8,
    unit: 'stuk',
    price: 189.99,
    location: 'Gereedschapskamer',
    supplier: 'Bosch Nederland',
    reorderLevel: 3,
    categoryId: 'cat-004',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'INV-0003',
    name: 'Schroeven M6x20 (doos van 100)',
    skuLeverancier: 'SCR-M6-20-100',
    skuAutomatisch: 'INV-0003',
    quantity: 45,
    unit: 'doos',
    price: 12.50,
    location: 'Magazijn B3',
    supplier: 'Bevestigingsmaterialen Groot',
    reorderLevel: 20,
    categoryId: 'cat-005',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'INV-0004',
    name: 'Verfspuit Elektrisch',
    skuLeverancier: 'WAGNER-W500',
    skuAutomatisch: 'INV-0004',
    quantity: 5,
    unit: 'stuk',
    price: 249.00,
    location: 'Gereedschapskamer',
    supplier: 'Wagner Professional',
    reorderLevel: 2,
    categoryId: 'cat-004',
    posAlertNote: 'Controleer olie niveau voor gebruik',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
  },
  {
    id: 'INV-0005',
    name: 'Aluminium Profiel 40x40',
    skuLeverancier: 'ALU-PRO-40',
    skuAutomatisch: 'INV-0005',
    quantity: 25,
    unit: 'meter',
    price: 18.75,
    location: 'Magazijn A2',
    supplier: 'Aluminium Specialist BV',
    reorderLevel: 10,
    categoryId: 'cat-001',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
  },
];

// ============================================================================
// CUSTOMERS
// ============================================================================

export const initialCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Bouwbedrijf Jansen BV',
    email: 'info@bouwbedrijfjansen.nl',
    phone: '+31 10 1234567',
    address: 'Bouwstraat 12',
    city: 'Rotterdam',
    postalCode: '3011 AB',
    notes: 'Vaste klant sinds 2020. Betaalt altijd op tijd.',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-05T08:00:00Z',
  },
  {
    id: 'cust-002',
    name: 'Installatiebedrijf Peters',
    email: 'contact@peters-installatie.nl',
    phone: '+31 20 9876543',
    address: 'Installatieweg 45',
    city: 'Amsterdam',
    postalCode: '1012 CD',
    createdAt: '2024-01-08T08:00:00Z',
    updatedAt: '2024-01-08T08:00:00Z',
  },
  {
    id: 'cust-003',
    name: 'Metaalbewerking De Groot',
    email: 'admin@degroot-metaal.nl',
    phone: '+31 30 5551234',
    address: 'Industriepark 88',
    city: 'Utrecht',
    postalCode: '3542 AB',
    createdAt: '2024-01-12T08:00:00Z',
    updatedAt: '2024-01-12T08:00:00Z',
  },
];

// ============================================================================
// WORKORDERS
// ============================================================================

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'WO-001',
    indexNumber: 1,
    title: 'Stalen Frame Assemblage',
    description: 'Assembleer stalen frame volgens tekening BJ-2024-001',
    assignedTo: 'user-002', // Jan
    status: 'in_progress',
    estimatedHours: 8,
    actualHours: 4.5,
    materials: [
      { inventoryItemId: 'INV-0001', quantity: 5 },
      { inventoryItemId: 'INV-0003', quantity: 2 },
    ],
    customerId: 'cust-001',
    location: 'Werkplaats 1',
    scheduledDate: '2025-01-14',
    createdAt: '2025-01-13T08:00:00Z',
    assignedAt: '2025-01-13T08:30:00Z',
    startedAt: '2025-01-13T09:00:00Z',
    updatedAt: '2025-01-13T14:30:00Z',
    history: [
      {
        id: 'hist-001',
        timestamp: '2025-01-13T08:00:00Z',
        action: 'created',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Werkorder aangemaakt',
      },
      {
        id: 'hist-002',
        timestamp: '2025-01-13T08:30:00Z',
        action: 'assigned',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Toegewezen aan Jan Jansen',
      },
      {
        id: 'hist-003',
        timestamp: '2025-01-13T09:00:00Z',
        action: 'started',
        userId: 'user-002',
        userName: 'Jan Jansen',
        details: 'Werkorder gestart',
      },
    ],
  },
  {
    id: 'WO-002',
    indexNumber: 2,
    title: 'Installatie Verfspuit Systeem',
    description: 'Installeer en test verfspuit systeem bij klant',
    assignedTo: 'user-003', // Emma
    status: 'todo',
    estimatedHours: 4,
    actualHours: 0,
    materials: [
      { inventoryItemId: 'INV-0004', quantity: 1 },
    ],
    customerId: 'cust-002',
    location: 'Klant locatie',
    scheduledDate: '2025-01-15',
    createdAt: '2025-01-13T10:00:00Z',
    assignedAt: '2025-01-13T10:15:00Z',
    updatedAt: '2025-01-13T10:15:00Z',
    history: [
      {
        id: 'hist-004',
        timestamp: '2025-01-13T10:00:00Z',
        action: 'created',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Werkorder aangemaakt',
      },
      {
        id: 'hist-005',
        timestamp: '2025-01-13T10:15:00Z',
        action: 'assigned',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Toegewezen aan Emma de Vries',
      },
    ],
  },
  {
    id: 'WO-003',
    indexNumber: 3,
    title: 'Aluminium Profielen Op Maat',
    description: 'Snij aluminium profielen op maat volgens specificaties',
    assignedTo: 'user-002', // Jan
    status: 'pending',
    estimatedHours: 2,
    actualHours: 0,
    materials: [
      { inventoryItemId: 'INV-0005', quantity: 10 },
    ],
    customerId: 'cust-003',
    pendingReason: 'Wachten op definitieve maten van klant',
    scheduledDate: '2025-01-16',
    createdAt: '2025-01-12T14:00:00Z',
    assignedAt: '2025-01-12T14:15:00Z',
    updatedAt: '2025-01-13T11:00:00Z',
    history: [
      {
        id: 'hist-006',
        timestamp: '2025-01-12T14:00:00Z',
        action: 'created',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Werkorder aangemaakt',
      },
      {
        id: 'hist-007',
        timestamp: '2025-01-12T14:15:00Z',
        action: 'assigned',
        userId: 'user-001',
        userName: 'Sophie van den Berg',
        details: 'Toegewezen aan Jan Jansen',
      },
      {
        id: 'hist-008',
        timestamp: '2025-01-13T11:00:00Z',
        action: 'status_changed',
        userId: 'user-002',
        userName: 'Jan Jansen',
        details: 'Status gewijzigd naar In Wacht',
        oldValue: 'todo',
        newValue: 'pending',
      },
    ],
  },
];

// ============================================================================
// QUOTES
// ============================================================================

export const initialQuotes: Quote[] = [
  {
    id: 'Q-2025-001',
    customerId: 'cust-001',
    customerName: 'Bouwbedrijf Jansen BV',
    title: 'Offerte Stalen Frame',
    description: 'Levering en assemblage stalen frame',
    items: [
      {
        id: 'qi-001',
        inventoryItemId: 'INV-0001',
        name: 'Stalen Plaat 2mm',
        quantity: 5,
        price: 45.50,
        total: 227.50,
      },
      {
        id: 'qi-002',
        inventoryItemId: 'INV-0003',
        name: 'Schroeven M6x20',
        quantity: 2,
        price: 12.50,
        total: 25.00,
      },
    ],
    laborHours: 8,
    hourlyRate: 65,
    subtotal: 772.50,
    vatRate: 21,
    vatAmount: 162.23,
    total: 934.73,
    status: 'approved',
    validUntil: '2025-02-13',
    workOrderId: 'WO-001',
    createdAt: '2025-01-08T10:00:00Z',
    sentAt: '2025-01-08T14:00:00Z',
    approvedAt: '2025-01-10T09:30:00Z',
    updatedAt: '2025-01-10T09:30:00Z',
  },
];

// ============================================================================
// INVOICES
// ============================================================================

export const initialInvoices: Invoice[] = [];

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const initialNotifications: Notification[] = [
  {
    id: 'notif-001',
    type: 'warning',
    title: 'Lage Voorraad',
    message: 'Aluminium Profiel 40x40 heeft lage voorraad (25 stuks)',
    read: false,
    link: '/inventory',
    timestamp: '2025-01-13T08:00:00Z',
  },
  {
    id: 'notif-002',
    type: 'success',
    title: 'Offerte Geaccepteerd',
    message: 'Offerte Q-2025-001 is geaccepteerd door Bouwbedrijf Jansen BV',
    read: false,
    link: '/accounting',
    timestamp: '2025-01-10T09:30:00Z',
  },
  {
    id: 'notif-003',
    type: 'info',
    title: 'Nieuwe Werkorder',
    message: 'Werkorder WO-002 is aan je toegewezen',
    userId: 'user-003', // Emma
    read: false,
    link: '/workorders',
    timestamp: '2025-01-13T10:15:00Z',
  },
];
