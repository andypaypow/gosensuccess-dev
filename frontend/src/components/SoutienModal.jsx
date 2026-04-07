import React, { useState, useEffect } from "react";

const API_URL = "http://72.62.181.239:8086/api";

export default function SoutienModal({ onClose }) {
  const [donationTypes, setDonationTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [donated, setDonated] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetchDonationTypes();
    // Restaurer le numero enregistre
    const savedPhone = localStorage.getItem("gosen-checked-phone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const fetchDonationTypes = async () => {
    try {
      const response = await fetch(`${API_URL}/public/donation-types/`);
      const data = await response.json();
      if (data.success) {
        setDonationTypes(data.donation_types);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (type) => {
    // Sauvegarder le numero pour verification ulterieure
    if (phone) {
      localStorage.setItem("gosen-checked-phone", phone);
    }

    // Enregistrer la donation
    try {
      await fetch(`${API_URL}/donations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donation_type_id: type.id,
          phone_number: phone,
          email: email,
        }),
      });
    } catch (err) {
      console.error("Erreur enregistrement:", err);
    }

    // Redirection vers l'URL de paiement
    if (type.payment_url) {
      window.open(type.payment_url, "_blank");
      setDonated(true);

      // Fermer le modal apres 2 secondes
      setTimeout(() => {
        onClose();
        // Recharger la page pour afficher la banniere si le paiement est confirme
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">❤️ Soutenir Gosen Success</h2>
            <button onClick={onClose} className="text-white text-2xl hover:text-yellow-200">
              ×
            </button>
          </div>
          <p className="text-white text-opacity-90 mt-2">
            Votre soutien nous aide à améliorer l'application
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {donated ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Merci pour votre soutien !
              </h3>
              <p className="text-gray-600">
                Vous allez être redirigé vers la page de paiement...
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+241 XX XX XX XX"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Requis pour recevoir votre confirmation de paiement
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Votre email (optionnel)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 outline-none transition-all"
                />
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Choisissez un montant de soutien :
              </h3>

              <div className="space-y-3">
                {donationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleDonate(type)}
                    disabled={!phone}
                    className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 hover:border-yellow-500 rounded-xl p-4 flex items-center justify-between transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{type.icon || "💝"}</span>
                      <div className="text-left">
                        <p className="font-bold text-gray-800">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-gray-500">{type.description}</p>
                        )}
                        {type.operator_display && (
                          <p className="text-xs text-blue-600 font-medium">
                            📱 {type.operator_display}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-900">
                        {type.amount_int?.toLocaleString()} FCFA
                      </p>
                      {type.amount_eur && (
                        <p className="text-sm text-gray-500">{type.amount_eur} €</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
