"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/components/LanguageContext";
import { useRouter } from "next/navigation";
import { Trophy, Flame, Lock, Star, Crown } from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();

  const isPremium = user?.isPremium;

  const { data, error, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/leaderboard", {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to load leaderboard");
      return result;
    },
    staleTime: 60 * 1000, 
  });

  // Real-time subscription for leaderboard updates
  useEffect(() => {
    const channel = supabase.channel('realtime_leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, () => {
        // Invalidate cache to trigger instant background refetch
        queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const leaderboard = data?.leaderboard || [];
  const currentUser = data?.currentUser;

  // Free users see only top 10
  const visibleList = isPremium ? leaderboard : leaderboard.slice(0, 10);
  const top3 = visibleList.slice(0, 3);
  const rest = visibleList.slice(3);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-black">
          <Trophy className="w-3.5 h-3.5" /> {t("sidebar.leaderboard") || "LEADERBOARD"}
        </div>
        <h1 className="text-3xl font-black">{t("leaderboard.title")}</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">{t("leaderboard.desc")}</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl text-center text-sm font-bold">
          {error.message || "Xatolik yuz berdi"}
        </div>
      )}

      {/* Your Rank — only for premium */}
      {isPremium && currentUser && (
        <div className="bg-indigo-600 text-white rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-indigo-200 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-black text-lg">
              #{currentUser.rank}
            </div>
            <div>
              <p className="font-bold">{t("leaderboard.yourPosition")}</p>
              <p className="text-sm text-white/70">{currentUser.xp} XP {t("leaderboard.total")}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <p className="text-xs text-white/50">{t("leaderboard.tests")}</p>
              <p className="font-black">{currentUser.tests_taken}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/50">{t("leaderboard.streak")}</p>
              <p className="font-black flex items-center gap-1"><Flame className="w-3 h-3 text-orange-300" />{currentUser.daily_streak}</p>
            </div>
          </div>
        </div>
      )}

      {/* Not premium — show CTA instead of rank */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-200 dark:shadow-none">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold">{t("leaderboard.premiumOnly")}</p>
              <p className="text-sm text-white/70">{t("leaderboard.upgradeToSee")}</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/dashboard/payment')}
            className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-700 rounded-xl font-black text-sm hover:bg-white/90 transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <Star className="w-4 h-4" /> {t("sidebar.premium") || "Premium"}
          </button>
        </div>
      )}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 sm:gap-4 pt-8">
          {top3[1] && (
            <PodiumCard user={top3[1]} rank={2} color="from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700" medal="🥈" height="h-28" />
          )}
          {top3[0] && (
            <PodiumCard user={top3[0]} rank={1} color="from-amber-100 to-yellow-200 dark:from-amber-900/30 dark:to-yellow-900/30" medal="🥇" height="h-36" isFirst />
          )}
          {top3[2] && (
            <PodiumCard user={top3[2]} rank={3} color="from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20" medal="🥉" height="h-24" />
          )}
        </div>
      )}

      {/* Full List */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-border bg-muted/10">
          <div className="grid grid-cols-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-5 sm:col-span-5 truncate">{t("leaderboard.studentColumn") || (t("leaderboard.tests") === "Tests" ? "Student" : "O'quvchi")}</div>
            <div className="col-span-2 text-center">XP</div>
            <div className="col-span-2 text-center hidden sm:block">{t("leaderboard.tests")}</div>
            <div className="col-span-4 sm:col-span-2 text-center">{t("leaderboard.streak")}</div>
          </div>
        </div>
        <div className="divide-y divide-border/40">
          {visibleList.map((entry) => (
            <div 
              key={entry.user_id}
              className={`grid grid-cols-12 items-center py-3 px-3 sm:px-4 text-sm transition-colors ${entry.isCurrentUser ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-muted/5'}`}
            >
              <div className="col-span-1 text-center font-black text-muted-foreground text-xs">{entry.rank}</div>
              <div className="col-span-5 sm:col-span-5 flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center text-xs font-black overflow-hidden shrink-0">
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    entry.full_name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <span className="font-bold truncate text-xs sm:text-sm">{entry.full_name}</span>
                {entry.isCurrentUser && <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full shrink-0">{t("leaderboard.you") || "YOU"}</span>}
              </div>
              <div className="col-span-2 text-center font-black text-indigo-600 text-xs sm:text-sm">{entry.xp}</div>
              <div className="col-span-2 text-center text-muted-foreground hidden sm:block">{entry.tests_taken}</div>
              <div className="col-span-4 sm:col-span-2 text-center flex items-center justify-center gap-1 text-orange-500 font-bold text-xs sm:text-sm">
                <Flame className="w-3 h-3" /> {entry.daily_streak}
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div className="text-center py-16 opacity-30">
              <Trophy className="w-12 h-12 mx-auto mb-3" />
              <p className="font-bold">{t("leaderboard.noData")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Premium upsell at bottom for free users */}
      {!isPremium && leaderboard.length > 10 && (
        <div className="text-center py-8 border-2 border-dashed border-indigo-200 dark:border-indigo-800 rounded-3xl">
          <Lock className="w-8 h-8 mx-auto mb-3 text-indigo-400" />
          <p className="font-bold text-muted-foreground mb-1">+{leaderboard.length - 10} {t("leaderboard.moreStudents") || "more students"}</p>
          <p className="text-sm text-muted-foreground mb-4">{t("leaderboard.premiumOnly")}</p>
          <button 
            onClick={() => router.push('/dashboard/payment')}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            {t("leaderboard.upgradeToSee")}
          </button>
        </div>
      )}
    </div>
  );
}

function PodiumCard({ user, rank, color, medal, height, isFirst }) {
  return (
    <div className="flex flex-col items-center w-24 sm:w-36">
      <div className="relative mb-3">
        <div className={`${isFirst ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-12 h-12 sm:w-16 sm:h-16'} rounded-2xl overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg border-4 border-white dark:border-gray-900`}>
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            user.full_name?.charAt(0)?.toUpperCase()
          )}
        </div>
        <span className="absolute -top-2 -right-2 text-xl sm:text-2xl">{medal}</span>
      </div>
      <p className="text-xs sm:text-sm font-black text-center truncate w-full">{user.full_name}</p>
      <p className="text-[10px] sm:text-xs font-bold text-indigo-600 mb-2">{user.xp} XP</p>
      <div className={`w-full ${height} rounded-t-2xl bg-gradient-to-b ${color} flex items-center justify-center border border-border/30`}>
        <span className="text-2xl sm:text-3xl font-black opacity-20">{rank}</span>
      </div>
    </div>
  );
}
