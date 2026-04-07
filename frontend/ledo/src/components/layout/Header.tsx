// ============================================
// HEADER COMPONENT
// ============================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Settings, User, Wallet } from 'lucide-react';
import { SettingsPanel } from '../settings';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Ledo',
  showBackButton = true
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {showBackButton && (
                <Link
                  to="/"
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Retour à Gosen Success"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Paramètres"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <User className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
