import { useEffect, useState } from 'react';
import { i18n, type SupportedLocale, type TranslationKeys } from '../lib/i18n';

export function useTranslation() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = i18n.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  const t = <K extends keyof TranslationKeys>(key: K): string => {
    return i18n.t(key);
  };

  const setLocale = (locale: SupportedLocale): void => {
    try {
      i18n.setLocale(locale);
      // Force re-render to update UI immediately
      forceUpdate({});
    } catch (error) {
      console.error('Failed to set locale:', error);
    }
  };

  const getCurrentLocale = (): SupportedLocale => {
    return i18n.getCurrentLocale();
  };

  const getAvailableLocales = () => {
    return i18n.getAvailableLocales();
  };

  return {
    t,
    setLocale,
    getCurrentLocale,
    getAvailableLocales
  };
}