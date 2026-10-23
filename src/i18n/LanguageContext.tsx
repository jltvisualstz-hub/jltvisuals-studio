import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  type Language,
  t,
  normalizeServiceCategoryId,
  getServiceCategoryLabel,
  normalizeEquipmentCategoryId,
  getEquipmentCategoryLabel,
  getProviderTypeLabel,
  getAvailabilityLabel,
  getConditionLabel,
  getCountryLabel,
  getBookingStatusLabel,
  formatPluralProfessionals,
  formatPluralListings,
  SERVICE_CATEGORY_REGISTRY,
  EQUIPMENT_CATEGORY_REGISTRY
} from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  getServiceCategoryLabel: (cat: string) => string;
  getEquipmentCategoryLabel: (cat: string) => string;
  getProviderTypeLabel: (type: string) => string;
  getAvailabilityLabel: (avail: string) => string;
  getConditionLabel: (condition: string) => string;
  getCountryLabel: (country: string) => string;
  getBookingStatusLabel: (status: string) => string;
  formatPluralProfessionals: (count: number) => string;
  formatPluralListings: (count: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'kazihub_pref_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode; initialLang?: Language }> = ({
  children,
  initialLang
}) => {
  const [lang, setLangState] = useState<Language>(() => {
    if (initialLang) return initialLang;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'SW' || saved === 'EN') return saved;
    } catch {}
    return 'EN';
  });

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang(lang === 'EN' ? 'SW' : 'EN');
  }, [lang, setLang]);

  // Synchronize across windows/tabs if storage changes
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'SW' || e.newValue === 'EN')) {
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(lang, key, params);
  }, [lang]);

  const serviceCatLabel = useCallback((cat: string) => {
    return getServiceCategoryLabel(cat, lang);
  }, [lang]);

  const equipmentCatLabel = useCallback((cat: string) => {
    return getEquipmentCategoryLabel(cat, lang);
  }, [lang]);

  const providerTypeLabel = useCallback((type: string) => {
    return getProviderTypeLabel(type, lang);
  }, [lang]);

  const availabilityLabel = useCallback((avail: string) => {
    return getAvailabilityLabel(avail, lang);
  }, [lang]);

  const conditionLabel = useCallback((cond: string) => {
    return getConditionLabel(cond, lang);
  }, [lang]);

  const countryLabel = useCallback((country: string) => {
    return getCountryLabel(country, lang);
  }, [lang]);

  const bookingStatusLabel = useCallback((status: string) => {
    return getBookingStatusLabel(status, lang);
  }, [lang]);

  const pluralPros = useCallback((count: number) => {
    return formatPluralProfessionals(count, lang);
  }, [lang]);

  const pluralGear = useCallback((count: number) => {
    return formatPluralListings(count, lang);
  }, [lang]);

  const value: LanguageContextType = {
    lang,
    setLang,
    toggleLanguage,
    t: translate,
    getServiceCategoryLabel: serviceCatLabel,
    getEquipmentCategoryLabel: equipmentCatLabel,
    getProviderTypeLabel: providerTypeLabel,
    getAvailabilityLabel: availabilityLabel,
    getConditionLabel: conditionLabel,
    getCountryLabel: countryLabel,
    getBookingStatusLabel: bookingStatusLabel,
    formatPluralProfessionals: pluralPros,
    formatPluralListings: pluralGear
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useI18n(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    // Graceful fallback for components used outside LanguageProvider
    return {
      lang: 'EN',
      setLang: () => {},
      toggleLanguage: () => {},
      t: (key: string, params?: Record<string, string | number>) => t('EN', key, params),
      getServiceCategoryLabel: (cat: string) => getServiceCategoryLabel(cat, 'EN'),
      getEquipmentCategoryLabel: (cat: string) => getEquipmentCategoryLabel(cat, 'EN'),
      getProviderTypeLabel: (type: string) => getProviderTypeLabel(type, 'EN'),
      getAvailabilityLabel: (avail: string) => getAvailabilityLabel(avail, 'EN'),
      getConditionLabel: (cond: string) => getConditionLabel(cond, 'EN'),
      getCountryLabel: (country: string) => getCountryLabel(country, 'EN'),
      getBookingStatusLabel: (status: string) => getBookingStatusLabel(status, 'EN'),
      formatPluralProfessionals: (count: number) => formatPluralProfessionals(count, 'EN'),
      formatPluralListings: (count: number) => formatPluralListings(count, 'EN')
    };
  }
  return context;
}
