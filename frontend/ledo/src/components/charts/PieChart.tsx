// ============================================
// PIE CHART COMPONENT
// ============================================

import React, { useState } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import type { Transaction } from '../../types';
import { CATEGORY_COLORS, INITIAL_CATEGORIES } from '../../types';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { formatCurrencyWithPrefs } from '../../types/preferences';

interface PieChartProps {
  transactions: Transaction[];
}

export const PieChart: React.FC<PieChartProps> = ({ transactions }) => {
  const [selectedView, setSelectedView] = useState<'category' | 'subcategory'>('category');
  const prefs = usePreferencesStore();

  // Type pour les données avec couleur
  interface PieData {
    name: string;
    value: number;
    color?: string;
  }

  // Calculate expenses by category
  const expensesByCategory = transactions.reduce((acc, t) => {
    t.depenses.forEach((expense) => {
      const key = expense.category;
      acc[key] = (acc[key] || 0) + expense.amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryData: PieData[] = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: INITIAL_CATEGORIES.find(c => c.type === category)?.name || category,
    value: amount,
    color: (CATEGORY_COLORS as any)[category]
  }));

  // Calculate expenses by subcategory
  const expensesBySubcategory = transactions.reduce((acc, t) => {
    t.depenses.forEach((expense) => {
      const key = `${expense.category} - ${expense.subcategory}`;
      acc[key] = (acc[key] || 0) + expense.amount;
    });
    return acc;
  }, {} as Record<string, number>);

  const subcategoryData: PieData[] = Object.entries(expensesBySubcategory)
    .map(([key, amount]) => ({
      name: key,
      value: amount
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10

  const data = selectedView === 'category' ? categoryData : subcategoryData;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0 || total === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Aucune dépense à afficher
      </div>
    );
  }

  // Custom tooltip avec préférences utilisateur
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrencyWithPrefs(data.value, prefs)}
          </p>
          <p className="text-sm text-gray-500">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* View selector */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedView('category')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'category'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Par catégorie
        </button>
        <button
          onClick={() => setSelectedView('subcategory')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedView === 'subcategory'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Par sous-catégorie
        </button>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm font-medium text-gray-900 ml-auto">
              {formatCurrencyWithPrefs(item.value, prefs)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6'];
