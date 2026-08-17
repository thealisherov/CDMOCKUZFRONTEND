"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Keyboard, Trophy, Award, History, Zap, Crown, Flame, Sparkles, Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TypingEngine from "./components/TypingEngine";
import TypingLeaderboard from "./components/TypingLeaderboard";
import TypingBadgesList from "./components/TypingBadgesList";
import TypingHistory from "./components/TypingHistory";
import { DailyLimitBadge, DailyLimitModal } from "./components/DailyLimitNotice";

export default function TypingPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("practice"); // 'practice' | 'leaderboard' | 'badges' | 'history'
  const [statusData, setStatusData] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/typing/status");
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (e) {
      console.warn("Could not fetch typing status:", e);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStatus();
    } else {
      setStatusData(null);
    }
  }, [user, fetchStatus]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* ── Top Header & Stats ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-xl shadow-indigo-600/25">
            <Keyboard className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Typing Practice
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                PRO SPEED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              IELTS Writing va kompyuterda tez, xatosiz yozish mahoratingizni oshiring
            </p>
          </div>
        </div>

        {/* Daily Limit Badge */}
        {statusData && (
          <DailyLimitBadge
            remainingToday={statusData.remainingToday}
            dailyLimit={statusData.dailyLimit}
            isPremium={statusData.isPremium}
            onOpenModal={() => setShowLimitModal(true)}
          />
        )}
      </div>

      {/* ── Quick Stats Bar (Personal Best) ── */}
      {statusData && statusData.totalAttempts > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Eng yaxshi WPM</p>
              <p className="text-base sm:text-lg font-black text-foreground">{statusData.bestWpm} WPM</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">O&apos;rtacha WPM</p>
              <p className="text-base sm:text-lg font-black text-foreground">{statusData.avgWpm} WPM</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">O&apos;rtacha Aniqlik</p>
              <p className="text-base sm:text-lg font-black text-foreground">{statusData.avgAccuracy}%</p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
              <History className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Bajarilgan mashqlar</p>
              <p className="text-base sm:text-lg font-black text-foreground">{statusData.totalAttempts} ta</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex space-x-2 border-b border-border pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === "practice"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Keyboard className="w-4 h-4" /> Mashq Qilish
        </button>

        <button
          onClick={() => setActiveTab("leaderboard")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Trophy className="w-4 h-4" /> Reyting (Leaderboard)
        </button>

        <button
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === "badges"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Award className="w-4 h-4" /> Yutuqlar (Badges)
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" /> Mashqlar Tarixi
        </button>
      </div>

      {/* ── Active Tab Component ── */}
      <div className="pt-2">
        {activeTab === "practice" && (
          <TypingEngine
            userStatus={statusData}
            onStatsUpdated={fetchStatus}
          />
        )}
        {activeTab === "leaderboard" && <TypingLeaderboard />}
        {activeTab === "badges" && <TypingBadgesList />}
        {activeTab === "history" && <TypingHistory />}
      </div>

      {/* Daily limit modal */}
      <DailyLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
    </div>
  );
}
