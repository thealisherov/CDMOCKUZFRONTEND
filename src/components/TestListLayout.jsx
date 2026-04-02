"use client";

import { useState, useMemo } from "react";
import {
  Search, ChevronDown, BookOpen, Headphones, PenTool,
  Clock, FileText, Play, RotateCcw, Star, Lock, Gift,
  Zap, TrendingUp, Filter, BarChart3, Share2, Check
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";
import { useAuth } from "@/hooks/useAuth";

const MODULE_META = {
  reading:   { icon: BookOpen,   color: "oklch(0.55 0.2 240)",  glow: "oklch(0.55 0.2 240 / 0.2)",  bg: "oklch(0.55 0.2 240 / 0.07)",  label: "Reading" },
  listening: { icon: Headphones, color: "oklch(0.52 0.2 170)",  glow: "oklch(0.52 0.2 170 / 0.2)",  bg: "oklch(0.52 0.2 170 / 0.07)",  label: "Listening" },
  writing:   { icon: PenTool,    color: "oklch(0.6 0.2 60)",    glow: "oklch(0.6 0.2 60 / 0.2)",    bg: "oklch(0.6 0.2 60 / 0.07)",    label: "Writing" },
};

const TEST_TYPE_LABEL = {
  full_test: "Full Test",
  section_1: "Section 1", section_2: "Section 2",
  section_3: "Section 3", section_4: "Section 4",
  part_1: "Part 1", part_2: "Part 2", part_3: "Part 3", part_4: "Part 4",
  passage_1: "Passage 1", passage_2: "Passage 2", passage_3: "Passage 3",
  task_1: "Task 1", task_2: "Task 2",
};

function FilterDropdown({ options, value, onChange, t }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 text-sm font-medium rounded-xl border transition-all focus:outline-none focus:ring-2 cursor-pointer"
        style={{
          background: 'var(--card)',
          borderColor: 'var(--border)',
          color: 'var(--foreground)',
          focusRingColor: 'var(--primary)',
        }}
      >
        {options.map((opt) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
        style={{ color: 'var(--muted-foreground)' }} />
    </div>
  );
}

export default function TestListLayout({ title, description, tests = [], moduleType = "reading", renderTestItem }) {
  const { t } = useTranslation();
  const { user } = useAuth();

  const TYPE_OPTIONS = [
    { val: "All Types", label: t("testList.allTypes", { defaultValue: "All Types" }) },
    { val: "Full Test", label: t("testList.fullTest", { defaultValue: "Full Test" }) },
    { val: "Part / Section", label: "Part / Section" },
    { val: "Passage", label: "Passage" },
    { val: "Task", label: "Task" }
  ];

  const TAB_OPTIONS = [
    { key: "all", label: t("testList.allTests") },
    { key: "free", label: t("testList.free") },
    { key: "premium", label: t("testList.premium") },
  ];

  const [activeTab,    setActiveTab]    = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [typeFilter,   setTypeFilter]   = useState("All Types");

  const meta = MODULE_META[moduleType] || MODULE_META.reading;
  const Icon = meta.icon;

  const filteredTests = useMemo(() => {
    let result = tests;
    if (activeTab === "free")    result = result.filter(t => t.access === "free");
    if (activeTab === "premium") result = result.filter(t => t.access === "premium");
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    if (typeFilter !== "All Types") {
      const typeMap = { 
        "Full Test": "full_test", 
        "Part / Section": ["section", "part"], 
        "Passage": "passage",
        "Task": "task"
      };
      const mapped = typeMap[typeFilter];
      if (Array.isArray(mapped)) {
        result = result.filter(t => mapped.some(m => (t.testType || '').toLowerCase().startsWith(m)));
      } else if (mapped) {
        result = result.filter(t => (t.testType || '').toLowerCase().startsWith(mapped));
      }
    }

    // Sort: Free tests first for non-premium users
    return [...result].sort((a, b) => {
      if (!user?.isPremium) {
        if (a.access === "free" && b.access === "premium") return -1;
        if (a.access === "premium" && b.access === "free") return 1;
      }
      return 0;
    });
  }, [tests, activeTab, searchQuery, typeFilter, user?.isPremium]);

  const freeCount    = tests.filter(t => t.access === "free").length;
  const premiumCount = tests.filter(t => t.access === "premium").length;

  return (
    <div className="space-y-6 w-full">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {/* Module icon */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color.replace(')', ' / 0.7)')})`,
              boxShadow: `0 8px 24px ${meta.glow}`,
            }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
              {title}
            </h1>
            {description && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
            )}
          </div>
        </div>

        {/* Stats and extra options */}
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/${moduleType}/attempts`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
          >
            <BarChart3 className="w-4 h-4" style={{ color: meta.color }} />
            {t("testList.yourAttempts")}
          </Link>
          <div
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: meta.color }} />
            <span style={{ color: 'var(--foreground)' }}>{tests.length} {t("testList.testsAvailable")}</span>
          </div>
        </div>
      </div>

      {/* ── Mobile Warning Alert ── */}
      <div className="block sm:hidden bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3 my-4">
        <svg className="w-6 h-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
            {t("testList.mobileWarningTitle") || "Diqqat!"}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {t("testList.mobileWarningDesc") || "Bu testdan o'tish uchun kompyuter yoki noutbuk orqali kiring. Telefon orqali test ishlash imkoni yo'q."}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex p-1 rounded-xl gap-1"
        style={{ background: 'var(--muted)' }}
      >
        {TAB_OPTIONS.map((tab) => {
          const count = tab.key === 'free' ? freeCount : tab.key === 'premium' ? premiumCount : tests.length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
              )}
              style={activeTab === tab.key ? {
                background: 'var(--card)',
                color: meta.color,
                boxShadow: '0 2px 8px oklch(0 0 0 / 0.08)',
              } : {
                color: 'var(--muted-foreground)',
              }}
            >
              {tab.key === "free"    && <Gift    className="w-3.5 h-3.5" />}
              {tab.key === "premium" && <Star    className="w-3.5 h-3.5" />}
              {tab.key === "all"     && <Zap     className="w-3.5 h-3.5" />}
              {tab.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                style={activeTab === tab.key
                  ? { background: meta.bg, color: meta.color }
                  : { background: 'var(--border)', color: 'var(--muted-foreground)' }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search + Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'var(--muted-foreground)' }}
          />
          <input
            type="text"
            placeholder={t("testList.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
        </div>

        {/* Filter icon */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <FilterDropdown options={TYPE_OPTIONS}  value={typeFilter}  onChange={setTypeFilter}  t={t} />
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          {filteredTests.length === tests.length
            ? t("testList.allTestsCount").replace("count", tests.length)
            : t("testList.filteredTestsCount").replace("filtered", filteredTests.length).replace("total", tests.length)}
        </h2>
        {(searchQuery || typeFilter !== "All Types") && (
          <button
            onClick={() => { setSearchQuery(""); setTypeFilter("All Types"); }}
            className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
            style={{ color: meta.color, background: meta.bg }}
          >
            {t("testList.clearFilters", { defaultValue: "Clear filters" })}
          </button>
        )}
      </div>

      {/* ── Test List ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
      >
        {filteredTests.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: meta.bg }}
            >
              <Icon className="w-7 h-7" style={{ color: meta.color }} />
            </div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
              {t("testList.noResults")}
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              {t("testList.noResultsDesc")}
            </p>
          </div>
        ) : (
          filteredTests.map((test, index) => (
            <div
              key={test.id}
              style={index > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
            >
              {renderTestItem
                ? renderTestItem(test)
                : <DefaultTestItem test={test} moduleType={moduleType} meta={meta} t={t} user={user} />
              }
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ShareButton({ test, moduleType }) {
  const [shared, setShared] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard/${moduleType}/${test.id}`;
    const shareData = {
      title: test.title,
      text: `IELTS ${moduleType.charAt(0).toUpperCase() + moduleType.slice(1)} Test — ${test.title}`,
      url,
    };
    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      }
    } catch {
      // user cancelled or not supported — fallback
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {}
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Share test"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: 10,
        border: '1.5px solid var(--border)',
        background: shared ? 'oklch(0.52 0.16 145 / 0.1)' : 'var(--card)',
        color: shared ? 'oklch(0.42 0.14 145)' : 'var(--muted-foreground)',
        cursor: 'pointer',
        transition: 'all 0.18s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!shared) {
          e.currentTarget.style.borderColor = 'var(--primary)';
          e.currentTarget.style.color = 'var(--primary)';
        }
      }}
      onMouseLeave={e => {
        if (!shared) {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.color = 'var(--muted-foreground)';
        }
      }}
    >
      {shared
        ? <Check  className="w-4 h-4" />
        : <Share2 className="w-4 h-4" />}
    </button>
  );
}

function DefaultTestItem({ test, moduleType, meta, t, user }) {
  const isLocked = test.access === "premium" && !user?.isPremium;

  return (
    <div
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 transition-all duration-200 gap-4 sm:gap-0"
      style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Left — info */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full">
        {/* Number badge */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
          style={{ background: meta.bg, color: meta.color }}
        >
          #{test.id}
        </div>

        <div className="min-w-0 space-y-1.5">
          {/* Title + badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[15px] leading-tight" style={{ color: 'var(--foreground)' }}>
              {test.title}
            </h3>

            {test.testType && (
              <span
                className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: meta.bg, color: meta.color }}
              >
                {TEST_TYPE_LABEL[test.testType] || test.testType}
              </span>
            )}

            {test.access === "free" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.52 0.16 145 / 0.1)', color: 'oklch(0.42 0.14 145)', border: '1px solid oklch(0.52 0.16 145 / 0.25)' }}>
                <Gift className="w-2.5 h-2.5" /> {t("testList.free")}
              </span>
            )}

            {test.access === "premium" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.72 0.17 80 / 0.1)', color: 'oklch(0.55 0.15 80)', border: '1px solid oklch(0.72 0.17 80 / 0.25)' }}>
                <Star className="w-2.5 h-2.5" /> {t("testList.premium")}
              </span>
            )}

            {test.completed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.52 0.16 145 / 0.1)', color: 'oklch(0.42 0.14 145)', border: '1px solid oklch(0.52 0.16 145 / 0.25)' }}>
                ✓ {t("testList.done")}{test.bestBand ? ` · ${test.bestBand}` : ''}
              </span>
            )}
          </div>

          {/* Description */}
          {test.description && (
            <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{test.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {test.duration} {t("testList.min")}
            </span>
            {test.questions && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {test.questions} {moduleType === "writing" ? (t("testList.tasks") || "Tasks") : (t("testList.qs") || "Qs")}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right — Share + CTA */}
      <div className="w-full sm:w-auto sm:ml-5 shrink-0 flex items-center justify-between sm:justify-end gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0" style={{ borderColor: 'var(--border)' }}>
        <ShareButton test={test} moduleType={moduleType} />
        {isLocked ? (
          <Link
            href={!user ? "/login" : "/dashboard/payment"}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: 'oklch(0.72 0.17 80 / 0.08)',
              color: 'oklch(0.55 0.15 80)',
              border: '1px solid oklch(0.72 0.17 80 / 0.3)',
            }}
          >
            <Lock className="w-3.5 h-3.5" /> {t("testList.locked")}
          </Link>
        ) : (
          <a
            href={`/dashboard/${moduleType}/${test.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={test.completed ? {
              background: 'transparent',
              color: meta.color,
              border: `1.5px solid ${meta.color}`,
            } : {
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color.replace(')', ' / 0.8)')})`,
              color: '#fff',
              boxShadow: `0 4px 16px ${meta.glow}`,
            }}
            onMouseEnter={e => {
              if (!test.completed) e.currentTarget.style.opacity = '0.88';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {test.completed
              ? <><RotateCcw className="w-3.5 h-3.5" /> {t("testList.retake")}</>
              : <><Play className="w-3.5 h-3.5 fill-white" /> {t("testList.startTest")}</>
            }
          </a>
        )}
      </div>
    </div>
  );
}

export { DefaultTestItem };
