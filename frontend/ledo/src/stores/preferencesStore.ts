// ============================================
// PREFERENCES STORE - Zustand
// ============================================

import { create } from 'zustand';
import type { UserPreferences, CurrencyCode, MonthPeriodConfig } from '../types/preferences';
import {
  DEFAULT_PREFERENCES,
  formatCurrencyWithPrefs,
  getMonthPeriodDates
} from '../types/preferences';
import { db } from '../db/db';

interface PreferencesState extends UserPreferences {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadPreferences: () => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  setDecimals: (decimals: boolean, decimalPlaces?: number) => Promise<void>;
  setMonthPeriod: (period: MonthPeriodConfig) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  // Initial state
  ...DEFAULT_PREFERENCES,
  isLoading: false,
  isSaving: false,
  error: null,

  // Load preferences from database
  loadPreferences: async () => {
    set({ isLoading: true, error: null });
    try {
      await db.open();

      const prefs = await db.preferences
        .toCollection()
        .first();

      if (prefs) {
        // Force defaults for currency and decimals (XAF, no decimals)
        const needsUpdate = prefs.currency !== 'XAF' || prefs.decimals !== false || prefs.decimalPlaces !== 0;

        if (needsUpdate) {
          const updated = {
            ...prefs,
            currency: 'XAF' as CurrencyCode,
            decimals: false,
            decimalPlaces: 0
          };
          await db.preferences.put(updated);
          set({ ...updated, isLoading: false });
        } else {
          set({ ...prefs, isLoading: false });
        }
      } else {
        // Create default preferences
        await db.preferences.add(DEFAULT_PREFERENCES);
        set({ ...DEFAULT_PREFERENCES, isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load preferences',
        isLoading: false
      });
    }
  },

  // Update preferences
  updatePreferences: async (updates) => {
    set({ isSaving: true, error: null });
    try {
      const current = {
        currency: get().currency,
        decimals: get().decimals,
        decimalPlaces: get().decimalPlaces,
        monthPeriod: get().monthPeriod,
        dateFormat: get().dateFormat,
        theme: get().theme,
        language: get().language,
      };

      const updated = { ...current, ...updates };

      // Save to database
      const count = await db.preferences.count();
      if (count === 0) {
        await db.preferences.add(updated);
      } else {
        await db.preferences.put(updated);
      }

      set({ ...updated, isSaving: false });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        isSaving: false
      });
    }
  },

  // Reset to default
  resetPreferences: async () => {
    set({ isSaving: true, error: null });
    try {
      await db.preferences.clear();
      await db.preferences.add(DEFAULT_PREFERENCES);
      set({ ...DEFAULT_PREFERENCES, isSaving: false });
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to reset preferences',
        isSaving: false
      });
    }
  },

  // Quick setters
  setCurrency: async (currency) => {
    await get().updatePreferences({ currency });
  },

  setDecimals: async (decimals, decimalPlaces) => {
    await get().updatePreferences({
      decimals,
      decimalPlaces: decimalPlaces !== undefined ? decimalPlaces : decimals ? 2 : 0
    });
  },

  setMonthPeriod: async (monthPeriod) => {
    await get().updatePreferences({ monthPeriod });
  },
}));

// Hook pour formater avec les préférences actuelles
export const useFormattedCurrency = (amount: number) => {
  const prefs = usePreferencesStore();
  return formatCurrencyWithPrefs(amount, prefs);
};

// Hook pour obtenir la période de mois actuelle
export const useCurrentMonthPeriod = () => {
  const { monthPeriod } = usePreferencesStore();
  return getMonthPeriodDates(new Date(), monthPeriod);
};
