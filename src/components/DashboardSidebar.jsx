"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Trophy, BarChart3,
  Headphones, BookOpen, PenTool, Mic,
  LogOut, PanelLeftClose, PanelLeftOpen,
  Zap, Crown, Settings, ShieldCheck, User, X, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

const mainNav = [
  { name: "Dashboard",   href: "/dashboard",             icon: LayoutDashboard, exact: true },
  { name: "Leaderboard", href: "/dashboard/leaderboard",  icon: Trophy },
  { name: "My Stats",    href: "/dashboard/profile",      icon: BarChart3 },
];

const practiceNav = [
  { name: "Listening", href: "/dashboard/listening", icon: Headphones },
  { name: "Reading",   href: "/dashboard/reading",   icon: BookOpen },
  { name: "Writing",   href: "/dashboard/writing",   icon: PenTool },
  { name: "Speaking",  href: "#",                     icon: Mic, locked: true, badge: "Soon" },
];

export default function DashboardSidebar({ collapsed, onToggle }) {
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
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const isAdmin = user?.user_metadata?.role === "admin";

  const renderNavItem = (item) => {
    const active = isActive(item.href, item.exact);
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.locked ? "#" : item.href}
        onClick={(e) => item.locked && e.preventDefault()}
        title={collapsed ? item.name : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-xl text-[13px] font-medium transition-all duration-200",
          collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "px-3 py-2.5",
          active
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
          item.locked && "opacity-40 cursor-not-allowed"
        )}
      >
        {/* Active left border indicator */}
        {active && !collapsed && (
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
            style={{
              background: 'var(--primary)',
              boxShadow: '0 0 12px var(--glow-primary)',
            }}
          />
        )}

        {/* Active background */}
        {active && (
          <span
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'var(--accent)',
            }}
          />
        )}

        {/* Hover background */}
        {!active && !item.locked && (
          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50" />
        )}

        <span className="relative flex items-center gap-3">
          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110",
              active && "text-primary"
            )}
          />
          {!collapsed && (
            <span className={cn("relative", active && "font-semibold text-primary")}>
              {item.name}
            </span>
          )}
        </span>

        {/* Badge */}
        {!collapsed && item.badge && (
          <span className="relative ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
            {item.badge}
          </span>
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <span
            className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none z-50
              opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200
              bg-popover text-popover-foreground border border-border shadow-xl"
          >
            {item.name}
            {item.badge && <span className="ml-1.5 opacity-50">({item.badge})</span>}
          </span>
        )}
      </Link>
    );
  };

  const SectionLabel = ({ children }) => (
    !collapsed ? (
      <p className="px-3 pt-5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
        {children}
      </p>
    ) : (
      <div className="my-2 mx-3 h-px bg-border/50" />
    )
  );

  return (
    <div className="flex h-full w-full flex-col bg-sidebar-background border-r border-sidebar-border">

      {/* ── Logo + Collapse ── */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-3 justify-between shrink-0">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 overflow-hidden select-none",
            collapsed && "justify-center w-full"
          )}
        >
          <div
            className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, #e22d2d, #c41e1e)',
              boxShadow: '0 0 14px rgba(226,45,45,0.35)',
            }}
          >
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          {!collapsed && (
            <div className="flex items-baseline gap-0 leading-none">
              <span className="font-black text-[19px] tracking-tight text-foreground">
                Mega
              </span>
              <span className="font-black text-[19px] tracking-tight ml-1.5" style={{ color: '#e22d2d' }}>
                IELTS
              </span>
            </div>
          )}
        </Link>

        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              "hidden md:flex items-center justify-center rounded-lg transition-all shrink-0",
              "w-7 h-7 opacity-50 hover:opacity-100 hover:bg-muted",
              collapsed && "absolute -right-3 top-4 border border-border shadow-lg z-50 h-6 w-6 rounded-full bg-background"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <PanelLeftOpen className="h-3.5 w-3.5" />
              : <PanelLeftClose className="h-3.5 w-3.5" />
            }
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn("flex-1 overflow-y-auto py-2", collapsed ? "px-2" : "px-3")}>
        <SectionLabel>Main</SectionLabel>
        <div className="space-y-0.5">
          {mainNav.map(renderNavItem)}
        </div>

        <SectionLabel>Practice</SectionLabel>
        <div className="space-y-0.5">
          {practiceNav.map(renderNavItem)}
        </div>

        {isAdmin && (
          <>
            <SectionLabel>Admin</SectionLabel>
            <div className="space-y-0.5">
              {renderNavItem({ name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck })}
            </div>
          </>
        )}
      </nav>

      {/* ── Upgrade to Premium Banner ── */}
      {!user?.isPremium && !collapsed && (
        <div className="mx-3 mb-3">
          <Link href="/dashboard/premium">
            <div
              className="relative overflow-hidden rounded-2xl p-4 cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.48 0.20 300))',
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />

              <div className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shrink-0">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white leading-tight">
                    Go Premium
                  </p>
                  <p className="text-[10px] text-white/70 leading-snug mt-0.5">
                    Unlock all tests & AI features
                  </p>
                </div>
              </div>

              <div className="relative mt-3 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                  Upgrade Now
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Divider ── */}
      <div className="mx-3 h-px bg-border/50" />

      {/* ── Bottom Section ── */}
      <div ref={settingsRef} className={cn("py-3 pb-6 shrink-0", collapsed ? "px-2" : "px-3")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            {showSettings && (
              <div className="flex flex-col items-center gap-2 mb-2 p-2 rounded-xl border border-border bg-popover animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-lg">
                <LanguageSelector position="top" />
                <ThemeToggle />
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
              className={cn(
                "flex items-center justify-center h-9 w-9 rounded-xl transition-all",
                showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Settings className="h-4 w-4" />
            </button>
            {user ? (
              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <Link
                href="/login"
                title="Log In / Sign Up"
                className="flex items-center justify-center h-9 w-9 rounded-xl transition-all border border-border text-muted-foreground hover:bg-muted"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <>
            {user ? (
              <>
                {/* User profile card */}
                <div
                  onClick={() => router.push('/dashboard/profile')}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2 cursor-pointer transition-all border border-border/50 hover:border-border hover:bg-muted/50"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.65 0.2 300))' }}
                  >
                    {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate text-foreground">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] truncate text-muted-foreground">
                      {user?.isPremium ? "Premium Account" : "Free Plan"}
                    </p>
                  </div>
                </div>

                {/* Settings panel */}
                {showSettings && (
                  <div className="mb-2 p-2 rounded-xl border border-border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-muted/30">
                    <span className="text-xs font-semibold pl-1 text-foreground">Settings</span>
                    <div className="flex gap-2">
                      <LanguageSelector position="top" />
                      <ThemeToggle />
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between px-1 mt-1">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-xl transition-all",
                      showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>

                  <button
                    onClick={logout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-xs">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                {showSettings && (
                  <div className="mb-2 p-2 rounded-xl border border-border flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 bg-muted/30">
                    <div className="flex w-full items-center justify-between px-1">
                      <span className="text-xs font-semibold text-foreground">Settings</span>
                      <button onClick={() => setShowSettings(false)} className="text-muted-foreground hover:text-primary">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex gap-2 w-full justify-center">
                      <LanguageSelector position="top" />
                      <ThemeToggle />
                    </div>
                  </div>
                )}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all bg-primary text-primary-foreground hover:opacity-90"
                >
                  <User className="h-4 w-4" />
                  <span>Log In / Sign Up</span>
                </Link>
                <div className="flex items-center justify-center mt-1">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-xl transition-all",
                      showSettings ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                    title="Settings"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
