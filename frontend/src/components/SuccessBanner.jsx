import React, { useState, useEffect } from "react";

const API_URL = "http://72.62.181.239:8086/api";

export default function SuccessBanner() {
  const [donations, setDonations] = useState([]);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkDonations();
  }, []);

  const checkDonations = async () => {
    // Verifier si l'utilisateur a deja des donations enregistrees
    const checkedPhone = localStorage.getItem("gosen-checked-phone");
    if (!checkedPhone) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/donations/check_status/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: checkedPhone }),
      });
      const data = await response.json();
      if (data.success && data.donations) {
        const completedDonations = data.donations.filter((d) => d.status === "completed");
        if (completedDonations.length > 0) {
          setDonations(completedDonations);
          setShowBanner(true);
        }
      }
    } catch (error) {
      console.error("Erreur verification:", error);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem("gosen-banner-dismissed", Date.now().toString());
  };

  // Ne pas afficher si deja masque il y a moins de 24h
  useEffect(() => {
    const dismissed = localStorage.getItem("gosen-banner-dismissed");
    if (dismissed) {
      const hoursSinceDismiss = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setShowBanner(false);
      }
    }
  }, []);

  if (!showBanner || donations.length === 0) {
    return null;
  }

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <div>
            <p className="font-bold text-lg">
              Merci pour votre générosité !
            </p>
            <p className="text-sm text-yellow-100">
              {donations.length} donation{donations.length > 1 ? "s" : ""} confirmée{donations.length > 1 ? "s" : ""} • {totalDonated.toLocaleString()} FCFA
            </p>
          </div>
        </div>
        <button
          onClick={dismissBanner}
          className="text-white hover:text-yellow-200 text-2xl leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
