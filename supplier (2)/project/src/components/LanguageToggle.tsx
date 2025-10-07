import React from 'react';
import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../contexts/TranslationContext';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      title={t('language.switch_to')}
    >
      <GlobeAltIcon className="h-4 w-4" />
      <span className="hidden sm:inline">
        {language === 'fr' ? t('language.english') : t('language.french')}
      </span>
      <span className="sm:hidden">
        {language === 'fr' ? 'EN' : 'FR'}
      </span>
    </button>
  );
};

export default LanguageToggle;