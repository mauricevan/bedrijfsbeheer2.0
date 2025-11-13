import React, { useState, useMemo } from 'react';
import { User, InventoryItem } from '../../types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ProductStatus = 'draft' | 'active' | 'archived';
export type ProductVisibility = 'public' | 'private' | 'hidden';
export type ShippingCategory = 'standard' | 'express' | 'pickup';

export interface WebshopProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  salePrice: number;
  regularPrice: number;
  costPrice: number;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryIds: string[];
  primaryCategoryId?: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  shippingCategory: ShippingCategory;
  isDigital: boolean;
  metaTitle?: string;
  metaDescription?: string;
  tags: string[];
  vatRate: number;
  allowReviews: boolean;
  adminNotes?: string;
  inventoryItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebshopCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface WebshopOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  vatRate: number;
  shippingCost: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface WebshopPageProps {
  currentUser: User | null;
  products: WebshopProduct[];
  setProducts: React.Dispatch<React.SetStateAction<WebshopProduct[]>>;
  categories: WebshopCategory[];
  setCategories: React.Dispatch<React.SetStateAction<WebshopCategory[]>>;
  orders: WebshopOrder[];
  setOrders: React.Dispatch<React.SetStateAction<WebshopOrder[]>>;
  inventory: InventoryItem[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateSKU = (products: WebshopProduct[]): string => {
  const maxNumber = products.reduce((max, product) => {
    const match = product.sku.match(/PRD-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);
  return `PRD-${String(maxNumber + 1).padStart(4, '0')}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

const getStatusColor = (status: ProductStatus | OrderStatus): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    archived: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

const getStockStatus = (product: WebshopProduct): { label: string; color: string } => {
  if (!product.trackStock) {
    return { label: 'Geen voorraad tracking', color: 'text-gray-500' };
  }
  if (product.stockQuantity === 0) {
    return { label: 'Uitverkocht', color: 'text-red-600' };
  }
  if (product.stockQuantity <= product.lowStockThreshold) {
    return { label: 'Lage voorraad', color: 'text-orange-600' };
  }
  return { label: 'Op voorraad', color: 'text-green-600' };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WebshopPage: React.FC<WebshopPageProps> = ({
  currentUser,
  products,
  setProducts,
  categories,
  setCategories,
  orders,
  setOrders,
  inventory
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders'>('dashboard');

  // Product state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WebshopProduct | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productViewMode, setProductViewMode] = useState<'grid' | 'list'>('grid');
  const [productFormData, setProductFormData] = useState<Partial<WebshopProduct>>({
    name: '',
    slug: '',
    sku: '',
    shortDescription: '',
    longDescription: '',
    salePrice: 0,
    regularPrice: 0,
    costPrice: 0,
    trackStock: true,
    stockQuantity: 0,
    lowStockThreshold: 10,
    categoryIds: [],
    primaryCategoryId: undefined,
    status: 'draft',
    visibility: 'public',
    weight: undefined,
    dimensions: undefined,
    shippingCategory: 'standard',
    isDigital: false,
    metaTitle: '',
    metaDescription: '',
    tags: [],
    vatRate: 21,
    allowReviews: true,
    adminNotes: '',
    inventoryItemId: undefined
  });

  // Category state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WebshopCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<WebshopCategory>>({
    name: '',
    slug: '',
    description: '',
    parentId: undefined,
    sortOrder: 0,
    isActive: true,
    metaTitle: '',
    metaDescription: ''
  });

  // Order state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WebshopOrder | null>(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');

  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'product' | 'category' | 'order';
    id: string;
    name: string;
  } | null>(null);

  // ============================================================================
  // COMPUTED DATA
  // ============================================================================

  // Dashboard KPIs
  const activeProductsCount = products.filter(p => p.status === 'active').length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, order) => sum + order.total, 0);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(productSearchTerm.toLowerCase());
      const matchesStatus = productStatusFilter === 'all' || product.status === productStatusFilter;
      const matchesCategory =
        productCategoryFilter === 'all' ||
        product.categoryIds.includes(productCategoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, productSearchTerm, productStatusFilter, productCategoryFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase());
      const matchesStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchTerm, orderStatusFilter]);

  // Category hierarchy
  const categoriesWithHierarchy = useMemo(() => {
    const buildHierarchy = (parentId?: string, level: number = 0): WebshopCategory[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .flatMap(cat => [
          { ...cat, level } as WebshopCategory & { level: number },
          ...buildHierarchy(cat.id, level + 1)
        ]);
    };
    return buildHierarchy();
  }, [categories]);

  // Product count per category
  const categoryProductCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat.id] = products.filter(p => p.categoryIds.includes(cat.id)).length;
    });
    return counts;
  }, [products, categories]);

  // ============================================================================
  // HANDLERS - PRODUCTS
  // ============================================================================

  const handleOpenProductModal = (product?: WebshopProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductFormData(product);
    } else {
      setEditingProduct(null);
      setProductFormData({
        name: '',
        slug: '',
        sku: generateSKU(products),
        shortDescription: '',
        longDescription: '',
        salePrice: 0,
        regularPrice: 0,
        costPrice: 0,
        trackStock: true,
        stockQuantity: 0,
        lowStockThreshold: 10,
        categoryIds: [],
        primaryCategoryId: undefined,
        status: 'draft',
        visibility: 'public',
        weight: undefined,
        dimensions: undefined,
        shippingCategory: 'standard',
        isDigital: false,
        metaTitle: '',
        metaDescription: '',
        tags: [],
        vatRate: 21,
        allowReviews: true,
        adminNotes: '',
        inventoryItemId: undefined
      });
    }
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductFormData({});
  };

  const handleProductFormChange = (field: keyof WebshopProduct, value: any) => {
    setProductFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleSaveProduct = () => {
    // Validation
    if (!productFormData.name?.trim()) {
      alert('Productnaam is verplicht');
      return;
    }
    if (!productFormData.sku?.trim()) {
      alert('SKU is verplicht');
      return;
    }

    const now = new Date().toISOString();

    if (editingProduct) {
      // Update existing product
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...productFormData, updatedAt: now } as WebshopProduct
            : p
        )
      );
    } else {
      // Create new product
      const newProduct: WebshopProduct = {
        id: `prod_${Date.now()}`,
        name: productFormData.name!,
        slug: productFormData.slug!,
        sku: productFormData.sku!,
        shortDescription: productFormData.shortDescription || '',
        longDescription: productFormData.longDescription || '',
        salePrice: productFormData.salePrice || 0,
        regularPrice: productFormData.regularPrice || 0,
        costPrice: productFormData.costPrice || 0,
        trackStock: productFormData.trackStock ?? true,
        stockQuantity: productFormData.stockQuantity || 0,
        lowStockThreshold: productFormData.lowStockThreshold || 10,
        categoryIds: productFormData.categoryIds || [],
        primaryCategoryId: productFormData.primaryCategoryId,
        status: productFormData.status || 'draft',
        visibility: productFormData.visibility || 'public',
        weight: productFormData.weight,
        dimensions: productFormData.dimensions,
        shippingCategory: productFormData.shippingCategory || 'standard',
        isDigital: productFormData.isDigital || false,
        metaTitle: productFormData.metaTitle,
        metaDescription: productFormData.metaDescription,
        tags: productFormData.tags || [],
        vatRate: productFormData.vatRate || 21,
        allowReviews: productFormData.allowReviews ?? true,
        adminNotes: productFormData.adminNotes,
        inventoryItemId: productFormData.inventoryItemId,
        createdAt: now,
        updatedAt: now
      };
      setProducts(prev => [...prev, newProduct]);
    }

    handleCloseProductModal();
  };

  const handleDeleteProduct = (product: WebshopProduct) => {
    setDeleteTarget({
      type: 'product',
      id: product.id,
      name: product.name
    });
    setShowDeleteConfirm(true);
  };

  const handleUpdateProductStatus = (productId: string, newStatus: ProductStatus) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  // ============================================================================
  // HANDLERS - CATEGORIES
  // ============================================================================

  const handleOpenCategoryModal = (category?: WebshopCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData(category);
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: '',
        slug: '',
        description: '',
        parentId: undefined,
        sortOrder: 0,
        isActive: true,
        metaTitle: '',
        metaDescription: ''
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({});
  };

  const handleCategoryFormChange = (field: keyof WebshopCategory, value: any) => {
    setCategoryFormData(prev => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when name changes
      if (field === 'name' && typeof value === 'string') {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  const handleSaveCategory = () => {
    // Validation
    if (!categoryFormData.name?.trim()) {
      alert('Categorienaam is verplicht');
      return;
    }

    const now = new Date().toISOString();

    if (editingCategory) {
      // Update existing category
      setCategories(prev =>
        prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, ...categoryFormData, updatedAt: now } as WebshopCategory
            : c
        )
      );
    } else {
      // Create new category
      const newCategory: WebshopCategory = {
        id: `cat_${Date.now()}`,
        name: categoryFormData.name!,
        slug: categoryFormData.slug!,
        description: categoryFormData.description || '',
        parentId: categoryFormData.parentId,
        sortOrder: categoryFormData.sortOrder || 0,
        isActive: categoryFormData.isActive ?? true,
        metaTitle: categoryFormData.metaTitle,
        metaDescription: categoryFormData.metaDescription,
        createdAt: now,
        updatedAt: now
      };
      setCategories(prev => [...prev, newCategory]);
    }

    handleCloseCategoryModal();
  };

  const handleDeleteCategory = (category: WebshopCategory) => {
    // Check if category has children
    const hasChildren = categories.some(c => c.parentId === category.id);
    if (hasChildren) {
      alert('Kan categorie met subcategorieën niet verwijderen. Verwijder eerst de subcategorieën.');
      return;
    }

    setDeleteTarget({
      type: 'category',
      id: category.id,
      name: category.name
    });
    setShowDeleteConfirm(true);
  };

  // ============================================================================
  // HANDLERS - ORDERS
  // ============================================================================

  const handleOpenOrderModal = (order: WebshopOrder) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, orderStatus: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
  };

  const handleUpdatePaymentStatus = (orderId: string, newStatus: PaymentStatus) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, paymentStatus: newStatus, updatedAt: new Date().toISOString() }
          : o
      )
    );
  };

  // ============================================================================
  // HANDLERS - DELETE CONFIRMATION
  // ============================================================================

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    switch (deleteTarget.type) {
      case 'product':
        setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
        break;
      case 'category':
        setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
        break;
      case 'order':
        setOrders(prev => prev.filter(o => o.id !== deleteTarget.id));
        break;
    }

    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actieve Producten</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{activeProductsCount}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {products.length} totaal producten
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totaal Bestellingen</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalOrders}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            {orders.filter(o => o.orderStatus === 'pending').length} wachtend op verwerking
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Totale Omzet</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Betaalde bestellingen
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Prestatie Overzicht</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Product Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Actief</span>
                <span className="text-sm font-semibold text-green-600">
                  {products.filter(p => p.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Concept</span>
                <span className="text-sm font-semibold text-gray-600">
                  {products.filter(p => p.status === 'draft').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Gearchiveerd</span>
                <span className="text-sm font-semibold text-red-600">
                  {products.filter(p => p.status === 'archived').length}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bestelling Status</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In afwachting</span>
                <span className="text-sm font-semibold text-gray-600">
                  {orders.filter(o => o.orderStatus === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In behandeling</span>
                <span className="text-sm font-semibold text-blue-600">
                  {orders.filter(o => o.orderStatus === 'processing').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verzonden</span>
                <span className="text-sm font-semibold text-purple-600">
                  {orders.filter(o => o.orderStatus === 'shipped').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Afgeleverd</span>
                <span className="text-sm font-semibold text-green-600">
                  {orders.filter(o => o.orderStatus === 'delivered').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {products.filter(p => p.trackStock && p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-orange-900 mb-3">Lage Voorraad Waarschuwing</h3>
          <p className="text-sm text-orange-800 mb-4">
            {products.filter(p => p.trackStock && p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0).length} producten hebben een lage voorraad
          </p>
          <div className="space-y-2">
            {products
              .filter(p => p.trackStock && p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0)
              .slice(0, 5)
              .map(product => (
                <div key={product.id} className="flex justify-between items-center bg-white rounded p-3">
                  <span className="text-sm font-medium text-gray-900">{product.name}</span>
                  <span className="text-sm text-orange-600">{product.stockQuantity} stuks</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProductBeheer = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Beheer</h2>
          <p className="text-sm text-gray-600 mt-1">{filteredProducts.length} producten gevonden</p>
        </div>
        <button
          onClick={() => handleOpenProductModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nieuw Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Zoek op naam of SKU..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={productStatusFilter}
              onChange={(e) => setProductStatusFilter(e.target.value as ProductStatus | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="draft">Concept</option>
              <option value="active">Actief</option>
              <option value="archived">Gearchiveerd</option>
            </select>
          </div>
          <div>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle categorieën</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={() => setProductViewMode('grid')}
            className={`px-3 py-1 rounded ${productViewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setProductViewMode('list')}
            className={`px-3 py-1 rounded ${productViewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
          >
            Lijst
          </button>
        </div>
      </div>

      {/* Products Display */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Geen producten gevonden</h3>
          <p className="mt-2 text-sm text-gray-500">
            Begin met het toevoegen van een nieuw product aan je webshop.
          </p>
          <button
            onClick={() => handleOpenProductModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nieuw Product
          </button>
        </div>
      ) : productViewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const stockStatus = getStockStatus(product);
            return (
              <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{product.sku}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(product.status)}`}>
                      {product.status === 'draft' ? 'Concept' : product.status === 'active' ? 'Actief' : 'Gearchiveerd'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.shortDescription}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Verkoopprijs:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(product.salePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Voorraad:</span>
                      <span className={`font-medium ${stockStatus.color}`}>{stockStatus.label}</span>
                    </div>
                    {product.trackStock && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Aantal:</span>
                        <span className="text-gray-900">{product.stockQuantity} stuks</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleOpenProductModal(product)}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      Bewerken
                    </button>
                    {product.status === 'draft' && (
                      <button
                        onClick={() => handleUpdateProductStatus(product.id, 'active')}
                        className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        Publiceren
                      </button>
                    )}
                    {product.status === 'active' && (
                      <button
                        onClick={() => handleUpdateProductStatus(product.id, 'archived')}
                        className="flex-1 px-3 py-2 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 transition-colors text-sm font-medium"
                      >
                        Archiveren
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prijs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voorraad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map(product => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.shortDescription.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.salePrice)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${stockStatus.color}`}>
                        {product.trackStock ? `${product.stockQuantity} stuks` : 'Niet getrackt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(product.status)}`}>
                        {product.status === 'draft' ? 'Concept' : product.status === 'active' ? 'Actief' : 'Gearchiveerd'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenProductModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Bewerken
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderCategorieen = () => (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorieën</h2>
          <p className="text-sm text-gray-600 mt-1">{categories.length} categorieën</p>
        </div>
        <button
          onClick={() => handleOpenCategoryModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Nieuwe Categorie
        </button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Geen categorieën</h3>
          <p className="mt-2 text-sm text-gray-500">
            Begin met het toevoegen van een categorie om je producten te organiseren.
          </p>
          <button
            onClick={() => handleOpenCategoryModal()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Nieuwe Categorie
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producten</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volgorde</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoriesWithHierarchy.map((category: any) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span style={{ marginLeft: `${category.level * 24}px` }} className="text-sm font-medium text-gray-900">
                        {category.level > 0 && '└─ '}
                        {category.name}
                      </span>
                    </div>
                    {category.description && (
                      <div style={{ marginLeft: `${category.level * 24}px` }} className="text-sm text-gray-500">
                        {category.description.substring(0, 50)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {categoryProductCounts[category.id] || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.sortOrder}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {category.isActive ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenCategoryModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Bewerken
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Verwijderen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderBestellingen = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Bestellingen</h2>
        <p className="text-sm text-gray-600 mt-1">{filteredOrders.length} bestellingen gevonden</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Zoek op ordernummer, naam of email..."
              value={orderSearchTerm}
              onChange={(e) => setOrderSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Alle statussen</option>
              <option value="pending">In afwachting</option>
              <option value="processing">In behandeling</option>
              <option value="shipped">Verzonden</option>
              <option value="delivered">Afgeleverd</option>
              <option value="cancelled">Geannuleerd</option>
              <option value="refunded">Terugbetaald</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Geen bestellingen</h3>
          <p className="mt-2 text-sm text-gray-500">
            Er zijn nog geen bestellingen geplaatst.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordernummer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Klant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Totaal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betaling</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('nl-NL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus === 'paid' ? 'Betaald' : 'Niet betaald'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus === 'pending' ? 'In afwachting' :
                       order.orderStatus === 'processing' ? 'In behandeling' :
                       order.orderStatus === 'shipped' ? 'Verzonden' :
                       order.orderStatus === 'delivered' ? 'Afgeleverd' :
                       order.orderStatus === 'cancelled' ? 'Geannuleerd' : 'Terugbetaald'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenOrderModal(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderProductModal = () => {
    if (!showProductModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? 'Product Bewerken' : 'Nieuw Product'}
            </h2>
            <button
              onClick={handleCloseProductModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basis Informatie</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productnaam *
                  </label>
                  <input
                    type="text"
                    value={productFormData.name || ''}
                    onChange={(e) => handleProductFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bijv. Premium T-shirt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={productFormData.slug || ''}
                    onChange={(e) => handleProductFormChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="Automatisch gegenereerd"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={productFormData.sku || ''}
                    onChange={(e) => handleProductFormChange('sku', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="PRD-0001"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Korte Beschrijving
                  </label>
                  <input
                    type="text"
                    value={productFormData.shortDescription || ''}
                    onChange={(e) => handleProductFormChange('shortDescription', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Korte productomschrijving voor overzichten"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lange Beschrijving
                  </label>
                  <textarea
                    value={productFormData.longDescription || ''}
                    onChange={(e) => handleProductFormChange('longDescription', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Uitgebreide productbeschrijving..."
                  />
                </div>
              </div>
            </div>

            {/* Price & Stock Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prijs & Voorraad</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verkoopprijs (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.salePrice || 0}
                    onChange={(e) => handleProductFormChange('salePrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adviesprijs (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.regularPrice || 0}
                    onChange={(e) => handleProductFormChange('regularPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kostprijs (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.costPrice || 0}
                    onChange={(e) => handleProductFormChange('costPrice', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productFormData.trackStock ?? true}
                    onChange={(e) => handleProductFormChange('trackStock', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Voorraad bijhouden</span>
                </label>
              </div>
              {productFormData.trackStock && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Voorraad Aantal
                    </label>
                    <input
                      type="number"
                      value={productFormData.stockQuantity || 0}
                      onChange={(e) => handleProductFormChange('stockQuantity', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lage Voorraad Drempel
                    </label>
                    <input
                      type="number"
                      value={productFormData.lowStockThreshold || 10}
                      onChange={(e) => handleProductFormChange('lowStockThreshold', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorieën</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categorieën (multi-select)
                  </label>
                  <select
                    multiple
                    value={productFormData.categoryIds || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      handleProductFormChange('categoryIds', selected);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    size={5}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Houd Ctrl/Cmd ingedrukt voor multi-select</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primaire Categorie
                  </label>
                  <select
                    value={productFormData.primaryCategoryId || ''}
                    onChange={(e) => handleProductFormChange('primaryCategoryId', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Geen primaire categorie</option>
                    {categories
                      .filter(cat => productFormData.categoryIds?.includes(cat.id))
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Status & Visibility Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Zichtbaarheid</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={productFormData.status || 'draft'}
                    onChange={(e) => handleProductFormChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Concept</option>
                    <option value="active">Actief</option>
                    <option value="archived">Gearchiveerd</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zichtbaarheid
                  </label>
                  <select
                    value={productFormData.visibility || 'public'}
                    onChange={(e) => handleProductFormChange('visibility', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="public">Openbaar</option>
                    <option value="private">Privé</option>
                    <option value="hidden">Verborgen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Verzending</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gewicht (kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productFormData.weight || ''}
                    onChange={(e) => handleProductFormChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verzendcategorie
                  </label>
                  <select
                    value={productFormData.shippingCategory || 'standard'}
                    onChange={(e) => handleProductFormChange('shippingCategory', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="standard">Standaard</option>
                    <option value="express">Express</option>
                    <option value="pickup">Ophalen</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lengte (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={productFormData.dimensions?.length || ''}
                    onChange={(e) => handleProductFormChange('dimensions', {
                      ...productFormData.dimensions,
                      length: e.target.value ? parseFloat(e.target.value) : 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Breedte (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={productFormData.dimensions?.width || ''}
                    onChange={(e) => handleProductFormChange('dimensions', {
                      ...productFormData.dimensions,
                      width: e.target.value ? parseFloat(e.target.value) : 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hoogte (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={productFormData.dimensions?.height || ''}
                    onChange={(e) => handleProductFormChange('dimensions', {
                      ...productFormData.dimensions,
                      height: e.target.value ? parseFloat(e.target.value) : 0
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productFormData.isDigital || false}
                    onChange={(e) => handleProductFormChange('isDigital', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Digitaal product (geen verzending)</span>
                </label>
              </div>
            </div>

            {/* SEO Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Titel
                  </label>
                  <input
                    type="text"
                    value={productFormData.metaTitle || ''}
                    onChange={(e) => handleProductFormChange('metaTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO titel voor zoekmachines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Beschrijving
                  </label>
                  <textarea
                    value={productFormData.metaDescription || ''}
                    onChange={(e) => handleProductFormChange('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO beschrijving voor zoekmachines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (komma gescheiden)
                  </label>
                  <input
                    type="text"
                    value={productFormData.tags?.join(', ') || ''}
                    onChange={(e) => handleProductFormChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>

            {/* Extra Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Extra Instellingen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BTW Tarief (%)
                  </label>
                  <select
                    value={productFormData.vatRate || 21}
                    onChange={(e) => handleProductFormChange('vatRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={21}>21% (Hoog tarief)</option>
                    <option value={9}>9% (Laag tarief)</option>
                    <option value={0}>0% (Geen BTW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inventaris Item
                  </label>
                  <select
                    value={productFormData.inventoryItemId || ''}
                    onChange={(e) => handleProductFormChange('inventoryItemId', e.target.value || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Geen koppeling</option>
                    {inventory.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.skuAutomatic})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productFormData.allowReviews ?? true}
                    onChange={(e) => handleProductFormChange('allowReviews', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Reviews toestaan</span>
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notities
                </label>
                <textarea
                  value={productFormData.adminNotes || ''}
                  onChange={(e) => handleProductFormChange('adminNotes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Interne notities (niet zichtbaar voor klanten)"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button
              onClick={handleCloseProductModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingProduct ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryModal = () => {
    if (!showCategoryModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {editingCategory ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
            </h2>
            <button
              onClick={handleCloseCategoryModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categorienaam *
              </label>
              <input
                type="text"
                value={categoryFormData.name || ''}
                onChange={(e) => handleCategoryFormChange('name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv. Elektronica"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                value={categoryFormData.slug || ''}
                onChange={(e) => handleCategoryFormChange('slug', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                placeholder="Automatisch gegenereerd"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschrijving
              </label>
              <textarea
                value={categoryFormData.description || ''}
                onChange={(e) => handleCategoryFormChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Categorie beschrijving..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bovenliggende Categorie
                </label>
                <select
                  value={categoryFormData.parentId || ''}
                  onChange={(e) => handleCategoryFormChange('parentId', e.target.value || undefined)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Geen (hoofdcategorie)</option>
                  {categories
                    .filter(cat => cat.id !== editingCategory?.id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sorteervolgorde
                </label>
                <input
                  type="number"
                  value={categoryFormData.sortOrder || 0}
                  onChange={(e) => handleCategoryFormChange('sortOrder', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryFormData.isActive ?? true}
                  onChange={(e) => handleCategoryFormChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Categorie is actief</span>
              </label>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Titel
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.metaTitle || ''}
                    onChange={(e) => handleCategoryFormChange('metaTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO titel voor zoekmachines"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Beschrijving
                  </label>
                  <textarea
                    value={categoryFormData.metaDescription || ''}
                    onChange={(e) => handleCategoryFormChange('metaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SEO beschrijving voor zoekmachines"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
            <button
              onClick={handleCloseCategoryModal}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuleren
            </button>
            <button
              onClick={handleSaveCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingCategory ? 'Bijwerken' : 'Aanmaken'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderModal = () => {
    if (!showOrderModal || !selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bestelling {selectedOrder.orderNumber}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Geplaatst op {new Date(selectedOrder.createdAt).toLocaleString('nl-NL')}
              </p>
            </div>
            <button
              onClick={handleCloseOrderModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Badges */}
            <div className="flex gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(selectedOrder.orderStatus)}`}>
                {selectedOrder.orderStatus === 'pending' ? 'In afwachting' :
                 selectedOrder.orderStatus === 'processing' ? 'In behandeling' :
                 selectedOrder.orderStatus === 'shipped' ? 'Verzonden' :
                 selectedOrder.orderStatus === 'delivered' ? 'Afgeleverd' :
                 selectedOrder.orderStatus === 'cancelled' ? 'Geannuleerd' : 'Terugbetaald'}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                {selectedOrder.paymentStatus === 'paid' ? 'Betaald' : 'Niet betaald'}
              </span>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Snelle Acties</h3>
              <div className="flex flex-wrap gap-2">
                {selectedOrder.orderStatus === 'pending' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'processing')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    In Behandeling
                  </button>
                )}
                {(selectedOrder.orderStatus === 'pending' || selectedOrder.orderStatus === 'processing') && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'shipped')}
                    className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                  >
                    Verzonden
                  </button>
                )}
                {selectedOrder.paymentStatus === 'unpaid' && (
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'paid')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Betaald Markeren
                  </button>
                )}
                {selectedOrder.orderStatus !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Annuleren
                  </button>
                )}
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Klantgegevens</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Naam:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Telefoon:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedOrder.customerPhone}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Verzendadres</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-sm text-gray-900">{selectedOrder.shippingAddress.street}</p>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.shippingAddress.postalCode} {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-900">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Factuuradres</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-sm text-gray-900">{selectedOrder.billingAddress.street}</p>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.billingAddress.postalCode} {selectedOrder.billingAddress.city}
                  </p>
                  <p className="text-sm text-gray-900">{selectedOrder.billingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bestelde Producten</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aantal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Prijs</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotaal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financieel Overzicht</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotaal:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">BTW ({selectedOrder.vatRate}%):</span>
                  <span className="text-sm text-gray-900">{formatCurrency(selectedOrder.vatAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Verzendkosten:</span>
                  <span className="text-sm text-gray-900">{formatCurrency(selectedOrder.shippingCost)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Korting:</span>
                    <span className="text-sm">-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-base font-semibold text-gray-900">Totaal:</span>
                  <span className="text-base font-bold text-gray-900">{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Betaalmethode:</span>
                  <span className="text-sm text-gray-900">{selectedOrder.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            {(selectedOrder.trackingNumber || selectedOrder.carrier) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Verzendgegevens</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {selectedOrder.carrier && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vervoerder:</span>
                      <span className="text-sm text-gray-900">{selectedOrder.carrier}</span>
                    </div>
                  )}
                  {selectedOrder.trackingNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Track & Trace:</span>
                      <span className="text-sm font-mono text-gray-900">{selectedOrder.trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {(selectedOrder.customerNotes || selectedOrder.adminNotes) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notities</h3>
                <div className="space-y-3">
                  {selectedOrder.customerNotes && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">Klant notitie:</p>
                      <p className="text-sm text-blue-800">{selectedOrder.customerNotes}</p>
                    </div>
                  )}
                  {selectedOrder.adminNotes && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">Admin notitie:</p>
                      <p className="text-sm text-gray-700">{selectedOrder.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end border-t">
            <button
              onClick={handleCloseOrderModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm || !deleteTarget) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {deleteTarget.type === 'product' ? 'Product verwijderen' :
               deleteTarget.type === 'category' ? 'Categorie verwijderen' : 'Bestelling verwijderen'}
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Weet je zeker dat je <span className="font-semibold">{deleteTarget.name}</span> wilt verwijderen?
              Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Webshop Beheer</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Beheer je online winkel, producten, categorieën en bestellingen
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Ingelogd als: <span className="font-semibold">{currentUser?.name || 'Gebruiker'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-8 border-t">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Product Beheer
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Categorieën
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Bestellingen
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && renderProductBeheer()}
        {activeTab === 'categories' && renderCategorieen()}
        {activeTab === 'orders' && renderBestellingen()}
      </div>

      {/* Modals */}
      {renderProductModal()}
      {renderCategoryModal()}
      {renderOrderModal()}
      {renderDeleteConfirmModal()}
    </div>
  );
};

export default WebshopPage;
