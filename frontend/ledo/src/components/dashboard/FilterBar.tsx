// ============================================
// FILTER BAR COMPONENT
// ============================================

import React, { useState } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { X, Calendar, DollarSign, Filter } from 'lucide-react';
import type { PeriodType } from '../../types';
import { INITIAL_CATEGORIES } from '../../types';

export const FilterBar: React.FC = () => {
  const {
    categories,
    subcategories,
    period,
    selectedMonth,
    entryRange,
    active,
    setCategories,
    setPeriod,
    setSelectedMonth,
    setEntryRange,
    resetFilters
  } = useFilterStore();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const periods: { value: PeriodType; label: string }[] = [
    { value: 'day', label: 'Jour' },
    { value: 'week', label: 'Semaine' },
    { value: 'month', label: 'Mois' },  // Par défaut
    { value: 'year', label: 'Année' }
  ];

  const activeFilterCount =
    categories.length +
    subcategories.length +
    (entryRange.min !== null ? 1 : 0) +
    (entryRange.max !== null ? 1 : 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Period filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Période:</span>
          </div>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${period === p.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Month selector - affiché seulement si period='month' */}
          {period === 'month' && (
            <input
              type="month"
              value={selectedMonth ? `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}` : ''}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-').map(Number);
                setSelectedMonth(new Date(year, month - 1, 1));
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          )}
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtres:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {INITIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  const newCategories = categories.includes(cat.type)
                    ? categories.filter(c => c !== cat.type)
                    : [...categories, cat.type];
                  setCategories(newCategories);
                }}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${categories.includes(cat.type)
                    ? 'text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
                style={categories.includes(cat.type) ? { backgroundColor: cat.color } : {}}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {active && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Réinitialiser
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {showAdvanced ? 'Moins' : 'Plus'}
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entry range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Plage d'entrées
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={entryRange.min ?? ''}
                  onChange={(e) => setEntryRange(
                    e.target.value ? parseFloat(e.target.value) : null,
                    entryRange.max
                  )}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={entryRange.max ?? ''}
                  onChange={(e) => setEntryRange(
                    entryRange.min,
                    e.target.value ? parseFloat(e.target.value) : null
                  )}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Active filters summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtres actifs
              </label>
              <div className="text-sm text-gray-600">
                {activeFilterCount === 0 ? (
                  <span className="text-gray-400">Aucun filtre actif</span>
                ) : (
                  <span>{activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
