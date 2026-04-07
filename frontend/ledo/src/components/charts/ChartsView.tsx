// ============================================
// CHARTS VIEW COMPONENT
// ============================================

import React, { useState } from 'react';
import { LineChart, PieChart, BarChart } from './index';
import type { Transaction, ChartType } from '../../types';

interface ChartsViewProps {
  transactions: Transaction[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ transactions }) => {
  const [activeChart, setActiveChart] = useState<ChartType>('line');

  const charts: { type: ChartType; label: string; icon: string }[] = [
    { type: 'line', label: 'Évolution', icon: '📈' },
    { type: 'pie', label: 'Répartition', icon: '🥧' },
    { type: 'bar', label: 'Comparaison', icon: '📊' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      {/* Chart selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Graphiques</h2>
        <div className="flex gap-2">
          {charts.map((chart) => (
            <button
              key={chart.type}
              onClick={() => setActiveChart(chart.type)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all
                ${activeChart === chart.type
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1">{chart.icon}</span>
              {chart.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart display */}
      <div className="min-h-[400px]">
        {activeChart === 'line' && <LineChart transactions={transactions} />}
        {activeChart === 'pie' && <PieChart transactions={transactions} />}
        {activeChart === 'bar' && <BarChart transactions={transactions} />}
      </div>
    </div>
  );
};
