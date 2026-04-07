// ============================================
// SUMMARY CARDS COMPONENT
// ============================================

import React from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, AlertCircle } from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { formatCurrencyWithPrefs } from '../../types/preferences';
import type { Summary } from '../../types';

interface SummaryCardsProps {
  summary: Summary;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  summary,
  isLoading = false
}) => {
  const prefs = usePreferencesStore();

  const cards = [
    {
      label: 'Total Entrées',
      value: summary.totalEntree,
      icon: ArrowDownLeft,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500'
    },
    {
      label: 'Dime Totale',
      value: summary.totalDime,
      icon: Wallet,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Dime Restante',
      value: summary.totalDimeRestante,
      icon: AlertCircle,
      color: summary.totalDimeRestante > 0 ? 'text-orange-600' : 'text-green-600',
      bgColor: summary.totalDimeRestante > 0 ? 'bg-orange-50' : 'bg-green-50',
      borderColor: summary.totalDimeRestante > 0 ? 'border-orange-500' : 'border-green-500'
    },
    {
      label: 'Total Dépenses',
      value: summary.totalDepenses,
      icon: ArrowUpRight,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500'
    },
    {
      label: 'Épargne Constituée',
      value: summary.totalEpargne,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const borderColor = card.borderColor.replace('border-', '');
        return (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-sm p-6 border-l-4"
            style={{ borderColor }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.label}
                </p>
                <p className={"text-2xl font-bold " + card.color}>
                  {formatCurrencyWithPrefs(card.value, prefs)}
                </p>
              </div>
              <div className={card.bgColor + " p-3 rounded-lg"}>
                <Icon className={"w-6 h-6 " + card.color} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
