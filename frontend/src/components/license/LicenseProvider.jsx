import React, { createContext, useContext, useState, useEffect } from 'react';
import { licenseManager, LicenseStatus } from '../../utils/licenseManager';
import TrialSelectionScreen from './TrialSelectionScreen';
import LicenseRequiredScreen from './LicenseRequiredScreen';

const LicenseContext = createContext(null);

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within LicenseProvider');
  }
  return context;
}

export function LicenseProvider({ children }) {
  const [status, setStatus] = useState(LicenseStatus.FIRST_LAUNCH);
  const [remainingTime, setRemainingTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLicense();
    
    // Vérification en arrière-plan toutes les 5 minutes
    const interval = setInterval(() => {
      checkLicense();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  function checkLicense() {
    const currentStatus = licenseManager.getStatus();
    setStatus(currentStatus);
    setRemainingTime(licenseManager.getRemainingTime());
    setIsLoading(false);
  }

  function handleSelectTrial(period) {
    licenseManager.startTrial(period);
    checkLicense();
  }

  async function handleActivate(key, email) {
    const result = await licenseManager.activateLicense(key, email);
    if (result.success) {
      checkLicense();
    }
    return result;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  if (status === LicenseStatus.FIRST_LAUNCH) {
    return <TrialSelectionScreen onSelect={handleSelectTrial} />;
  }

  if (status === LicenseStatus.EXPIRED || status === LicenseStatus.REVOKED) {
    return (
      <LicenseRequiredScreen 
        onActivate={handleActivate}
        isRevoked={status === LicenseStatus.REVOKED}
      />
    );
  }

  const value = {
    status,
    remainingTime,
    isTrial: status === LicenseStatus.TRIAL,
    canUseApp: licenseManager.canUseApp(),
    refresh: checkLicense
  };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
}
