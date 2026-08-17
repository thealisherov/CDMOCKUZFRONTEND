"use client";

import { useEffect, useState } from "react";
import { Award, Zap, Flame, Rocket, Crown, Target, Crosshair, Timer, Sparkles, Gauge, Loader2 } from "lucide-react";
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

export default function TypingBadgesManager() {
  const [badges, setBadges] = useState([]);
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
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">Typing Badgelari & Yutuqlar</h3>
          <p className="text-xs text-muted-foreground">
            Foydalanuvchilar erishishi mumkin bo&apos;lgan avtomatik mukofotlar va shartlar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => {
          const IconComp = ICON_MAP[badge.icon] || Award;
          return (
            <div
              key={badge.id}
              className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0 shadow-inner">
                <IconComp className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground truncate">{badge.name}</h4>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {badge.code}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
                {badge.condition_json && (
                  <div className="pt-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg">
                    Qoida: {JSON.stringify(badge.condition_json)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
