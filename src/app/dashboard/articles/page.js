"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, Sparkles, Crown, Lock, Clock, ArrowRight,
  Filter, CheckCircle2, ChevronRight, X, Layers, Flame, BookMarked
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "All",
  "Society",
  "Technology",
  "Environment",
  "Education",
  "Health",
  "Economy",
  "Travel & Culture"
];

const CATEGORY_GRADIENTS = {
  Society: "from-blue-600 via-indigo-700 to-slate-900",
  Technology: "from-violet-600 via-purple-700 to-slate-900",
  Environment: "from-emerald-600 via-teal-700 to-slate-900",
  Education: "from-amber-600 via-orange-700 to-slate-900",
  Health: "from-rose-600 via-pink-700 to-slate-900",
  Economy: "from-cyan-600 via-blue-700 to-slate-900",
  "Travel & Culture": "from-fuchsia-600 via-purple-700 to-slate-900"
};

export default function ArticlesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isPremiumUser = !!user?.isPremium || user?.user_metadata?.role === "admin";

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [accessFilter, setAccessFilter] = useState("all"); // all, free, premium
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [selectedLockedArticle, setSelectedLockedArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, [page, selectedCategory, search]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12"
      });
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (search.trim()) params.set("q", search.trim());

      const res = await fetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
        setCategoryCounts(data.categories || {});
      }
    } catch (err) {
      console.error("Error loading articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleArticleClick = (article, e) => {
    if (article.locked && !isPremiumUser) {
      e.preventDefault();
      setSelectedLockedArticle(article);
      setShowPaywallModal(true);
    }
  };

  const filteredArticles = articles.filter(a => {
    if (accessFilter === "free") return a.is_free;
    if (accessFilter === "premium") return !a.is_free;
    return true;
  });

  return (
    <div className="w-full min-h-screen pb-16 space-y-8 animate-in fade-in duration-300">
      
      {/* ── Hero Section (Light & Dark mode compatible) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-6 sm:p-10 shadow-sm">
        {/* Ambient background glow & shapes */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary shadow-xs">
            <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
            <span>IELTS Band 7.5+ Academic Articles & Vocabulary</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
            Boost Your Vocabulary & <span className="text-primary underline decoration-primary/40 decoration-wavy underline-offset-8">Essay Ideas</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Explore 130+ curated IELTS topics with bolded academic collocations, topic-specific vocabulary lists, and practice exercises designed to sharpen your reading & writing performance.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-muted/80 px-3.5 py-2 rounded-xl border border-border text-foreground shadow-xs">
              <BookMarked className="w-4 h-4 text-primary shrink-0" />
              <span>{totalCount || 139} IELTS Topics</span>
            </div>
            <div className="flex items-center gap-2 bg-muted/80 px-3.5 py-2 rounded-xl border border-border text-foreground shadow-xs">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Key Collocations & Vocabulary</span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>3 Free Articles for Everyone</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics (e.g. Urbanization, AI, Climate)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Access filter (All, Free, Premium) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border w-full sm:w-auto">
            <button
              onClick={() => setAccessFilter("all")}
              className={cn(
                "flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
                accessFilter === "all" ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Topics
            </button>
            <button
              onClick={() => setAccessFilter("free")}
              className={cn(
                "flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                accessFilter === "free" ? "bg-emerald-500 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
              Free Only
            </button>
            <button
              onClick={() => setAccessFilter("premium")}
              className={cn(
                "flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
                accessFilter === "premium" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Crown className="w-3 h-3 text-yellow-200" />
              Premium
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] ?? 0;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={cn(
                  "px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card hover:bg-muted text-muted-foreground border-border"
                )}
              >
                <span>{cat}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Articles Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-card border border-border animate-pulse p-4 space-y-4">
              <div className="w-full h-40 bg-muted rounded-2xl" />
              <div className="w-2/3 h-5 bg-muted rounded-lg" />
              <div className="w-full h-12 bg-muted rounded-lg" />
              <div className="w-1/3 h-4 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-3xl border border-border p-8 space-y-4">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <h3 className="text-lg font-bold">No articles found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
              setAccessFilter("all");
            }}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article, index) => {
            const isLocked = article.locked && !isPremiumUser;
            return (
              <motion.div
                key={article.id || article.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className="group relative flex flex-col rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all duration-300"
              >
                {/* Cover Image & Badges */}
                <div className="relative w-full h-48 overflow-hidden bg-slate-900">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br transition-all duration-300 group-hover:scale-105",
                      CATEGORY_GRADIENTS[article.category] || "from-indigo-600 via-slate-800 to-slate-900"
                    )}>
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20 shadow-inner">
                        <BookOpen className="w-6 h-6 text-white/90" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-white/80 line-clamp-1">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top Left: Category & Level */}
                  <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/10">
                      {article.category}
                    </span>
                    <span className="px-2 py-1 rounded-xl text-[10px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/10">
                      {article.level}
                    </span>
                  </div>

                  {/* Top Right: Free or PRO Badge */}
                  <div className="absolute top-3.5 right-3.5">
                    {article.is_free ? (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-emerald-500 text-white shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        FREE
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                        <Crown className="w-3 h-3 text-yellow-200" />
                        PRO
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Details */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-[11px] font-medium text-white/80">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-white/70" />
                      <span>{article.read_time}</span>
                    </div>
                    {isLocked && (
                      <div className="flex items-center gap-1 text-amber-300 font-semibold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Premium Only</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Article Card Content */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Action Link / Button */}
                  <Link
                    href={`/dashboard/articles/${article.slug}`}
                    onClick={(e) => handleArticleClick(article, e)}
                    className={cn(
                      "mt-auto flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold transition-all",
                      isLocked
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20"
                        : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                    )}
                  >
                    <span>{isLocked ? "Unlock Full Article" : "Read Article"}</span>
                    {isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    )}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-bold px-3 text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold border border-border bg-card disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Premium Paywall Modal ── */}
      <AnimatePresence>
        {showPaywallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaywallModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 sm:p-8 space-y-6 z-10 overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowPaywallModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-foreground">
                    Unlock Premium Articles
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Get unlimited access to all 60+ IELTS academic topics
                  </p>
                </div>
              </div>

              {selectedLockedArticle && (
                <div className="p-3.5 rounded-2xl bg-muted/60 border border-border text-xs space-y-1">
                  <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                    Selected Topic
                  </span>
                  <p className="font-bold text-foreground line-clamp-1">
                    {selectedLockedArticle.title}
                  </p>
                </div>
              )}

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full access to 65+ Band 7.5+ IELTS Reading Articles</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Highlighted Academic Collocations & Vocabulary lists</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive Fill-in-the-blanks and Collocation exercises</span>
                </div>
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full Mock Tests, AI Speaking & Writing evaluations</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => router.push("/dashboard/premium")}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                </button>
                <button
                  onClick={() => setShowPaywallModal(false)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
