import React, { useState } from 'react';
import RecoverLicenseScreen from './RecoverLicenseScreen';

export default function TrialSelectionScreen({ onSelect }) {
  const [showPayment, setShowPayment] = useState(false);
  const [showRecover, setShowRecover] = useState(false);

  if (showRecover) {
    return (
      <RecoverLicenseScreen 
        onRecovered={() => {
          window.location.reload();
        }}
        onBack={() => setShowRecover(false)}
      />
    );
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">💎</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Accès Illimité</h1>
            <p className="text-gray-600">Profitez de Gosen Success sans limite !</p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-6 text-center">
            <p className="text-gray-600 mb-2">Paiement unique</p>
            <p className="text-4xl font-bold text-green-600 mb-1">10.000 FCFA</p>
            <p className="text-gray-500 text-sm">Accès à vie illimité</p>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Choisissez votre mode de paiement :
            </h2>

            <div className="space-y-3">
              <a
                href="https://sumb.cyberschool.ga/?productId=500KL5JQLYF3ZfdEWiei&operationAccountCode=ACC_6835C458B85FF&maison=moov&amount=100"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 block"
              >
                <span className="text-2xl">📱</span>
                <div className="text-left">
                  <div>Moov Gabon</div>
                  <div className="text-sm opacity-80">Paiement via Moov Money</div>
                </div>
              </a>

              <a
                href="https://sumb.cyberschool.ga/?productId=500KL5JQLYF3ZfdEWiei&operationAccountCode=ACC_6835C649CA536&maison=airtel&amount=100"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 block"
              >
                <span className="text-2xl">📱</span>
                <div className="text-left">
                  <div>Airtel Gabon</div>
                  <div className="text-sm opacity-80">Paiement via Airtel Money</div>
                </div>
              </a>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowPayment(false)}
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline transition-colors"
            >
              ← Retour à la période d'essai
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-blue-800 text-sm text-center">
              💡 Après le paiement, votre accès sera activé automatiquement. Vous pouvez fermer cette page et revenir sur l'application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gosen Success</h1>
          <p className="text-gray-600">Gestion des tâches intelligente</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Comment souhaitez-vous commencer ?
          </h2>
        </div>

        <div className="space-y-4 mb-6">
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">💎</span>
            <div className="text-left">
              <div>Accès Illimité</div>
              <div className="text-sm opacity-80">10.000 FCFA - À vie</div>
            </div>
          </button>

          <div className="text-center py-2">
            <span className="text-gray-400">ou</span>
          </div>

          <button
            onClick={() => onSelect('1h')}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">⏰</span>
            <div className="text-left">
              <div>1 heure</div>
              <div className="text-sm opacity-80">Pour tester rapidement</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('1d')}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📅</span>
            <div className="text-left">
              <div>1 jour</div>
              <div className="text-sm opacity-80">24h pour découvrir</div>
            </div>
          </button>

          <button
            onClick={() => onSelect('1w')}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <span className="text-2xl">📆</span>
            <div className="text-left">
              <div>1 semaine</div>
              <div className="text-sm opacity-80">7 jours d'essai</div>
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowRecover(true)}
            className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm py-2 transition-colors"
          >
            💳 J'ai déjà payé - Récupérer mon accès
          </button>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          Après la période d'essai, une clé d'activation sera requise
        </p>
      </div>
    </div>
  );
}
