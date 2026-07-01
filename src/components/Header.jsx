"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Flame, Bell, Search, ChevronDown, LogOut, User, Settings, Crown,
  Moon, Sun, Menu, X, BookOpen, Headphones, PenTool, Lock, Sparkles, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/components/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Button } from "@/components/ui/button";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  // Fetch user daily streak
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        if (!user?.id) return;
        const supabase = createClient();

        const { data: stats } = await supabase
          .from("user_stats")
          .select("daily_streak")
          .eq("user_id", user.id)
          .maybeSingle();

        if (stats?.daily_streak) {
          setStreak(stats.daily_streak);
        }
      } catch (err) {
        console.error("Error fetching streak:", err);
      }
    };
    if (pathname?.startsWith("/dashboard")) {
      fetchStreak();
    }
  }, [pathname, user]);

  // Click outside to close dropdown
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
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const userInitial = userName.charAt(0).toUpperCase();

  // If we are in the Dashboard context, render the Dashboard Header variant
  if (pathname?.startsWith("/dashboard")) {
    return (
      <header
        className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b px-6 backdrop-blur-xl"
        style={{
          background: isDark
            ? 'oklch(0.15 0.03 260 / 0.85)'
            : 'oklch(0.985 0.002 240 / 0.85)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Left section: Empty placeholder to keep right-aligned layout */}
        <div className="flex items-center gap-4" />

        {/* Right Section: Stats, Theme, Lang, Dropdown */}
        <div className="flex items-center gap-3">
          {/* Streak Counter 🔥 */}
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-950 bg-orange-50/50 dark:bg-orange-950/20"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame className="h-4.5 w-4.5 text-orange-500 fill-orange-500" />
              </motion.div>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {streak} Days
              </span>
            </motion.div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User profile dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                "flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border transition-all",
                dropdownOpen
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-border hover:bg-muted/50"
              )}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--primary), #6366f1)',
                }}
              >
                {userInitial}
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:inline max-w-[100px] truncate">
                {userName}
              </span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 hidden sm:block",
                dropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-popover shadow-xl overflow-hidden z-50 p-1.5"
                >
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="text-xs font-bold text-foreground truncate">{userName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    {user?.isPremium && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <Crown className="w-3 h-3 fill-amber-500 text-amber-500" /> Premium Member
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/profile"); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    My Profile
                  </button>

                  <button
                    onClick={() => { setDropdownOpen(false); router.push("/dashboard/premium"); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded-xl text-foreground hover:bg-muted transition-colors"
                  >
                    <Crown className="h-4 w-4 text-muted-foreground" />
                    {user?.isPremium ? "Manage Plan" : "Upgrade Plan"}
                  </button>

                  <div className="h-px bg-border my-1" />

                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    );
  }

  // Classic Landing/Public Page Header variant
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl select-none">
          <span className="font-black text-[20px] tracking-tight text-foreground">Mega</span>
          <span className="font-black text-[20px] tracking-tight text-primary">IELTS</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
          <Link href="#features" className="hover:text-primary transition-colors">
            {t("nav.why")}
          </Link>
          <Link href="#about" className="hover:text-primary transition-colors">
            {t("nav.about")}
          </Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">
            {t("nav.pricing")}
          </Link>
          
          <div className="relative group py-2 z-[100]">
            <Link href="/dashboard" className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-medium">
              Tests
              <ChevronDown size={14} className="mt-0.5 group-hover:rotate-180 transition-transform duration-200" />
            </Link>
            <div className="absolute top-[80%] left-1/2 -translate-x-1/2 w-[500px] bg-background border rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] p-4">
              <div className="grid grid-cols-2 gap-3">
                <Link href="/dashboard/reading" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-blue-100/80 text-blue-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-blue-900/30 dark:text-blue-400">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Reading Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Read academic texts and answer question types.</p>
                  </div>
                </Link>

                <Link href="/dashboard/writing" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-emerald-100/80 text-emerald-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-emerald-900/30 dark:text-emerald-400">
                    <PenTool size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Writing Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Write essays and get instant AI evaluation.</p>
                  </div>
                </Link>

                <Link href="/dashboard/listening" className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group/item">
                  <div className="bg-purple-100/80 text-purple-600 p-2.5 rounded-lg group-hover/item:scale-105 transition-transform dark:bg-purple-900/30 dark:text-purple-400">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5 text-foreground group-hover/item:text-primary transition-colors">Listening Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Answer questions from audio clips.</p>
                  </div>
                </Link>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-transparent cursor-not-allowed">
                  <div className="bg-muted/80 text-muted-foreground p-2.5 rounded-lg mt-0.5">
                    <Lock size={20} />
                  </div>
                  <div className="flex-1 mt-0.5">
                    <h4 className="font-semibold text-sm mb-0.5 text-muted-foreground">Speaking Test</h4>
                    <p className="text-[11px] text-muted-foreground leading-snug">Coming Soon - Practice real interview questions with our advanced AI examiner.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ThemeToggle />
          <LanguageSelector />
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">{t("nav.getStarted")}</Button>
          </Link>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSelector />
          <ThemeToggle />
          <button
            className="p-2 text-muted-foreground hover:text-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 flex flex-col gap-4 shadow-lg animate-in slide-in-from-top-2">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.why")}
          </Link>
          <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.about")}
          </Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
            {t("nav.pricing")}
          </Link>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Tests</span>
            <div className="flex flex-col pl-4 gap-3">
              <Link href="/dashboard/reading" className="text-sm hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Reading</Link>
              <Link href="/dashboard/listening" className="text-sm hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Listening</Link>
              <Link href="/dashboard/writing" className="text-sm hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>Writing</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start">{t("nav.login")}</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-start">{t("nav.getStarted")}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
