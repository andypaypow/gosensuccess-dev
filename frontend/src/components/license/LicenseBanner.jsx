import React from 'react';
import { useLicense } from './LicenseProvider';

export default function LicenseBanner() {
  const { remainingTime, isTrial } = useLicense();

  if (!remainingTime) {
    return null;
  }

  const bgColor = isTrial ? 'bg-blue-500' : 'bg-green-500';

  return (
    <div className={bgColor + ' text-white px-4 py-2 text-center text-sm font-medium'}>
      ⏱️ {isTrial ? 'Période d\'essai' : 'Licence'} - Temps restant : {remainingTime}
    </div>
  );
}
