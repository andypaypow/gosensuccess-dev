// ============================================
// TRANSACTION STORE - Zustand
// ============================================

import { create } from 'zustand';
import type { Transaction, Expense, Summary } from '../types';
import {
  calculateDime,
  calculateEpargne,
  calculateDimePayee,
  calculateDimeRestante,
  generateId
} from '../types';
import {
  transactionDB,
  expenseDB,
  initializeDB
} from '../db/db';

// ============================================
// Store Interface
// ============================================

interface TransactionState {
  // Data
  transactions: Transaction[];
  currentTransaction: Transaction | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Error state
  error: string | null;

  // Actions
  loadTransactions: () => Promise<void>;
  loadTransactionsByDateRange: (start: Date, end: Date) => Promise<void>;
  getTransactionById: (id: string) => Promise<Transaction | undefined>;

  createTransaction: (data: {
    date: Date;
    entree: number;
    depenses: Omit<Expense, 'id' | 'createdAt'>[];
  }) => Promise<Transaction>;

  updateTransaction: (id: string, data: {
    date?: Date;
    entree?: number;
    depenses?: Omit<Expense, 'id' | 'createdAt'>[];
  }) => Promise<void>;

  deleteTransaction: (id: string) => Promise<void>;

  setCurrentTransaction: (transaction: Transaction | null) => void;
  clearError: () => void;

  // Summary
  getSummary: (start?: Date, end?: Date) => Promise<Summary>;
}

// ============================================
// Store Implementation
// ============================================

export const useTransactionStore = create<TransactionState>((set) => ({
  // Initial state
  transactions: [],
  currentTransaction: null,
  isLoading: false,
  isSaving: false,
  error: null,

  // Load all transactions
  loadTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      await initializeDB();
      const transactions = await transactionDB.getAll();
      set({ transactions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load transactions',
        isLoading: false
      });
    }
  },

  // Load transactions by date range
  loadTransactionsByDateRange: async (start: Date, end: Date) => {
    set({ isLoading: true, error: null });
    try {
      await initializeDB();
      const transactions = await transactionDB.getByDateRange(start, end);
      set({ transactions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load transactions',
        isLoading: false
      });
    }
  },

  // Get transaction by ID
  getTransactionById: async (id: string) => {
    try {
      return await transactionDB.getById(id);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get transaction' });
      return undefined;
    }
  },

  // Create new transaction
  createTransaction: async (data) => {
    set({ isSaving: true, error: null });
    try {
      await initializeDB();

      // Calculate dime
      const dime = calculateDime(data.entree);

      // Create expenses with IDs
      const depenses: Expense[] = data.depenses.map(d => ({
        ...d,
        id: generateId(),
        createdAt: new Date()
      }));

      // Calculate dime payee and restante
      const dimePayee = calculateDimePayee(depenses);
      const dimeRestante = calculateDimeRestante(dime, dimePayee);

      // Calculate total expenses and epargne
      const totalDepenses = depenses.reduce((sum, d) => sum + d.amount, 0);
      const epargne = calculateEpargne(data.entree, dime, totalDepenses);

      // Create transaction
      const transaction: Transaction = {
        id: generateId(),
        date: data.date,
        entree: data.entree,
        dime,
        depenses,
        epargne,
        dimePayee,
        dimeRestante,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await transactionDB.add(transaction);

      // Save expenses
      for (const expense of depenses) {
        await expenseDB.add(expense);
      }

      // Update state
      set(state => ({
        transactions: [transaction, ...state.transactions],
        isSaving: false
      }));

      return transaction;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create transaction',
        isSaving: false
      });
      throw error;
    }
  },

  // Update transaction
  updateTransaction: async (id, data) => {
    set({ isSaving: true, error: null });
    try {
      const existing = await transactionDB.getById(id);
      if (!existing) {
        throw new Error('Transaction not found');
      }

      let dime = existing.dime;
      let depenses = [...existing.depenses];

      // Calculate new dime if entree changed
      if (data.entree !== undefined && data.entree !== existing.entree) {
        dime = calculateDime(data.entree);
      }

      if (data.depenses) {
        // Delete old expenses
        for (const expense of existing.depenses) {
          await expenseDB.delete(expense.id);
        }
        // Create new expenses
        depenses = data.depenses.map(d => ({
          ...d,
          id: generateId(),
          createdAt: new Date()
        }));
        // Save new expenses
        for (const expense of depenses) {
          await expenseDB.add(expense);
        }
      }

      // Calculate dime payee and restante
      const dimePayee = calculateDimePayee(depenses);
      const dimeRestante = calculateDimeRestante(dime, dimePayee);

      // Calculate epargne with total expenses
      const totalDepenses = depenses.reduce((sum, d) => sum + d.amount, 0);
      const currentEntree = data.entree !== undefined ? data.entree : existing.entree;
      const epargne = calculateEpargne(currentEntree, dime, totalDepenses);

      const updates: Partial<Transaction> = {
        ...data,
        dime,
        epargne,
        depenses,
        dimePayee,
        dimeRestante,
        updatedAt: new Date()
      };

      await transactionDB.update(id, updates);

      // Update state
      set(state => ({
        transactions: state.transactions.map(t =>
          t.id === id ? { ...t, ...updates } : t
        ),
        isSaving: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update transaction',
        isSaving: false
      });
      throw error;
    }
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    set({ isSaving: true, error: null });
    try {
      await transactionDB.delete(id);

      // Update state
      set(state => ({
        transactions: state.transactions.filter(t => t.id !== id),
        isSaving: false
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete transaction',
        isSaving: false
      });
      throw error;
    }
  },

  // Set current transaction
  setCurrentTransaction: (transaction) => {
    set({ currentTransaction: transaction });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Get summary
  getSummary: async (start?: Date, end?: Date) => {
    try {
      await initializeDB();
      const defaultStart = start || new Date(new Date().setMonth(new Date().getMonth() - 1));
      const defaultEnd = end || new Date();
      return await transactionDB.getSummary(defaultStart, defaultEnd);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to get summary' });
      return {
        totalEntree: 0,
        totalDime: 0,
        totalDepenses: 0,
        totalEpargne: 0,
        totalDimePayee: 0,
        totalDimeRestante: 0,
        transactionCount: 0,
        expenseCount: 0
      };
    }
  }
}));
