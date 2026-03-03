"use client";

import { useState, useMemo } from "react";
import {
  Search, ChevronDown, BookOpen, Headphones, PenTool,
  Clock, FileText, Play, RotateCcw, Star, Lock, Gift,
  Zap, TrendingUp, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = ["All Levels", "Easy", "Medium", "Hard"];
const TYPE_OPTIONS  = ["All Types", "Full Test", "Section", "Part"];
const TAB_OPTIONS   = [
  { key: "all",     label: "All Tests" },
  { key: "free",    label: "Free" },
  { key: "premium", label: "Premium" },
];

const MODULE_META = {
  reading:   { icon: BookOpen,   color: "oklch(0.55 0.2 240)",  glow: "oklch(0.55 0.2 240 / 0.2)",  bg: "oklch(0.55 0.2 240 / 0.07)",  label: "Reading" },
  listening: { icon: Headphones, color: "oklch(0.52 0.2 170)",  glow: "oklch(0.52 0.2 170 / 0.2)",  bg: "oklch(0.52 0.2 170 / 0.07)",  label: "Listening" },
  writing:   { icon: PenTool,    color: "oklch(0.6 0.2 60)",    glow: "oklch(0.6 0.2 60 / 0.2)",    bg: "oklch(0.6 0.2 60 / 0.07)",    label: "Writing" },
};

const LEVEL_STYLE = {
  easy:   { dot: "oklch(0.55 0.16 145)", text: "oklch(0.45 0.14 145)", bg: "oklch(0.55 0.16 145 / 0.1)",  border: "oklch(0.55 0.16 145 / 0.25)", label: "Easy" },
  medium: { dot: "oklch(0.72 0.17 80)",  text: "oklch(0.58 0.15 80)",  bg: "oklch(0.72 0.17 80 / 0.1)",   border: "oklch(0.72 0.17 80 / 0.25)",  label: "Medium" },
  hard:   { dot: "oklch(0.55 0.22 25)",  text: "oklch(0.45 0.2 25)",   bg: "oklch(0.55 0.22 25 / 0.1)",   border: "oklch(0.55 0.22 25 / 0.25)",  label: "Hard" },
};

const TEST_TYPE_LABEL = {
  full_test: "Full Test",
  section_1: "Section 1", section_2: "Section 2",
  section_3: "Section 3", section_4: "Section 4",
  part_1: "Part 1", part_2: "Part 2", part_3: "Part 3",
};

function FilterDropdown({ options, value, onChange }) {
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
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
        style={{ color: 'var(--muted-foreground)' }} />
    </div>
  );
}

export default function TestListLayout({ title, description, tests = [], moduleType = "reading", renderTestItem }) {
  const [activeTab,    setActiveTab]    = useState("all");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [levelFilter,  setLevelFilter]  = useState("All Levels");
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
    if (levelFilter !== "All Levels") {
      result = result.filter(t => (t.level || t.difficulty || '').toLowerCase() === levelFilter.toLowerCase());
    }
    if (typeFilter !== "All Types") {
      const typeMap = { "Full Test": "full_test", "Section": "section", "Part": "part" };
      const mapped = typeMap[typeFilter];
      if (mapped) result = result.filter(t => (t.testType || '').toLowerCase().startsWith(mapped));
    }
    return result;
  }, [tests, activeTab, searchQuery, levelFilter, typeFilter]);

  const freeCount    = tests.filter(t => t.access === "free").length;
  const premiumCount = tests.filter(t => t.access === "premium").length;

  return (
    <div className="space-y-6 max-w-5xl">

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

        {/* Stats pill */}
        <div
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: meta.color }} />
          <span style={{ color: 'var(--foreground)' }}>{tests.length} Tests Available</span>
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
            placeholder="Search tests..."
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
          <FilterDropdown options={LEVEL_OPTIONS} value={levelFilter} onChange={setLevelFilter} />
          <FilterDropdown options={TYPE_OPTIONS}  value={typeFilter}  onChange={setTypeFilter}  />
        </div>
      </div>

      {/* ── Results count ── */}
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
          {filteredTests.length === tests.length
            ? `All ${tests.length} tests`
            : `${filteredTests.length} of ${tests.length} tests`}
        </h2>
        {(searchQuery || levelFilter !== "All Levels" || typeFilter !== "All Types") && (
          <button
            onClick={() => { setSearchQuery(""); setLevelFilter("All Levels"); setTypeFilter("All Types"); }}
            className="text-xs px-2 py-0.5 rounded-full font-medium transition-colors"
            style={{ color: meta.color, background: meta.bg }}
          >
            Clear filters
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
            <p className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>No tests found</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
              Try adjusting your filters or search query.
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
                : <DefaultTestItem test={test} moduleType={moduleType} meta={meta} />
              }
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DefaultTestItem({ test, moduleType, meta }) {
  const levelKey   = (test.level || test.difficulty || '').toLowerCase();
  const levelStyle = LEVEL_STYLE[levelKey] || {};

  return (
    <div
      className="group flex items-center justify-between p-5 transition-all duration-200"
      style={{ background: 'transparent' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--muted)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Left — info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
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
                <Gift className="w-2.5 h-2.5" /> Free
              </span>
            )}

            {test.access === "premium" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.72 0.17 80 / 0.1)', color: 'oklch(0.55 0.15 80)', border: '1px solid oklch(0.72 0.17 80 / 0.25)' }}>
                <Star className="w-2.5 h-2.5" /> Premium
              </span>
            )}

            {test.completed && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'oklch(0.52 0.16 145 / 0.1)', color: 'oklch(0.42 0.14 145)', border: '1px solid oklch(0.52 0.16 145 / 0.25)' }}>
                ✓ Done
              </span>
            )}
          </div>

          {/* Description */}
          {test.description && (
            <p className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>{test.description}</p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
            {levelKey && levelStyle.label && (
              <span
                className="flex items-center gap-1.5 font-semibold px-2 py-0.5 rounded-full"
                style={{ background: levelStyle.bg, color: levelStyle.text, border: `1px solid ${levelStyle.border}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: levelStyle.dot }} />
                {levelStyle.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {test.duration} min
            </span>
            {test.questions && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" /> {test.questions} Qs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right — CTA */}
      <div className="ml-5 shrink-0">
        {test.access === "premium" ? (
          <button
            disabled
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'oklch(0.72 0.17 80 / 0.08)',
              color: 'oklch(0.55 0.15 80)',
              border: '1px solid oklch(0.72 0.17 80 / 0.3)',
              cursor: 'not-allowed',
            }}
          >
            <Lock className="w-3.5 h-3.5" /> Unlock
          </button>
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
              ? <><RotateCcw className="w-3.5 h-3.5" /> Re-take</>
              : <><Play className="w-3.5 h-3.5 fill-white" /> Start</>
            }
          </a>
        )}
      </div>
    </div>
  );
}

export { DefaultTestItem };
