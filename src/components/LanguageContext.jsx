"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // Default is English
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference on mount
    const saved = localStorage.getItem("mega_ielts_lang");
    if (saved && ["en", "uz", "ru"].includes(saved)) {
      setLang(saved);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem("mega_ielts_lang", newLang);
  };

  const t = (key, params = {}) => {
    const keys = key.split(".");
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key; // Fallback to key if missing
      }
    }
    
    // Support interpolation: ex. t("key", { count: 5 })
    if (typeof value === "string") {
      Object.keys(params).forEach((paramKey) => {
        value = value.replace(new RegExp(paramKey, "g"), params[paramKey]);
      });
    }
    
    return value;
  };

  // Only render children after mount to ensure same HTML hydration
  if (!mounted) {
    return <div className="min-h-screen" />; // empty skeleton to prevent hydration mismatch
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
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
