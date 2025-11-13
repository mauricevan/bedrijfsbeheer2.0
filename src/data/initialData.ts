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
  WebshopProduct,
  WebshopCategory,
  WebshopOrder,
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
        inventoryItemId: 'inv-2',
        quantity: 12,
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
// WEBSHOP - CATEGORIES
// ============================================================================

export const initialWebshopCategories: WebshopCategory[] = [
  {
    id: 'cat-1',
    name: 'Elektronica',
    slug: 'elektronica',
    description: 'Elektrische apparaten en gadgets',
    sortOrder: 1,
    isActive: true,
    metaTitle: 'Elektronica - Online Winkel',
    metaDescription: 'Ontdek onze collectie elektronica',
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Notebooks en laptops voor thuis en werk',
    parentCategoryId: 'cat-1',
    sortOrder: 1,
    isActive: true,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Accessoires',
    slug: 'accessoires',
    description: 'Computer accessoires en randapparatuur',
    parentCategoryId: 'cat-1',
    sortOrder: 2,
    isActive: true,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Kantoorartikelen',
    slug: 'kantoorartikelen',
    description: 'Alles voor kantoor en administratie',
    sortOrder: 2,
    isActive: true,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:00:00.000Z',
  },
];

// ============================================================================
// WEBSHOP - PRODUCTS
// ============================================================================

export const initialWebshopProducts: WebshopProduct[] = [
  {
    id: 'prod-1',
    name: 'Business Laptop Pro 15"',
    slug: 'business-laptop-pro-15',
    sku: 'PRD-0001',
    shortDescription: 'Krachtige zakelijke laptop met Intel i7 processor',
    longDescription:
      'Deze Business Laptop Pro is perfect voor professionals. Met een Intel i7 processor, 16GB RAM en 512GB SSD heb je alle kracht die je nodig hebt voor multitasking.',
    salePrice: 899.99,
    originalPrice: 1099.99,
    costPrice: 650.0,
    trackInventory: true,
    stockQuantity: 15,
    lowStockThreshold: 5,
    categoryIds: ['cat-2', 'cat-1'],
    primaryCategoryId: 'cat-2',
    status: 'active',
    visibility: 'public',
    featured: true,
    weight: 1.8,
    dimensions: { length: 38, width: 26, height: 2 },
    shippingCategory: 'standard',
    isDigitalProduct: false,
    metaTitle: 'Business Laptop Pro 15" - Krachtige Zakelijke Laptop',
    metaDescription:
      'Koop de Business Laptop Pro 15" met Intel i7, 16GB RAM en 512GB SSD. Perfect voor professionals.',
    tags: ['laptop', 'business', 'intel-i7', 'zakelijk'],
    vatRate: 21,
    allowReviews: true,
    adminNotes: 'Populair product, regelmatig bijbestellen',
    viewCount: 234,
    purchaseCount: 12,
    wishlistCount: 8,
    createdAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-08T14:30:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Draadloze Muis Premium',
    slug: 'draadloze-muis-premium',
    sku: 'PRD-0002',
    shortDescription: 'Ergonomische draadloze muis met 6 knoppen',
    longDescription:
      'Deze premium draadloze muis biedt optimaal comfort en precisie. Met 6 programmeerbare knoppen en een batterijduur van 12 maanden is dit de ideale muis voor dagelijks gebruik.',
    salePrice: 29.99,
    costPrice: 15.0,
    trackInventory: true,
    stockQuantity: 45,
    lowStockThreshold: 10,
    categoryIds: ['cat-3', 'cat-1'],
    primaryCategoryId: 'cat-3',
    status: 'active',
    visibility: 'public',
    featured: false,
    weight: 0.15,
    dimensions: { length: 12, width: 7, height: 4 },
    shippingCategory: 'standard',
    isDigitalProduct: false,
    metaTitle: 'Draadloze Muis Premium - Ergonomisch & Comfortabel',
    metaDescription: 'Ergonomische draadloze muis met 6 knoppen en lange batterijduur',
    tags: ['muis', 'draadloos', 'ergonomisch', 'accessoires'],
    vatRate: 21,
    allowReviews: true,
    viewCount: 156,
    purchaseCount: 28,
    wishlistCount: 3,
    createdAt: '2025-01-02T10:00:00.000Z',
    updatedAt: '2025-01-10T09:15:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'USB-C Hub 7-in-1',
    slug: 'usb-c-hub-7-in-1',
    sku: 'PRD-0003',
    shortDescription: '7 poorten USB-C hub voor uitbreiding',
    longDescription:
      'Breid je laptop uit met deze veelzijdige USB-C hub. Inclusief 3x USB 3.0, HDMI 4K, SD/TF kaartlezer, en USB-C PD charging. Plug & play zonder drivers.',
    salePrice: 49.99,
    costPrice: 22.0,
    trackInventory: true,
    stockQuantity: 8,
    lowStockThreshold: 10,
    categoryIds: ['cat-3', 'cat-1'],
    primaryCategoryId: 'cat-3',
    status: 'active',
    visibility: 'public',
    featured: true,
    weight: 0.08,
    dimensions: { length: 11, width: 4, height: 1.5 },
    shippingCategory: 'standard',
    isDigitalProduct: false,
    metaTitle: 'USB-C Hub 7-in-1 - Uitbreiding voor je Laptop',
    metaDescription: '7 poorten USB-C hub met HDMI 4K, USB 3.0 en kaartlezer',
    tags: ['usb-c', 'hub', 'adapter', 'hdmi'],
    vatRate: 21,
    allowReviews: true,
    adminNotes: 'Lage voorraad, bestellen bij leverancier',
    viewCount: 89,
    purchaseCount: 15,
    wishlistCount: 12,
    createdAt: '2025-01-03T10:00:00.000Z',
    updatedAt: '2025-01-11T11:20:00.000Z',
  },
  {
    id: 'prod-4',
    name: 'Notitieblok A4 Gelinieerd',
    slug: 'notitieblok-a4-gelinieerd',
    sku: 'PRD-0004',
    shortDescription: 'Professioneel notitieblok met 100 vellen',
    longDescription:
      'Hoogwaardig A4 notitieblok met 100 gelinieerde vellen. Perfect voor vergaderingen, notities en ideëen. Stevige kartonnen omslag.',
    salePrice: 4.99,
    costPrice: 1.5,
    trackInventory: true,
    stockQuantity: 120,
    lowStockThreshold: 20,
    categoryIds: ['cat-4'],
    primaryCategoryId: 'cat-4',
    status: 'active',
    visibility: 'public',
    featured: false,
    weight: 0.3,
    dimensions: { length: 29.7, width: 21, height: 1 },
    shippingCategory: 'standard',
    isDigitalProduct: false,
    tags: ['notitieblok', 'kantoor', 'a4', 'papier'],
    vatRate: 9,
    allowReviews: true,
    viewCount: 45,
    purchaseCount: 34,
    createdAt: '2025-01-04T10:00:00.000Z',
    updatedAt: '2025-01-09T16:00:00.000Z',
  },
  {
    id: 'prod-5',
    name: 'Concept Product - Gaming Toetsenbord',
    slug: 'concept-product-gaming-toetsenbord',
    sku: 'PRD-0005',
    shortDescription: 'Mechanisch RGB gaming toetsenbord (Binnenkort)',
    longDescription: 'Dit product is nog in ontwikkeling en zal binnenkort beschikbaar zijn.',
    salePrice: 129.99,
    costPrice: 70.0,
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 5,
    categoryIds: ['cat-3', 'cat-1'],
    primaryCategoryId: 'cat-3',
    status: 'draft',
    visibility: 'hidden',
    featured: false,
    weight: 1.2,
    shippingCategory: 'standard',
    isDigitalProduct: false,
    tags: ['toetsenbord', 'gaming', 'rgb', 'mechanisch'],
    vatRate: 21,
    allowReviews: false,
    adminNotes: 'Wachten op leverancier voor lancering',
    viewCount: 0,
    purchaseCount: 0,
    createdAt: '2025-01-05T10:00:00.000Z',
    updatedAt: '2025-01-05T10:00:00.000Z',
  },
];

// ============================================================================
// WEBSHOP - ORDERS
// ============================================================================

export const initialWebshopOrders: WebshopOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2025-001',
    customerId: 'customer-1',
    customerName: 'Jan Bakker',
    customerEmail: 'jan.bakker@example.com',
    customerPhone: '+31612345678',
    items: [
      {
        productId: 'prod-1',
        productName: 'Business Laptop Pro 15"',
        quantity: 1,
        unitPrice: 899.99,
        total: 899.99,
      },
      {
        productId: 'prod-2',
        productName: 'Draadloze Muis Premium',
        quantity: 2,
        unitPrice: 29.99,
        total: 59.98,
      },
    ],
    subtotal: 959.97,
    shippingCost: 6.95,
    vatAmount: 201.45,
    total: 1168.37,
    status: 'delivered',
    shippingAddress: {
      street: 'Hoofdstraat 123',
      city: 'Amsterdam',
      postalCode: '1012 AB',
      country: 'Nederland',
    },
    paymentMethod: 'iDEAL',
    paymentStatus: 'paid',
    paidAt: '2025-01-08T10:15:00.000Z',
    trackingNumber: 'TRK-NL-2025-001',
    carrier: 'PostNL',
    customerNotes: 'Graag voor 12:00 bezorgen',
    adminNotes: 'VIP klant, snelle afhandeling',
    createdAt: '2025-01-08T09:30:00.000Z',
    updatedAt: '2025-01-10T14:20:00.000Z',
    shippedAt: '2025-01-09T08:00:00.000Z',
    deliveredAt: '2025-01-10T14:20:00.000Z',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-2025-002',
    customerName: 'Sophie de Vries',
    customerEmail: 'sophie.devries@example.com',
    customerPhone: '+31687654321',
    items: [
      {
        productId: 'prod-3',
        productName: 'USB-C Hub 7-in-1',
        quantity: 1,
        unitPrice: 49.99,
        total: 49.99,
      },
    ],
    subtotal: 49.99,
    shippingCost: 4.95,
    vatAmount: 11.54,
    total: 66.48,
    status: 'processing',
    shippingAddress: {
      street: 'Kerkstraat 45',
      city: 'Utrecht',
      postalCode: '3511 AB',
      country: 'Nederland',
    },
    paymentMethod: 'Creditcard',
    paymentStatus: 'paid',
    paidAt: '2025-01-11T15:20:00.000Z',
    createdAt: '2025-01-11T15:20:00.000Z',
    updatedAt: '2025-01-11T16:00:00.000Z',
  },
  {
    id: 'order-3',
    orderNumber: 'ORD-2025-003',
    customerName: 'Peter Jansen',
    customerEmail: 'peter.j@example.com',
    items: [
      {
        productId: 'prod-4',
        productName: 'Notitieblok A4 Gelinieerd',
        quantity: 10,
        unitPrice: 4.99,
        total: 49.9,
      },
    ],
    subtotal: 49.9,
    shippingCost: 4.95,
    vatAmount: 4.49,
    total: 59.34,
    status: 'pending',
    shippingAddress: {
      street: 'Dorpsweg 78',
      city: 'Rotterdam',
      postalCode: '3012 CD',
      country: 'Nederland',
    },
    paymentMethod: 'Bankoverschrijving',
    paymentStatus: 'unpaid',
    customerNotes: 'Bestelling voor kantoor',
    createdAt: '2025-01-12T11:00:00.000Z',
    updatedAt: '2025-01-12T11:00:00.000Z',
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
    enabled: true,
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
