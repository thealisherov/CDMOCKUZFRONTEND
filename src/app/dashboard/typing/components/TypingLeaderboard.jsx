"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown, Zap, Target, Loader2, User } from "lucide-react";
import toast from "react-hot-toast";

export default function TypingLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/typing/leaderboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Reytingni yuklashda xatolik");
      setLeaderboard(json.leaderboard || []);
      setCurrentUser(json.currentUser || null);
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

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" /> Typing Chempionlari
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Typing Reytingi (XP & WPM)
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Typing mashqlaridan yig&apos;ilgan XP asosida reyting — umumiy test reytingidan alohida
        </p>
      </div>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto items-end pt-6">
          
          {/* 2nd Place */}
          {top3[1] && (
            <div className="order-2 sm:order-1 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-card shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-300 to-slate-400 text-slate-900 flex items-center justify-center font-black text-xl shadow-md overflow-hidden">
                  {top3[1].avatar_url ? (
                    <img src={top3[1].avatar_url} alt={top3[1].full_name} className="w-full h-full object-cover" />
                  ) : (
                    top3[1].full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-900 flex items-center justify-center text-xs font-black shadow-sm">
                  2
                </div>
              </div>
              <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{top3[1].full_name}</p>
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{top3[1].total_xp} <span className="text-xs font-bold text-muted-foreground">XP</span></p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{top3[1].best_wpm} WPM · {top3[1].avg_accuracy}%</p>
            </div>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <div className="order-1 sm:order-2 p-6 rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-amber-500/10 via-card to-card shadow-xl text-center flex flex-col items-center transform sm:-translate-y-4">
              <div className="relative mb-3">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-500 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/25 overflow-hidden">
                  {top3[0].avatar_url ? (
                    <img src={top3[0].avatar_url} alt={top3[0].full_name} className="w-full h-full object-cover" />
                  ) : (
                    top3[0].full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-sm font-black shadow-md">
                  1
                </div>
              </div>
              <p className="text-base font-extrabold text-foreground truncate max-w-[180px]">{top3[0].full_name}</p>
              <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{top3[0].total_xp} <span className="text-xs font-bold text-muted-foreground">XP</span></p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">{top3[0].best_wpm} WPM · {top3[0].avg_accuracy}%</p>
            </div>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <div className="order-3 p-5 rounded-3xl border border-amber-900/20 bg-card shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-800 text-white flex items-center justify-center font-black text-xl shadow-md overflow-hidden">
                  {top3[2].avatar_url ? (
                    <img src={top3[2].avatar_url} alt={top3[2].full_name} className="w-full h-full object-cover" />
                  ) : (
                    top3[2].full_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center text-xs font-black shadow-sm">
                  3
                </div>
              </div>
              <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{top3[2].full_name}</p>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-500 mt-1">{top3[2].total_xp} <span className="text-xs font-bold text-muted-foreground">XP</span></p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{top3[2].best_wpm} WPM · {top3[2].avg_accuracy}%</p>
            </div>
          )}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top O&apos;quvchilar</span>
          <span className="text-xs font-semibold text-muted-foreground">Jami: {leaderboard.length} nafar</span>
        </div>

        {leaderboard.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-bold">Hozircha natijalar mavjud emas</p>
            <p className="text-xs mt-1">Birinchi bo&apos;lib test topshiring va 1-o&apos;rinni egallang!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map((item) => (
              <div
                key={item.user_id}
                className={`flex items-center justify-between p-4 transition-colors ${
                  item.isCurrentUser
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold"
                    : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    item.rank === 1
                      ? "bg-amber-400 text-amber-950"
                      : item.rank === 2
                      ? "bg-slate-300 text-slate-900"
                      : item.rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    #{item.rank}
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                    {item.avatar_url ? (
                      <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" />
                    ) : (
                      item.full_name.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate flex items-center gap-2">
                      {item.full_name}
                      {item.isCurrentUser && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                          Siz
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.tests_completed} ta mashq · {item.avg_accuracy}% aniqlik
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                      {item.total_xp} <span className="text-xs font-bold text-muted-foreground">XP</span>
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-muted-foreground">
                      {item.best_wpm} <span className="text-[10px]">WPM</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
