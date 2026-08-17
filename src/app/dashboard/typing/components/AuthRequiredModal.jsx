"use client";

import Link from "next/link";
import { Sparkles, X, ArrowRight, ShieldCheck, LogIn, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthRequiredModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md rounded-[2.5rem] bg-card border border-border/80 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Glow backdrop */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-indigo-500/25 via-purple-500/25 to-pink-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Sparkles / Auth Icon */}
          <div className="relative mx-auto my-4 w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-800 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Sparkles className="w-10 h-10" />
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Tizimga kirish talab qilinadi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Typing mashqlarini bajarish, WPM tezlikni hisoblash, reytingda qatnashish va natijalaringizni saqlash uchun profilingizga kiring.
            </p>
          </div>

          {/* Features list */}
          <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/60 text-left space-y-2 text-xs font-semibold text-foreground">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Shaxsiy WPM va aniqlik natijalarini saqlash</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Umumiy Leaderboard reytingida o&apos;rin egallash</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>XP to&apos;plash va maxsus yutuq (Badge) larni yutish</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Link href="/login?next=/dashboard/typing" className="w-full">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Tizimga Kirish <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/register" className="w-full">
              <button
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-muted hover:bg-muted/80 text-foreground font-bold text-xs sm:text-sm border border-border/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Ro&apos;yxatdan o&apos;tish
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
