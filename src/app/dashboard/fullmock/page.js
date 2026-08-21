"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, Clock, DollarSign, ArrowRight, Loader2,
  KeyRound, Send, ExternalLink, Award, Calendar, Headphones,
  BookOpen, PenTool, CheckCircle2, Eye, X, Download, FileText,
  ChevronRight, ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import FullMockResultView from "./components/FullMockResultView";
import { downloadFullMockPdf } from "@/utils/fullmockPdfGenerator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function FullMockPage() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [codeModal, setCodeModal] = useState(null); // test object or null
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resultsExpanded, setResultsExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/fullmock")
      .then(r => r.json())
      .then(d => setTests(d.tests || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load past results from API + localStorage
    async function loadPastSubmissions() {
      let merged = [];
      try {
        const localSaved = JSON.parse(localStorage.getItem("fullmock_my_results") || "[]");
        if (Array.isArray(localSaved)) merged = [...localSaved];
      } catch {
        // ignore
      }

      try {
        const res = await fetch("/api/fullmock/my-submissions");
        const json = await res.json();
        if (json.submissions && Array.isArray(json.submissions)) {
          // Merge avoiding duplicates by id
          const existingIds = new Set(merged.map(m => m.id || m.submission_id));
          json.submissions.forEach(sub => {
            if (!existingIds.has(sub.id)) {
              merged.push(sub);
              existingIds.add(sub.id);
            }
          });
        }
      } catch (err) {
        console.warn("Could not fetch submissions from API:", err);
      }

      setMyResults(merged);
    }

    loadPastSubmissions();
  }, []);

  async function handleDownloadCardPdf(item) {
    setDownloadingPdfId(item.id);
    try {
      await downloadFullMockPdf(item);
      toast.success("PDF yuklab olindi!");
    } catch (e) {
      console.error(e);
      toast.error("PDF yuklashda xatolik");
    } finally {
      setDownloadingPdfId(null);
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/fullmock/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Kod noto'g'ri");
        return;
      }
      localStorage.setItem("fullmock_session", JSON.stringify({
        code_id: json.code_id,
        mock_id: json.mock_id,
        test_row_id: json.test_row_id,
        person_name: json.person_name,
        title: json.title,
        sections: json.sections,
        expires_at: json.expires_at,
        verified_at: new Date().toISOString(),
      }));
      toast.success(`Xush kelibsiz, ${json.person_name}!`);
      router.push(`/dashboard/fullmock/test/${json.mock_id}`);
    } catch (e) {
      toast.error("Server xatoligi");
    } finally {
      setVerifying(false);
    }
  }

  function handleBuy(test) {
    const msg = encodeURIComponent(`Salom! Men "${test.title}" (${test.price_uzs?.toLocaleString()} UZS / $${test.price_usd}) full mock testni sotib olmoqchiman.`);
    window.open(`https://t.me/megaielts_admin?text=${msg}`, "_blank");
  }

  // Latest result preview for compact bar
  const latestResult = myResults[0] || null;
  const latestBand = latestResult?.results?.overall_band || "0.0";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), oklch(0.55 0.2 290))" }}>
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Full Mock Tests
            </h1>
            <p className="text-muted-foreground text-sm">
              IELTS to&apos;liq mock — Listening + Reading + Writing
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Mening Natijalarim Compact Accordion ── */}
      {myResults.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-border/80 bg-card overflow-hidden transition-all shadow-xs"
        >
          {/* Compact Header Bar */}
          <button
            onClick={() => setResultsExpanded(!resultsExpanded)}
            className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-muted/40 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-foreground">Mening Natijalarim</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {myResults.length} ta test
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                  Oxirgi topshirilgan: <b className="text-foreground">{latestResult?.title}</b> — <span className="text-primary font-bold">Band {latestBand}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-primary hidden sm:inline">
                {resultsExpanded ? "Yopish" : "Natijalarni ko'rish"}
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border border-border bg-background transition-transform duration-200 ${resultsExpanded ? "rotate-180" : ""}`}>
                <ChevronRight className="w-4 h-4 text-muted-foreground rotate-90" />
              </div>
            </div>
          </button>

          {/* Expanded Content Grid */}
          {resultsExpanded && (
            <div className="p-4 sm:p-5 pt-0 border-t border-border/60 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {myResults.map((item) => {
                  const r = item.results || {};
                  const formattedDate = item.created_at
                    ? new Date(item.created_at).toLocaleDateString("uz-UZ", {
                        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
                      })
                    : "Yaqinda";

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 rounded-2xl border border-border bg-background/60 hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3" /> {formattedDate}
                            {item.person_name && <span>• {item.person_name}</span>}
                          </p>
                        </div>
                        <div className="px-3 py-1 rounded-xl font-black text-sm bg-primary/10 text-primary border border-primary/20 shrink-0">
                          Band {r.overall_band || "0.0"}
                        </div>
                      </div>

                      {/* Section Scores */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                          <span className="text-[10px] text-blue-700 dark:text-blue-400 block font-bold">Listening</span>
                          <span className="font-black text-sm text-foreground">{r.listening?.band || "0.0"}</span>
                          <span className="text-[10px] text-muted-foreground block">{r.listening?.score || 0}/40</span>
                        </div>
                        <div className="p-2 rounded-xl bg-green-50/60 dark:bg-green-950/20 border border-green-200/50 dark:border-green-900/30">
                          <span className="text-[10px] text-green-700 dark:text-green-400 block font-bold">Reading</span>
                          <span className="font-black text-sm text-foreground">{r.reading?.band || "0.0"}</span>
                          <span className="text-[10px] text-muted-foreground block">{r.reading?.score || 0}/40</span>
                        </div>
                        <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                          <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold">Writing</span>
                          <span className="font-black text-sm text-foreground">{r.writing?.band || "0.0"}</span>
                          <span className="text-[10px] text-muted-foreground block">AI Examiner</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setSelectedResult(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted transition-colors text-foreground"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Batafsil tahlil
                        </button>
                        <button
                          onClick={() => handleDownloadCardPdf(item)}
                          disabled={downloadingPdfId === item.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                          style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), #4f46e5)" }}
                        >
                          {downloadingPdfId === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          PDF yuklab olish
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tests Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.55 0.22 270)" }} />
        </div>
      ) : tests.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 text-muted-foreground">
          Hozircha full mock testlar mavjud emas.
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Mavjud Full Mock Testlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tests.map((test, idx) => (
              <motion.div
                key={test.id}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Top gradient bar */}
                <div className="h-1.5"
                  style={{ background: "linear-gradient(90deg, oklch(0.55 0.22 270), oklch(0.6 0.2 330))" }} />

                <div className="p-5 space-y-4">
                  {/* Title + badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: "oklch(0.55 0.22 270 / 0.1)", color: "oklch(0.55 0.22 270)" }}>
                          <Layers className="w-3 h-3" /> Full Mock
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {test.title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                      style={{ background: "oklch(0.55 0.22 270 / 0.1)" }}>
                      <Award className="w-5 h-5" style={{ color: "oklch(0.55 0.22 270)" }} />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {test.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> L + R + W
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 pt-2 border-t border-border/50">
                    <span className="text-2xl font-black tracking-tight text-foreground">
                      {test.price_uzs > 0 ? test.price_uzs.toLocaleString() : "Bepul"}
                    </span>
                    {test.price_uzs > 0 && (
                      <span className="text-xs font-medium text-muted-foreground">
                        UZS {test.price_usd > 0 && `/ $${test.price_usd}`}
                      </span>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setCodeModal(test); setCode(""); }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all text-white shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.48 0.22 270), #4f46e5)",
                      }}
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Kod bilan kirish
                    </button>
                    {test.price_uzs > 0 && (
                      <button
                        onClick={() => handleBuy(test)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Sotib olish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Code Entry Modal ── */}
      {codeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), oklch(0.55 0.2 290))" }}>
                <KeyRound className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold">{codeModal.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">6 ta belgili kirish kodingizni kiriting</p>
            </div>

            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6))}
              placeholder="A7K3M2"
              maxLength={6}
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-center text-2xl font-mono font-bold tracking-[0.4em] border border-border bg-card outline-none focus:ring-2 focus:ring-purple-500/30"
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setCodeModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleVerifyCode}
                disabled={verifying || code.length < 4}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, oklch(0.48 0.22 270), #4f46e5)" }}
              >
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Kirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result Details Fullscreen / Modal ── */}
      {selectedResult && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 backdrop-blur-md p-4 sm:p-6 flex items-start justify-center">
          <div className="w-full max-w-4xl my-8">
            <FullMockResultView
              resultData={selectedResult}
              onBack={() => setSelectedResult(null)}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
