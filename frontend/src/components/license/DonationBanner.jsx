import React, { useState } from 'react';
import { useLicense } from './LicenseProvider';

export default function DonationBanner() {
  const { isActivated, showDonationScreen } = useLicense();
  const [dismissed, setDismissed] = useState(false);

  // Ne pas afficher si l'utilisateur a déjà activé une clé (donateur)
  if (isActivated || dismissed) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-100 via-orange-100 to-pink-100 border-b border-yellow-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💝</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Vous aimez Gosen Success ? 
                <span className="font-bold text-orange-600"> Soutenez le projet !</span>
              </p>
              <p className="text-xs text-gray-600">
                Votre aide nous permet de continuer à améliorer l'application gratuitement
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={showDonationScreen}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
            >
              Faire un don ❤️
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-all"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
