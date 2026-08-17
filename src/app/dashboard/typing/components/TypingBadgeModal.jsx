"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, Zap, Flame, Rocket, Crown, Target, Crosshair, Timer, Sparkles, X, CheckCircle2 } from "lucide-react";

const ICON_MAP = {
  Zap,
  Flame,
  Rocket,
  Crown,
  Target,
  Crosshair,
  Timer,
  Award,
  Sparkles
};

export default function TypingBadgeModal({ badge, onClose }) {
  if (!badge) return null;

  const IconComp = ICON_MAP[badge.icon] || Award;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-[2.5rem] bg-card border border-border/80 shadow-2xl p-6 sm:p-8 text-center overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Background glowing particles */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-tr from-amber-400/20 via-orange-500/20 to-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Badge icon with animations */}
          <div className="relative mx-auto my-6 w-28 h-28 flex items-center justify-center">
            {/* Pulsing ring */}
            <motion.div
              animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 blur-md opacity-50"
            />
            
            <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-white flex items-center justify-center shadow-xl shadow-orange-500/30">
              <IconComp className="w-12 h-12" strokeWidth={2.2} />
            </div>

            {/* Sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-2 border-2 border-dashed border-amber-300/40 rounded-full pointer-events-none"
            />
          </div>

          {/* Badge Content */}
          <div className="space-y-2 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
              <Sparkles className="w-3.5 h-3.5" /> Yangi Yutuq Ochildi!
            </span>
            <h3 className="text-2xl font-black text-foreground tracking-tight pt-1">
              {badge.name}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed px-2">
              {badge.description}
            </p>
          </div>

          {/* XP Celebration banner */}
          <div className="mt-6 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2 text-xs font-bold">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>+50 Bonus XP profilingizga qo&apos;shildi!</span>
          </div>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 cursor-pointer"
          >
            Ajoyib, davom etamiz!
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
