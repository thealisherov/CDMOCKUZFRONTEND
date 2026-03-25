"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // Default is English — renders immediately

  useEffect(() => {
    // Check localStorage for saved preference on mount
    const saved = localStorage.getItem("mega_ielts_lang");
    if (saved && ["en", "uz", "ru"].includes(saved)) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem("mega_ielts_lang", newLang);
  }, []);

  const t = useCallback((key, params = {}) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return typeof params === "string" ? params : key; // Fallback to default or key
      }
    }
    
    // Support interpolation: ex. t("key", { count: 5 })
    if (typeof value === "string" && typeof params === "object") {
      Object.keys(params).forEach((paramKey) => {
        value = value.replace(new RegExp(paramKey, "g"), params[paramKey]);
      });
    }
    
    return value;
  }, [lang]);

  const contextValue = useMemo(() => ({
    lang,
    setLang: changeLanguage,
    t
  }), [lang, changeLanguage, t]);

  // Render children immediately — no mount blocker!
  // English is used as default, so content is visible from the first paint.
  // When localStorage lang is different, it will re-render seamlessly.
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within LanguageProvider");
  }
  return context;
};
