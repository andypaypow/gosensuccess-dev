// ============================================
// INDEXEDDB CONFIGURATION avec Dexie
// ============================================

import Dexie, { Table } from 'dexie';
import type { Transaction, Expense, Category } from '../types';
import type { UserPreferences } from '../types/preferences';

// ============================================
// Database Class
// ============================================

export class LedoDB extends Dexie {
  // Tables
  transactions!: Table<Transaction>;
  expenses!: Table<Expense>;
  categories!: Table<Category>;
  preferences!: Table<UserPreferences>;

  constructor() {
    super('LedoDB');

    // Define schema
    // version 1: Initial schema
    this.version(1).stores({
      transactions: 'id, date, entree, epargne, createdAt',
      expenses: 'id, category, subcategory, amount, createdAt',
      categories: 'id, type, name',
      preferences: 'currency, dateFormat, theme'
    });

    // version 2: Ajout d'index pour les filtres
    this.version(2).stores({
      transactions: 'id, date, entree, epargne, createdAt',
      expenses: 'id, category, subcategory, amount, createdAt, [category+subcategory]',
      categories: 'id, type, name',
      preferences: 'currency, decimals, monthPeriod, language'
    });
  }
}

// ============================================
// Database Instance
// ============================================

export const db = new LedoDB();

// ============================================
// Database Operations - Transactions
// ============================================

export const transactionDB = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    return await db.transactions.orderBy('date').reverse().toArray();
  },

  // Get transactions by date range
  getByDateRange: async (start: Date, end: Date): Promise<Transaction[]> => {
    return await db.transactions
      .where('date')
      .between(start, end, true, true)
      .sortBy('date');
  },

  // Get transaction by ID
  getById: async (id: string): Promise<Transaction | undefined> => {
    return await db.transactions.get(id);
  },

  // Add transaction
  add: async (transaction: Transaction): Promise<string> => {
    const id = await db.transactions.add(transaction);
    return String(id);
  },

  // Update transaction
  update: async (id: string, updates: Partial<Transaction>): Promise<number> => {
    return await db.transactions.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  },

  // Delete transaction
  delete: async (id: string): Promise<void> => {
    // Delete associated expenses first
    const transaction = await db.transactions.get(id);
    if (transaction) {
      for (const expense of transaction.depenses) {
        await db.expenses.delete(expense.id);
      }
    }
    await db.transactions.delete(id);
  },

  // Get summary for a period
  getSummary: async (start: Date, end: Date): Promise<{
    totalEntree: number;
    totalDime: number;
    totalDepenses: number;
    totalEpargne: number;
    totalDimePayee: number;
    totalDimeRestante: number;
    transactionCount: number;
    expenseCount: number;
  }> => {
    const transactions = await db.transactions
      .where('date')
      .between(start, end, true, true)
      .toArray();

    const totalEntree = transactions.reduce((sum, t) => sum + t.entree, 0);
    const totalDime = transactions.reduce((sum, t) => sum + t.dime, 0);
    const totalEpargne = transactions.reduce((sum, t) => sum + t.epargne, 0);

    // Calculer dimePayee et dimeRestante
    const totalDimePayee = transactions.reduce((sum, t) => sum + (t.dimePayee || 0), 0);
    const totalDimeRestante = transactions.reduce((sum, t) => {
      const dr = t.dimeRestante !== undefined ? t.dimeRestante : (t.dime - (t.dimePayee || 0));
      return sum + Math.max(0, dr);
    }, 0);

    const expenses = await db.expenses
      .where('createdAt')
      .between(start, end, true, true)
      .toArray();
    const totalDepenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      totalEntree: Math.round(totalEntree * 100) / 100,
      totalDime: Math.round(totalDime * 100) / 100,
      totalDepenses: Math.round(totalDepenses * 100) / 100,
      totalEpargne: Math.round(totalEpargne * 100) / 100,
      totalDimePayee: Math.round(totalDimePayee * 100) / 100,
      totalDimeRestante: Math.round(totalDimeRestante * 100) / 100,
      transactionCount: transactions.length,
      expenseCount: expenses.length
    };
  }
};

// ============================================
// Database Operations - Expenses
// ============================================

export const expenseDB = {
  // Get all expenses
  getAll: async (): Promise<Expense[]> => {
    return await db.expenses.orderBy('createdAt').reverse().toArray();
  },

  // Get expenses by category
  getByCategory: async (category: string): Promise<Expense[]> => {
    return await db.expenses.where('category').equals(category).toArray();
  },

  // Get expenses by date range
  getByDateRange: async (start: Date, end: Date): Promise<Expense[]> => {
    return await db.expenses
      .where('createdAt')
      .between(start, end, true, true)
      .sortBy('createdAt');
  },

  // Get expenses by category AND date range
  getByCategoryAndDateRange: async (category: string, start: Date, end: Date): Promise<Expense[]> => {
    const allExpenses = await db.expenses
      .where('createdAt')
      .between(start, end, true, true)
      .toArray();
    return allExpenses.filter(e => e.category === category);
  },

  // Add expense
  add: async (expense: Expense): Promise<string> => {
    const id = await db.expenses.add(expense);
    return String(id);
  },

  // Update expense
  update: async (id: string, updates: Partial<Expense>): Promise<number> => {
    return await db.expenses.update(id, updates);
  },

  // Delete expense
  delete: async (id: string): Promise<void> => {
    await db.expenses.delete(id);
  }
};

// ============================================
// Database Operations - Categories
// ============================================

export const categoryDB = {
  // Initialize default categories
  initialize: async (): Promise<void> => {
    const count = await db.categories.count();
    if (count === 0) {
      const { INITIAL_CATEGORIES } = await import('../types');
      await db.categories.bulkAdd(INITIAL_CATEGORIES);
    }
  },

  // Get all categories
  getAll: async (): Promise<Category[]> => {
    return await db.categories.toArray();
  },

  // Get category by ID
  getById: async (id: string): Promise<Category | undefined> => {
    return await db.categories.get(id);
  },

  // Add category
  add: async (category: Category): Promise<string> => {
    const id = await db.categories.add(category);
    return String(id);
  },

  // Update category
  update: async (id: string, updates: Partial<Category>): Promise<number> => {
    return await db.categories.update(id, updates);
  },

  // Delete category
  delete: async (id: string): Promise<void> => {
    await db.categories.delete(id);
  }
};

// ============================================
// Database Operations - Preferences
// ============================================

export const preferencesDB = {
  // Get preferences
  get: async (): Promise<UserPreferences> => {
    const prefs = await db.preferences.toCollection().first();
    if (!prefs) {
      const { DEFAULT_PREFERENCES } = await import('../types/preferences');
      return DEFAULT_PREFERENCES;
    }
    return prefs;
  },

  // Update preferences
  update: async (updates: Partial<UserPreferences>): Promise<void> => {
    const current = await preferencesDB.get();
    const updated = { ...current, ...updates };
    const count = await db.preferences.count();
    if (count === 0) {
      await db.preferences.add(updated);
    } else {
      await db.preferences.put(updated);
    }
  }
};

// ============================================
// Database Initialization
// ============================================

export const initializeDB = async (): Promise<void> => {
  try {
    await db.open();
    await categoryDB.initialize();
    console.log('LedoDB initialized successfully');
  } catch (error) {
    console.error('Failed to initialize LedoDB:', error);
    throw error;
  }
};

// ============================================
// Utility Functions
// ============================================

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Clear all data (for testing)
export const clearAllData = async (): Promise<void> => {
  await db.transactions.clear();
  await db.expenses.clear();
  await db.categories.clear();
  await db.preferences.clear();
  await categoryDB.initialize();
};
