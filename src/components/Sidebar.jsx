"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen, Headphones, PenTool, Mic,
  MessageCircle, LogOut, PanelLeftClose, PanelLeftOpen,
  Zap, Star, Settings, ShieldCheck, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import ProfileModal from "@/components/ProfileModal";
import { useTranslation } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({ collapsed, onToggle }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  const navigation = [
    { name: t("sidebar.reading"),   href: "/dashboard/reading",   icon: BookOpen,      locked: false },
    { name: t("sidebar.listening"), href: "/dashboard/listening", icon: Headphones,    locked: false },
    { name: t("sidebar.writing"),   href: "/dashboard/writing",   icon: PenTool,       locked: false },
    { name: t("sidebar.speaking"),  href: "#",                    icon: Mic,           locked: true, badge: t("sidebar.soon") },
    { name: t("sidebar.comments"),  href: "/dashboard/comments",  icon: MessageCircle, locked: false },
    { name: t("sidebar.leaderboard") || "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy, locked: false },
    { name: t("sidebar.premium"),   href: "/dashboard/premium",   icon: Star,          locked: false, badge: t("sidebar.upgrade") },
  ];

  if (user?.user_metadata?.role === "admin") {
    navigation.push({ name: "Admin", href: "/dashboard/admin", icon: ShieldCheck, locked: false });
  }

  const handleNavClick = (e, item) => {
    if (item.locked) e.preventDefault();
  };

  const isActive = (href) => {
    if (href === "#") return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full w-full flex-col" style={{ background: 'var(--sidebar-background)' }}>

      {/* ── Logo + Collapse ── */}
      <div
        className="flex h-16 items-center border-b px-3 justify-between shrink-0"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 overflow-hidden select-none",
            collapsed && "justify-center w-full"
          )}
        >
          {/* Icon mark */}
          <div
            className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #e22d2d, #c41e1e)',
              boxShadow: '0 0 14px rgba(226,45,45,0.4)',
            }}
          >
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>

          {/* Wordmark — only when expanded */}
          {!collapsed && (
            <div className="flex items-baseline gap-0 leading-none">
              <span
                className="font-black text-[19px] tracking-tight"
                style={{ color: 'var(--sidebar-foreground)' }}
              >
                Mega
              </span>
              <span
                className="font-black text-[19px] tracking-tight ml-1.5"
                style={{ color: '#e22d2d' }}
              >
                IELTS
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle — desktop only */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "hidden md:flex items-center justify-center rounded-lg transition-all shrink-0",
              "w-7 h-7 opacity-50 hover:opacity-100",
              "hover:bg-[oklch(0.72_0.2_270/_0.15)]",
              collapsed && "absolute -right-3 top-4 border border-[color:var(--sidebar-border)] shadow-lg z-50 h-6 w-6 rounded-full"
            )}
            style={{
              color: 'var(--sidebar-foreground)',
              background: collapsed ? 'var(--sidebar-background)' : 'transparent',
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <PanelLeftOpen  className="h-3.5 w-3.5" />
              : <PanelLeftClose className="h-3.5 w-3.5" />
            }
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn("flex-1 py-5 space-y-1 overflow-y-auto", collapsed ? "px-2" : "px-3")}>

        {!collapsed && (
          <p
            className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: 'oklch(0.55 0.04 270)' }}
          >
            Modules
          </p>
        )}

        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <a
              key={item.name}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              title={collapsed ? item.name : undefined}
              className={cn(
                "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-0 py-3" : "justify-between px-3 py-2.5",
                !active && !item.locked && "hover:opacity-100",
                item.locked && "cursor-not-allowed opacity-35"
              )}
              style={active ? {
                background: 'linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.52 0.2 250))',
                boxShadow: '0 4px 20px oklch(0.55 0.22 270 / 0.35), inset 0 1px 0 oklch(1 0 0 / 0.1)',
                color: '#ffffff',
              } : {
                color: 'var(--sidebar-foreground)',
                opacity: 0.75,
              }}
            >
              {/* Hover bg */}
              {!active && !item.locked && (
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'oklch(0.72 0.2 270 / 0.1)' }}
                />
              )}

              {/* Active left bar */}
              {active && !collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'oklch(0.9 0.1 270)', boxShadow: '0 0 8px #fff' }}
                />
              )}

              <div className={cn("relative flex items-center", collapsed ? "gap-0" : "gap-3")}>
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-110",
                    active ? "text-white" : ""
                  )}
                  style={active ? {} : { color: 'var(--sidebar-foreground)', opacity: 0.7 }}
                />
                {!collapsed && (
                  <span className={cn("font-medium", active ? "text-white" : "")}>
                    {item.name}
                  </span>
                )}
              </div>

              {/* Badge */}
              {!collapsed && item.badge && (
                <span
                  className="relative text-[10px] px-1.5 py-0.5 rounded-full font-semibold tracking-wide border border-current/20"
                  style={active
                    ? { background: 'rgba(255,255,255,0.2)', color: '#fff' }
                    : { color: 'var(--sidebar-foreground)', opacity: 0.5 }
                  }
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip in collapsed mode */}
              {collapsed && (
                <span
                  className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none z-50
                    opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                  style={{
                    background: 'var(--sidebar-background)',
                    color: 'var(--sidebar-foreground)',
                    border: '1px solid var(--sidebar-border)',
                    boxShadow: '0 8px 24px oklch(0 0 0 / 0.3)',
                  }}
                >
                  {item.name}
                  {item.badge && <span className="ml-1.5 opacity-60">({item.badge})</span>}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'var(--sidebar-border)' }} />

      {/* ── Bottom actions ── */}
      <div ref={settingsRef} className={cn("py-4 pb-8 shrink-0", collapsed ? "px-2 space-y-2" : "px-3 space-y-1")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-2 relative">
            {showSettings && (
              <div className="flex flex-col items-center gap-2 mb-2 p-2 rounded-xl border animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm" style={{ background: 'oklch(0.5 0.0 0 / 0.03)', borderColor: 'var(--sidebar-border)' }}>
                <LanguageSelector position="top" />
                <ThemeToggle />
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title={t("sidebar.settings", { defaultValue: "Settings" })}
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-xl transition-all",
                showSettings ? "bg-primary/10 text-primary" : "hover:bg-[oklch(0.72_0.2_270/_0.12)]"
              )}
              style={!showSettings ? { color: 'var(--sidebar-foreground)', opacity: 0.6 } : {}}
            >
              <Settings className="h-4 w-4 pointer-events-none" />
            </button>
            <button
              onClick={logout}
              title={t("sidebar.signOut", { defaultValue: "Sign Out" })}
              className="flex items-center justify-center h-9 w-9 rounded-xl transition-all hover:bg-red-500/10 text-red-500"
            >
              <LogOut className="h-4 w-4 pointer-events-none" />
            </button>
          </div>
        ) : (
            <>
            {/* User block */}
            <div
              onClick={() => router.push('/dashboard/profile')}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all hover:bg-[oklch(0.72_0.2_270/_0.12)]"
              style={{
                background: 'oklch(0.72 0.2 270 / 0.08)',
                border: '1px solid var(--sidebar-border)',
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white"
                style={{ background: 'linear-gradient(135deg, #e22d2d, oklch(0.68 0.22 270))' }}
              >
                {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate" style={{ color: 'var(--sidebar-foreground)' }}>
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || t("sidebar.student")}
                </p>
                <p className="text-[10px] truncate" style={{ color: 'oklch(0.55 0.04 270)' }}>
                  {user?.isPremium ? "Premium Account" : t("sidebar.freePlan")}
                </p>
              </div>
            </div>

            {showSettings && (
              <div
                className="mx-1 mb-2 p-2 rounded-xl border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm"
                style={{ background: 'oklch(0.5 0.0 0 / 0.03)', borderColor: 'var(--sidebar-border)' }}
              >
                <span className="text-xs font-semibold pl-1" style={{ color: 'var(--sidebar-foreground)' }}>{t("sidebar.settings", { defaultValue: "Settings" })}</span>
                <div className="flex gap-2">
                  <LanguageSelector position="top" />
                  <ThemeToggle />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1 mt-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={cn(
                  "flex items-center justify-center p-2 rounded-xl transition-all",
                  showSettings ? "bg-primary/10 text-primary" : "hover:bg-[oklch(0.72_0.2_270/_0.12)]"
                )}
                style={!showSettings ? { color: 'var(--sidebar-foreground)', opacity: 0.6 } : {}}
                title={t("sidebar.settings", { defaultValue: "Settings" })}
              >
                <Settings className="h-4 w-4 pointer-events-none" />
              </button>

              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-red-500/10 text-red-500 hover:text-red-700"
                style={{ opacity: 0.8 }}
              >
                <LogOut className="h-4 w-4 pointer-events-none" />
                <span className="hidden sm:inline">{t("sidebar.signOut")}</span>
              </button>
            </div>
          </>
        )}
      </div>

      {showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          user={user} 
        />
      )}
    </div>
  );
}
