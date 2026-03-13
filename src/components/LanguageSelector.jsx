"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@/components/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";

export function LanguageSelector({ position = "bottom" }) {
  const { lang, setLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: "en", label: "English" },
    { code: "uz", label: "O'zbek" },
    { code: "ru", label: "Русский" },
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 group" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background transition-all duration-200
          ${isOpen ? 'border-primary ring-2 ring-primary/20 bg-muted/30' : 'border-border hover:bg-muted/50 hover:shadow-sm'}
        `}
      >
        <Globe className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
        <span className="text-sm font-bold uppercase select-none w-6 text-center text-foreground">
          {lang}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180 text-primary" : ""}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute ${position === 'top' ? 'bottom-[calc(100%+8px)] origin-bottom-right slide-in-from-bottom-2' : 'top-[calc(100%+8px)] origin-top-right slide-in-from-top-2'} right-0 w-[160px] rounded-xl border border-border bg-background/95 backdrop-blur-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] p-1.5 z-50 animate-in fade-in-0 zoom-in-95 duration-200 transform`}
        >
          <div className="flex flex-col gap-0.5">
            {languages.map((l) => {
              const isActive = lang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium outline-none transition-all duration-200
                    ${isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    <span 
                      className={`uppercase text-[11px] font-black rounded w-7 py-0.5 text-center ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                    >
                      {l.code}
                    </span>
                    <span>{l.label}</span>
                  </span>
                  {isActive && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
