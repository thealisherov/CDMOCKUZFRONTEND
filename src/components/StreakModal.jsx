"use client";

import { useState, useEffect } from "react";
import { Flame, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from "@/lib/translations";

export default function StreakModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    const checkStreak = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data: stats } = await supabase
          .from("user_stats")
          .select("daily_streak, last_active_date")
          .eq("user_id", session.user.id)
          .single();

        if (stats && stats.last_active_date) {
          const lastDate = new Date(stats.last_active_date);
          const today = new Date();
          
          const isToday = 
            lastDate.getUTCFullYear() === today.getUTCFullYear() &&
            lastDate.getUTCMonth() === today.getUTCMonth() &&
            lastDate.getUTCDate() === today.getUTCDate();

          if (isToday) {
            const todayStr = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
            const seen = localStorage.getItem("streakSeenDate");
            
            if (seen !== todayStr) {
              setStreak(stats.daily_streak || 1);
              setIsOpen(true);
              localStorage.setItem("streakSeenDate", todayStr);
              // Trigger animation shortly after opening
              setTimeout(() => setIsAnimating(true), 100);
            }
          }
        }
      } catch (err) {
        console.error("Error checking streak", err);
      }
    };

    checkStreak();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      <div 
        className={`bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden relative transition-all duration-700 transform \${isAnimating ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-10 opacity-0'}`}
      >
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="p-8 pb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Streak!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 text-[15px]">
            You're on a roll. Keep it up!
          </p>

          <div className="relative mb-6">
            {/* Pulsing glows behind the flame */}
            <div className={`absolute inset-0 bg-orange-400 rounded-full blur-2xl transition-all duration-1000 \${isAnimating ? 'animate-pulse opacity-60 scale-150' : 'opacity-0 scale-50'}`}></div>
            <div className={`absolute inset-0 bg-amber-300 rounded-full blur-xl transition-all duration-1000 delay-100 \${isAnimating ? 'animate-pulse opacity-40 scale-125' : 'opacity-0 scale-50'}`}></div>
            
            {/* The Flame Icon Container */}
            <div className={`relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 shadow-xl shadow-orange-500/30 transform transition-all duration-700 delay-200 \${isAnimating ? 'scale-100 rotate-0' : 'scale-50 -rotate-12'}`}>
              <Flame className="w-16 h-16 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Particles/Sparks */}
            {isAnimating && (
              <>
                <div className="absolute top-[-20%] left-[20%] w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-75 animation-delay-100"></div>
                <div className="absolute top-[40%] right-[-10%] w-2 h-2 bg-orange-300 rounded-full animate-ping opacity-75 animation-delay-300"></div>
                <div className="absolute bottom-[10%] left-[-10%] w-4 h-4 bg-amber-300 rounded-full animate-ping opacity-60 animation-delay-500"></div>
              </>
            )}
          </div>

          <div className={`transform transition-all duration-700 delay-300 \${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <span className="text-[64px] font-black leading-none tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">
              {streak}
            </span>
            <span className="block text-xl font-bold text-orange-500 uppercase tracking-widest mt-1">
              Days
            </span>
          </div>
        </div>

        <div className="px-8 pb-8">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-[15px] hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-slate-900/20 dark:shadow-white/10"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
