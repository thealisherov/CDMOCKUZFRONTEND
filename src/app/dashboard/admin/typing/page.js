"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Keyboard, FileText, Award, ArrowLeft, ShieldCheck } from "lucide-react";
import TypingTextsList from "./components/TypingTextsList";
import TypingBadgesManager from "./components/TypingBadgesManager";

export default function AdminTypingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("texts");

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/admin")}
            className="p-2.5 rounded-2xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Admin panelga qaytish"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
            <Keyboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Typing Boshqaruvi</h1>
            <p className="text-sm text-muted-foreground">
              Tez yozish matnlari, kategoriyalar va badgelarni sozlash
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("texts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "texts"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <FileText className="w-4 h-4" /> Matnlar Ro&apos;yxati
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === "badges"
              ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Award className="w-4 h-4" /> Badgeler & Shartlar
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "texts" && <TypingTextsList />}
        {activeTab === "badges" && <TypingBadgesManager />}
      </div>
    </div>
  );
}
