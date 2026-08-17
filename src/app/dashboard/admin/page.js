"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, TrendingUp, Settings as SettingsIcon, Building2, Send, FileText, Keyboard, Layers } from "lucide-react";
import UsersList from "./UsersList";
import StatsPanel from "./StatsPanel";
import PricingEditor from "./PricingEditor";
import CentersManager from "./CentersManager";
import TelegramBotManager from "./TelegramBotManager";
import FullMockManager from "./FullMockManager";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

  const isSuperAdmin = !!user?.email && (
    user.email.toLowerCase().includes("aziz0826") ||
    user.email === "aziz0826@gmail.com" ||
    user.email === "aziz0826alisheroc@gmail.com"
  );

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
    if (user && activeTab === "centers" && !isSuperAdmin) {
      setActiveTab("users");
    }
  }, [user, router, activeTab, isSuperAdmin]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, view stats, and config pricing</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border pb-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "users" ? "bg-indigo-50 text-indigo-700" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Users className="w-4 h-4" /> Users
        </button>
        <button
          onClick={() => setActiveTab("telegram")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "telegram" ? "bg-blue-50 text-blue-700 font-semibold" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Send className="w-4 h-4 text-blue-600" /> Telegram Bot
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
        <button
          onClick={() => router.push("/dashboard/admin/tests")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all text-muted-foreground hover:bg-muted"
        >
          <FileText className="w-4 h-4" /> Testlar
        </button>
        <button
          onClick={() => setActiveTab("fullmock")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "fullmock" ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold" : "text-muted-foreground hover:bg-muted"}`}
        >
          <Layers className="w-4 h-4 text-purple-600" /> Full Mocks
        </button>
        <button
          onClick={() => router.push("/dashboard/admin/typing")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all text-muted-foreground hover:bg-muted hover:text-indigo-600"
        >
          <Keyboard className="w-4 h-4" /> Typing
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab("centers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${activeTab === "centers" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-muted-foreground hover:bg-muted"}`}
          >
            <Building2 className="w-4 h-4" /> Centers
          </button>
        )}
      </div>

      <div className="flex-1">
        {activeTab === "users" && <UsersList />}
        {activeTab === "telegram" && <TelegramBotManager />}
        {activeTab === "stats" && <StatsPanel />}
        {activeTab === "pricing" && <PricingEditor />}
        {activeTab === "fullmock" && <FullMockManager />}
        {isSuperAdmin && activeTab === "centers" && <CentersManager />}
      </div>
    </div>
  );
}
