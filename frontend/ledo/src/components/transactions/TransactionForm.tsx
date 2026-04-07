// ============================================
// TRANSACTION FORM COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { useCategoryStore } from '../../stores/categoryStore';
import { Modal, ModalFooter, Button, NumberInput } from '../shared';
import { calculateDime, calculateEpargne, formatCurrency } from '../../types';
import type { Expense, CategoryType } from '../../types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId?: string;
  onSaved?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  transactionId,
  onSaved
}) => {
  const { createTransaction, updateTransaction, currentTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();

  const [date, setDate] = useState<Date>(new Date());
  const [entree, setEntree] = useState<number>(0);
  const [depenses, setDepenses] = useState<Omit<Expense, 'id' | 'createdAt'>[]>([]);

  // Calculs automatiques
  const dime = calculateDime(entree);
  const totalDepenses = depenses.reduce((sum, d) => sum + d.amount, 0);
  const epargne = calculateEpargne(entree, dime, totalDepenses);

  // Calculer la dîme payée (somme des dépenses Église → Dimes)
  const dimePayee = depenses
    .filter(d => d.category === 'eglise' && d.subcategory === 'Dimes')
    .reduce((sum, d) => sum + d.amount, 0);
  const dimeRestante = Math.max(0, dime - dimePayee);

  // Reset form
  const resetForm = () => {
    setDate(new Date());
    setEntree(0);
    setDepenses([]);
  };

  // Load transaction if editing
  useEffect(() => {
    if (transactionId && currentTransaction) {
      setDate(new Date(currentTransaction.date));
      setEntree(currentTransaction.entree);
      setDepenses(
        currentTransaction.depenses.map(({ id, createdAt, ...rest }) => rest)
      );
    } else {
      resetForm();
    }
  }, [transactionId, currentTransaction, isOpen]);

  // Add expense
  const addExpense = () => {
    setDepenses([
      ...depenses,
      {
        category: 'charges' as CategoryType,
        subcategory: '',
        amount: 0,
        description: ''
      }
    ]);
  };

  // Remove expense
  const removeExpense = (index: number) => {
    setDepenses(depenses.filter((_, i) => i !== index));
  };

  // Update expense
  const updateExpense = (index: number, field: keyof Omit<Expense, 'id' | 'createdAt'>, value: any) => {
    const newDepenses = [...depenses];
    newDepenses[index] = { ...newDepenses[index], [field]: value };
    setDepenses(newDepenses);
  };

  // Get subcategories for category
  const getSubcategories = (categoryType: CategoryType): string[] => {
    const category = categories.find(c => c.type === categoryType);
    return category?.subcategories || [];
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = {
        date,
        entree,
        depenses: depenses.filter(d => d.amount > 0)
      };

      if (transactionId) {
        await updateTransaction(transactionId, data);
      } else {
        await createTransaction(data);
      }

      resetForm();
      onSaved?.(); // Appeler le callback pour mise à jour automatique
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionId ? 'Modifier la transaction' : 'Nouvelle transaction'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={date.toISOString().split('T')[0]}
            onChange={(e) => setDate(new Date(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Entrée */}
        <div>
          <NumberInput
            label="Entrée journalière"
            value={entree}
            onChange={(e) => setEntree(parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
            prefix="€"
            placeholder="0.00"
            required
          />
        </div>

        {/* Calculs automatiques */}
        {entree > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Calculs automatiques</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-purple-700">Dime (10%):</span>
                <span className="ml-2 font-bold text-purple-900">{formatCurrency(dime)}</span>
              </div>
              <div>
                <span className="text-blue-700">Dime payée:</span>
                <span className="ml-2 font-bold text-blue-900">{formatCurrency(dimePayee)}</span>
              </div>
              <div>
                <span className={dimeRestante > 0 ? "text-orange-700" : "text-green-700"}>Dime restante:</span>
                <span className={`ml-2 font-bold ${dimeRestante > 0 ? "text-orange-900" : "text-green-900"}`}>
                  {formatCurrency(dimeRestante)}
                </span>
              </div>
              <div>
                <span className="text-green-700">Épargne:</span>
                <span className="ml-2 font-bold text-green-900">{formatCurrency(epargne)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Dépenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Dépenses
            </label>
            <button
              type="button"
              onClick={addExpense}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {depenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Aucune dépense pour cette transaction
            </div>
          ) : (
            <div className="space-y-3">
              {depenses.map((expense, index) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                    {/* Catégorie */}
                    <select
                      value={expense.category}
                      onChange={(e) => updateExpense(index, 'category', e.target.value as CategoryType)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.type}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>

                    {/* Sous-catégorie */}
                    <select
                      value={expense.subcategory}
                      onChange={(e) => updateExpense(index, 'subcategory', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={getSubcategories(expense.category).length === 0}
                    >
                      <option value="">Sélectionner...</option>
                      {getSubcategories(expense.category).map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>

                    {/* Montant */}
                    <input
                      type="number"
                      value={expense.amount || ''}
                      onChange={(e) => updateExpense(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Description */}
                    <input
                      type="text"
                      value={expense.description || ''}
                      onChange={(e) => updateExpense(index, 'description', e.target.value)}
                      placeholder="Description (optionnel)"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeExpense(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Total des dépenses */}
          {depenses.length > 0 && totalDepenses > 0 && (
            <div className="mt-3 text-right">
              <span className="text-sm text-gray-600">Total dépenses: </span>
              <span className="text-lg font-bold text-red-600">{formatCurrency(totalDepenses)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            {transactionId ? 'Mettre à jour' : 'Créer'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
