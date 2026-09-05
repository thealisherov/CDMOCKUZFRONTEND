"use client";

/**
 * Public Full Mock Runner — Markaz tizimiga o'xshash, lekin public mode uchun.
 * 
 * Flow: gate (ism ko'rsatish) → listening → break → reading → break → writing → submitting → results
 * 
 * Natijalar foydalanuvchiga ko'rsatiladi va PDF yuklab olish imkoni beriladi.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, User, Send, Loader2, CheckCircle2, ArrowLeft, AlertTriangle,
  Download, Headphones, BookOpen, PenTool, Clock, Award,
} from "lucide-react";
import ReadingTestClient from "@/app/dashboard/reading/[id]/ReadingTestClient";
import ListeningTestClient from "@/app/dashboard/listening/[id]/ListeningTestClient";
import WritingTestClient from "@/app/dashboard/writing/[id]/WritingTestClient";
import FullMockResultView from "@/app/dashboard/fullmock/components/FullMockResultView";

const SECTION_LABEL = {
  listening: "Listening bo'limi",
  reading: "Reading bo'limi",
  writing: "Writing bo'limi",
};

const STEPS = [
  { kind: "break", section: "listening" },
  { kind: "section", section: "listening" },
  { kind: "break", section: "reading" },
  { kind: "section", section: "reading" },
  { kind: "break", section: "writing" },
  { kind: "section", section: "writing" },
];

function BreakScreen({ section, sectionLabel, onContinue }) {
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); onContinue(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onContinue]);

  const icons = { listening: Headphones, reading: BookOpen, writing: PenTool };
  const Icon = icons[section] || Layers;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{ background: "oklch(0.55 0.22 270 / 0.1)" }}>
          <Icon className="w-8 h-8" style={{ color: "oklch(0.55 0.22 270)" }} />
        </div>
        <h2 className="text-xl font-bold text-foreground">Keyingi: {sectionLabel}</h2>
        <p className="text-muted-foreground text-sm">
          {countdown} soniyadan keyin avtomatik boshlanadi
        </p>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${((60 - countdown) / 60) * 100}%`,
              background: "linear-gradient(90deg, oklch(0.55 0.22 270), oklch(0.6 0.2 330))",
            }}
          />
        </div>
        <button
          onClick={onContinue}
          className="px-6 py-2.5 rounded-xl font-medium text-sm text-white transition-colors"
          style={{ background: "oklch(0.55 0.22 270)" }}
        >
          Hoziroq boshlash
        </button>
      </div>
    </div>
  );
}

export default function PublicFullMockRunner({ session, onComplete }) {
  const router = useRouter();

  const storageTag = `pub_fm_${session.mock_id}`;
  const sessionKey = `${storageTag}_session`;

  const [phase, setPhase] = useState("gate"); // gate | running | submitting | done | error
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const startedAtRef = useRef(0);
  const collectedRef = useRef({});
  const lastAdvancedRef = useRef(-1);

  const clearStaleState = useCallback(() => {
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.includes(storageTag)) localStorage.removeItem(k);
      });
    } catch { /* ignore */ }
  }, [storageTag]);

  // Sahifa yangilanganda (refresh) mavjud sessiyani tiklash
  useEffect(() => {
    try {
      const savedRaw = localStorage.getItem(sessionKey);
      if (savedRaw) {
        const saved = JSON.parse(savedRaw);
        if (saved?.phase === "running") {
          const now = Date.now();
          const age = now - (saved.startedAt || 0);
          // 24 soatdan oshmagan faol sessiya bo'lsa tiklaymiz
          if (age < 24 * 60 * 60 * 1000) {
            const restoredStep = typeof saved.stepIndex === "number" ? saved.stepIndex : 0;
            setStepIndex(restoredStep);
            startedAtRef.current = saved.startedAt || now;
            collectedRef.current = saved.collected || {};
            lastAdvancedRef.current = restoredStep - 1;
            setPhase("running");
            setIsRestoring(false);
            return;
          }
        }
      }
    } catch {
      /* ignore */
    }
    setIsRestoring(false);
  }, [sessionKey]);

  // Faol sessiyani localStorage ga saqlab borish
  const saveSession = useCallback((overrideStep = null, overrideCollected = null) => {
    try {
      localStorage.setItem(
        sessionKey,
        JSON.stringify({
          phase: "running",
          stepIndex: overrideStep !== null ? overrideStep : stepIndex,
          startedAt: startedAtRef.current,
          collected: overrideCollected !== null ? overrideCollected : collectedRef.current,
        })
      );
    } catch {
      /* ignore */
    }
  }, [sessionKey, stepIndex]);

  useEffect(() => {
    if (phase === "running" && !isRestoring) {
      saveSession();
    }
  }, [phase, stepIndex, isRestoring, saveSession]);

  const advanceFrom = useCallback((idx) => {
    if (lastAdvancedRef.current >= idx) return;
    lastAdvancedRef.current = idx;
    setStepIndex((cur) => {
      const next = idx + 1;
      saveSession(next);
      return next;
    });
  }, [saveSession]);

  const handleSection = useCallback((section, answers) => {
    if (collectedRef.current[section] === undefined) {
      collectedRef.current[section] = answers || {};
    }
    setStepIndex((cur) => {
      if (lastAdvancedRef.current >= cur) return cur;
      lastAdvancedRef.current = cur;
      const next = cur + 1;
      saveSession(next, { ...collectedRef.current });
      return next;
    });
  }, [saveSession]);

  const doSubmit = useCallback(async () => {
    setPhase("submitting");
    try {
      const res = await fetch("/api/fullmock/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code_id: session.code_id,
          mock_id: session.mock_id,
          person_name: session.person_name,
          answers: collectedRef.current,
          timeSpent: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : null,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Yuborishda xatolik");
      }
      const result = await res.json();
      setResults(result);

      // Save to localStorage fullmock_my_results for dashboard view
      try {
        const savedHistory = JSON.parse(localStorage.getItem("fullmock_my_results") || "[]");
        const entry = {
          id: result.submission_id || `fm_${Date.now()}`,
          mock_id: session.mock_id,
          title: result.title || session.title || "IELTS Full Mock Test",
          person_name: result.person_name || session.person_name,
          created_at: result.created_at || new Date().toISOString(),
          time_spent_seconds: result.time_spent_seconds,
          results: result.results,
        };
        const updated = [entry, ...savedHistory.filter(h => h.id !== entry.id)].slice(0, 30);
        localStorage.setItem("fullmock_my_results", JSON.stringify(updated));
      } catch (saveErr) {
        console.warn("Could not save to local history:", saveErr);
      }

      clearStaleState();
      onComplete?.();
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.message || "Yuborishda xatolik");
      setPhase("error");
    }
  }, [session, clearStaleState, onComplete]);

  useEffect(() => {
    if (phase === "running" && stepIndex >= STEPS.length) {
      doSubmit();
    }
  }, [phase, stepIndex, doSubmit]);

  // ── RESTORING ──
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── DONE — Natijalar ──
  if (phase === "done" && results) {
    return (
      <div className="min-h-screen py-8 px-4 flex flex-col items-center justify-center">
        <FullMockResultView
          resultData={results}
          onBack={() => {
            clearStaleState();
            router.replace("/dashboard/fullmock");
          }}
        />
      </div>
    );
  }

  // ── SUBMITTING ──
  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-1">Natijalaringiz tekshirilmoqda...</h2>
        <p className="text-muted-foreground text-sm">Writing AI tekshiruvi bir necha daqiqa davom etishi mumkin.</p>
        <p className="text-muted-foreground text-xs mt-2">Iltimos, sahifani yopmang.</p>
      </div>
    );
  }

  // ── ERROR ──
  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Yuborishda xatolik</h2>
        <p className="text-muted-foreground mb-4">{errorMsg}</p>
        <button onClick={doSubmit} className="px-6 py-2.5 rounded-xl font-medium text-white" style={{ background: "oklch(0.55 0.22 270)" }}>
          Qayta yuborish
        </button>
      </div>
    );
  }

  // ── GATE ──
  if (phase === "gate") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), oklch(0.55 0.2 290))" }}>
              <Layers className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">{session.title}</h1>
            <p className="text-sm text-muted-foreground">IELTS Full Mock Test</p>
          </div>
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{session.person_name}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              To&apos;liq mock: <b>Listening → Reading → Writing</b>.
              Har bo&apos;lim oldidan 1 daqiqalik tanaffus beriladi.
            </p>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              Diqqat: testni boshlagach, <b>yakuniga yetkazing</b> — to&apos;xtatib bo&apos;lmaydi.
              Writing AI tomonidan tekshiriladi va natija sizga ko&apos;rsatiladi.
            </div>

            <button
              onClick={() => {
                clearStaleState();
                const now = Date.now();
                startedAtRef.current = now;
                setStepIndex(0);
                collectedRef.current = {};
                lastAdvancedRef.current = -1;
                try {
                  localStorage.setItem(
                    sessionKey,
                    JSON.stringify({
                      phase: "running",
                      stepIndex: 0,
                      startedAt: now,
                      collected: {},
                    })
                  );
                } catch {
                  /* ignore */
                }
                setPhase("running");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-white transition-colors"
              style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), oklch(0.55 0.2 290))" }}
            >
              <Send className="w-4 h-4" /> Testni boshlash
            </button>
            <button
              onClick={() => {
                clearStaleState();
                localStorage.removeItem("fullmock_session");
                router.replace("/dashboard/fullmock");
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RUNNING ──
  const step = STEPS[stepIndex];
  if (!step) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  if (step.kind === "break") {
    return (
      <BreakScreen
        key={`break-${stepIndex}`}
        section={step.section}
        sectionLabel={SECTION_LABEL[step.section]}
        onContinue={() => advanceFrom(stepIndex)}
      />
    );
  }

  // step.kind === 'section'
  const centerConfig = {
    mode: "full_mock",
    name: session.person_name.split(" ")[0] || session.person_name,
    surname: session.person_name.split(" ").slice(1).join(" ") || "",
    startedAt: startedAtRef.current,
    onSection: (answers) => handleSection(step.section, answers),
  };
  const secData = session.sections[step.section];
  const secId = `${storageTag}_${step.section}`;

  if (step.section === "listening") return <ListeningTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  if (step.section === "reading") return <ReadingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  return <WritingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
}
