/**
 * useWebshopCategories Hook
 * Business logic voor Webshop Categorie Beheer (Hiërarchisch)
 */

import { useState, useCallback, useMemo } from 'react';
import type { WebshopCategory, WebshopProduct } from '../../../types';

export interface CategoryWithChildren extends WebshopCategory {
  children?: CategoryWithChildren[];
  level: number;
}

export const useWebshopCategories = (
  initialCategories: WebshopCategory[],
  products: WebshopProduct[]
) => {
  const [categories, setCategories] = useState<WebshopCategory[]>(initialCategories);

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

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Calculate product count for each category
  const categoriesWithCount = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      productCount: products.filter((p) => p.categoryIds.includes(category.id)).length,
    }));
  }, [categories, products]);

  // Build hierarchical tree structure
  const categoryTree = useMemo(() => {
    const buildTree = (
      parentId: string | undefined,
      level: number = 0
    ): CategoryWithChildren[] => {
      return categoriesWithCount
        .filter((cat) => cat.parentCategoryId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((cat) => ({
          ...cat,
          level,
          children: buildTree(cat.id, level + 1),
        }));
    };

    return buildTree(undefined);
  }, [categoriesWithCount]);

  // Flattened list with hierarchy indication (for dropdowns)
  const flattenedCategories = useMemo(() => {
    const flatten = (tree: CategoryWithChildren[]): CategoryWithChildren[] => {
      return tree.reduce<CategoryWithChildren[]>((acc, node) => {
        acc.push(node);
        if (node.children && node.children.length > 0) {
          acc.push(...flatten(node.children));
        }
        return acc;
      }, []);
    };

    return flatten(categoryTree);
  }, [categoryTree]);

  // Active categories only
  const activeCategories = useMemo(() => {
    return categoriesWithCount.filter((cat) => cat.isActive);
  }, [categoriesWithCount]);

  // Root categories (no parent)
  const rootCategories = useMemo(() => {
    return categoriesWithCount.filter((cat) => !cat.parentCategoryId);
  }, [categoriesWithCount]);

  // Stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = categories.filter((c) => !c.isActive).length;
    const root = categories.filter((c) => !c.parentCategoryId).length;

    return {
      total,
      active,
      inactive,
      root,
    };
  }, [categories]);

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const addCategory = useCallback(
    (
      categoryData: Omit<WebshopCategory, 'id' | 'slug' | 'productCount' | 'createdAt' | 'updatedAt'>
    ) => {
      const now = new Date().toISOString();

      const newCategory: WebshopCategory = {
        ...categoryData,
        id: `category-${Date.now()}`,
        slug: generateSlug(categoryData.name),
        productCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      setCategories((prev) => [...prev, newCategory]);
      return newCategory;
    },
    []
  );

  const updateCategory = useCallback((id: string, updates: Partial<WebshopCategory>) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              ...updates,
              // Regenerate slug if name changed
              slug: updates.name ? generateSlug(updates.name) : category.slug,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
  }, []);

  const deleteCategory = useCallback(
    (id: string) => {
      // Check if category has children
      const hasChildren = categories.some((cat) => cat.parentCategoryId === id);
      if (hasChildren) {
        throw new Error('Kan categorie met subcategorieën niet verwijderen');
      }

      // Check if category has products
      const hasProducts = products.some((p) => p.categoryIds.includes(id));
      if (hasProducts) {
        throw new Error('Kan categorie met producten niet verwijderen');
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
    },
    [categories, products]
  );

  // ============================================================================
  // HIERARCHY OPERATIONS
  // ============================================================================

  const moveCategory = useCallback(
    (categoryId: string, newParentId: string | undefined) => {
      // Prevent circular reference
      const isDescendant = (parentId: string, targetId: string): boolean => {
        const parent = categories.find((c) => c.id === parentId);
        if (!parent) return false;
        if (parent.parentCategoryId === targetId) return true;
        if (parent.parentCategoryId) {
          return isDescendant(parent.parentCategoryId, targetId);
        }
        return false;
      };

      if (newParentId && isDescendant(categoryId, newParentId)) {
        throw new Error('Kan categorie niet naar eigen subcategorie verplaatsen');
      }

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === categoryId
            ? {
                ...cat,
                parentCategoryId: newParentId,
                updatedAt: new Date().toISOString(),
              }
            : cat
        )
      );
    },
    [categories]
  );

  const reorderCategories = useCallback((categoryIds: string[]) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        sortOrder: categoryIds.indexOf(cat.id),
        updatedAt: new Date().toISOString(),
      }))
    );
  }, []);

  // ============================================================================
  // STATUS OPERATIONS
  // ============================================================================

  const toggleActive = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: !category.isActive,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
  }, []);

  const activateCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: true,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
  }, []);

  const deactivateCategory = useCallback((id: string) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              isActive: false,
              updatedAt: new Date().toISOString(),
            }
          : category
      )
    );
  }, []);

  // ============================================================================
  // QUERY HELPERS
  // ============================================================================

  const getCategoryById = useCallback(
    (id: string) => {
      return categoriesWithCount.find((cat) => cat.id === id);
    },
    [categoriesWithCount]
  );

  const getChildCategories = useCallback(
    (parentId: string) => {
      return categoriesWithCount.filter((cat) => cat.parentCategoryId === parentId);
    },
    [categoriesWithCount]
  );

  const getParentCategory = useCallback(
    (categoryId: string) => {
      const category = categories.find((c) => c.id === categoryId);
      if (!category?.parentCategoryId) return null;
      return categories.find((c) => c.id === category.parentCategoryId);
    },
    [categories]
  );

  const getBreadcrumbs = useCallback(
    (categoryId: string): WebshopCategory[] => {
      const breadcrumbs: WebshopCategory[] = [];
      let currentId: string | undefined = categoryId;

      while (currentId) {
        const category = categories.find((c) => c.id === currentId);
        if (!category) break;
        breadcrumbs.unshift(category);
        currentId = category.parentCategoryId;
      }

      return breadcrumbs;
    },
    [categories]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // State
    categories: categoriesWithCount,
    categoryTree,
    flattenedCategories,
    activeCategories,
    rootCategories,
    stats,

    // CRUD
    addCategory,
    updateCategory,
    deleteCategory,

    // Hierarchy
    moveCategory,
    reorderCategories,

    // Status
    toggleActive,
    activateCategory,
    deactivateCategory,

    // Query helpers
    getCategoryById,
    getChildCategories,
    getParentCategory,
    getBreadcrumbs,

    // Utilities
    generateSlug,
  };
};
