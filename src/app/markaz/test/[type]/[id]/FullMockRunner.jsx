"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Send, Loader2, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
import ReadingTestClient from "@/app/dashboard/reading/[id]/ReadingTestClient";
import ListeningTestClient from "@/app/dashboard/listening/[id]/ListeningTestClient";
import WritingTestClient from "@/app/dashboard/writing/[id]/WritingTestClient";
import InstructionVideo from "./InstructionVideo";
import BreakScreen from "./BreakScreen";

const SECTION_LABEL = {
  listening: "Listening bo'limi",
  reading: "Reading bo'limi",
  writing: "Writing bo'limi",
};

// HAR DOIM shu tartib: video → bo'lim → video → bo'lim → video → bo'lim
const STEPS = [
  { kind: "video", section: "listening" },
  { kind: "section", section: "listening" },
  { kind: "video", section: "reading" },
  { kind: "section", section: "reading" },
  { kind: "video", section: "writing" },
  { kind: "section", section: "writing" },
];

export default function FullMockRunner({ id, title, center, sections, videos }) {
  const router = useRouter();

  // localStorage kalitlari uchun markaz nomi bilan ajratilgan prefiks —
  // platforma testlari bilan to'qnashmaydi.
  const storageTag = `mkz_${center.slug}_fm${id}`;
  const sessionKey = `${storageTag}_session`;

  const [phase, setPhase] = useState("gate"); // gate | running | submitting | done | error
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreview, setIsPreview] = useState(false); // admin sinovi — natija saqlanmaydi
  const [isRestoring, setIsRestoring] = useState(true);

  const startedAtRef = useRef(0);
  const collectedRef = useRef({});          // { listening, reading, writing }
  const lastAdvancedRef = useRef(-1);        // qadam bir marta oldinga siljishi uchun

  // Yangi o'quvchi boshlaganda yoki test topshirilganda barcha ma'lumotlar tozalanadi
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
        if (saved?.phase === "running" && saved?.name && saved?.surname) {
          const now = Date.now();
          const age = now - (saved.startedAt || 0);
          // 24 soatdan oshmagan faol sessiya bo'lsa tiklaymiz
          if (age < 24 * 60 * 60 * 1000) {
            const restoredStep = typeof saved.stepIndex === "number" ? saved.stepIndex : 0;
            setName(saved.name);
            setSurname(saved.surname);
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
          name: name.trim(),
          surname: surname.trim(),
          stepIndex: overrideStep !== null ? overrideStep : stepIndex,
          startedAt: startedAtRef.current,
          collected: overrideCollected !== null ? overrideCollected : collectedRef.current,
        })
      );
    } catch {
      /* ignore */
    }
  }, [sessionKey, name, surname, stepIndex]);

  useEffect(() => {
    if (phase === "running" && !isRestoring) {
      saveSession();
    }
  }, [phase, stepIndex, name, surname, isRestoring, saveSession]);

  const advanceFrom = useCallback((idx) => {
    if (lastAdvancedRef.current >= idx) return; // allaqachon siljigan
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
    // Joriy qadamdan (section) keyingiga siljiymiz
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
      const res = await fetch("/api/centers/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "full_mock",
          testNumericId: Number(id),
          name: name.trim(),
          surname: surname.trim(),
          answers: collectedRef.current,
          timeSpent: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : null,
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Yuborishda xatolik");
      }
      const result = await res.json().catch(() => ({}));
      if (result.preview) setIsPreview(true);
      clearStaleState(); // keyingi o'quvchi toza boshlashi uchun barcha sessiya ma'lumotlarini tozalaymiz
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.message || "Yuborishda xatolik");
      setPhase("error");
    }
  }, [id, name, surname, clearStaleState]);

  // Barcha qadamlar tugagach — yuborish
  useEffect(() => {
    if (phase === "running" && stepIndex >= STEPS.length) {
      doSubmit();
    }
  }, [phase, stepIndex, doSubmit]);

  // ── RESTORING (Sessiyani tiklash) ────────────────────────────────────
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ── DONE ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Full Mock yakunlandi!</h1>
          {isPreview ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
              <b>Sinov rejimi (admin preview)</b> — natija bazaga <b>saqlanmadi</b> va panelga tushmadi.
              Testni qayta sinashingiz mumkin.
            </div>
          ) : (
            <>
              <p className="text-slate-600 leading-relaxed">
                Sizning natijalaringiz <b className="text-indigo-600">{center.name}</b>ning
                {center.telegram ? <> <b>{center.telegram}</b> telegram kanalida</> : " telegram kanalida"} e'lon qilinadi.
              </p>
            </>
          )}
          <button
            onClick={() => {
              clearStaleState();
              router.replace("/markaz/tests");
            }}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Testlar ro'yxatiga qaytish
          </button>
        </div>
      </div>
    );
  }

  // ── SUBMITTING ───────────────────────────────────────────────────────
  if (phase === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-indigo-800 mb-1">Natijalaringiz yuborilmoqda...</h2>
        <p className="text-slate-500">Iltimos, kuting.</p>
      </div>
    );
  }

  // ── ERROR ────────────────────────────────────────────────────────────
  if (phase === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Yuborishda xatolik</h2>
        <p className="text-slate-500 mb-4">{errorMsg}</p>
        <button onClick={doSubmit} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700">Qayta yuborish</button>
      </div>
    );
  }

  // ── GATE (ism / familiya) ────────────────────────────────────────────
  if (phase === "gate") {
    const canStart = name.trim().length >= 2 && surname.trim().length >= 2;
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">{center.name}</h1>
            <p className="text-sm text-slate-500">{title || "IELTS Full Mock"}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canStart) {
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
                      name: name.trim(),
                      surname: surname.trim(),
                      stepIndex: 0,
                      startedAt: now,
                      collected: {},
                    })
                  );
                } catch {
                  /* ignore */
                }
                setPhase("running");
              }
            }}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4"
          >
            {center.preview && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700 text-center">
                <b>Sinov rejimi (admin preview)</b> — natijalar saqlanmaydi
              </div>
            )}
            <p className="text-sm text-slate-600 text-center mb-2">To'liq mock: Listening → Reading → Writing. Ism va familiyangizni kiriting.</p>
            <div>
              <label className="text-sm font-medium text-slate-700">Ism</label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Abdulaziz" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Familiya</label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={surname} onChange={(e) => setSurname(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Test" />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
              Diqqat: testni boshlagach, <b>yakuniga yetkazing</b> — to'xtatib bo'lmaydi, chiqib ketsangiz javoblaringiz saqlanmaydi. {center?.slug === "istudy" ? "Har bo'lim oldidan ko'rsatma video chiqadi." : "Har bo'lim oldidan 1 daqiqalik tanaffus beriladi."}
            </div>
            <button type="submit" disabled={!canStart}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" /> Testni boshlash
            </button>
            <button type="button" onClick={() => router.replace("/markaz/tests")} className="w-full text-sm text-slate-400 hover:text-slate-600">Bekor qilish</button>
          </form>
        </div>
      </div>
    );
  }

  // ── RUNNING (video / break / section) ────────────────────────────────
  const step = STEPS[stepIndex];
  if (!step) {
    // stepIndex >= STEPS.length — submit useEffect ishga tushadi
    return (
      <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
    );
  }

  if (step.kind === "video") {
    const isIstudy = center?.slug === "istudy";
    if (isIstudy) {
      return (
        <InstructionVideo
          key={`video-${stepIndex}`}
          url={videos[step.section]}
          sectionLabel={SECTION_LABEL[step.section]}
          onContinue={() => advanceFrom(stepIndex)}
        />
      );
    }
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
    name: name.trim(),
    surname: surname.trim(),
    startedAt: startedAtRef.current,
    onSection: (answers) => handleSection(step.section, answers),
  };
  const secData = sections[step.section];
  const secId = `${storageTag}_${step.section}`;

  if (step.section === "listening") return <ListeningTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  if (step.section === "reading") return <ReadingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  return <WritingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
}
