import { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectLanguage } from '../store/settingsSlice';

const LANGUAGE_DATA_URL = '/language/data.json';

const TranslationsContext = createContext({
  translations: null,
  loading: true,
});

export function LanguageProvider({ children }) {
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(LANGUAGE_DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        setTranslations(data.translations || { ru: {}, en: {} });
      })
      .catch(() => setTranslations({ ru: {}, en: {} }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <TranslationsContext.Provider value={{ translations, loading }}>
      {children}
    </TranslationsContext.Provider>
  );
}

/**
 * Возвращает объект переводов для текущего языка из Redux и флаг загрузки.
 * t — переводы для текущего языка (ru/en), t.settings — объект для модалки настроек.
 */
export function useTranslations() {
  const { translations, loading } = useContext(TranslationsContext);
  const language = useSelector(selectLanguage);
  const lang = language === 'en' ? 'en' : 'ru';
  const t = translations?.[lang] || {};
  return { t, language: lang, loading };
}
