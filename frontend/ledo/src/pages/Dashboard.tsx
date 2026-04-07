// ============================================
// DASHBOARD PAGE
// ============================================

import { useState, useCallback, useMemo } from 'react';
import { Plus, Download, AlertTriangle } from 'lucide-react';
import { useTransactionStore } from '../stores/transactionStore';
import { useFilterStore } from '../stores/filterStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { getDateRangeForPeriod, matchesFilters } from '../stores/filterStore';
import { getMonthPeriodDates, formatPeriodName } from '../types/preferences';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { FilterBar } from '../components/dashboard/FilterBar';
import { TransactionGrid } from '../components/dashboard/TransactionGrid';
import { ChartsView } from '../components/charts';
import { PartnerSection } from '../components/dashboard/PartnerSection';
import { TransactionForm } from '../components/transactions/TransactionForm';
import { Button } from '../components/shared/Button';
import { Modal, ModalFooter } from '../components/shared/Modal';
import type { Transaction } from '../types';

export const Dashboard = () => {
  const { transactions, loadTransactions, deleteTransaction, setCurrentTransaction } = useTransactionStore();
  const { active, period, categories, subcategories, entryRange, selectedMonth } = useFilterStore();
  const { monthPeriod } = usePreferencesStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // Obtenir les dates de filtre selon la période sélectionnée (jour/semaine/mois/année)
  const getFilteredDates = useCallback(() => {
    const referenceDate = selectedMonth || new Date();

    // Pour le mois, utiliser la période personnalisée de l'utilisateur
    if (period === 'month') {
      return getMonthPeriodDates(referenceDate, monthPeriod);
    }
    // Pour jour, semaine, année : utiliser la fonction standard
    return getDateRangeForPeriod(period);
  }, [period, monthPeriod, selectedMonth]);

  // Get filtered transactions - utilise la période du filtre (jour/semaine/mois/année)
  const filteredTransactions = useMemo(() => {
    const { start, end } = getFilteredDates();

    // Construire l'état de filtre pour matchesFilters
    const filterState = {
      categories,
      subcategories,
      period,
      selectedMonth,
      dateRange: { start: null, end: null },
      entryRange,
      active
    };

    return transactions.filter(t => {
      const tDate = new Date(t.date);

      // Vérifier si la transaction est dans la période filtrée
      const inPeriod = tDate >= start && tDate <= end;

      return inPeriod && matchesFilters(t, filterState);
    });
  }, [transactions, period, categories, subcategories, entryRange, active, getFilteredDates]);

  // Calculer le summary directement à partir des transactions filtrées (synchronisation totale)
  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const tDimePayee = t.dimePayee || 0;
      const tDimeRestante = t.dimeRestante !== undefined ? t.dimeRestante : (t.dime - tDimePayee);
      return {
        totalEntree: acc.totalEntree + t.entree,
        totalDime: acc.totalDime + t.dime,
        totalDepenses: acc.totalDepenses + t.depenses.reduce((sum, d) => sum + d.amount, 0),
        totalEpargne: acc.totalEpargne + t.epargne,
        totalDimePayee: acc.totalDimePayee + tDimePayee,
        totalDimeRestante: acc.totalDimeRestante + tDimeRestante,
        transactionCount: acc.transactionCount + 1,
        expenseCount: acc.expenseCount + t.depenses.length
      };
    }, {
      totalEntree: 0,
      totalDime: 0,
      totalDepenses: 0,
      totalEpargne: 0,
      totalDimePayee: 0,
      totalDimeRestante: 0,
      transactionCount: 0,
      expenseCount: 0
    });
  }, [filteredTransactions]);

  // Fonction appelée après l'ajout/modification d'une transaction
  const handleTransactionSaved = useCallback(() => {
    loadTransactions(); // Recharger toutes les transactions
  }, [loadTransactions]);

  // Modifier une transaction
  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransactionId(transaction.id);
    setCurrentTransaction(transaction);
    setIsFormOpen(true);
  }, [setCurrentTransaction]);

  // Supprimer une transaction - confirmation
  const handleDeleteClick = useCallback((id: string) => {
    setTransactionToDelete(id);
    setIsDeleteModalOpen(true);
  }, []);

  // Confirmer la suppression
  const handleDeleteConfirm = useCallback(async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    }
  }, [transactionToDelete, deleteTransaction]);

  // Ouvrir le formulaire pour une nouvelle transaction
  const handleNewTransaction = useCallback(() => {
    setEditingTransactionId(undefined);
    setCurrentTransaction(null);
    setIsFormOpen(true);
  }, [setCurrentTransaction]);

  // Handle export
  const handleExport = () => {
    const data = filteredTransactions.map(t => ({
      date: new Date(t.date).toLocaleDateString('fr-FR'),
      entree: t.entree,
      dime: t.dime,
      totalDepenses: t.depenses.reduce((sum, d) => sum + d.amount, 0),
      epargne: t.epargne
    }));

    const headers = ['Date', 'Entrée', 'Dime', 'Dépenses', 'Épargne'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledo-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">
            Affichage : {period === 'day' ? 'Aujourd\'hui' : period === 'week' ? 'Cette semaine' : period === 'month' ? formatPeriodName(selectedMonth || new Date(), monthPeriod) : 'Cette année'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExport}
            disabled={filteredTransactions.length === 0}
          >
            Exporter
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleNewTransaction}
          >
            Nouvelle transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards summary={summary} />

      {/* Filters */}
      <FilterBar />

      {/* Transactions Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transactions {active && '(filtré)'} - {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''}
          </h2>
        </div>
        <TransactionGrid
          transactions={filteredTransactions}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Charts */}
      <ChartsView transactions={filteredTransactions} />

      {/* Partner Section */}
      <PartnerSection />

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransactionId(undefined);
          setCurrentTransaction(null);
        }}
        transactionId={editingTransactionId}
        onSaved={() => {
          handleTransactionSaved();
          setEditingTransactionId(undefined);
          setCurrentTransaction(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 mb-4">
            Êtes-vous sûr de vouloir supprimer cette transaction ?
          </p>
          <p className="text-sm text-gray-500">
            Cette action est irréversible.
          </p>
        </div>
        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
          >
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
