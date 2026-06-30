"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2, TrendingUp, Globe, ArrowRight,
  Headphones, BookOpen, PenTool, Clock, ChevronRight,
  Sparkles, Target, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

// ── Animation Variants ──
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

// ── Stat Card Component ──
function StatCard({ icon: Icon, label, value, subtitle, gradient, delay = 0 }) {
  return (
    <motion.div
      variants={itemVariants}
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      {/* Gradient accent top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-80"
        style={{ background: gradient }}
      />

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
            {subtitle && (
              <span className="text-xs font-medium text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>
        <div
          className="flex items-center justify-center w-11 h-11 rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: gradient, opacity: 0.15 }}
        >
          <Icon className="h-5 w-5" style={{ color: gradient.includes('270') ? 'var(--primary)' : gradient.includes('145') ? 'oklch(0.52 0.16 145)' : 'oklch(0.65 0.2 40)' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Test Card Component ──
const typeConfig = {
  listening: {
    icon: Headphones,
    color: "oklch(0.55 0.22 270)",
    bg: "oklch(0.55 0.22 270 / 0.1)",
    label: "Listening",
  },
  reading: {
    icon: BookOpen,
    color: "oklch(0.52 0.16 145)",
    bg: "oklch(0.52 0.16 145 / 0.1)",
    label: "Reading",
  },
  writing: {
    icon: PenTool,
    color: "oklch(0.65 0.2 40)",
    bg: "oklch(0.65 0.2 40 / 0.1)",
    label: "Writing",
  },
};

function PracticeTestCard({ title, type, duration, progress = 0, href, index }) {
  const config = typeConfig[type] || typeConfig.reading;
  const Icon = config.icon;

  return (
    <motion.div variants={itemVariants}>
      <Link href={href}>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
          {/* Type badge + duration */}
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style={{ background: config.bg, color: config.color }}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {duration} min
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Progress</span>
              <span className="font-semibold tabular-nums" style={{ color: config.color }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Arrow */}
          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
            Continue <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Quick Action Card ──
function QuickAction({ icon: Icon, title, description, href, gradient }) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={href}>
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5 cursor-pointer">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
            style={{ background: gradient, opacity: 0.15 }}
          >
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h4 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          <ArrowRight className="h-4 w-4 mt-3 text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1" />
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main Dashboard Page ──
export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ testsCompleted: 0, avgBand: 0, globalRank: 0 });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  // Fetch stats and recent test activity
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user?.id) {
          setLoading(false);
          return;
        }

        const userId = session.user.id;

        // 1. Fetch user stats (for tests_taken, daily_streak)
        const { data: userStats } = await supabase
          .from("user_stats")
          .select("tests_taken, xp, daily_streak")
          .eq("user_id", userId)
          .maybeSingle();

        // 2. Fetch all attempts to calculate average band score
        const { data: allAttempts } = await supabase
          .from("TestAttempts")
          .select("band_score")
          .eq("user_id", userId);

        let calculatedAvgBand = "0.0";
        if (allAttempts && allAttempts.length > 0) {
          const validScores = allAttempts
            .map((a) => parseFloat(a.band_score))
            .filter((score) => !isNaN(score) && score > 0);
          if (validScores.length > 0) {
            const sum = validScores.reduce((acc, curr) => acc + curr, 0);
            calculatedAvgBand = (sum / validScores.length).toFixed(1);
          }
        }

        // 3. Fetch rank from leaderboard API
        let currentUserRank = "—";
        try {
          const res = await fetch("/api/leaderboard");
          if (res.ok) {
            const leaderboardData = await res.json();
            currentUserRank = leaderboardData?.currentUser?.rank || "—";
          }
        } catch (rankErr) {
          console.error("Error fetching leaderboard rank:", rankErr);
        }

        setStats({
          testsCompleted: userStats?.tests_taken || allAttempts?.length || 0,
          avgBand: calculatedAvgBand,
          globalRank: currentUserRank,
        });

        // 4. Fetch recent test attempts (max 6) for "Continue Practicing"
        const { data: attempts } = await supabase
          .from("TestAttempts")
          .select("id, test_numeric_id, test_type, test_title, band_score, completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(6);

        if (attempts && attempts.length > 0) {
          const testCards = attempts.map((sub) => {
            const bandVal = parseFloat(sub.band_score);
            const progressPct = !isNaN(bandVal) ? Math.min(Math.round((bandVal / 9) * 100), 100) : 0;
            return {
              id: sub.id,
              title: sub.test_title || `${sub.test_type?.charAt(0).toUpperCase() + sub.test_type?.slice(1)} Test #${sub.test_numeric_id}`,
              type: sub.test_type || "reading",
              duration: sub.test_type === "listening" ? 30 : 60,
              progress: progressPct,
              href: `/dashboard/${sub.test_type || "reading"}`,
            };
          });
          setRecentTests(testCards);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fallback test cards for new users
  const defaultTests = [
    { id: 1, title: "Academic Reading Practice", type: "reading", duration: 60, progress: 0, href: "/dashboard/reading" },
    { id: 2, title: "Listening Comprehension", type: "listening", duration: 30, progress: 0, href: "/dashboard/listening" },
    { id: 3, title: "Writing Task 1 & 2", type: "writing", duration: 60, progress: 0, href: "/dashboard/writing" },
    { id: 4, title: "Reading: Passage Analysis", type: "reading", duration: 60, progress: 0, href: "/dashboard/reading" },
    { id: 5, title: "Listening: Section Practice", type: "listening", duration: 30, progress: 0, href: "/dashboard/listening" },
    { id: 6, title: "Writing: Essay Practice", type: "writing", duration: 60, progress: 0, href: "/dashboard/writing" },
  ];

  const testsToShow = recentTests.length > 0 ? recentTests : defaultTests;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* ── Welcome Section ── */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {greeting}, {userName}! 👋
          </h1>
        </div>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
          Let&apos;s get that <span className="font-semibold text-primary">Band 8.0</span> today. Pick up where you left off or start something new.
        </p>
      </motion.div>

      {/* ── Progress Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={CheckCircle2}
          label="Tests Completed"
          value={loading ? "—" : stats.testsCompleted}
          gradient="linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.65 0.2 300))"
        />
        <StatCard
          icon={TrendingUp}
          label="Average Band Score"
          value={loading ? "—" : stats.avgBand}
          subtitle="/ 9.0"
          gradient="linear-gradient(135deg, oklch(0.52 0.16 145), oklch(0.58 0.18 160))"
        />
        <StatCard
          icon={Globe}
          label="Global Rank"
          value={loading ? "—" : stats.globalRank === "—" ? "—" : `#${stats.globalRank}`}
          gradient="linear-gradient(135deg, oklch(0.65 0.2 40), oklch(0.7 0.18 60))"
        />
      </div>

      {/* ── Continue Practicing ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Continue Practicing</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pick up where you left off</p>
          </div>
          <Link
            href="/dashboard/reading"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {testsToShow.map((test, idx) => (
            <PracticeTestCard key={test.id} {...test} index={idx} />
          ))}
        </div>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-lg font-bold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={BookOpen}
            title="Reading Practice"
            description="Academic passages with timed questions"
            href="/dashboard/reading"
            gradient="linear-gradient(135deg, oklch(0.52 0.16 145), oklch(0.58 0.18 160))"
          />
          <QuickAction
            icon={Headphones}
            title="Listening Practice"
            description="Audio-based comprehension tests"
            href="/dashboard/listening"
            gradient="linear-gradient(135deg, oklch(0.55 0.22 270), oklch(0.65 0.2 300))"
          />
          <QuickAction
            icon={PenTool}
            title="Writing Practice"
            description="Task 1 & 2 with AI evaluation"
            href="/dashboard/writing"
            gradient="linear-gradient(135deg, oklch(0.65 0.2 40), oklch(0.7 0.18 60))"
          />
          <QuickAction
            icon={Target}
            title="Leaderboard"
            description="See how you rank globally"
            href="/dashboard/leaderboard"
            gradient="linear-gradient(135deg, oklch(0.6 0.2 330), oklch(0.65 0.18 350))"
          />
        </div>
      </motion.div>

      {/* ── Daily Tip Section ── */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-primary/3 translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-start gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 shrink-0">
            <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground mb-1">💡 Daily Tip</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              For Reading section — always skim the passage first, identify keywords in the questions,
              then scan for specific answers. This can save you up to 5 minutes per passage!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
