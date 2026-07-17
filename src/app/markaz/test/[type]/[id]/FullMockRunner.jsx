"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Send, Loader2, CheckCircle2, ArrowLeft, AlertTriangle } from "lucide-react";
import ReadingTestClient from "@/app/dashboard/reading/[id]/ReadingTestClient";
import ListeningTestClient from "@/app/dashboard/listening/[id]/ListeningTestClient";
import WritingTestClient from "@/app/dashboard/writing/[id]/WritingTestClient";
import InstructionVideo from "./InstructionVideo";

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
  const doneKey = `center_done_${center.slug}_full_mock_${id}`;

  const [phase, setPhase] = useState("loading"); // loading | gate | running | submitting | done | error
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreview, setIsPreview] = useState(false); // admin sinovi — natija saqlanmaydi

  const startedAtRef = useRef(0);
  const collectedRef = useRef({});          // { listening, reading, writing }
  const lastAdvancedRef = useRef(-1);        // qadam bir marta oldinga siljishi uchun

  useEffect(() => {
    try { if (localStorage.getItem(doneKey)) { setPhase("done"); return; } } catch { /* */ }
    setPhase("gate");
  }, [doneKey]);

  const advanceFrom = useCallback((idx) => {
    if (lastAdvancedRef.current >= idx) return; // allaqachon siljigan
    lastAdvancedRef.current = idx;
    setStepIndex(idx + 1);
  }, []);

  const handleSection = useCallback((section, answers) => {
    if (collectedRef.current[section] === undefined) {
      collectedRef.current[section] = answers || {};
    }
    // Joriy qadamdan (section) keyingiga siljiymiz
    setStepIndex((cur) => {
      if (lastAdvancedRef.current >= cur) return cur;
      lastAdvancedRef.current = cur;
      return cur + 1;
    });
  }, []);

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
      if (result.preview) {
        // Admin sinovi — natija saqlanmadi, testni ham qulflamaymiz (qayta sinash mumkin)
        setIsPreview(true);
      } else {
        try { localStorage.setItem(doneKey, "1"); } catch { /* */ }
      }
      setPhase("done");
    } catch (err) {
      setErrorMsg(err.message || "Yuborishda xatolik");
      setPhase("error");
    }
  }, [id, name, surname, doneKey]);

  // Barcha qadamlar tugagach — yuborish
  useEffect(() => {
    if (phase === "running" && stepIndex >= STEPS.length) {
      doSubmit();
    }
  }, [phase, stepIndex, doSubmit]);

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
              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-700">
                Diqqat: bu testga faqat bir marta kirish mumkin.
              </div>
            </>
          )}
          <button onClick={() => router.replace("/markaz/tests")} className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all">
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
  if (phase === "gate" || phase === "loading") {
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
            onSubmit={(e) => { e.preventDefault(); if (canStart) { startedAtRef.current = Date.now(); setPhase("running"); } }}
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
              Diqqat: test <b>bir marta</b> ishlanadi va <b>to'xtatib bo'lmaydi</b>. Har bo'lim oldidan ko'rsatma video chiqadi.
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

  // ── RUNNING (video / section) ────────────────────────────────────────
  const step = STEPS[stepIndex];
  if (!step) {
    // stepIndex >= STEPS.length — submit useEffect ishga tushadi
    return (
      <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
    );
  }

  if (step.kind === "video") {
    return (
      <InstructionVideo
        key={`video-${stepIndex}`}
        url={videos[step.section]}
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
  const secId = `fm${id}_${step.section}`;

  if (step.section === "listening") return <ListeningTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  if (step.section === "reading") return <ReadingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
  return <WritingTestClient key={secId} id={secId} rawData={secData} centerConfig={centerConfig} />;
}
