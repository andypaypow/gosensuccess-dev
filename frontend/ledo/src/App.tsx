// ============================================
// APP COMPONENT - Main Application
// ============================================

import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { useTransactionStore } from './stores/transactionStore';
import { usePreferencesStore } from './stores/preferencesStore';
import { initializeDB } from './db/db';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const loadTransactions = useTransactionStore(state => state.loadTransactions);
  const loadPreferences = usePreferencesStore(state => state.loadPreferences);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
        await loadPreferences(); // Charger les préférences d'abord
        await loadTransactions();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loadTransactions, loadPreferences]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de Ledo...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
