"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Crown, Lock, Sparkles,
  Check, Copy, BookMarked, HelpCircle, Flame, Share2, Layers, Bookmark
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import ArticleExercises from "./ArticleExercises";

const CATEGORY_GRADIENTS = {
  Society: "from-blue-900 via-indigo-950 to-slate-950",
  Technology: "from-purple-900 via-violet-950 to-slate-950",
  Environment: "from-emerald-900 via-teal-950 to-slate-950",
  Education: "from-amber-900 via-orange-950 to-slate-950",
  Health: "from-rose-900 via-pink-950 to-slate-950",
  Economy: "from-cyan-900 via-blue-950 to-slate-950",
  "Travel & Culture": "from-fuchsia-900 via-purple-950 to-slate-950"
};

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const isPremiumUser = !!user?.isPremium || user?.user_metadata?.role === "admin";

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(17); // px
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedWord, setCopiedWord] = useState(null);
  const [activeTab, setActiveTab] = useState("content"); // content, vocabulary, exercises
  const [readMode, setReadMode] = useState("study"); // study, exam

  const validExercises = useMemo(() => {
    return (article?.exercises || []).filter(
      ex => ex && Array.isArray(ex.questions) && ex.questions.length > 0
    );
  }, [article?.exercises]);

  const validVocabulary = useMemo(() => {
    return article?.vocabulary || [];
  }, [article?.vocabulary]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}`);
      const data = await res.json();
      if (res.ok) {
        setArticle(data.article);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Error fetching article:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedWord(text);
    setTimeout(() => setCopiedWord(null), 2000);
  };

  // Custom Markdown renderer with rich bold styling
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const sections = content.split('\n\n');

    return sections.map((sec, idx) => {
      const trimmed = sec.trim();
      if (!trimmed) return null;

      // H3 or H2 Header
      if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
        const titleText = trimmed.replace(/^(###|##)\s+/, '');
        return (
          <div key={idx} className="mt-8 mb-4 pt-4 border-t border-border/70 first:mt-0 first:pt-0 first:border-0">
            <h3 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-primary shrink-0" />
              <span>{titleText}</span>
            </h3>
          </div>
        );
      }

      // Format bold text **bold**
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p
          key={idx}
          className="w-full text-foreground/90 leading-relaxed sm:leading-8 my-4 font-normal text-left block"
          style={{ fontSize: `${fontSize}px` }}
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              const boldWord = part.slice(2, -2);
              return (
                <strong
                  key={pIdx}
                  className={cn(
                    "font-bold px-1.5 py-0.5 rounded-md inline transition-all",
                    readMode === "study"
                      ? "text-primary bg-primary/10 shadow-2xs"
                      : "text-foreground font-semibold"
                  )}
                >
                  {boldWord}
                </strong>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 space-y-6 animate-pulse px-4">
        <div className="w-32 h-8 bg-muted rounded-xl" />
        <div className="w-full h-64 bg-muted rounded-3xl" />
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-4 bg-muted rounded w-4/5" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 px-4">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/40" />
        <h2 className="text-xl font-bold">Article not found</h2>
        <p className="text-sm text-muted-foreground">
          The article you are looking for might have been moved or removed.
        </p>
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
      </div>
    );
  }

  const isLocked = article.locked && !isPremiumUser;

  return (
    <div className="w-full min-h-screen pb-24 px-2 sm:px-4">
      
      {/* ── Reading Progress Bar ── */}
      <div
        className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* ── Top Header Navigation & Controls ── */}
      <div className="w-full max-w-4xl mx-auto py-4 flex items-center justify-between gap-4">
        <Link
          href="/dashboard/articles"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Topics</span>
        </Link>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          {/* Font Size Adjuster */}
          <div className="flex items-center bg-card border border-border rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setFontSize(s => Math.max(14, s - 1))}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold"
              title="Decrease text size"
            >
              A-
            </button>
            <span className="text-[11px] font-bold px-1.5 text-muted-foreground">
              {fontSize}px
            </span>
            <button
              onClick={() => setFontSize(s => Math.min(24, s + 1))}
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-bold"
              title="Increase text size"
            >
              A+
            </button>
          </div>

          {/* Read Mode Toggle */}
          <button
            onClick={() => setReadMode(m => m === "study" ? "exam" : "study")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all border shadow-xs",
              readMode === "exam"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            )}
            title="Toggle Exam Focus Mode"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{readMode === "exam" ? "Exam Mode" : "Study Mode"}</span>
          </button>
        </div>
      </div>

      {/* ── Main Article Container ── */}
      <div className="w-full max-w-4xl mx-auto space-y-8 mt-2">
        
        {/* Article Meta Hero Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {article.category || "IELTS Essay"}
            </span>
            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
              {article.level || "B2-C1 Band 7.5+"}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              {article.read_time || "4 min read"}
            </span>
            {article.is_free ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                FREE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px] flex items-center gap-1">
                <Crown className="w-3 h-3" />
                PREMIUM
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* ── View Switcher Navigation Tabs ── */}
        <div className="flex items-center gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border/80 w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === "content"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>Essay & Reading</span>
          </button>

          {validVocabulary.length > 0 && (
            <button
              onClick={() => setActiveTab("vocabulary")}
              className={cn(
                "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "vocabulary"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Key Vocabulary ({validVocabulary.length})</span>
            </button>
          )}

          {validExercises.length > 0 && (
            <button
              onClick={() => setActiveTab("exercises")}
              className={cn(
                "flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                activeTab === "exercises"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <HelpCircle className="w-4 h-4 text-indigo-500" />
              <span>Exercises ({validExercises.length})</span>
            </button>
          )}
        </div>

        {/* ── Dynamic Tab Content ── */}

        {/* 1. Essay & Reading View */}
        {activeTab === "content" && (
          <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
            <div className="w-full rounded-3xl bg-card border border-border/80 p-6 sm:p-10 shadow-xs relative overflow-hidden">
              
              {/* Essay Content Render */}
              <div className="w-full text-foreground">
                {renderFormattedContent(article.content)}
              </div>

              {/* ── Paywall Blocker Overlay ── */}
              {isLocked && (
                <div className="relative mt-8 pt-12 text-center rounded-2xl bg-gradient-to-t from-card via-card/95 to-transparent border-t border-amber-500/20 p-6 space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-foreground">
                      Unlock Full Article with Premium
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Upgrade your account to read the complete text, unlock all vocabulary terms, and solve IELTS practice exercises.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard/premium")}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white text-xs font-extrabold shadow-lg hover:opacity-95 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Actions Banner (Vocabulary & Interactive Exercises) */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.vocabulary && article.vocabulary.length > 0 && (
                <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        Review Topic Vocabulary
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {article.vocabulary.length} academic terms extracted.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("vocabulary");
                      window.scrollTo({ top: 250, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold transition-all border border-border"
                  >
                    View Vocabulary List
                  </button>
                </div>
              )}

              {validExercises.length > 0 && (
                <div className="p-6 rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-primary/10 to-purple-500/10 border border-primary/30 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        Practice Questions & Gap Filling
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {validExercises.length} interactive exercises with instant feedback.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab("exercises");
                      window.scrollTo({ top: 250, behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-extrabold shadow-sm hover:opacity-90 transition-all"
                  >
                    Start Practice Exercises ({validExercises.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Key Topic Vocabulary View */}
        {activeTab === "vocabulary" && (
          <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
            <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <BookMarked className="w-5 h-5 text-primary" />
                  <h3 className="font-extrabold text-base text-foreground">
                    Key Vocabulary & Collocations
                  </h3>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {article.vocabulary?.length || 0} terms
                </span>
              </div>

              {article.vocabulary && article.vocabulary.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {article.vocabulary.map((item, vIdx) => {
                    const word = typeof item === "string" ? item : (item.word || "");
                    const meaning = typeof item === "object" ? (item.meaning || item.definition || "") : "";
                    const type = typeof item === "object" ? (item.type || "") : "";
                    
                    return (
                      <div
                        key={vIdx}
                        className="p-4 rounded-2xl bg-muted/40 border border-border hover:border-primary/50 transition-all space-y-1.5 group flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-foreground group-hover:text-primary transition-colors">
                              {word}
                            </span>
                            {type && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold uppercase">
                                {type}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(word)}
                            className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copy word"
                          >
                            {copiedWord === word ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {meaning && (
                          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                            {meaning}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic text-center py-8">
                  No vocabulary extracted for this topic.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. Interactive Practice Exercises View */}
        {activeTab === "exercises" && validExercises.length > 0 && (
          <ArticleExercises
            exercises={validExercises}
            vocabulary={validVocabulary}
          />
        )}

        {/* Master IELTS Reading Callout Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-primary/10 via-indigo-500/5 to-purple-500/10 border border-primary/20 text-center space-y-2">
          <Sparkles className="w-6 h-6 mx-auto text-primary" />
          <h4 className="font-bold text-sm text-foreground">
            Master IELTS Reading & Vocabulary
          </h4>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Review this article regularly to retain band 7.5+ academic collocations and essay arguments in your active memory.
          </p>
        </div>
      </div>
    </div>
  );
}
