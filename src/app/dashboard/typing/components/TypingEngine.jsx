"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Timer, FileText, Zap, Target, RotateCcw, ArrowRight,
  Flame, Award, Sparkles, BarChart2, ShieldAlert,
  ChevronRight, CheckCircle2, XCircle, AlertCircle, Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import TypingBadgeModal from "./TypingBadgeModal";
import { DailyLimitModal } from "./DailyLimitNotice";
import AuthRequiredModal from "./AuthRequiredModal";

// ═══════════════════════════════════════════════════════════════
// WPM HISOBLASH UTILITY — yagona manba, barcha joyda ishlatiladi
// Formula: WPM = (to'g'ri_harflar / 5) / minutlar
// 5 harf = 1 so'z (standart Monkeytype formulasi)
// ═══════════════════════════════════════════════════════════════
function computeTypingMetrics(correctChars, totalChars, elapsedSeconds) {
  // Minimum 1 sekund — 0 ga bo'lishni oldini olish
  const safeSeconds = Math.max(1, elapsedSeconds);
  const minutes = safeSeconds / 60;

  // Net WPM (faqat to'g'ri harflar), Raw WPM (barcha harflar)
  const netWpm = Math.min(300, Math.max(0, Math.round((correctChars / 5) / minutes)));
  const grossWpm = Math.min(300, Math.max(0, Math.round((totalChars / 5) / minutes)));
  const accuracy = totalChars > 0
    ? Math.round((correctChars / totalChars) * 1000) / 10
    : 100;

  return { netWpm, grossWpm, accuracy };
}

export default function TypingEngine({ userStatus, onStatsUpdated }) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Config state (English only)
  const [mode, setMode] = useState("time"); // 'time' | 'words'
  const [modeValue, setModeValue] = useState(30); // 15, 30, 60, 120 or 10, 25, 50, 100
  const [difficulty, setDifficulty] = useState("medium"); // 'easy' | 'medium' | 'hard'

  // Typing session state
  const [currentTextId, setCurrentTextId] = useState(null);
  const [targetText, setTargetText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // 'idle' | 'running' | 'finished'
  const [isFocused, setIsFocused] = useState(true);
  const [loadingText, setLoadingText] = useState(true);
  const [noTextsAvailable, setNoTextsAvailable] = useState(false);

  // Timers & Metrics
  const [timeLeft, setTimeLeft] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [rawWpm, setRawWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [correctChars, setCorrectChars] = useState(0);
  const [incorrectChars, setIncorrectChars] = useState(0);

  // Result state
  const [resultData, setResultData] = useState(null);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // DOM & State Refs (Prevents any stale closure bugs!)
  const inputRef = useRef(null);
  const textContainerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const userInputRef = useRef("");
  const targetTextRef = useRef("");
  const statusRef = useRef("idle");
  const startTimeRef = useRef(null);
  const modeRef = useRef("time");
  const modeValueRef = useRef(30);
  const currentTextIdRef = useRef(null);
  const userStatusRef = useRef(userStatus);

  // Synchronize refs with state
  useEffect(() => { userInputRef.current = userInput; }, [userInput]);
  useEffect(() => { targetTextRef.current = targetText; }, [targetText]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { startTimeRef.current = startTime; }, [startTime]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { modeValueRef.current = modeValue; }, [modeValue]);
  useEffect(() => { currentTextIdRef.current = currentTextId; }, [currentTextId]);
  useEffect(() => { userStatusRef.current = userStatus; }, [userStatus]);

  // 1. Matnni serverdan yuklash
  const loadText = useCallback(async () => {
    setLoadingText(true);
    setNoTextsAvailable(false);
    try {
      const res = await fetch(`/api/typing/texts?lang=en&difficulty=${difficulty}`);
      const json = await res.json();
      const textsList = json.texts || [];

      if (textsList.length === 0) {
        const fallbackRes = await fetch(`/api/typing/texts?lang=en`);
        const fallbackJson = await fallbackRes.json();
        const fallbackList = fallbackJson.texts || [];

        if (fallbackList.length === 0) {
          setNoTextsAvailable(true);
          setTargetText("");
          setCurrentTextId(null);
          setLoadingText(false);
          return;
        }

        const randomIndex = Math.floor(Math.random() * fallbackList.length);
        prepareTextContent(fallbackList[randomIndex].content, fallbackList[randomIndex].id);
      } else {
        const randomIndex = Math.floor(Math.random() * textsList.length);
        prepareTextContent(textsList[randomIndex].content, textsList[randomIndex].id);
      }
    } catch {
      setNoTextsAvailable(true);
      setTargetText("");
    } finally {
      setLoadingText(false);
    }
  }, [difficulty, mode, modeValue]);

  const prepareTextContent = (content, id) => {
    let chosenText = (content || "").trim();

    if (mode === "words") {
      const wordsArr = chosenText.split(/\s+/).filter(Boolean);
      if (wordsArr.length < modeValue) {
        let expanded = [...wordsArr];
        while (expanded.length < modeValue) {
          expanded = expanded.concat(wordsArr);
        }
        chosenText = expanded.slice(0, modeValue).join(" ");
      } else {
        chosenText = wordsArr.slice(0, modeValue).join(" ");
      }
    } else {
      if (modeValue >= 60) {
        const wordsArr = chosenText.split(/\s+/).filter(Boolean);
        let expanded = [...wordsArr];
        while (expanded.length < 250) {
          expanded = expanded.concat(wordsArr);
        }
        chosenText = expanded.join(" ");
      }
    }

    setTargetText(chosenText);
    targetTextRef.current = chosenText;
    setCurrentTextId(id);
    currentTextIdRef.current = id;
    setNoTextsAvailable(false);
  };

  // 2. Restart / Reset funksiyasi
  const handleReset = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setStatus("idle");
    statusRef.current = "idle";
    setUserInput("");
    userInputRef.current = "";
    setStartTime(null);
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setTimeLeft(mode === "time" ? modeValue : 0);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setResultData(null);
    loadText();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 80);
  }, [mode, modeValue, loadText]);

  // Initial mount va rejim o'zgarganda yuklash
  useEffect(() => {
    handleReset();
  }, [handleReset]);

  // 3. Testni yakunlash va Natijani saqlash
  const handleFinish = useCallback(async (forcedDuration) => {
    if (statusRef.current === "finished") return;
    setStatus("finished");
    statusRef.current = "finished";
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const now = Date.now();
    const st = startTimeRef.current;

    // Vaqtni hisoblash:
    // - Time rejimida: forcedDuration (aniq taymer qiymati, masalan 30 sekund)
    // - Words rejimida: haqiqiy o'tgan vaqt (startTime → now)
    // - startTime null bo'lsa: forcedDuration yoki minimal 1 sekund
    let computedDuration;
    if (forcedDuration) {
      computedDuration = forcedDuration;
    } else if (st) {
      computedDuration = Math.max(1, Math.round((now - st) / 1000));
    } else {
      computedDuration = 1; // Hech qachon boshlanmagan — fallback
    }

    const currentInput = userInputRef.current || "";
    const currentTarget = targetTextRef.current || "";

    let correctCount = 0;
    let incorrectCount = 0;

    for (let i = 0; i < currentInput.length; i++) {
      if (currentInput[i] === currentTarget[i]) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    }

    const totalTyped = correctCount + incorrectCount;

    // Agar juda kam harf yozilgan bo'lsa (< 5 ta), saqlamaymiz
    if (totalTyped < 5) {
      setResultData({
        wpm: 0,
        rawWpm: 0,
        accuracy: 0,
        correctChars: correctCount,
        incorrectChars: incorrectCount,
        durationSeconds: computedDuration,
        earnedXp: 0,
        tooShort: true
      });
      return;
    }

    // Yagona WPM hisoblash funksiyasidan foydalanamiz
    const metrics = computeTypingMetrics(correctCount, totalTyped, computedDuration);
    const finalWpm = metrics.netWpm;
    const finalRawWpm = metrics.grossWpm;
    const finalAccuracy = metrics.accuracy;

    const result = {
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      accuracy: finalAccuracy,
      correctChars: correctCount,
      incorrectChars: incorrectCount,
      durationSeconds: computedDuration,
      earnedXp: 15 + Math.floor(finalWpm / 10) * 2 + (finalAccuracy >= 98 ? 10 : 0)
    };

    setResultData(result);

    // Backendga POST /api/typing/attempts jo'natish
    setSubmitting(true);
    try {
      const res = await fetch("/api/typing/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_id: currentTextIdRef.current,
          mode: modeRef.current,
          mode_value: modeValueRef.current,
          wpm: finalWpm,
          raw_wpm: finalRawWpm,
          accuracy: finalAccuracy,
          correct_chars: correctCount,
          incorrect_chars: incorrectCount,
          duration_seconds: computedDuration
        })
      });

      const json = await res.json();

      if (res.status === 403 && json.error === "DAILY_LIMIT_REACHED") {
        setShowLimitModal(true);
        toast.error("Kunlik bepul mashqlar limiti (3 ta) tugadi!");
        return;
      }

      if (json.newlyEarnedBadges && json.newlyEarnedBadges.length > 0) {
        setEarnedBadge(json.newlyEarnedBadges[0]);
      }

      onStatsUpdated?.();
    } catch (err) {
      console.warn("Attempt save error:", err.message);
    } finally {
      setSubmitting(false);
    }
  }, [onStatsUpdated]);

  // 4. Taymer va Live Metrics hisoblash (Interval)
  useEffect(() => {
    if (status !== "running") return;

    timerIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const st = startTimeRef.current || now;
      const elapsed = Math.max(1, Math.floor((now - st) / 1000));
      setElapsedSeconds(elapsed);

      if (modeRef.current === "time") {
        const remaining = Math.max(0, modeValueRef.current - elapsed);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerIntervalRef.current);
          handleFinish(modeValueRef.current);
        }
      }
    }, 200);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, handleFinish]);

  // 5. Harflar kiritilishini boshqarish
  const processKeyInput = useCallback((newValue) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (statusRef.current === "finished" || !targetTextRef.current) return;

    // Birinchi harf kiritilganda taymer boshlanadi
    if (statusRef.current === "idle" && newValue.length > 0) {
      const uStat = userStatusRef.current;
      if (!uStat?.isPremium && uStat?.remainingToday <= 0) {
        setShowLimitModal(true);
        return;
      }

      setStatus("running");
      statusRef.current = "running";
      const now = Date.now();
      setStartTime(now);
      startTimeRef.current = now;
      if (modeRef.current === "time") {
        setTimeLeft(modeValueRef.current);
      }
    }

    // ANTI-CHEAT: bir vaqtda 5 dan ko'p harf qo'shilsa (paste yoki autocomplete) — rad qilish
    const prevLen = userInputRef.current.length;
    const charsAdded = newValue.length - prevLen;
    if (charsAdded > 5) {
      // Paste yoki sun'iy kiritish — faqat oxirgi 1 harf qabul qilinadi
      newValue = userInputRef.current + newValue.charAt(newValue.length - 1);
    }

    setUserInput(newValue);
    userInputRef.current = newValue;

    const currentTarget = targetTextRef.current;
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < newValue.length; i++) {
      if (newValue[i] === currentTarget[i]) {
        correct++;
      } else {
        incorrect++;
      }
    }

    setCorrectChars(correct);
    setIncorrectChars(incorrect);

    // Live WPM — faqat kamida 1 sekund o'tganda hisoblash
    const now = Date.now();
    const st = startTimeRef.current;
    if (st) {
      const elapsedSec = Math.max(1, Math.round((now - st) / 1000));
      const metrics = computeTypingMetrics(correct, correct + incorrect, elapsedSec);
      setWpm(metrics.netWpm);
      setRawWpm(metrics.grossWpm);
      setAccuracy(metrics.accuracy);
    }
    // startTime yo'q bo'lsa WPM 0 qoladi (birinchi harf holatida)

    // Words rejimida matn oxiriga yetganda testni yakunlash
    if (modeRef.current === "words" && newValue.length >= currentTarget.length) {
      handleFinish();
    }
  }, [handleFinish, user]);

  // Global window keydown listener — Monkeytype kabi qayerda bosilsa ham ishlaydi
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Agar modal ochiq bo'lsa yoki finished bo'lsa
      if (statusRef.current === "finished") return;

      if (!user) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setShowAuthModal(true);
        }
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        handleReset();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleReset();
        return;
      }

      // Inputga fokus berish
      if (document.activeElement !== inputRef.current) {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleReset, user]);

  // Belgilarni render qilish uchun array
  const renderedChars = useMemo(() => {
    if (!targetText) return [];
    const chars = [];
    const targetLen = targetText.length;
    const inputLen = userInput.length;

    for (let i = 0; i < targetLen; i++) {
      const char = targetText[i];
      let state = "pending";

      if (i < inputLen) {
        state = userInput[i] === char ? "correct" : "incorrect";
      } else if (i === inputLen) {
        state = "current";
      }

      chars.push({
        index: i,
        char,
        state,
        userChar: i < inputLen ? userInput[i] : null
      });
    }

    return chars;
  }, [targetText, userInput]);

  // Agar bazada umuman matnlar yo'q bo'lsa
  if (noTextsAvailable && !loadingText) {
    return (
      <div className="p-12 text-center rounded-[2.5rem] border border-dashed border-border bg-card shadow-sm max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">Typing matnlari topilmadi</h3>
          <p className="text-xs text-muted-foreground">
            Bazada hali faol matnlar mavjud emas. Admin panel orqali yangi ingliz tili matnlarini kiritishingiz mumkin.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={loadText}
            className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
          >
            Qayta tekshirish
          </button>
          <Link href="/dashboard/admin/typing">
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Admin Panelda matn qo&apos;shish
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* ── 1. Controls / Mode Bar (English only) ── */}
      {status !== "finished" && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-card border border-border shadow-xs text-xs">
          
          {/* Mode switch (Time / Words) */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80 font-bold">
            <button
              onClick={() => { setMode("time"); setModeValue(30); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "time" ? "bg-indigo-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Timer className="w-3.5 h-3.5" /> Time
            </button>
            <button
              onClick={() => { setMode("words"); setModeValue(25); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "words" ? "bg-indigo-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Words
            </button>
          </div>

          {/* Mode values (15/30/60/120s or 10/25/50/100 words) */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80 font-bold">
            {mode === "time" ? (
              [15, 30, 60, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setModeValue(sec)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modeValue === sec ? "bg-indigo-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sec}s
                </button>
              ))
            ) : (
              [10, 25, 50, 100].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setModeValue(cnt)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modeValue === cnt ? "bg-indigo-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cnt}
                </button>
              ))
            )}
          </div>

          {/* Difficulty selection */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/80 font-bold">
              <BarChart2 className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
              {["easy", "medium", "hard"].map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-lg capitalize text-[11px] transition-all cursor-pointer ${
                    difficulty === diff ? "bg-indigo-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 2. Live Metrics Header ── */}
      {status !== "finished" && (
        <div className="flex items-center justify-between px-2 text-muted-foreground">
          <div className="flex items-center gap-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Live Speed</span>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {wpm} <span className="text-xs font-bold text-muted-foreground">WPM</span>
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Accuracy</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {accuracy}%
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
              {mode === "time" ? "Time left" : "Words left"}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
              {mode === "time" ? `${timeLeft}s` : `${Math.max(0, targetText.split(/\s+/).length - userInput.split(/\s+/).length)}`}
            </p>
          </div>
        </div>
      )}

      {/* ── 3. Main Monkeytype Engine Box ── */}
      {status !== "finished" ? (
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative min-h-[260px] sm:min-h-[300px] p-6 sm:p-10 rounded-[2.5rem] bg-card border-2 border-border/80 shadow-lg hover:border-indigo-500/40 transition-all cursor-text select-none flex flex-col justify-center overflow-hidden"
        >
          {/* Transparent Input covering whole surface */}
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => processKeyInput(e.target.value)}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            className="absolute inset-0 opacity-0 w-full h-full cursor-text z-10"
          />

          {/* Text Characters Render */}
          <div
            ref={textContainerRef}
            className="text-lg sm:text-2xl font-mono leading-relaxed tracking-wider text-justify break-words relative overflow-hidden max-h-[320px] pointer-events-none"
          >
            {renderedChars.map((item) => {
              let charColor = "text-muted-foreground/40"; // pending
              let bg = "";

              if (item.state === "correct") {
                charColor = "text-foreground font-semibold";
              } else if (item.state === "incorrect") {
                charColor = "text-red-500 bg-red-500/15 rounded-xs font-bold";
              }

              return (
                <span key={item.index} className="relative inline">
                  {/* Smooth Caret on current letter */}
                  {item.state === "current" && isFocused && (
                    <motion.span
                      layoutId="typingCaret"
                      transition={{ type: "spring", damping: 28, stiffness: 350 }}
                      className="absolute -left-[1px] top-1 bottom-1 w-[2.5px] rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse z-20"
                    />
                  )}
                  <span className={`${charColor} ${bg} transition-colors duration-75`}>
                    {item.char}
                  </span>
                </span>
              );
            })}
          </div>

          {/* Bottom Hint */}
          <div className="mt-8 flex items-center justify-between text-xs text-muted-foreground opacity-70 z-20">
            <span className="flex items-center gap-1.5 font-medium">
              <kbd className="px-2 py-0.5 rounded-md bg-muted border border-border font-mono text-[10px]">Tab</kbd>
              <span>— Restart test</span>
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Restart
            </button>
          </div>
        </div>
      ) : (
        /* ── 4. Monkeytype Results Screen ── */
        resultData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="p-6 sm:p-10 rounded-[2.5rem] bg-card border border-border shadow-xl space-y-8 animate-in fade-in duration-300"
          >
            {/* Top Result Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-border pb-8">
              <div className="text-center sm:text-left space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Test Completed
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground pt-1">
                  Your Speed: {resultData.wpm} WPM 🔥
                </h3>
              </div>

              {/* XP celebration badge */}
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300">
                <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">XP Earned</p>
                  <p className="text-lg font-black">+{resultData.earnedXp} XP</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WPM (Net)</span>
                <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">{resultData.wpm}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Accuracy</span>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{resultData.accuracy}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Raw WPM</span>
                <p className="text-3xl font-black text-foreground tabular-nums">{resultData.rawWpm}</p>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Characters</span>
                <p className="text-2xl font-black text-foreground font-mono">
                  <span className="text-emerald-600">{resultData.correctChars}</span> / <span className="text-red-500">{resultData.incorrectChars}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>

              <button
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted font-bold text-sm text-foreground transition-all cursor-pointer"
              >
                Next Text <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )
      )}

      {/* Badge Award Celebration Modal */}
      {earnedBadge && (
        <TypingBadgeModal
          badge={earnedBadge}
          onClose={() => setEarnedBadge(null)}
        />
      )}

      {/* Free Limit Modal */}
      <DailyLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
