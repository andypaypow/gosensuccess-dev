// ============================================
// TYPES LEDO - Gestion Financière
// ============================================

// Ré-exporter les types de préférences
export * from './preferences';

// ============================================
// Catégories et Sous-catégories
// ============================================

export type CategoryType = 'eglise' | 'charges' | 'investissement' | 'urgence';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  subcategories: string[];
}

// Catégories prédéfinies
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'eglise',
    name: 'Église',
    type: 'eglise',
    color: '#8B5CF6',
    icon: '🏛️',
    subcategories: ['Dimes', 'Offrandes', 'Vœux', 'Sacrifices', 'Collecte', 'Prémices']
  },
  {
    id: 'charges',
    name: 'Charges fixes',
    type: 'charges',
    color: '#EF4444',
    icon: '🏠',
    subcategories: ['Alimentation', 'Électricité', 'Transport', 'Travail', 'Internet', 'Conjoint', 'Enfants']
  },
  {
    id: 'investissement',
    name: 'Investissement',
    type: 'investissement',
    color: '#10B981',
    icon: '📈',
    subcategories: []
  },
  {
    id: 'urgence',
    name: "Fonds d'urgence",
    type: 'urgence',
    color: '#F59E0B',
    icon: '🚨',
    subcategories: []
  }
];

// ============================================
// Transactions et Dépenses
// ============================================

export interface Expense {
  id: string;
  category: CategoryType;
  subcategory: string;
  amount: number;
  description?: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  date: Date;
  entree: number;           // Entrée journalière
  dime: number;             // Calculé automatiquement: entree * 0.10
  depenses: Expense[];      // Tableau des dépenses du jour
  epargne: number;          // Calculé automatiquement: entree - dime - total_depenses
  dimePayee: number;        // Somme des dépenses "Église → Dimes" déjà payées
  dimeRestante: number;     // Dîme restante à payer: dime - dimePayee
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Filtres
// ============================================

export type PeriodType = 'day' | 'week' | 'month' | 'year';

export interface FilterState {
  categories: CategoryType[];        // Catégories sélectionnées
  subcategories: string[];           // Sous-catégories sélectionnées
  period: PeriodType;
  selectedMonth: Date | null;        // Mois sélectionné (pour period='month')
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  entryRange: {
    min: number | null;
    max: number | null;
  };
  active: boolean;                   // True si au moins un filtre est actif
}

// ============================================
// Graphiques
// ============================================

export type ChartType = 'line' | 'pie' | 'bar';

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  date: string;
  entree: number;
  dime: number;
  depenses: number;
  epargne: number;
}

// ============================================
// Résumé
// ============================================

export interface Summary {
  totalEntree: number;
  totalDime: number;
  totalDepenses: number;
  totalEpargne: number;
  totalDimePayee: number;
  totalDimeRestante: number;
  transactionCount: number;
  expenseCount: number;
}

// ============================================
// Préférences utilisateur
// ============================================

export interface UserPreferences {
  currency: string;
  dateFormat: string;
  defaultPeriod: PeriodType;
  theme: 'light' | 'dark';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'EUR',
  dateFormat: 'dd/MM/yyyy',
  defaultPeriod: 'month',
  theme: 'light'
};

// ============================================
// Utilitaires de calcul
// ============================================

export const calculateDime = (entree: number): number => {
  return Math.round(entree * 0.10 * 100) / 100;
};

export const calculateEpargne = (entree: number, dime: number, totalDepenses: number): number => {
  return Math.round((entree - dime - totalDepenses) * 100) / 100;
};

// Calculer la dîme payée (somme des dépenses Église → Dimes)
export const calculateDimePayee = (depenses: Expense[]): number => {
  return Math.round(
    depenses
      .filter(d => d.category === 'eglise' && d.subcategory === 'Dimes')
      .reduce((sum, d) => sum + d.amount, 0) * 100
  ) / 100;
};

// Calculer la dîme restante à payer
export const calculateDimeRestante = (dime: number, dimePayee: number): number => {
  return Math.round((dime - dimePayee) * 100) / 100;
};

export const calculateTotalDepenses = (depenses: Expense[]): number => {
  return Math.round(depenses.reduce((sum, d) => sum + d.amount, 0) * 100) / 100;
};

// ============================================
// Formatage
// ============================================

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date, format: string = 'dd/MM/yyyy'): string => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'dd/MM/yyyy') {
    return `${day}/${month}/${year}`;
  }
  return d.toLocaleDateString('fr-FR');
};

// ============================================
// Constantes
// ============================================

export const DIME_PERCENTAGE = 0.10;

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  eglise: '#8B5CF6',
  charges: '#EF4444',
  investissement: '#10B981',
  urgence: '#F59E0B'
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
