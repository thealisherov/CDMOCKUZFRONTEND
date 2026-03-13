"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Users, CreditCard, DollarSign, Wallet, Calendar, ArrowUpRight, TrendingUp } from "lucide-react";
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
        <h2 className="text-lg font-bold">Platform Overview</h2>
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
