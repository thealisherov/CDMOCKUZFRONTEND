"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, TrendingUp, Settings as SettingsIcon } from "lucide-react";
import UsersList from "./UsersList";
import StatsPanel from "./StatsPanel";
import PricingEditor from "./PricingEditor";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  return (
    <div className="w-full h-full flex flex-col p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, view stats, and config pricing</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "users" ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "stats" ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"}`}
        >
          <TrendingUp className="w-4 h-4" /> Statistics
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "pricing" ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"}`}
        >
          <SettingsIcon className="w-4 h-4" /> Pricing
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "users" && <UsersList />}
        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "pricing" && <PricingEditor />}
      </div>
    </div>
  );
}
