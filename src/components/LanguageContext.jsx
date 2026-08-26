"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { translations } from "@/lib/translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("en"); // Default is English

  useEffect(() => {
    // Check localStorage for saved preference on mount
    try {
      const saved = localStorage.getItem("mega_ielts_lang");
      if (saved && ["en", "uz", "ru"].includes(saved)) {
        setLang(saved);
      }
    } catch (e) {
      console.warn("localStorage unavailable for language preference:", e);
    }
  }, []);

  const changeLanguage = useCallback((newLang) => {
    if (!newLang || !["en", "uz", "ru"].includes(newLang)) return;
    setLang(newLang);
    try {
      localStorage.setItem("mega_ielts_lang", newLang);
    } catch (e) {
      console.warn("Could not save language to localStorage:", e);
    }
  }, []);

  const t = useMemo(() => {
    const currentTranslations = translations[lang] || translations.en;

    const translateFn = (key, params = {}) => {
      if (!key) return "";
      const keys = String(key).split(".");
      let value = currentTranslations;
      for (const k of keys) {
        if (value && value[k] !== undefined) {
          value = value[k];
        } else {
          // Fallback to English if missing in current language
          let fallback = translations.en;
          for (const fbK of keys) {
            if (fallback && fallback[fbK] !== undefined) {
              fallback = fallback[fbK];
            } else {
              fallback = undefined;
              break;
            }
          }
          if (fallback !== undefined) {
            value = fallback;
            break;
          }
          return typeof params === "string" ? params : key; // Fallback to default or key
        }
      }

      // Support interpolation: ex. t("key", { count: 5 }) or t("key", { {count}: 5 })
      if (typeof value === "string" && typeof params === "object" && params !== null) {
        Object.keys(params).forEach((paramKey) => {
          value = value.replace(new RegExp(`{${paramKey}}`, "g"), params[paramKey]);
          value = value.replace(new RegExp(paramKey, "g"), params[paramKey]);
        });
      }

      return value;
    };

    // Return a Proxy so t can be called as a function `t("nav.why")`
    // OR accessed as an object `t.trainingPage.listening.title` or `t.sidebar`!
    return new Proxy(translateFn, {
      get(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        if (currentTranslations && currentTranslations[prop] !== undefined) {
          return currentTranslations[prop];
        }
        if (translations.en && translations.en[prop] !== undefined) {
          return translations.en[prop];
        }
        return undefined;
      }
    });
  }, [lang]);

  const contextValue = useMemo(() => ({
    lang,
    setLang: changeLanguage,
    t
  }), [lang, changeLanguage, t]);

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
