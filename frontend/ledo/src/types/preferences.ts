// ============================================
// USER PREFERENCES TYPES
// ============================================

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'CHF' | 'XOF' | 'XAF' | 'CDF';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  position: 'before' | 'after';
}

export const CURRENCIES: Currency[] = [
  { code: 'EUR', symbol: '€', name: 'Euro', position: 'after' },
  { code: 'USD', symbol: '$', name: 'Dollar américain', position: 'before' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling', position: 'before' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien', position: 'before' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', position: 'before' },
  { code: 'XOF', symbol: 'CFA', name: 'Franc CFA Ouest', position: 'after' },
  { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA Centre', position: 'after' },
  { code: 'CDF', symbol: 'FC', name: 'Franc congolais', position: 'after' },
];

export interface MonthPeriodConfig {
  startDay: number;      // Jour de début (1-31)
  endDay: number;        // Jour de fin (1-31)
  name: string;          // Nom de la période (ex: "Mensuel (25-24)")
}

// Périodes prédéfinies
export const PREDEFINED_PERIODS: MonthPeriodConfig[] = [
  { startDay: 1, endDay: 31, name: 'Mois calendaire (1er - dernier jour)' },
  { startDay: 25, endDay: 24, name: 'Mensuel (25 au 24 suivant)' },
  { startDay: 20, endDay: 19, name: 'Mensuel (20 au 19 suivant)' },
  { startDay: 15, endDay: 14, name: 'Mensuel (15 au 14 suivant)' },
] as const;

export interface UserPreferences {
  currency: CurrencyCode;
  decimals: boolean;           // Afficher les décimales (2) ou arrondir à l'entier
  decimalPlaces: number;       // Nombre de décimales (0-4)
  monthPeriod: MonthPeriodConfig;
  dateFormat: string;          // dd/MM/yyyy ou MM/dd/yyyy
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  currency: 'XAF',  // Afrique centrale par défaut
  decimals: false,   // Pas de décimales par défaut
  decimalPlaces: 0,
  monthPeriod: PREDEFINED_PERIODS[1], // Par défaut: 25-24
  dateFormat: 'dd/MM/yyyy',
  theme: 'light',
  language: 'fr'
};

// Formatage avec préférences utilisateur
export const formatCurrencyWithPrefs = (
  amount: number,
  prefs: UserPreferences
): string => {
  const currency = CURRENCIES.find(c => c.code === prefs.currency) || CURRENCIES[0];

  // Formater avec séparateurs de milliers
  const formattedNumber = new Intl.NumberFormat(prefs.language, {
    minimumFractionDigits: prefs.decimals ? prefs.decimalPlaces : 0,
    maximumFractionDigits: prefs.decimals ? prefs.decimalPlaces : 0,
  }).format(amount);

  if (currency.position === 'before') {
    return `${currency.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber}${currency.symbol}`;
  }
};

// Obtenir les dates de début et de fin du mois basé sur la période personnalisée
export const getMonthPeriodDates = (
  referenceDate: Date,
  period: MonthPeriodConfig
): { start: Date; end: Date } => {
  const start = new Date(referenceDate);
  const end = new Date(referenceDate);

  // Pour une période personnalisée (ex: 25-24), le mois sélectionné est le mois de DÉBUT
  // Si startDay > endDay (ex: 25-24), la période chevauche deux mois
  if (period.startDay > 1) {
    // Le mois de référence est le mois de début de la période
    // On fixe le jour de début dans le mois sélectionné
    start.setDate(period.startDay);
    start.setHours(0, 0, 0, 0);

    // La fin est dans le mois suivant
    end.setMonth(start.getMonth() + 1);
    end.setDate(period.endDay);
    end.setHours(23, 59, 59, 999);
  } else {
    // Cas standard : startDay = 1 (mois calendaire)
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    // Trouver le dernier jour du mois
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    end.setDate(period.endDay > lastDay ? lastDay : period.endDay);
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
};

// Formater le nom de la période pour affichage
export const formatPeriodName = (date: Date, period: MonthPeriodConfig): string => {
  const { start, end } = getMonthPeriodDates(date, period);

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  const startMonth = monthNames[start.getMonth()];
  const startYear = start.getFullYear();
  const endMonth = monthNames[end.getMonth()];
  const endYear = end.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startMonth} ${startYear}`;
  }

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`;
};
