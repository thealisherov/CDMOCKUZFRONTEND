"use client";

import { useState } from "react";
import {
  Download, ArrowLeft, Headphones, BookOpen, PenTool, CheckCircle2,
  XCircle, Award, Clock, Calendar, ChevronRight, FileText, Check, Loader2,
  Sparkles, Layers
} from "lucide-react";
import toast from "react-hot-toast";
import { downloadFullMockPdf, getCefrLevel } from "@/utils/fullmockPdfGenerator";

export default function FullMockResultView({ resultData, onBack }) {
  const [activeTab, setActiveTab] = useState("overview"); // overview | listening | reading | writing
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const r = resultData?.results || {};
  const personName = resultData?.person_name || "O'quvchi";
  const testTitle = resultData?.title || "IELTS Full Mock Test";
  const createdAt = resultData?.created_at
    ? new Date(resultData.created_at).toLocaleDateString("uz-UZ", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
      })
    : new Date().toLocaleDateString("uz-UZ");

  const listeningAnswers = r.listening?.results || {};
  const readingAnswers = r.reading?.results || {};
  const writingEvaluation = r.writing?.tasksEvaluation || {};
  const writingTasks = r.writing?.tasks || [];

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      await downloadFullMockPdf(resultData);
      toast.success("PDF muvaffaqiyatli yuklab olindi!");
    } catch (e) {
      console.error("PDF download error:", e);
      toast.error("PDF yuklashda xatolik");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Ortga qaytish
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={downloadingPdf}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), #4f46e5)" }}
        >
          {downloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          PDF yuklab olish
        </button>
      </div>

      {/* Main Report Container for PDF & Display */}
      <div id="fullmock-report-container" className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden">
        {/* Header Hero */}
        <div
          className="p-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, oklch(0.22 0.08 270), oklch(0.18 0.12 290))",
          }}
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-white/10 border border-white/20">
            <Award className="w-8 h-8 text-yellow-300" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white/80 bg-white/10 mb-2">
            Rasmiy Natijalar Hisoboti
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{testTitle}</h1>
          <p className="text-white/80 text-sm mt-1 font-semibold">{personName}</p>
          <div className="flex items-center justify-center gap-4 text-xs text-white/50 mt-3">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {createdAt}</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Tekshirilgan</span>
          </div>
        </div>

        {/* Overall Score Banner */}
        <div className="p-6 sm:p-8 space-y-6">
          <div
            className="p-6 rounded-2xl text-center relative overflow-hidden border border-border"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.22 270 / 0.08), oklch(0.6 0.2 330 / 0.05))" }}
          >
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Umumiy IELTS Ball</p>
            <div className="flex items-baseline justify-center gap-2 mt-2">
              <span className="text-6xl font-black tracking-tight" style={{ color: "oklch(0.55 0.22 270)" }}>
                {r.overall_band || "0.0"}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">/ 9.0</span>
            </div>
            <p className="text-xs font-bold text-foreground/80 mt-2">
              Daraja: <span className="text-primary font-black">{getCefr(r.overall_band)}</span>
            </p>
          </div>

          {/* 3 Section Band Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mb-2">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Listening</span>
              <span className="text-3xl font-black text-foreground mt-1">{r.listening?.band || "0.0"}</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">
                {r.listening?.score || 0} / {r.listening?.total || 40} to&apos;g&apos;ri
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 flex items-center justify-center mb-2">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Reading</span>
              <span className="text-3xl font-black text-foreground mt-1">{r.reading?.band || "0.0"}</span>
              <span className="text-xs text-muted-foreground mt-1 font-medium">
                {r.reading?.score || 0} / {r.reading?.total || 40} to&apos;g&apos;ri
              </span>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mb-2">
                <PenTool className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Writing</span>
              <span className="text-3xl font-black text-foreground mt-1">{r.writing?.band || "0.0"}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
                AI Examiner
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation for Detailed Breakdown */}
        <div className="border-t border-border px-6 pt-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-3">
            {[
              { id: "overview", label: "Umumiy Tahlil", icon: Layers },
              { id: "listening", label: `Listening (${r.listening?.score || 0}/40)`, icon: Headphones },
              { id: "reading", label: `Reading (${r.reading?.score || 0}/40)`, icon: BookOpen },
              { id: "writing", label: "Writing AI Feedback", icon: PenTool },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? "bg-primary text-white shadow-md"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 pt-4">
          {/* 1. OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" /> Kuchli tomonlar
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <li>• Test to&apos;liq formatda oxirigacha topshirildi.</li>
                    <li>• Listening bo&apos;limida {r.listening?.score || 0} ta to&apos;g&apos;ri javob qayd etildi.</li>
                    <li>• Reading bo&apos;limida {r.reading?.score || 0} ta to&apos;g&apos;ri javob topildi.</li>
                  </ul>
                </div>
                <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <h4 className="text-sm font-bold flex items-center gap-2 text-amber-600">
                    <Sparkles className="w-4 h-4" /> Tavsiyalar
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <li>• Xato qilingan savollarni &quot;Listening&quot; va &quot;Reading&quot; tablarida tahlil qiling.</li>
                    <li>• Writing bo&apos;limidagi AI maslahatlari va tuzatishlarni ko&apos;rib chiqing.</li>
                    <li>• Keyingi mock testda 7.5+ natija uchun har kuni practice qiling.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. LISTENING DETAILS */}
          {activeTab === "listening" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Listening Savollari Natijasi</h4>
                <span className="text-xs text-muted-foreground">
                  {r.listening?.score || 0} to&apos;g&apos;ri / {Math.max(0, (r.listening?.total || 40) - (r.listening?.score || 0))} xato
                </span>
              </div>
              {Object.keys(listeningAnswers).length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Savollar tafsiloti mavjud emas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-2">
                  {Object.entries(listeningAnswers).map(([qKey, res]) => {
                    const isCorrect = typeof res === "object" ? res.isCorrect : Boolean(res);
                    const userAns = typeof res === "object" ? res.userAnswer : "-";
                    const correctAns = typeof res === "object" ? res.correctAnswer : "-";
                    return (
                      <div
                        key={qKey}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isCorrect
                            ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">Savol {qKey}</span>
                          <div className="text-[11px] text-muted-foreground">
                            Siz: <span className="font-semibold text-foreground">{userAns || "(bo'sh)"}</span>
                          </div>
                          {!isCorrect && correctAns && correctAns !== "-" && (
                            <div className="text-[11px] text-green-600 font-semibold">
                              To&apos;g&apos;ri: {correctAns}
                            </div>
                          )}
                        </div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. READING DETAILS */}
          {activeTab === "reading" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold">Reading Savollari Natijasi</h4>
                <span className="text-xs text-muted-foreground">
                  {r.reading?.score || 0} to&apos;g&apos;ri / {Math.max(0, (r.reading?.total || 40) - (r.reading?.score || 0))} xato
                </span>
              </div>
              {Object.keys(readingAnswers).length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Savollar tafsiloti mavjud emas.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-2">
                  {Object.entries(readingAnswers).map(([qKey, res]) => {
                    const isCorrect = typeof res === "object" ? res.isCorrect : Boolean(res);
                    const userAns = typeof res === "object" ? res.userAnswer : "-";
                    const correctAns = typeof res === "object" ? res.correctAnswer : "-";
                    return (
                      <div
                        key={qKey}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isCorrect
                            ? "bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                            : "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">Savol {qKey}</span>
                          <div className="text-[11px] text-muted-foreground">
                            Siz: <span className="font-semibold text-foreground">{userAns || "(bo'sh)"}</span>
                          </div>
                          {!isCorrect && correctAns && correctAns !== "-" && (
                            <div className="text-[11px] text-green-600 font-semibold">
                              To&apos;g&apos;ri: {correctAns}
                            </div>
                          )}
                        </div>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 4. WRITING DETAILS */}
          {activeTab === "writing" && (
            <div className="space-y-6">
              {Object.keys(writingEvaluation).length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">Writing tahlili mavjud emas.</p>
              ) : (
                Object.entries(writingEvaluation).map(([idx, task]) => {
                  const taskNum = Number(idx) + 1;
                  const taskAnswer = writingTasks[idx] || {};
                  return (
                    <div key={idx} className="p-6 rounded-2xl border border-border bg-card space-y-4 shadow-xs">
                      <div className="flex items-center justify-between pb-3 border-b border-border">
                        <div>
                          <h4 className="text-base font-bold text-foreground">Writing Task {taskNum}</h4>
                          <span className="text-xs text-muted-foreground">
                            So&apos;zlar soni: <b>{taskAnswer.wordCount || 0} ta</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground uppercase">Ball:</span>
                          <span className="text-2xl font-black text-primary">Band {task.BandScore || "0.0"}</span>
                        </div>
                      </div>

                      {/* Criteria scores */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {task.isTask1 ? "Task Achievement" : "Task Response"}
                          </p>
                          <p className="text-base font-black mt-0.5">
                            {task.isTask1 ? task.TaskAchievement : task.TaskResponse}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                          <p className="text-[10px] text-muted-foreground font-bold">Coherence & Cohesion</p>
                          <p className="text-base font-black mt-0.5">{task.CoherenceAndCohesion}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                          <p className="text-[10px] text-muted-foreground font-bold">Lexical Resource</p>
                          <p className="text-base font-black mt-0.5">{task.LexicalResource}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/50 text-center">
                          <p className="text-[10px] text-muted-foreground font-bold">Grammar Accuracy</p>
                          <p className="text-base font-black mt-0.5">{task.GrammaticalRangeAndAccuracy}</p>
                        </div>
                      </div>

                      {/* Student Essay Box */}
                      {taskAnswer.text && (
                        <div>
                          <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> Yozilgan insho:
                          </p>
                          <div className="p-3.5 rounded-xl bg-muted/40 text-xs text-foreground/80 leading-relaxed font-sans max-h-36 overflow-y-auto whitespace-pre-wrap">
                            {taskAnswer.text}
                          </div>
                        </div>
                      )}

                      {/* Feedback */}
                      {task.Feedback && (
                        <div>
                          <p className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Examiner Fikri:
                          </p>
                          <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {task.Feedback}
                          </div>
                        </div>
                      )}

                      {/* Corrections */}
                      {task.Corrections && (
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                            ⚠️ Asosiy Tuzatishlar:
                          </p>
                          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-wrap">
                            {task.Corrections}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
