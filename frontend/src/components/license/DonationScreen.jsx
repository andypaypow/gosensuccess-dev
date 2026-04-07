import React, { useState, useEffect } from "react";
import ContactSupportForm from "./ContactSupportForm";

const API_URL = "http://72.62.181.239:8086/api";

export default function DonationScreen({ onActivate, onSkip, onClose }) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [donationTypes, setDonationTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);

  useEffect(() => {
    fetchDonationTypes();
  }, []);

  const fetchDonationTypes = async () => {
    try {
      const response = await fetch(API_URL + "/donation/types/");
      const data = await response.json();
      if (data.success) {
        setDonationTypes(data.donation_types);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
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
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join("-") || "";
    return formatted.substring(0, 19);
  };

  const handleContactSubmit = async (formData) => {
    console.log("Contact form submitted:", formData);
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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        )}

        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gosen Success est GRATUITE !
          </h1>
          <p className="text-gray-600">
            Utilisez l'application sans aucune limite
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6">
          <h3 className="font-bold text-green-800 mb-2">
            💝 Application 100% Gratuite à Vie
          </h3>
          <p className="text-green-700 text-sm">
            Profitez de toutes les fonctionnalites de Gosen Success sans payer !
          </p>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-5 rounded-r-xl mb-6">
          <h3 className="font-bold text-yellow-800 mb-2">
            ❤️ Soutenez le projet (Optionnel)
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            Si vous souhaitez soutenir le developpement de Gosen Success,
            choisissez un montant de don :
          </p>

          {loadingTypes ? (
            <div className="bg-white rounded-lg p-3 text-center text-gray-500">
              Chargement des options...
            </div>
          ) : donationTypes.length > 0 ? (
            <div className="space-y-2">
              {donationTypes.map((type) => (
                <div
                  key={type.id}
                  className="bg-white rounded-lg p-3 flex justify-between items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{type.icon || "💝"}</span>
                    <div>
                      <p className="font-bold text-gray-800">{type.name}</p>
                      {type.description && (
                        <p className="text-xs text-gray-500">{type.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-900">
                      {type.amount_int.toLocaleString()} FCFA
                    </p>
                    {type.amount_eur && (
                      <p className="text-xs text-gray-500">{type.amount_eur} €</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-yellow-900 mb-1">
                Aucun type de don disponible
              </p>
              <p className="text-yellow-700 text-xs">
                Contactez l'administrateur pour configurer les options de don
              </p>
            </div>
          )}
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Merci pour votre soutien !
            </h2>
            <p className="text-gray-600">Votre don nous aide beaucoup</p>
            <p className="text-gray-500 text-sm mt-2">Redirection...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-gray-700 font-medium mb-2">
                Vous avez une cle de soutien ? 💝
              </p>
              <details className="text-left">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold text-sm">
                  Cliquez pour activer votre cle de soutien
                </summary>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cle de soutien
                    </label>
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => setKey(formatKey(e.target.value))}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all text-center text-xl tracking-widest uppercase"
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
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
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
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Verification..." : "Valider ma cle de soutien 💝"}
                  </button>
                </form>
              </details>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowContactForm(true)}
                className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-all"
              >
                📱 Obtenir une cle
              </button>
              {onSkip && (
                <button
                  onClick={onSkip}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Passer →
                </button>
              )}
            </div>

            <p className="text-center text-gray-500 text-xs">
              Votre cle de soutien symbolise votre contribution au projet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
