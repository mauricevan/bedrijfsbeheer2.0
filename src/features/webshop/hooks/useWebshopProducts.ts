/**
 * useWebshopProducts Hook
 * Business logic voor Webshop Product Beheer
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  WebshopProduct,
  WebshopProductStatus,
  WebshopProductVisibility,
} from '../../../types';

export const useWebshopProducts = (initialProducts: WebshopProduct[]) => {
  const [products, setProducts] = useState<WebshopProduct[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<WebshopProductStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  // Generate URL-friendly slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove duplicate hyphens
  };

  // Generate SKU (PRD-0001, PRD-0002, etc.)
  const generateSKU = useCallback((): string => {
    const maxSku = products.reduce((max, p) => {
      const match = p.sku.match(/PRD-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 0);

    return `PRD-${String(maxSku + 1).padStart(4, '0')}`;
  }, [products]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const draft = products.filter((p) => p.status === 'draft').length;
    const archived = products.filter((p) => p.status === 'archived').length;
    const lowStock = products.filter(
      (p) => p.trackInventory && p.stockQuantity <= p.lowStockThreshold
    ).length;
    const outOfStock = products.filter(
      (p) => p.trackInventory && p.stockQuantity === 0
    ).length;

    return {
      total,
      active,
      draft,
      archived,
      lowStock,
      outOfStock,
    };
  }, [products]);

  // Filtered & Searched products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.categoryIds.includes(filterCategory));
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.shortDescription?.toLowerCase().includes(term) ||
          p.longDescription?.toLowerCase().includes(term) ||
          p.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    return result;
  }, [products, searchTerm, filterStatus, filterCategory]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addProduct = useCallback(
    (productData: Omit<WebshopProduct, 'id' | 'sku' | 'slug' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();

      const newProduct: WebshopProduct = {
        ...productData,
        id: `product-${Date.now()}`,
        sku: generateSKU(),
        slug: generateSlug(productData.name),
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [...prev, newProduct]);
      return newProduct;
    },
    [generateSKU]
  );

  const updateProduct = useCallback((id: string, updates: Partial<WebshopProduct>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...updates,
              // Regenerate slug if name changed
              slug: updates.name ? generateSlug(updates.name) : product.slug,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id));
  }, []);

  const cloneProduct = useCallback(
    (id: string) => {
      const original = products.find((p) => p.id === id);
      if (!original) return;

      const now = new Date().toISOString();
      const clonedProduct: WebshopProduct = {
        ...original,
        id: `product-${Date.now()}`,
        name: `${original.name} (Kopie)`,
        sku: generateSKU(),
        slug: generateSlug(`${original.name} (Kopie)`),
        status: 'draft', // Reset to draft
        createdAt: now,
        updatedAt: now,
      };

      setProducts((prev) => [...prev, clonedProduct]);
      return clonedProduct;
    },
    [products, generateSKU]
  );

  // ============================================================================
  // STATUS WORKFLOW
  // ============================================================================

  const publishProduct = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: 'active' as WebshopProductStatus,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const archiveProduct = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status: 'archived' as WebshopProductStatus,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const changeStatus = useCallback((id: string, status: WebshopProductStatus) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              status,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const toggleVisibility = useCallback((id: string, visibility: WebshopProductVisibility) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              visibility,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const toggleFeatured = useCallback((id: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              featured: !product.featured,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const setStatusFilter = useCallback((status: WebshopProductStatus | 'all') => {
    setFilterStatus(status);
  }, []);

  const setCategoryFilter = useCallback((categoryId: string | 'all') => {
    setFilterCategory(categoryId);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('all');
    setFilterCategory('all');
    setSearchTerm('');
  }, []);

  // ============================================================================
  // STOCK MANAGEMENT
  // ============================================================================

  const updateStock = useCallback((id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              stockQuantity: quantity,
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  const adjustStock = useCallback((id: string, adjustment: number) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              stockQuantity: Math.max(0, product.stockQuantity + adjustment),
              updatedAt: new Date().toISOString(),
            }
          : product
      )
    );
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    products,
    filteredProducts,
    stats,

    // Search & Filter
    searchTerm,
    filterStatus,
    filterCategory,
    handleSearch,
    clearSearch,
    setStatusFilter,
    setCategoryFilter,
    clearFilters,

    // CRUD
    addProduct,
    updateProduct,
    deleteProduct,
    cloneProduct,

    // Status workflow
    publishProduct,
    archiveProduct,
    changeStatus,
    toggleVisibility,
    toggleFeatured,

    // Stock
    updateStock,
    adjustStock,

    // Utilities
    generateSlug,
    generateSKU,
  };
};
