import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setLanguage } from '../store/slices/uiSlice';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.ui.currentLanguage);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    dispatch(setLanguage(lang));
    setIsOpen(false);
  };

  const getAvailableLocales = () => {
    // This should ideally come from the store or a configuration
    // For now, hardcoding based on the original implementation
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' },
      { code: 'fr', name: 'Français' },
    ];
  };

  const currentLocale = currentLanguage; // Use currentLanguage from Redux store
  const availableLocales = getAvailableLocales();

  const handleLocaleChange = (localeCode: string) => {
    changeLanguage(localeCode); // Use the new changeLanguage function
  };

  const getCurrentLocaleName = () => {
    const current = availableLocales.find(locale => locale.code === currentLocale);
    return current?.name || 'English';
  };

  const getFlag = (code: string) => {
    const flags: { [key: string]: string } = {
      'en': '🇺🇸',
      'es': '🇪🇸',
      'fr': '🇫🇷'
    };
    return flags[code] || '🌐';
  };

  return (
    <div className="dropdown position-relative">
      <button
        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 language-switcher-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="language-switcher-toggle"
        style={{
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: '500',
          minWidth: '110px',
          justifyContent: 'center',
          transition: 'all 0.2s ease-in-out',
          border: '1px solid var(--bs-border-color)',
          background: 'var(--bs-body-bg)'
        }}
      >
        <span className="flag-icon" style={{ fontSize: '16px' }}>
          {getFlag(currentLocale)}
        </span>
        <span className="language-name d-none d-sm-inline">
          {getCurrentLocaleName()}
        </span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} small transition-transform`}></i>
      </button>

      {isOpen && (
        <>
          <div
            className="dropdown-backdrop position-fixed w-100 h-100 top-0 start-0"
            style={{ zIndex: 1040 }}
            onClick={() => setIsOpen(false)}
          ></div>
          <ul
            className="dropdown-menu show position-absolute animate__animated animate__fadeIn animate__faster"
            style={{
              right: '0',
              left: 'auto',
              top: '100%',
              marginTop: '8px',
              minWidth: '160px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid var(--bs-border-color)',
              borderRadius: '12px',
              padding: '8px',
              zIndex: 1050,
              background: 'var(--bs-dropdown-bg)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <li className="dropdown-header d-flex align-items-center gap-2 px-3 py-2 mb-1">
              <i className="fas fa-globe text-primary"></i>
              <span className="fw-semibold small">Select Language</span>
            </li>
            <li><hr className="dropdown-divider my-1" /></li>
            {availableLocales.map((locale) => (
              <li key={locale.code}>
                <button
                  className={`dropdown-item d-flex align-items-center gap-3 px-3 py-2 rounded-lg ${
                    currentLocale === locale.code ? 'active' : ''
                  }`}
                  onClick={() => handleLocaleChange(locale.code)}
                  data-testid={`language-option-${locale.code}`}
                  style={{
                    fontSize: '0.875rem',
                    transition: 'all 0.15s ease',
                    borderRadius: '8px',
                    margin: '2px 0'
                  }}
                >
                  <span className="flag-icon" style={{ fontSize: '18px' }}>
                    {getFlag(locale.code)}
                  </span>
                  <span className="flex-grow-1 text-start">
                    {locale.name}
                  </span>
                  {currentLocale === locale.code && (
                    <i className="fas fa-check text-success small"></i>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;