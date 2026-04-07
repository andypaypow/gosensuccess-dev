// ============================================
// FILTER STORE - Zustand
// ============================================

import { create } from 'zustand';
import type { FilterState, PeriodType, CategoryType } from '../types';

// ============================================
// Store Interface
// ============================================

interface FilterStore extends FilterState {
  // Actions
  setCategories: (categories: CategoryType[]) => void;
  setSubcategories: (subcategories: string[]) => void;
  setPeriod: (period: PeriodType) => void;
  setSelectedMonth: (month: Date | null) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  setEntryRange: (min: number | null, max: number | null) => void;
  resetFilters: () => void;
  updateActive: () => void;
}

// ============================================
// Initial State
// ============================================

const initialFilterState: FilterState = {
  categories: [],
  subcategories: [],
  period: 'month',
  selectedMonth: new Date(),  // Par défaut: mois actuel
  dateRange: {
    start: null,
    end: null
  },
  entryRange: {
    min: null,
    max: null
  },
  active: false
};

// ============================================
// Store Implementation
// ============================================

export const useFilterStore = create<FilterStore>((set, get) => ({
  ...initialFilterState,

  // Set categories filter
  setCategories: (categories) => {
    set({ categories });
    get().updateActive();
  },

  // Set subcategories filter
  setSubcategories: (subcategories) => {
    set({ subcategories });
    get().updateActive();
  },

  // Set period filter
  setPeriod: (period) => {
    set({ period });
    get().updateActive();
  },

  // Set selected month (for period='month')
  setSelectedMonth: (month) => {
    set({ selectedMonth: month });
  },

  // Set date range filter
  setDateRange: (start, end) => {
    set({ dateRange: { start, end } });
    get().updateActive();
  },

  // Set entry range filter
  setEntryRange: (min, max) => {
    set({ entryRange: { min, max } });
    get().updateActive();
  },

  // Reset all filters
  resetFilters: () => {
    set({
      categories: [],
      subcategories: [],
      period: 'month',
      dateRange: { start: null, end: null },
      entryRange: { min: null, max: null },
      active: false
    });
  },

  // Update active state based on filters
  updateActive: () => {
    const state = get();
    const hasActiveFilters =
      state.categories.length > 0 ||
      state.subcategories.length > 0 ||
      state.dateRange.start !== null ||
      state.dateRange.end !== null ||
      state.entryRange.min !== null ||
      state.entryRange.max !== null;

    set({ active: hasActiveFilters });
  }
}));

// ============================================
// Selector Hooks
// ============================================

// Get date range based on period
export const getDateRangeForPeriod = (period: PeriodType): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'week':
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;

    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'year':
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11, 31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

// Check if filters match transaction
export const matchesFilters = (
  transaction: any,
  filters: FilterState
): boolean => {
  // Check categories
  if (filters.categories.length > 0) {
    // Vérifier si la transaction a des dépenses dans les catégories sélectionnées
    const hasMatchingCategory = transaction.depenses?.some((expense: any) =>
      filters.categories.includes(expense.category)
    );

    // Cas spécial : si on filtre par 'eglise', vérifier aussi s'il y a une dîme calculée
    const hasDime = filters.categories.includes('eglise') && transaction.dime > 0;

    if (!hasMatchingCategory && !hasDime) return false;
  }

  // Check subcategories
  if (filters.subcategories.length > 0) {
    const hasMatchingSubcategory = transaction.depenses?.some((expense: any) =>
      filters.subcategories.includes(expense.subcategory)
    );

    // Cas spécial : si on filtre par 'Dimes', vérifier aussi s'il y a une dîme calculée
    const hasDimeSubcategory = filters.subcategories.includes('Dimes') && transaction.dime > 0;

    if (!hasMatchingSubcategory && !hasDimeSubcategory) return false;
  }

  // Check entry range
  if (filters.entryRange.min !== null && transaction.entree < filters.entryRange.min) {
    return false;
  }
  if (filters.entryRange.max !== null && transaction.entree > filters.entryRange.max) {
    return false;
  }

  // Check date range
  if (filters.dateRange.start || filters.dateRange.end) {
    const transactionDate = new Date(transaction.date);
    if (filters.dateRange.start && transactionDate < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && transactionDate > filters.dateRange.end) {
      return false;
    }
  }

  return true;
};
