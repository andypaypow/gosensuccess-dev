// ============================================
// PARTNER SECTION COMPONENT
// ============================================

import React from 'react';

export const PartnerSection: React.FC = () => {
  return (
    <div className="mt-8 bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">🤝 Nos Partenaires</h2>
      <div className="flex justify-center items-center gap-8 md:gap-16 flex-wrap">
        <a
          href="https://filtreexpert.org"
          target="_blank"
          rel="noopener noreferrer"
          className="group transition-all duration-300 hover:scale-110"
        >
          <img
            src="/ledo/logo.png"
            alt="Filtre Expert"
            className="h-16 md:h-20 opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </a>
        <a
          href="https://wa.me/241077045354"
          target="_blank"
          rel="noopener noreferrer"
          className="group transition-all duration-300 hover:scale-110"
        >
          <img
            src="/ledo/partner-gm.webp"
            alt="Contact WhatsApp"
            className="h-16 md:h-20 opacity-70 group-hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
      <p className="text-gray-500 text-xs text-center mt-4">
        Découvrez nos solutions complémentaires
      </p>
    </div>
  );
};
