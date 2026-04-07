// ============================================
// CATEGORY STORE - Zustand
// ============================================

import { create } from 'zustand';
import type { Category, CategoryType } from '../types';
import { INITIAL_CATEGORIES } from '../types';
import { categoryDB, initializeDB } from '../db/db';

// ============================================
// Store Interface
// ============================================

interface CategoryState {
  // Data
  categories: Category[];
  selectedCategory: Category | null;
  selectedSubcategory: string | null;

  // Loading states
  isLoading: boolean;

  // Error state
  error: string | null;

  // Actions
  loadCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: CategoryType) => Category[];
  setSelectedCategory: (category: Category | null) => void;
  setSelectedSubcategory: (subcategory: string | null) => void;

  // CRUD operations
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Subcategory management
  addSubcategory: (categoryId: string, subcategory: string) => Promise<void>;
  removeSubcategory: (categoryId: string, subcategory: string) => Promise<void>;

  // Clear
  clearError: () => void;
}

// ============================================
// Store Implementation
// ============================================

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // Initial state
  categories: INITIAL_CATEGORIES,
  selectedCategory: null,
  selectedSubcategory: null,
  isLoading: false,
  error: null,

  // Load categories from database
  loadCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      await initializeDB();
      const categories = await categoryDB.getAll();
      set({ categories: categories.length > 0 ? categories : INITIAL_CATEGORIES, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load categories',
        isLoading: false
      });
    }
  },

  // Get category by ID
  getCategoryById: (id) => {
    return get().categories.find(c => c.id === id);
  },

  // Get categories by type
  getCategoriesByType: (type) => {
    return get().categories.filter(c => c.type === type);
  },

  // Set selected category
  setSelectedCategory: (category) => {
    set({ selectedCategory: category, selectedSubcategory: null });
  },

  // Set selected subcategory
  setSelectedSubcategory: (subcategory) => {
    set({ selectedSubcategory: subcategory });
  },

  // Add new category
  addCategory: async (categoryData) => {
    set({ isLoading: true, error: null });
    try {
      await initializeDB();

      const newCategory: Category = {
        ...categoryData,
        id: `cat-${Date.now()}`
      };

      await categoryDB.add(newCategory);

      set(state => ({
        categories: [...state.categories, newCategory],
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add category',
        isLoading: false
      });
    }
  },

  // Update category
  updateCategory: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await categoryDB.update(id, updates);

      set(state => ({
        categories: state.categories.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update category',
        isLoading: false
      });
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await categoryDB.delete(id);

      set(state => ({
        categories: state.categories.filter(c => c.id !== id),
        selectedCategory: state.selectedCategory?.id === id ? null : state.selectedCategory,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete category',
        isLoading: false
      });
    }
  },

  // Add subcategory to category
  addSubcategory: async (categoryId, subcategory) => {
    set({ isLoading: true, error: null });
    try {
      const category = get().categories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      if (category.subcategories.includes(subcategory)) {
        throw new Error('Subcategory already exists');
      }

      const updatedSubcategories = [...category.subcategories, subcategory];
      await categoryDB.update(categoryId, { subcategories: updatedSubcategories });

      set(state => ({
        categories: state.categories.map(c =>
          c.id === categoryId
            ? { ...c, subcategories: updatedSubcategories }
            : c
        ),
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add subcategory',
        isLoading: false
      });
    }
  },

  // Remove subcategory from category
  removeSubcategory: async (categoryId, subcategory) => {
    set({ isLoading: true, error: null });
    try {
      const category = get().categories.find(c => c.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const updatedSubcategories = category.subcategories.filter(s => s !== subcategory);
      await categoryDB.update(categoryId, { subcategories: updatedSubcategories });

      set(state => ({
        categories: state.categories.map(c =>
          c.id === categoryId
            ? { ...c, subcategories: updatedSubcategories }
            : c
        ),
        selectedSubcategory: state.selectedSubcategory === subcategory ? null : state.selectedSubcategory,
        isLoading: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to remove subcategory',
        isLoading: false
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

// ============================================
// Utility Hooks
// ============================================

// Get category by type
export const useCategoryByType = (type: CategoryType) => {
  const categories = useCategoryStore(state => state.categories);
  return categories.find(c => c.type === type);
};

// Get all subcategories for a category
export const useSubcategories = (categoryId: string) => {
  const category = useCategoryStore(state => state.categories.find(c => c.id === categoryId));
  return category?.subcategories || [];
};
