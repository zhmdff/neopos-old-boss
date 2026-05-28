import { useCallback, useEffect, useState } from 'react';
import { readQrLang, writeQrLang } from '../i18n/qrLocales';

export function readStoredDarkMode() {
  try {
    const v = localStorage.getItem('theme');
    if (v === 'light') return false;
    return true;
  } catch {
    return true;
  }
}

export function applyQrTheme(darkMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function applyStoredQrTheme() {
  applyQrTheme(readStoredDarkMode());
}

export function useQrTheme() {
  const [darkMode, setDarkMode] = useState(readStoredDarkMode);

  useEffect(() => {
    applyQrTheme(darkMode);
    try {
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch {
      /* ignore */
    }
  }, [darkMode]);

  const toggle = useCallback(() => setDarkMode((d) => !d), []);

  return { darkMode, setDarkMode, toggle };
}

export function useQrLang(slug) {
  const [lang, setLangState] = useState(() => readQrLang(slug));

  useEffect(() => {
    setLangState(readQrLang(slug));
  }, [slug]);

  const setLang = useCallback(
    (code) => {
      writeQrLang(slug, code);
      setLangState(code);
    },
    [slug],
  );

  return { lang, setLang };
}
