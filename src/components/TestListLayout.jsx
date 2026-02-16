"use client";

import { useState, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_OPTIONS = ["All Levels", "Easy", "Medium", "Hard"];
const TYPE_OPTIONS = ["All Types", "Full Test", "Section", "Part"];
const TAB_OPTIONS = [
  { key: "all", label: "All Tests" },
  { key: "free", label: "Free" },
  { key: "premium", label: "Premium" },
];

function FilterDropdown({ label, options, value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-background border rounded-lg px-3 py-2 pr-8 text-sm font-medium text-foreground cursor-pointer hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export default function TestListLayout({ 
  title, 
  description, 
  tests = [], 
  moduleType = "reading",
  renderTestItem 
}) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [typeFilter, setTypeFilter] = useState("All Types");


  const filteredTests = useMemo(() => {
    let result = tests;

    // Tab filter
    if (activeTab === "free") {
      result = result.filter((t) => t.access === "free");
    } else if (activeTab === "premium") {
      result = result.filter((t) => t.access === "premium");
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // Level filter
    if (levelFilter !== "All Levels") {
      result = result.filter((t) => (t.level || t.difficulty || '').toLowerCase() === levelFilter.toLowerCase());
    }

    // Type filter (full_test, section, part)
    if (typeFilter !== "All Types") {
      const typeMap = { "Full Test": "full_test", "Section": "section", "Part": "part" };
      const mapped = typeMap[typeFilter];
      if (mapped) {
        result = result.filter((t) => (t.testType || '').toLowerCase().startsWith(mapped));
      }
    }

    return result;
  }, [tests, activeTab, searchQuery, levelFilter, typeFilter]);

  return (
    <div className="space-y-0">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* Tabs: All Tests | Free | Premium */}
      <div className="flex border-b mb-6">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 text-center py-3 text-sm font-medium transition-all border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            )}
          >
            {tab.key === "free" && <span className="mr-1">🎁</span>}
            {tab.key === "premium" && <span className="mr-1">🔒</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <FilterDropdown label="Level" options={LEVEL_OPTIONS} value={levelFilter} onChange={setLevelFilter} />
        <FilterDropdown label="Type" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
      </div>

      {/* Test Count */}
      <div className="mb-4">
        <h2 className="text-lg font-bold">Choose a test</h2>
        <p className="text-sm text-muted-foreground">{filteredTests.length} tests</p>
      </div>

      {/* Test List */}
      <div className="space-y-0 border rounded-lg overflow-hidden">
        {filteredTests.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-medium">No tests found</p>
            <p className="text-sm mt-1">Try changing your filters or search query.</p>
          </div>
        ) : (
          filteredTests.map((test, index) => (
            <div key={test.id} className={cn(index > 0 && "border-t")}>
              {renderTestItem ? renderTestItem(test) : <DefaultTestItem test={test} moduleType={moduleType} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function DefaultTestItem({ test, moduleType }) {
  const levelValue = (test.level || test.difficulty || '').toLowerCase();
  const difficultyColor = {
    easy: "text-green-600",
    medium: "text-yellow-600",
    hard: "text-red-600",
  };

  const testTypeLabel = {
    full_test: "Full Test",
    section_1: "Section 1",
    section_2: "Section 2",
    section_3: "Section 3",
    section_4: "Section 4",
    part_1: "Part 1",
    part_2: "Part 2",
    part_3: "Part 3",
  };

  return (
    <div className="flex items-center justify-between p-5 bg-card hover:bg-secondary/30 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-base">{test.title}</h3>
          {test.testType && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
              {testTypeLabel[test.testType] || test.testType}
            </span>
          )}
          {test.access === "free" && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              🎁 Free
            </span>
          )}
          {test.access === "premium" && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              🔒 Premium
            </span>
          )}
          {test.completed && (
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ✓ Completed
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{test.description}</p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span className={cn("font-semibold uppercase flex items-center gap-1", difficultyColor[levelValue] || "")}>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current"></span>
            {levelValue.charAt(0).toUpperCase() + levelValue.slice(1)}
          </span>
          <span className="flex items-center gap-1">⏱ {test.duration} minutes</span>
          {test.questions && <span className="flex items-center gap-1">📝 {test.questions} questions</span>}
        </div>
      </div>

      <a
        href={`/dashboard/${moduleType}/${test.id}`}
        className={cn(
          "ml-4 shrink-0 inline-flex items-center justify-center rounded-lg px-5 py-2 text-sm font-medium transition-colors",
          test.completed
            ? "border border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        )}
      >
        {test.completed ? "Re-do test" : "Start test"}
      </a>
    </div>
  );
}

export { DefaultTestItem };
