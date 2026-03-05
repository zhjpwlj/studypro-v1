
import { createContext } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';

export const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});
