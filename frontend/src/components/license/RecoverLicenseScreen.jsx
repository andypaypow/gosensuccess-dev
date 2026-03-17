import React, { useState } from 'react';

export default function RecoverLicenseScreen({ onRecovered, onBack }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { licenseManager } = await import('../../utils/licenseManager');
    const result = await licenseManager.recoverLicense(phoneNumber);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        if (onRecovered) onRecovered();
      }, 2000);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Licence activée !</h2>
          <p className="text-gray-600">Votre accès illimité est maintenant activé.</p>
          <p className="text-gray-500 text-sm mt-4">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Récupérer votre accès</h1>
          <p className="text-gray-600">Entrez le numéro de téléphone utilisé pour le paiement</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>💡 Astuce :</strong> Utilisez le même numéro que celui utilisé pour le paiement Moov ou Airtel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="077045354"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Vérification...' : 'Récupérer mon accès'}
          </button>

          {onBack && (
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={onBack}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline transition-colors"
              >
                ← Retour
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
