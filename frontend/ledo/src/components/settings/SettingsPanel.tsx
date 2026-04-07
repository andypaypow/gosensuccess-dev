// ============================================
// SETTINGS PANEL COMPONENT
// ============================================

import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Modal, ModalFooter, Button } from '../shared';
import { usePreferencesStore } from '../../stores/preferencesStore';
import {
  CURRENCIES,
  PREDEFINED_PERIODS,
  formatCurrencyWithPrefs,
  getMonthPeriodDates,
  formatPeriodName
} from '../../types/preferences';
import type { CurrencyCode } from '../../types/preferences';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const {
    currency,
    decimals,
    decimalPlaces,
    monthPeriod,
    dateFormat,
    theme,
    language,
    isSaving,
    updatePreferences,
    resetPreferences,
    loadPreferences
  } = usePreferencesStore();

  const [localCurrency, setLocalCurrency] = useState<CurrencyCode>(currency);
  const [localDecimals, setLocalDecimals] = useState(decimals);
  const [localDecimalPlaces, setLocalDecimalPlaces] = useState(decimalPlaces);
  const [localMonthPeriod, setLocalMonthPeriod] = useState(monthPeriod);
  const [customPeriod, setCustomPeriod] = useState(false);
  const [customStartDay, setCustomStartDay] = useState(monthPeriod.startDay);
  const [customEndDay, setCustomEndDay] = useState(monthPeriod.endDay);

  // Charger les préférences à l'ouverture
  useEffect(() => {
    if (isOpen) {
      loadPreferences();
    }
  }, [isOpen, loadPreferences]);

  // Mettre à jour les valeurs locales quand les préférences changent
  useEffect(() => {
    setLocalCurrency(currency);
    setLocalDecimals(decimals);
    setLocalDecimalPlaces(decimalPlaces);
    setLocalMonthPeriod(monthPeriod);
    setCustomStartDay(monthPeriod.startDay);
    setCustomEndDay(monthPeriod.endDay);
  }, [currency, decimals, decimalPlaces, monthPeriod]);

  const handleSave = async () => {
    const period = customPeriod
      ? { startDay: customStartDay, endDay: customEndDay, name: 'Personnalisé' }
      : localMonthPeriod;

    await updatePreferences({
      currency: localCurrency,
      decimals: localDecimals,
      decimalPlaces: localDecimals ? localDecimalPlaces : 0,
      monthPeriod: period
    });
    onClose();
  };

  const handleReset = async () => {
    if (confirm('Réinitialiser toutes les préférences aux valeurs par défaut ?')) {
      await resetPreferences();
      onClose();
    }
  };

  const previewAmount = 1234.56;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres"
      size="lg"
    >
      <div className="space-y-6">
        {/* Devise */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Devise
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CURRENCIES.map((curr) => (
              <button
                key={curr.code}
                onClick={() => setLocalCurrency(curr.code)}
                className={`
                  p-3 rounded-lg text-left transition-colors
                  ${localCurrency === curr.code
                    ? 'bg-blue-100 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }
                `}
              >
                <div className="font-medium">{curr.symbol}</div>
                <div className="text-sm text-gray-600">{curr.name}</div>
              </button>
            ))}
          </div>
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Aperçu : </span>
            <span className="font-bold text-lg">
              {formatCurrencyWithPrefs(previewAmount, {
                currency: localCurrency,
                decimals: localDecimals,
                decimalPlaces: localDecimalPlaces,
                monthPeriod,
                dateFormat,
                theme,
                language
              })}
            </span>
          </div>
        </div>

        {/* Décimales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Décimales
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={localDecimals}
                onChange={() => setLocalDecimals(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span>Avec décimales</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!localDecimals}
                onChange={() => setLocalDecimals(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span>Arrondi à l'entier</span>
            </label>
          </div>

          {localDecimals && (
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">
                Nombre de décimales
              </label>
              <select
                value={localDecimalPlaces}
                onChange={(e) => setLocalDecimalPlaces(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0 décimale</option>
                <option value={1}>1 décimale</option>
                <option value={2}>2 décimales</option>
                <option value={3}>3 décimales</option>
              </select>
            </div>
          )}
        </div>

        {/* Période du mois */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période mensuelle
          </label>

          {!customPeriod ? (
            <div className="space-y-2">
              {PREDEFINED_PERIODS.map((period) => (
                <button
                  key={`${period.startDay}-${period.endDay}`}
                  onClick={() => setLocalMonthPeriod(period)}
                  className={`
                    w-full p-3 rounded-lg text-left transition-colors
                    ${localMonthPeriod.startDay === period.startDay && localMonthPeriod.endDay === period.endDay
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }
                  `}
                >
                  <div className="font-medium">{period.name}</div>
                  <div className="text-sm text-gray-600">
                    Du {period.startDay} au {period.endDay} du mois suivant
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Jour de début (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={customStartDay}
                  onChange={(e) => setCustomStartDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Jour de fin (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={customEndDay}
                  onChange={(e) => setCustomEndDay(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setCustomPeriod(!customPeriod)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-700"
          >
            {customPeriod ? '← Voir les périodes prédéfinies' : '+ Période personnalisée'}
          </button>

          {/* Aperçu de la période actuelle */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              Période actuelle : <strong>{formatPeriodName(new Date(), localMonthPeriod)}</strong>
            </div>
          </div>
        </div>

        {/* Date de début et de fin calculées */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Dates pour la période actuelle
          </div>
          <div className="text-sm">
            <div>Début : <strong>{getMonthPeriodDates(new Date(), localMonthPeriod).start.toLocaleDateString('fr-FR')}</strong></div>
            <div>Fin : <strong>{getMonthPeriodDates(new Date(), localMonthPeriod).end.toLocaleDateString('fr-FR')}</strong></div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          type="button"
          variant="ghost"
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={handleReset}
        >
          Réinitialiser
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Enregistrer
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};
