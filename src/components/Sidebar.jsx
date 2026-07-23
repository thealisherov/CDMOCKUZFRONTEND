"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Trophy, BarChart3, Headphones, BookOpen, PenTool, Mic,
  LogOut, PanelLeftClose, PanelLeftOpen, Zap, Crown, Settings, ShieldCheck,
  User, X, Sparkles, MessageCircle, FileText, LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (href, exact) => {
    if (href === "#") return false;
    if (exact) return pathname === "/dashboard" || pathname === "/dashboard/";
    return pathname.startsWith(href);
  };

  const mainNav = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
    { name: "Premium", href: "/dashboard/premium", icon: Crown, badge: "PRO" },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "My Stats", href: "/dashboard/profile", icon: BarChart3 },
    { name: "Comments", href: "/dashboard/comments", icon: MessageCircle },
  ];

  const practiceNav = [
    { name: "Listening", href: "/dashboard/listening", icon: Headphones },
    { name: "Reading", href: "/dashboard/reading", icon: BookOpen },
    { name: "Writing", href: "/dashboard/writing", icon: PenTool },
    { name: "Speaking", href: "#", icon: Mic, locked: true, badge: "Soon" },
    { name: "Predictions", href: "#", icon: Sparkles, locked: true, badge: "Soon" },
    { name: "Articles", href: "#", icon: FileText, locked: true, badge: "Soon" },
  ];

  const supportNav = [
    { name: "Support", href: "/dashboard/support", icon: LifeBuoy },
  ];

  const handleNavClick = (e, item) => {
    if (item.locked) e.preventDefault();
  };

  const renderNavItem = (item) => {
    const active = isActive(item.href, item.exact);
    const Icon = item.icon;
    const displayName = t?.sidebar?.[item.name.toLowerCase()] || item.name;

    return (
      <Link
        key={item.name}
        href={item.locked ? "#" : item.href}
        onClick={(e) => handleNavClick(e, item)}
        title={collapsed ? displayName : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-2xl text-[14px] font-medium transition-all duration-200",
          collapsed ? "justify-center px-0 py-2.5 mx-auto w-11 h-11" : "px-3.5 py-3",
          active
            ? "text-primary bg-primary/5 dark:bg-primary/10"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200",
          item.locked && "opacity-40 cursor-not-allowed"
        )}
      >
        {/* Active left border highlight */}
        {active && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 10px var(--primary)',
            }}
          />
        )}

        {/* Hover overlay */}
        {!active && !item.locked && (
          <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800/50" />
        )}

        <span className="relative flex items-center gap-3 w-full">
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
              active 
                ? "text-primary" 
                : item.name === "Premium" 
                ? "text-amber-500 dark:text-amber-400" 
                : "text-slate-400 dark:text-slate-500"
            )}
          />
          {!collapsed && (
            <span className={cn("font-medium", active && "font-semibold", item.name === "Premium" && !active && "text-amber-600 dark:text-amber-400 font-semibold")}>
              {displayName}
            </span>
          )}
          
          {/* Badge */}
          {!collapsed && item.badge && (
            <span className={cn(
              "ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
              item.badge === "PRO"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs"
                : "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 animate-pulse"
            )}>
              {item.badge}
            </span>
          )}
        </span>

        {/* Collapsed tooltip */}
        {collapsed && (
          <span
            className="absolute left-full ml-3 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap pointer-events-none z-50
              opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200
              bg-popover text-popover-foreground border border-border shadow-xl"
          >
            {displayName}
            {item.badge && <span className="ml-1.5 opacity-60">({item.badge})</span>}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-full w-full flex-col bg-sidebar-background border-r border-sidebar-border">
      
      {/* Logo Header */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4 justify-between shrink-0">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 overflow-hidden select-none",
            collapsed && "justify-center w-full"
          )}
        >
          <div
            className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
              boxShadow: '0 0 14px rgba(79,70,229,0.3)',
            }}
          >
            <Zap className="w-4 h-4 text-white animate-pulse" fill="white" />
          </div>

          {!collapsed && (
            <div className="flex items-baseline gap-0 leading-none">
              <span className="font-extrabold text-[20px] tracking-tight text-slate-800 dark:text-white">
                Mega
              </span>
              <span className="font-extrabold text-[20px] tracking-tight ml-1 text-primary">
                IELTS
              </span>
            </div>
          )}
        </Link>

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "hidden md:flex items-center justify-center rounded-xl transition-all shrink-0",
              "w-8 h-8 opacity-60 hover:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800",
              collapsed && "absolute -right-3 top-4 border border-border shadow-lg z-50 h-6 w-6 rounded-full bg-background"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className={cn("flex-1 overflow-y-auto no-scrollbar", collapsed ? "px-2 py-2 space-y-2.5" : "px-4 py-4 space-y-4")}>
        <div>
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              Main
            </p>
          )}
          <div className="space-y-1">
            {mainNav.map(renderNavItem)}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              Practice
            </p>
          )}
          <div className="space-y-1">
            {practiceNav.map(renderNavItem)}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
              Support
            </p>
          )}
          <div className="space-y-1">
            {supportNav.map(renderNavItem)}
          </div>
        </div>

        {user?.user_metadata?.role === "admin" && (
          <div>
            {!collapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                Admin
              </p>
            )}
            <div className="space-y-1">
              {renderNavItem({ name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck })}
            </div>
          </div>
        )}

        {/* Upgrade to Premium Mini Banner */}
        {!user?.isPremium && !collapsed && (
          <div className="pt-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-md shadow-indigo-500/20"
            >
              {/* Background elements */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl" />
              <div className="absolute top-1 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300 shrink-0" />
                  <span className="text-[13px] font-bold uppercase tracking-wider">Upgrade to Premium</span>
                </div>
                <p className="text-[11px] text-indigo-100 leading-normal">
                  Unlock full mock tests, get detailed evaluation reports & instant feedback.
                </p>
                <Link href="/dashboard/premium" className="block w-full">
                  <button className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade Now
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-4 h-px bg-sidebar-border" />

      {/* Bottom Profile / Settings Actions */}
      <div ref={settingsRef} className={cn("py-4 shrink-0", collapsed ? "px-2" : "px-4")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            {showSettings && (
              <div className="flex flex-col items-center gap-2 mb-2 p-2 rounded-2xl border border-border bg-popover shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                <LanguageSelector position="top" />
                <ThemeToggle />
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "flex items-center justify-center h-10 w-10 rounded-2xl transition-all",
                showSettings ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
              title="Settings"
            >
              <Settings className="h-4.5 w-4.5" />
            </button>
            {user ? (
              <button
                onClick={logout}
                className="flex items-center justify-center h-10 w-10 rounded-2xl transition-all text-red-500 hover:bg-red-500/10"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center h-10 w-10 rounded-2xl transition-all border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Sign In"
              >
                <User className="h-4.5 w-4.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {user ? (
              <>
                <div
                  onClick={() => router.push("/dashboard/profile")}
                  className="flex items-center gap-3 p-2 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--primary), #6366f1)' }}
                  >
                    {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {user?.isPremium ? "Premium Account" : "Free Account"}
                    </p>
                  </div>
                </div>

                {showSettings && (
                  <div className="p-2 rounded-2xl border border-border bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">Prefs</span>
                    <div className="flex gap-2">
                      <LanguageSelector position="top" />
                      <ThemeToggle />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-xl transition-all",
                      showSettings ? "bg-primary/10 text-primary" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    title="Preferences"
                  >
                    <Settings className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
