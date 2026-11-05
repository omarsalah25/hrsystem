'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import arMessages from '../messages/ar.json';
import enMessages from '../messages/en.json';

type Locale = 'ar' | 'en';

interface TranslationContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (path: string) => string;
  isRtl: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
  locale: 'ar',
  setLocale: () => {},
  t: (path: string) => path,
  isRtl: true,
});

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('ar');

  useEffect(() => {
    // Update document HTML dir and lang attributes
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: any = locale === 'ar' ? arMessages : enMessages;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return path;
      }
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <TranslationContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isRtl: locale === 'ar',
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);

