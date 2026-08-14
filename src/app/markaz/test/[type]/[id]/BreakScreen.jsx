"use client";

import { useEffect, useState } from "react";
import { Clock, ArrowRight, Sparkles, Headphones, BookOpen, PenLine, Coffee } from "lucide-react";

const SECTION_META = {
  listening: { label: "Listening bo'limi", icon: Headphones, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  reading:   { label: "Reading bo'limi",   icon: BookOpen,   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  writing:   { label: "Writing bo'limi",   icon: PenLine,    color: "text-purple-400",  bg: "bg-purple-500/10 border-purple-500/20" },
};

/**
 * 1 daqiqalik tanaffus ekrani (iStudy dan boshqa barcha markazlar uchun).
 * 60 soniya sanaydi, tugagach avtomatik keyingi bo'limga o'tadi.
 * Xohlagan vaqtda "Kutmasdan boshlash" tugmasi bilan to'g'ridan-to'g'ri o'tish mumkin.
 */
export default function BreakScreen({ section, sectionLabel, onContinue }) {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onContinue();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onContinue]);

  const meta = SECTION_META[section] || {
    label: sectionLabel || "Keyingi bo'lim",
    icon: Clock,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
  };
  const Icon = meta.icon;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  // Progress percentage (60s -> 0s)
  const progress = ((60 - timeLeft) / 60) * 100;
  const strokeDashoffset = 440 - (440 * (60 - timeLeft)) / 60;

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col items-center justify-center p-4 sm:p-6 text-white select-none">
      {/* ── Main Card ────────────────────────────────────────────── */}
      <div className="w-full max-w-lg bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-2xl backdrop-blur-md">
        {/* Next Section Pill */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border mb-6 ${meta.bg} ${meta.color}`}>
          <Icon className="w-4 h-4" />
          <span>Keyingi: {meta.label}</span>
        </div>

        {/* Circular Countdown */}
        <div className="relative w-44 h-44 flex items-center justify-center my-2">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-zinc-800"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated countdown ring */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="text-indigo-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Clock */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow">
              {formattedTime}
            </span>
            <span className="text-[11px] text-zinc-400 uppercase tracking-widest font-semibold mt-1">
              Tanaffus vaqti
            </span>
          </div>
        </div>

        {/* Title and message */}
        <h2 className="text-xl sm:text-2xl font-bold mt-6 text-white">
          Biroz dam oling va tayyorlaning
        </h2>
        <p className="text-sm text-zinc-400 mt-2 max-w-sm leading-relaxed">
          Nafas oling va diqqatingizni jamlang. Vaqt tugagach{" "}
          <span className="text-indigo-400 font-semibold">{meta.label}</span> avtomatik boshlanadi.
        </p>

        {/* Action button: Skip break */}
        <button
          onClick={onContinue}
          className="mt-8 w-full flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Kutmasdan boshlash</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-zinc-500 text-xs mt-3">
          Istalgan vaqtda keyingi bo'limga o'tishingiz mumkin
        </p>
      </div>
    </div>
  );
}
