"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Building2, User, Loader2, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import ReadingTestClient from "@/app/dashboard/reading/[id]/ReadingTestClient";
import ListeningTestClient from "@/app/dashboard/listening/[id]/ListeningTestClient";
import WritingTestClient from "@/app/dashboard/writing/[id]/WritingTestClient";

export default function CenterTestRunner({ type, id, rawData, center }) {
  const router = useRouter();
  const doneKey = `center_done_${center.slug}_${type}_${id}`;

  const [phase, setPhase] = useState("loading"); // loading | gate | test | done
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [startedAt, setStartedAt] = useState(0);
  const [isPreview, setIsPreview] = useState(false); // admin sinovi — natija saqlanmaydi

  useEffect(() => {
    try {
      if (localStorage.getItem(doneKey)) { setPhase("done"); return; }
    } catch { /* ignore */ }
    setPhase("gate");
  }, [doneKey]);

  const handleComplete = (resData) => {
    if (resData?.preview) {
      // Admin sinovi — qulflamaymiz (qayta sinash mumkin), saqlanmagani haqida xabar
      setIsPreview(true);
    } else {
      try { localStorage.setItem(doneKey, "1"); } catch { /* ignore */ }
    }
    setPhase("done");
  };

  const centerConfig = useMemo(() => ({
    mode: "center",
    submitUrl: "/api/centers/submit",
    type,
    testNumericId: Number(id),
    name: name.trim(),
    surname: surname.trim(),
    centerName: center.name,
    telegram: center.telegram,
    startedAt,
    onComplete: handleComplete,
  }), [type, id, name, surname, center, startedAt]);

  // ── DONE ─────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Test yakunlandi!</h1>
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
          <button
            onClick={() => router.replace("/markaz/tests")}
            className="mt-6 inline-flex items-center gap-2 text-indigo-600 font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Testlar ro'yxatiga qaytish
          </button>
        </div>
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
            <p className="text-sm text-slate-500">{rawData?.title || "IELTS Test"}</p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); if (canStart) { setStartedAt(Date.now()); setPhase("test"); } }}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4"
          >
            {center.preview && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-xs text-indigo-700 text-center">
                <b>Sinov rejimi (admin preview)</b> — natijalar saqlanmaydi
              </div>
            )}
            <p className="text-sm text-slate-600 text-center mb-2">Testni boshlash uchun ism va familiyangizni kiriting</p>
            <div>
              <label className="text-sm font-medium text-slate-700">Ism</label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Abdulaziz" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Familiya</label>
              <div className="mt-1 relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input value={surname} onChange={(e) => setSurname(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Test" />
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
              Diqqat: testga faqat <b>bir marta</b> kirasiz. Boshlagach, yakuniga yetkazing.
            </div>
            <button type="submit" disabled={!canStart}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white rounded-lg py-2.5 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" /> Testni boshlash
            </button>
            <button type="button" onClick={() => router.replace("/markaz/tests")}
              className="w-full text-sm text-slate-400 hover:text-slate-600">Bekor qilish</button>
          </form>
        </div>
      </div>
    );
  }

  // ── TEST ─────────────────────────────────────────────────────────────
  if (!rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (type === "reading") return <ReadingTestClient id={id} rawData={rawData} centerConfig={centerConfig} />;
  if (type === "listening") return <ListeningTestClient id={id} rawData={rawData} centerConfig={centerConfig} />;
  return <WritingTestClient id={id} rawData={rawData} centerConfig={centerConfig} />;
}
