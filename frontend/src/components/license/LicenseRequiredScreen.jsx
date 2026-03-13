import React, { useState } from 'react';

export default function LicenseRequiredScreen({ onActivate, isRevoked = false }) {
  const [key, setKey] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onActivate(key, email);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  const formatKey = (value) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || '';
    return formatted.substring(0, 19);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          {isRevoked ? (
            <>
              <div className="text-6xl mb-4">🔒</div>
              <h1 className="text-2xl font-bold text-red-600 mb-2">Licence révoquée</h1>
              <p className="text-gray-600">Votre licence a été révoquée. Veuillez contacter le support.</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Période d'essai terminée</h1>
              <p className="text-gray-600">Pour continuer, activez votre application</p>
            </>
          )}
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Activée !</h2>
            <p className="text-gray-600">Redirection en cours...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé d'activation
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(formatKey(e.target.value))}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-center text-xl tracking-widest uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
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
              disabled={loading || isRevoked}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Valider ma clé'}
            </button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Pas de clé ? Contactez le support
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
