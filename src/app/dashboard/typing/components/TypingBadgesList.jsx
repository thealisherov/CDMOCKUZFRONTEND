"use client";

import { useEffect, useState } from "react";
import { Award, Zap, Flame, Rocket, Crown, Target, Crosshair, Timer, Sparkles, Lock, CheckCircle2, Loader2, Gauge } from "lucide-react";
import toast from "react-hot-toast";

const ICON_MAP = {
  Zap,
  Flame,
  Rocket,
  Crown,
  Target,
  Crosshair,
  Timer,
  Award,
  Sparkles,
  Gauge
};

export default function TypingBadgesList() {
  const [badges, setBadges] = useState([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/typing/badges");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Badgelarni yuklashda xatolik");
      setBadges(json.badges || []);
      setUnlockedCount(json.unlockedCount || 0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const total = badges.length;
  const progressPct = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header with progress */}
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> Yutuqlar To&apos;plami
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Typing Badgelari ({unlockedCount}/{total})
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Tez yozish mashqlarini bajarib, yangi unvonlar va yutuqlarni qo&apos;lga kiriting
        </p>

        {/* Progress bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-muted-foreground">Ochilgan yutuqlar</span>
            <span className="text-indigo-600 dark:text-indigo-400">{progressPct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {badges.map((badge) => {
          const IconComp = ICON_MAP[badge.icon] || Award;
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={badge.id}
              className={`relative p-5 rounded-3xl border transition-all duration-200 overflow-hidden flex items-start gap-4 ${
                isUnlocked
                  ? "bg-card border-amber-400/40 dark:border-amber-500/30 shadow-md shadow-amber-500/5 hover:-translate-y-0.5"
                  : "bg-muted/30 border-border/60 opacity-65 grayscale hover:grayscale-0 hover:opacity-90"
              }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isUnlocked
                  ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-orange-500/20"
                  : "bg-muted text-muted-foreground"
              }`}>
                {isUnlocked ? (
                  <IconComp className="w-7 h-7" strokeWidth={2.2} />
                ) : (
                  <Lock className="w-6 h-6" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-foreground truncate">{badge.name}</h4>
                  {isUnlocked && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Ochilgan
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
                {isUnlocked && badge.earned_at && (
                  <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 pt-1">
                    Erishilgan sana: {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
