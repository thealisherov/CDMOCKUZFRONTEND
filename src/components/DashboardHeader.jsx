"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame, Bell, Search, ChevronDown, LogOut,
  User, Settings, Crown, Moon, Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch streak
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data: stats } = await supabase
          .from("user_stats")
          .select("daily_streak")
          .eq("user_id", session.user.id)
          .single();

        if (stats?.daily_streak) {
          setStreak(stats.daily_streak);
        }
      } catch (err) {
        console.error("Error fetching streak:", err);
      }
    };
    fetchStreak();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b px-6 backdrop-blur-xl"
      style={{
        background: isDark
          ? 'oklch(0.15 0.03 260 / 0.85)'
          : 'oklch(0.985 0.002 240 / 0.85)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground hover:border-border transition-colors w-64">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="text"
            placeholder="Search tests, modules..."
            className="bg-transparent text-sm font-medium outline-none w-full placeholder:text-muted-foreground/60"
          />
          <kbd className="hidden lg:flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground/50 border border-border/50 rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Streak counter */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Flame className="h-4 w-4 text-orange-500" fill="currentColor" />
            </motion.div>
            <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
              {streak}
            </span>
            <span className="text-[10px] font-semibold text-orange-500/70 dark:text-orange-400/60 uppercase tracking-wider hidden sm:inline">
              Day{streak !== 1 ? "s" : ""}
            </span>
          </motion.div>
        )}

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted transition-all text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isDark ? "sun" : "moon"}
                initial={{ y: -10, opacity: 0, rotate: -90 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: 10, opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                {isDark
                  ? <Sun className="h-4 w-4" />
                  : <Moon className="h-4 w-4" />
                }
              </motion.div>
            </AnimatePresence>
          </button>
        )}

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-destructive border-2 border-background" />
        </button>

        {/* User dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={cn(
              "flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl border transition-all",
              dropdownOpen
                ? "border-primary/30 bg-primary/5"
                : "border-border/50 hover:border-border hover:bg-muted/50"
            )}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.65 0.2 300))',
              }}
            >
              {userInitial}
            </div>
            <span className="text-sm font-semibold text-foreground hidden sm:inline max-w-[100px] truncate">
              {userName}
            </span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block",
              dropdownOpen && "rotate-180"
            )} />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-popover shadow-xl overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "guest@example.com"}</p>
                  {user?.isPremium && (
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/premium"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    {user?.isPremium ? "Manage Plan" : "Upgrade"}
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/support"); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    Settings
                  </button>
                </div>

                {/* Sign out */}
                <div className="border-t border-border py-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
