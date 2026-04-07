// ============================================
// LINE CHART COMPONENT
// ============================================

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Transaction } from '../../types';
import { formatDate } from '../../types';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { formatCurrencyWithPrefs } from '../../types/preferences';

interface LineChartProps {
  transactions: Transaction[];
}

export const LineChart: React.FC<LineChartProps> = ({ transactions }) => {
  const prefs = usePreferencesStore();

  // Prepare data for chart
  const data = transactions
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => {
      const totalDepenses = t.depenses.reduce((sum, d) => sum + d.amount, 0);
      return {
        date: formatDate(new Date(t.date)),
        entree: t.entree,
        dime: t.dime,
        depenses: totalDepenses,
        epargne: t.epargne
      };
    });

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
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.date}</p>
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
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
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
        <Line
          type="monotone"
          dataKey="entree"
          stroke="#10B981"
          strokeWidth={2}
          name="Entrée"
          dot={{ fill: '#10B981', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="dime"
          stroke="#8B5CF6"
          strokeWidth={2}
          name="Dime (10%)"
          dot={{ fill: '#8B5CF6', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="depenses"
          stroke="#EF4444"
          strokeWidth={2}
          name="Dépenses"
          dot={{ fill: '#EF4444', r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="epargne"
          stroke="#10B981"
          strokeWidth={2}
          name="Épargne"
          dot={{ fill: '#10B981', r: 4 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};
