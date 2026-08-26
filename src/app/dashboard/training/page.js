"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Headphones, BookOpen, PenTool, ArrowRight, Sparkles,
  Clock, CheckCircle2, Zap, Play, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/components/LanguageContext";

export default function TrainingPage() {
  const { t } = useTranslation();
  const tp = t?.trainingPage || {};

  const modules = [
    {
      id: "listening",
      title: tp.listening?.title || "Listening Practice",
      subtitle: tp.listening?.subtitle || "Sectional & Complete Audio Tests",
      description: tp.listening?.desc || "Practice part-by-part or full listening sections with real audio recordings, instant grading, and detailed explanations.",
      icon: Headphones,
      href: "/dashboard/listening",
      bgGradient: "from-indigo-600 via-indigo-700 to-purple-800",
      badge: tp.listening?.badge || "Audio Tracks",
      stats: [
        { label: tp.listening?.stat1Label || "Sections", value: tp.listening?.stat1Val || "Part 1 — 4" },
        { label: tp.listening?.stat2Label || "Format", value: tp.listening?.stat2Val || "Multi-Type" },
        { label: tp.listening?.stat3Label || "Grading", value: tp.listening?.stat3Val || "Instant" }
      ],
      features: [
        tp.listening?.f1 || "Part-by-part & full listening practice",
        tp.listening?.f2 || "Real native speaker audio recordings",
        tp.listening?.f3 || "Instant band score and detailed answers"
      ],
      btnText: tp.listening?.btn || "Enter Listening Practice"
    },
    {
      id: "reading",
      title: tp.reading?.title || "Reading Practice",
      subtitle: tp.reading?.subtitle || "Passage-by-Passage & Full Sets",
      description: tp.reading?.desc || "Practice single passages or full 3-passage tests with academic texts, authentic question types, and split-screen interface.",
      icon: BookOpen,
      href: "/dashboard/reading",
      bgGradient: "from-emerald-600 via-teal-700 to-slate-900",
      badge: tp.reading?.badge || "Passage Analysis",
      stats: [
        { label: tp.reading?.stat1Label || "Passages", value: tp.reading?.stat1Val || "Single & Full" },
        { label: tp.reading?.stat2Label || "Questions", value: tp.reading?.stat2Val || "All Types" },
        { label: tp.reading?.stat3Label || "Interface", value: tp.reading?.stat3Val || "Split View" }
      ],
      features: [
        tp.reading?.f1 || "Single passages and complete mock tests",
        tp.reading?.f2 || "Split-screen comfortable reading layout",
        tp.reading?.f3 || "True/False, Headings, Matching question types"
      ],
      btnText: tp.reading?.btn || "Enter Reading Practice"
    },
    {
      id: "writing",
      title: tp.writing?.title || "Writing Practice",
      subtitle: tp.writing?.subtitle || "Task 1 & 2 with AI Evaluation",
      description: tp.writing?.desc || "Write Task 1 (Reports/Charts) and Task 2 (Essays) with timed exam conditions and receive in-depth AI  feedback.",
      icon: PenTool,
      href: "/dashboard/writing",
      bgGradient: "from-amber-600 via-orange-700 to-red-900",
      badge: tp.writing?.badge || "AI Evaluated",
      stats: [
        { label: tp.writing?.stat1Label || "Tasks", value: tp.writing?.stat1Val || "Task 1 & 2" },
        { label: tp.writing?.stat2Label || "Feedback", value: tp.writing?.stat2Val || "GPT-4o AI" },
        { label: tp.writing?.stat3Label || "Criteria", value: tp.writing?.stat3Val || "4 Metrics" }
      ],
      features: [
        tp.writing?.f1 || "Task 1 (Charts/Graphs) & Task 2 (Essays)",
        tp.writing?.f2 || "Official 4-criteria IELTS band calculation",
        tp.writing?.f3 || "Grammar, lexical resource & coherence advice"
      ],
      btnText: tp.writing?.btn || "Enter Writing Practice"
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300">
      
      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 border border-indigo-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-72 h-72 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
            <Target className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            {tp.badge || "IELTS Skills Training"}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {tp.title1 || "Select Your"} <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">{tp.titleHighlight || "Training Module"}</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {tp.desc || "Target your specific weak areas with focused Listening, Reading, and Writing practice. Practice single parts, individual passages, or complete tests to boost your IELTS band score."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-indigo-200">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{tp.tag1 || "Section & Full Tests"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>{tp.tag2 || "Instant AI Feedback"}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>{tp.tag3 || "Real Exam Simulation"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3 Big Training Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modules.map((mod, index) => {
          const Icon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group relative flex flex-col rounded-3xl bg-card border border-border overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300"
            >
              {/* Card Header with Thematic Gradient */}
              <div className={cn("relative p-6 sm:p-7 text-white bg-gradient-to-br", mod.bgGradient)}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[11px] font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {mod.title}
                </h3>
                <p className="text-xs text-white/80 mt-1 font-medium">
                  {mod.subtitle}
                </p>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-6 flex flex-col justify-between space-y-6">
                
                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {mod.description}
                </p>

                {/* Mini Stats Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-muted/60 border border-border/80 text-center">
                  {mod.stats.map((s, sIdx) => (
                    <div key={sIdx} className="space-y-0.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase">{s.label}</p>
                      <p className="text-xs font-black text-foreground">{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Features List */}
                <div className="space-y-2">
                  {mod.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-foreground/80 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Action Link Button */}
                <Link
                  href={mod.href}
                  className="mt-auto w-full inline-flex items-center justify-between px-5 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold text-xs shadow-md group-hover:opacity-95 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {mod.btnText}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
