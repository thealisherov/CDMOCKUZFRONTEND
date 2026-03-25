"use client";

import { useState, useEffect } from "react";
import { Send, X, Instagram } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function TelegramPromo() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has already closed the promo in this given expiry time
    const dismissed = localStorage.getItem("telegram-promo-dismissed-v2");
    if (dismissed) {
      const expiry = parseInt(dismissed, 10);
      if (new Date().getTime() < expiry) {
        setIsClosed(true);
        return;
      } else {
        localStorage.removeItem("telegram-promo-dismissed-v2");
      }
    }

    const timerDuration = user ? 3000 : 5000;
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, timerDuration);

    return () => clearTimeout(timer);
  }, [user]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
    // Suppress for 3 days
    const expiry = new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("telegram-promo-dismissed-v2", expiry.toString());
  };

  if (isClosed && !isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-[340px] w-full transition-all duration-500 ease-out transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative group overflow-hidden rounded-2xl shadow-2xl border border-white/10" style={{ background: "rgba(30, 30, 30, 0.95)", backdropFilter: "blur(12px)" }}>
        {/* Accent background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl transition-all duration-500 group-hover:bg-primary/30" />
        
        <div className="relative p-5 text-white">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={16} />
          </button>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Send size={24} className="text-white rotate-[-10deg]" />
            </div>
            
            <div className="flex-1 pr-4">
              <h4 className="font-bold text-base mb-1 tracking-tight">
                {t("promo.telegramTitle")}
              </h4>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                {t("promo.telegramDesc")}
              </p>
              
              <div className="flex flex-col gap-2">
                <a
                  href="https://t.me/megaieltsuz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all shadow-md shadow-primary/20"
                >
                  <Send size={16} className="rotate-[-10deg]" />
                  {t("promo.telegramBtn")}
                </a>
                
                <a
                  href="https://www.instagram.com/megaieltsuz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs transition-all border border-white/10"
                >
                  <Instagram size={14} />
                  {t("footer.subscribe")} Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-primary {
          background-color: #e22d2d;
        }
        .text-primary {
          color: #e22d2d;
        }
      `}</style>
    </div>
  );
}
