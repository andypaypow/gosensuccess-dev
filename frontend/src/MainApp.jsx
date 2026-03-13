import React from 'react';
import App from './App';
import { LicenseProvider } from './components/license/LicenseProvider';
import LicenseBanner from './components/license/LicenseBanner';

function MainApp() {
  return (
    <LicenseProvider>
      <div>
        <LicenseBanner />
        <App />
      </div>
    </LicenseProvider>
  );
}

export default MainApp;
