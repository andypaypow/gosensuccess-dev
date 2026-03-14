import React, { useState } from 'react';
import ContactSupportForm from './ContactSupportForm';

export default function LicenseRequiredScreen({ onActivate, isRevoked = false }) {
  const [showContactForm, setShowContactForm] = useState(false);
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

  const handleContactSubmit = async (formData) => {
    // Sauvegarder la demande de contact (optionnel)
    console.log('Contact form submitted:', formData);
    return { success: true };
  };

  if (showContactForm) {
    return (
      <ContactSupportForm
        onClose={() => setShowContactForm(false)}
        onSubmit={handleContactSubmit}
      />
    );
  }

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

        {/* Information sur la clé à vie */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-r-xl mb-6">
          <h3 className="font-bold text-purple-800 mb-1">💎 Clé d'activation à vie</h3>
          <p className="text-purple-700 text-sm mb-2">
            Profitez de Gosen Success sans limite !
          </p>
          <p className="text-2xl font-bold text-purple-900">
            18€ ou 10.000 FCFA
          </p>
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

            <div className="text-center pt-2">
              <p className="text-gray-500 text-sm mb-2">Pas de clé ?</p>
              <button
                type="button"
                onClick={() => setShowContactForm(true)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm underline transition-colors"
              >
                📱 Contactez le support pour obtenir une clé d'activation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
