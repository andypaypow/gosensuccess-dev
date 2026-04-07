// ============================================
// TRANSACTION GRID COMPONENT
// ============================================

import React from 'react';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { formatCurrencyWithPrefs } from '../../types/preferences';
import { formatDate } from '../../types';
import type { Transaction } from '../../types';

interface TransactionGridProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionGrid: React.FC<TransactionGridProps> = ({
  transactions,
  onEdit,
  onDelete
}) => {
  const prefs = usePreferencesStore();

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune transaction</h3>
        <p className="text-gray-500">Commencez par ajouter votre première entrée.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Entrée
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-purple-600 uppercase tracking-wider">
                Dime (10%)
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-red-600 uppercase tracking-wider">
                Dépenses
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-green-600 uppercase tracking-wider">
                Épargne
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((transaction) => {
              const totalDepenses = transaction.depenses.reduce(
                (sum, d) => sum + d.amount,
                0
              );

              return (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(transaction.date)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {formatCurrencyWithPrefs(transaction.entree, prefs)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-purple-600">
                      {formatCurrencyWithPrefs(transaction.dime, prefs)}
                    </div>
                    <div className="text-xs text-gray-500">10%</div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {formatCurrencyWithPrefs(totalDepenses, prefs)}
                    </div>
                    {transaction.depenses.length > 0 && (
                      <div className="text-xs text-gray-500">
                        {transaction.depenses.length} dépense{transaction.depenses.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-bold text-green-600">
                      {formatCurrencyWithPrefs(transaction.epargne, prefs)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
