"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Locale, translations } from "./translations";

const STORAGE_KEY = "kaamsetu-locale";
const COOKIE_KEY = "kaamsetu-locale";

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const fromStorage = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (fromStorage && translations[fromStorage]) return fromStorage;
  const match = document.cookie.match(new RegExp(`${COOKIE_KEY}=([^;]+)`));
  const fromCookie = match?.[1] as Locale | undefined;
  if (fromCookie && translations[fromCookie]) return fromCookie;
  return "en";
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)["en"];
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(readStoredLocale());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `${COOKIE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`;
    document.documentElement.lang = locale;
  }, [locale, mounted]);

  function setLocale(next: Locale) {
    setLocaleState(next);
  }

  const value: I18nContextValue = {
    locale,
    setLocale,
    t: translations[locale],
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
