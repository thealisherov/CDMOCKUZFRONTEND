"use client";

import Link from "next/link";
import { Crown, Sparkles, Lock, X, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DailyLimitBadge({ remainingToday, dailyLimit, isPremium, onOpenModal }) {
  if (isPremium) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs">
        <Crown className="w-3.5 h-3.5 fill-amber-500" />
        <span>Cheksiz mashqlar (Premium)</span>
      </div>
    );
  }

  const isExhausted = remainingToday <= 0;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
        isExhausted
          ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400"
          : "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300"
      }`}>
        <Zap className={`w-3.5 h-3.5 ${isExhausted ? "text-red-500" : "text-amber-500 fill-amber-500"}`} />
        <span>Bugungi urinishlar: {remainingToday}/{dailyLimit || 3}</span>
      </div>

      <button
        onClick={onOpenModal}
        className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
      >
        <Crown className="w-3 h-3" /> Cheksiz qilish →
      </button>
    </div>
  );
}

export function DailyLimitModal({ isOpen, onClose }) {
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
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-amber-400/25 via-orange-500/25 to-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Crown Icon */}
          <div className="relative mx-auto my-4 w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Crown className="w-10 h-10 fill-white" />
          </div>

          <div className="space-y-2 relative z-10">
            <h3 className="text-2xl font-black text-foreground tracking-tight">
              Kunlik Bepul Mashqlar Tugadi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bepul tarifda kuniga 3 tagacha mashq bajarish mumkin. Cheklovsiz typing va boshqa barcha imkoniyatlardan foydalanish uchun Premiumga o&apos;ting!
            </p>
          </div>

          {/* Premium features checklist */}
          <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border/60 text-left space-y-2.5 text-xs font-semibold text-foreground">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Cheksiz Monkeytype tez yozish mashqlari</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Barcha Reading & Listening to&apos;liq testlari</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Writing insholarini sun&apos;iy intellekt orqali tekshirish</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Leaderboardda rasmiy reyting va barcha badgeler</span>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/dashboard/payment" className="w-full">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> Premium Tarifga O&apos;tish <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={onClose}
              className="py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Ertaga davom ettiraman
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
