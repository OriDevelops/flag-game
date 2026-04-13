import { useState, useCallback } from 'react';
import { Language } from '../types';
import { T, Translations } from '../i18n';

const STORAGE_KEY = 'flag-guesser-lang-v1';

export function useLang(): { lang: Language; setLang: (l: Language) => void; t: Translations } {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem(STORAGE_KEY) as Language) || 'en';
  });

  const setLang = useCallback((l: Language) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  return { lang, setLang, t: T[lang] };
}
