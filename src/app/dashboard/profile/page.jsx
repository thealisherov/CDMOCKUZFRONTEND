"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/components/LanguageContext";
import { createClient } from "@/utils/supabase/client";
import { format, differenceInDays } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Mail, Calendar, Shield, Crown, Clock, Flame,
  BookOpen, CheckCircle2, Timer, Camera,
  Trophy, Target, Zap, CreditCard, TrendingUp, Lock
} from "lucide-react";

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { t } = useTranslation();
  const [profileData, setProfileData] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (authUser) fetchProfile();
  }, [authUser]);

  const fetchProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const [profileRes, leaderboardRes] = await Promise.all([
        fetch("/api/profile", { headers: { Authorization: `Bearer ${session?.access_token}` }}),
        fetch("/api/leaderboard", { headers: { Authorization: `Bearer ${session?.access_token}` }})
      ]);

      if (!profileRes.ok) throw new Error("Failed to load profile");
      const data = await profileRes.json();
      setProfileData(data);

      if (leaderboardRes.ok) {
        const lbData = await leaderboardRes.json();
        setLeaderboardData(lbData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setProfileData(prev => ({
        ...prev,
        user: { ...prev.user, user_metadata: { ...prev.user.user_metadata, avatar_url: data.avatar_url } }
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!profileData?.user) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-muted-foreground">Could not load profile</p>
    </div>
  );

  const { user, stats, payments, testResults } = profileData;
  const meta = user.user_metadata || {};
  const isPremium = meta.premium_until && new Date(meta.premium_until) > new Date();
  const premiumUntil = meta.premium_until ? new Date(meta.premium_until) : null;
  const daysLeft = premiumUntil && isPremium ? differenceInDays(premiumUntil, new Date()) : 0;
  const avatarUrl = meta.avatar_url;

  const formatTime = (seconds) => {
    if (!seconds) return "0h 0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 pb-12 pt-4">
      {/* Hero Header */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-border shadow-sm bg-white dark:bg-gray-900">
        <div className="h-28 sm:h-40 w-full" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #e11d48)' }}>
          <div className="absolute inset-x-0 top-0 h-28 sm:h-40 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.3'%3E%3Cpath d='M0 20L20 0L40 20L20 40Z'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: "24px"}}></div>
        </div>

        <div className="px-4 sm:px-8 pb-6 sm:pb-8 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl border-4 border-white dark:border-gray-900 shadow-xl overflow-hidden bg-indigo-600 flex items-center justify-center text-2xl sm:text-4xl font-black text-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  meta.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()
                )}
              </div>
              <button 
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-1 right-1 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-700"
              >
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              {uploading && <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-black/50 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div>}
            </div>

            <div className="flex-1 text-center sm:text-left pt-2 sm:pt-0">
              <h1 className="text-xl sm:text-2xl font-black">{meta.full_name || 'User'}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
            </div>

            <div className={`px-4 sm:px-5 py-2 rounded-2xl text-sm font-black ${isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200 dark:shadow-none' : 'bg-gray-100 dark:bg-gray-800 text-muted-foreground'}`}>
              {isPremium ? `⭐ ${t("sidebar.premium")}` : t("sidebar.freePlan")}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat icon={Flame} label={t("profile.dailyStreak")} value={`${stats.daily_streak || 0}`} suffix=" 🔥" color="orange" />
        <MiniStat icon={BookOpen} label={t("profile.testsTaken")} value={stats.tests_taken || 0} color="blue" />
        <MiniStat icon={Target} label={t("profile.correctAnswers")} value={stats.correct_answers || 0} color="emerald" />
        <MiniStat icon={Timer} label={t("profile.studyTime")} value={formatTime(stats.total_time_seconds)} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left: Account Details */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("profile.accountInfo")}</h3>
            <InfoRow icon={Shield} label={t("profile.role")} value={meta.role || 'Student'} />
            <InfoRow icon={Calendar} label={t("profile.joined")} value={format(new Date(user.created_at), "MMMM dd, yyyy")} />
            <InfoRow icon={Zap} label={t("profile.xpLevel")} value={`${stats.xp || 0} XP`} />
          </div>

          {/* Rank Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm space-y-4 shadow-indigo-100/50 dark:shadow-none relative overflow-hidden">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("profile.leaderboardRank") || "Leaderboard Rank"}</h3>
            {isPremium ? (
              <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800/20">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                  #{leaderboardData?.currentUser?.rank || '?'}
                </div>
                <div>
                  <p className="font-bold text-indigo-900 dark:text-indigo-100">{t("profile.topStudent") || "Top Performing Student"}</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">{t("profile.basedOnXp", { xp: stats.xp || 0 }) || `Based on your ${stats.xp || 0} XP`}</p>
                </div>
              </div>
            ) : (
              <div 
                className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push('/dashboard/payment')}
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-bold text-muted-foreground text-sm">{t("profile.rankHidden") || "Rank Hidden"}</p>
                  <p className="text-xs text-muted-foreground/70">{t("profile.upgradeToSeeRank") || "Upgrade to Premium to see your rank"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("profile.subscription")}</h3>
            {isPremium ? (
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" />
                  <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full">{t("profile.active")}</span>
                </div>
                <p className="text-lg sm:text-xl font-black">{daysLeft} {t("profile.daysLeft")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("profile.expires")} {format(premiumUntil, "MMMM dd, yyyy")}</p>
                <div className="mt-4 h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all" style={{ width: `${Math.max(5, Math.min(100, (daysLeft / 30) * 100))}%` }}></div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-muted/30 rounded-2xl border border-dashed border-border text-center">
                <p className="text-sm font-bold text-muted-foreground mb-3">{t("profile.freePlanMsg")}</p>
                <button onClick={() => router.push('/dashboard/payment')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all">
                  {t("profile.upgradeToPremium")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Breakdown */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> {t("profile.xpBreakdown")}
              </h3>
              <span className="text-xl sm:text-2xl font-black text-indigo-600">{stats.xp || 0} XP</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <XPSegment label={t("profile.testsCompleted")} value={stats.tests_taken || 0} xp={(stats.tests_taken || 0) * 10} icon="📝" />
              <XPSegment label={t("profile.correctAnswers")} value={stats.correct_answers || 0} xp={(stats.correct_answers || 0) * 2} icon="✅" />
              <XPSegment label={t("profile.studyTime")} value={formatTime(stats.total_time_seconds)} xp={Math.floor((stats.total_time_seconds || 0) / 60)} icon="⏱️" />
            </div>
          </div>

          {/* Recent Tests */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" /> {t("profile.recentTests")}
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {testResults.length > 0 ? testResults.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0">
                      {item.test_type?.substring(0, 2)?.toUpperCase() || 'T'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate">{item.test_name || `Test #${i + 1}`}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(item.created_at), "MMM dd, yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-black text-emerald-600">{item.score || 0}%</p>
                    <p className="text-[10px] text-muted-foreground">{item.correct}/{item.total}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 opacity-30">
                  <BookOpen className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm font-bold">{t("profile.noTests")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-border shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-500" /> {t("profile.paymentHistory")}
            </h3>
            <div className="space-y-3">
              {payments.length > 0 ? payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold">{Number(p.amount).toLocaleString()} {p.currency}</p>
                      <p className="text-[10px] text-muted-foreground">{p.plan_months} {t("profile.monthsAccess")}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{format(new Date(p.created_at), "MMM dd")}</span>
                </div>
              )) : (
                <div className="text-center py-8 opacity-30">
                  <CreditCard className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-bold">{t("profile.noPayments")}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, color, suffix }) {
  const colors = {
    orange: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/15 dark:border-orange-800/30 dark:text-orange-400",
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/15 dark:border-blue-800/30 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/15 dark:border-emerald-800/30 dark:text-emerald-400",
    purple: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/15 dark:border-purple-800/30 dark:text-purple-400",
  };
  return (
    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex flex-col gap-2 ${colors[color]} transition-transform hover:scale-[1.02]`}>
      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      <div>
        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
        <p className="text-lg sm:text-xl font-black">{value}{suffix}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-bold text-muted-foreground">{label}</p>
        <p className="text-sm font-bold capitalize truncate">{value}</p>
      </div>
    </div>
  );
}

function XPSegment({ label, value, xp, icon }) {
  return (
    <div className="p-3 sm:p-4 bg-muted/20 rounded-xl sm:rounded-2xl text-center">
      <span className="text-xl sm:text-2xl">{icon}</span>
      <p className="text-sm sm:text-lg font-black mt-1 sm:mt-2">{value}</p>
      <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground mt-0.5">{label}</p>
      <p className="text-[10px] sm:text-xs font-black text-indigo-500 mt-1">+{xp} XP</p>
    </div>
  );
}
