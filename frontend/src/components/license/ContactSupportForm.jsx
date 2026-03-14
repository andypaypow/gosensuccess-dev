import React, { useState } from 'react';

export default function ContactSupportForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    subject: 'key_activation', // key_activation, partnership, other
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Préparer les données pour WhatsApp
      const whatsappNumber = '2250157480494'; // À remplacer par le vrai numéro
      const subjectLabels = {
        'key_activation': 'Demande de clé d\'activation',
        'partnership': 'Partenariat',
        'other': 'Autre'
      };

      const message = `📱 *Nouveau contact Gosen Success*

*Nom:* ${formData.name}
*WhatsApp:* ${formData.whatsapp}
*Objet:* ${subjectLabels[formData.subject]}

${formData.message ? `*Message:* ${formData.message}` : ''}

---
🔑 Clé à vie - 18€ ou 10.000 FCFA`;

      // Créer le lien WhatsApp
      const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

      // Envoyer les données au backend (optionnel pour sauvegarde)
      if (onSubmit) {
        await onSubmit(formData);
      }

      setSuccess(true);

      // Ouvrir WhatsApp après 1 seconde
      setTimeout(() => {
        window.open(whatsappLink, '_blank');
      }, 1000);

    } catch (err) {
      setError('Erreur lors de l\'envoi. Veuillez réessayer.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Demande envoyée !</h2>
          <p className="text-gray-600 mb-4">Redirection vers WhatsApp...</p>
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-xl"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Contactez le support</h1>
          <p className="text-gray-600 text-sm">Nous vous répondrons dans les plus brefs délais</p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-l-4 border-purple-500 p-4 rounded-r-xl mb-6">
          <h3 className="font-bold text-purple-800 mb-2">💎 Clé d\'activation à vie</h3>
          <p className="text-purple-700 text-sm">
            Profitez de Gosen Success sans limite !
          </p>
          <p className="text-2xl font-bold text-purple-900 mt-2">
            18€ ou 10.000 FCFA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom complet *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro WhatsApp *
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="Ex: +225 01 57 48 04 94"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objet *
            </label>
            <select
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              required
            >
              <option value="key_activation">🔑 Clé d\'activation</option>
              <option value="partnership">🤝 Partenariat</option>
              <option value="other">💬 Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optionnel)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Décrivez votre demande..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              rows="3"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-xl font-semibold transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi...' : '📱 Envoyer sur WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
