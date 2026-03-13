import React from 'react';

export default function TrialSelectionScreen({ onSelect }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gosen Success</h1>
          <p className="text-gray-600">Gestion des tâches intelligente</p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Choisissez votre période d'essai :
          </h2>
        </div>

        <div className="space-y-4">
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

        <p className="text-center text-gray-500 text-sm mt-6">
          Après la période d'essai, une clé d'activation sera requise
        </p>
      </div>
    </div>
  );
}
