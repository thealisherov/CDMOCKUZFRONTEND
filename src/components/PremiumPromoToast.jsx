"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/components/LanguageContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";

export default function PremiumPromoToast() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const toastIdRef = useRef(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const wasTakingTestRef = useRef(false);

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return clearTimers;
  }, []);

  useEffect(() => {
    // If user is premium or not logged in, do nothing
    if (!user || user.isPremium) return;

    const pathParts = pathname.split('/');
    const isTakingTest = pathParts.length === 4 && 
                         ['listening', 'reading', 'writing'].includes(pathParts[2]) && 
                         pathParts[3] !== 'attempts';

    const showPromoToast = () => {
      // Dismiss active toast to avoid duplicates
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      
      const toastId = toast.custom((toastObj) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="max-w-md w-full bg-white dark:bg-slate-950 shadow-2xl rounded-2xl pointer-events-auto flex border border-amber-200 dark:border-amber-900/50 overflow-hidden relative"
        >
          {/* Subtle animated light effect */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          
          <div className="p-4 flex-1 flex gap-4 items-start relative z-10">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Crown className="w-5.5 h-5.5 animate-bounce fill-amber-100 text-amber-100" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                {t("premiumPromo.title")}
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-normal">
                {t("premiumPromo.desc")}
              </p>
              <div className="mt-3.5 flex gap-2">
                <button
                  onClick={() => {
                    toast.dismiss(toastObj.id);
                    router.push("/dashboard/premium");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs hover:from-amber-600 hover:to-orange-700 transition-all shadow-md shadow-orange-500/10 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t("premiumPromo.button")}
                </button>
                <button
                  onClick={() => toast.dismiss(toastObj.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 font-semibold text-xs transition-colors"
                >
                  {t("premiumPromo.close")}
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => toast.dismiss(toastObj.id)}
              className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ), {
        duration: 8000, // Show for 8 seconds
        position: 'bottom-right'
      });
      
      toastIdRef.current = toastId;
    };

    if (isTakingTest) {
      wasTakingTestRef.current = true;
      clearTimers();
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    } else {
      if (wasTakingTestRef.current) {
        // Just finished/exited a test
        wasTakingTestRef.current = false;
        clearTimers();
        timerRef.current = setTimeout(() => {
          showPromoToast();
          intervalRef.current = setInterval(showPromoToast, 180000); // 3 mins after
        }, 8000);
      } else {
        // Normal dashboard navigation
        // Only start if not already running
        if (!timerRef.current && !intervalRef.current) {
          timerRef.current = setTimeout(() => {
            showPromoToast();
            intervalRef.current = setInterval(showPromoToast, 180000);
          }, 15000);
        }
      }
    }
  }, [user, pathname, router, t]);

  return null;
}
