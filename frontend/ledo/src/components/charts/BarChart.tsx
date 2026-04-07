// ============================================
// BAR CHART COMPONENT
// ============================================

import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Transaction } from '../../types';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { formatCurrencyWithPrefs } from '../../types/preferences';

interface BarChartProps {
  transactions: Transaction[];
}

export const BarChart: React.FC<BarChartProps> = ({ transactions }) => {
  const prefs = usePreferencesStore();

  // Group by month
  const monthlyData = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthLabel,
        entree: 0,
        dime: 0,
        depenses: 0,
        epargne: 0
      };
    }

    acc[monthKey].entree += t.entree;
    acc[monthKey].dime += t.dime;
    acc[monthKey].epargne += t.epargne;
    acc[monthKey].depenses += t.depenses.reduce((sum, d) => sum + d.amount, 0);

    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(monthlyData);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-gray-500">
        Aucune donnée à afficher
      </div>
    );
  }

  // Custom tooltip avec préférences utilisateur
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {formatCurrencyWithPrefs(entry.value, prefs)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#6B7280"
          tickFormatter={(value) => formatCurrencyWithPrefs(value as number, prefs)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="entree" fill="#10B981" name="Entrée" radius={[4, 4, 0, 0]} />
        <Bar dataKey="dime" fill="#8B5CF6" name="Dime (10%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="depenses" fill="#EF4444" name="Dépenses" radius={[4, 4, 0, 0]} />
        <Bar dataKey="epargne" fill="#10B981" name="Épargne" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
