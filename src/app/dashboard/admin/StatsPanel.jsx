"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, CreditCard, DollarSign, Wallet, Calendar, ArrowUpRight, TrendingUp, BookOpen, Headphones, PenTool, Gift, Star, FileText } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d"); 
  const [customRange, setCustomRange] = useState({ 
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"), 
    end: format(new Date(), "yyyy-MM-dd") 
  });
  const supabase = createClient();

  useEffect(() => {
    fetchStats();

    // ── Real-time polling every 20 seconds ──
    const interval = setInterval(() => {
      fetchStats();
    }, 20000);

    // ── Supabase Realtime: listen to Tests + payments tables ──
    const channel = supabase
      .channel('admin-stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Tests' },
        () => {
          console.log('[Admin Stats] Tests table changed, refreshing...');
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          console.log('[Admin Stats] Payments changed, refreshing...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [dateRange, customRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      let url = "/api/admin/stats";
      if (dateRange === "custom") {
        url += `?startDate=${startOfDay(new Date(customRange.start)).toISOString()}&endDate=${endOfDay(new Date(customRange.end)).toISOString()}`;
      } else if (dateRange !== "all") {
        const days = dateRange === "7d" ? 7 : 30;
        const start = startOfDay(subDays(new Date(), days)).toISOString();
        url += `?startDate=${start}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <div className="p-8 text-center text-muted-foreground">Loading statistics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          Platform Overview
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-muted/50 p-1 rounded-xl">
            {["7d", "30d", "all", "custom"].map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${dateRange === r ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600" : "text-muted-foreground hover:text-foreground"}`}
              >
                {r === "all" ? "All Time" : r === "custom" ? "Calendar" : r.toUpperCase()}
              </button>
            ))}
          </div>

          {dateRange === "custom" && (
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 px-3 rounded-xl border border-border shadow-sm animate-in slide-in-from-right-2 duration-300">
              <input 
                type="date" 
                value={customRange.start}
                onChange={(e) => setCustomRange({...customRange, start: e.target.value})}
                className="bg-transparent border-none text-[11px] font-bold focus:ring-0 outline-none"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <input 
                type="date" 
                value={customRange.end}
                onChange={(e) => setCustomRange({...customRange, end: e.target.value})}
                className="bg-transparent border-none text-[11px] font-bold focus:ring-0 outline-none"
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={Users} 
          color="blue" 
          subtitle="Registered accounts"
        />
        <StatCard 
          title="Premium Users" 
          value={stats?.premiumUsers || 0} 
          icon={TrendingUp} 
          color="emerald" 
          subtitle={`${((stats?.premiumUsers / stats?.totalUsers) * 100 || 0).toFixed(1)}% conversion rate`}
        />
        <StatCard 
          title="Revenue (UZS)" 
          value={(stats?.revenueUZS || 0).toLocaleString()} 
          icon={Wallet} 
          color="indigo" 
          isCurrency
        />
        <StatCard 
          title="Revenue (USD)" 
          value={(stats?.revenueUSD || 0).toLocaleString()} 
          icon={DollarSign} 
          color="amber" 
          isCurrency
          suffix="$"
        />
      </div>

      {/* ── Test Library Stats ── */}
      <div className="bg-white dark:bg-black/20 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold">Test Library</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800/40 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 opacity-70 mb-1">Total</p>
            <p className="text-2xl font-black text-indigo-600">{stats?.tests?.total || 0}</p>
          </div>
          {/* Reading */}
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800/40 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 opacity-70">Reading</p>
            </div>
            <p className="text-2xl font-black text-blue-600">{stats?.tests?.reading || 0}</p>
          </div>
          {/* Listening */}
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border-2 border-teal-100 dark:border-teal-800/40 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Headphones className="w-3.5 h-3.5 text-teal-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-teal-500 opacity-70">Listening</p>
            </div>
            <p className="text-2xl font-black text-teal-600">{stats?.tests?.listening || 0}</p>
          </div>
          {/* Writing */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-100 dark:border-amber-800/40 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <PenTool className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500 opacity-70">Writing</p>
            </div>
            <p className="text-2xl font-black text-amber-600">{stats?.tests?.writing || 0}</p>
          </div>
          {/* Free */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/40 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Gift className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 opacity-70">Free</p>
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats?.tests?.free || 0}</p>
          </div>
          {/* Premium */}
          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-100 dark:border-yellow-800/40 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-yellow-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-500 opacity-70">Premium</p>
            </div>
            <p className="text-2xl font-black text-yellow-600">{stats?.tests?.premium || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-black/20 border border-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold">Recent Payments</h3>
        </div>
        <p className="text-sm text-muted-foreground italic">
            Detailed payment history and charts will be available once the payments table is fully populated.
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle, isCurrency, suffix }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/40",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/40",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800/40",
    amber: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/40",
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} border-2 flex flex-col justify-between transition-transform hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 rounded-xl bg-white/80 dark:bg-black/40 shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <ArrowUpRight className="w-4 h-4 opacity-30" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{title}</p>
        <h4 className="text-2xl font-black">
            {isCurrency && !suffix && "UZS "}
            {value}
            {suffix}
        </h4>
        {subtitle && <p className="text-[10px] mt-1 font-medium opacity-60">{subtitle}</p>}
      </div>
    </div>
  );
}
