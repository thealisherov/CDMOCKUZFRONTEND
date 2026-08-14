"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  LogOut,
  Loader2,
  Trash2,
  Headphones,
  BookOpen,
  PenLine,
  Layers,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  AlertTriangle,
  Save,
  RefreshCw,
  ListChecks,
  Play,
  ArrowRight,
  Search,
  ExternalLink,
  Sparkles,
  BarChart3,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const TYPE_META = {
  listening: {
    icon: Headphones,
    label: "Listening",
    chip: "bg-blue-50 text-blue-700 border-blue-100",
    num: "text-blue-600",
    iconBg: "bg-blue-50 text-blue-600",
    accent: "text-blue-600",
    badge: "bg-blue-100 text-blue-800 border-blue-200",
  },
  reading: {
    icon: BookOpen,
    label: "Reading",
    chip: "bg-green-50 text-green-700 border-green-100",
    num: "text-green-600",
    iconBg: "bg-green-50 text-green-600",
    accent: "text-green-600",
    badge: "bg-green-100 text-green-800 border-green-200",
  },
  writing: {
    icon: PenLine,
    label: "Writing",
    chip: "bg-purple-50 text-purple-700 border-purple-100",
    num: "text-purple-600",
    iconBg: "bg-purple-50 text-purple-600",
    accent: "text-purple-600",
    badge: "bg-purple-100 text-purple-800 border-purple-200",
  },
  full_mock: {
    icon: Layers,
    label: "Full Mock",
    chip: "bg-indigo-50 text-indigo-700 border-indigo-100",
    num: "text-indigo-600",
    iconBg: "bg-indigo-50 text-indigo-600",
    accent: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
};

function fmtDate(s) {
  try {
    return new Date(s).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text || "");
          setCopied(true);
          toast.success("Nusxalandi!");
          setTimeout(() => setCopied(false), 1400);
        } catch {
          toast.error("Nusxalashda xatolik");
        }
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
      title="Nusxa olish"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? "Nusxalandi" : label}</span>
    </button>
  );
}

export default function PanelClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("tests"); // "tests" | "submissions"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [center, setCenter] = useState(null);
  const [subs, setSubs] = useState([]);
  const [tests, setTests] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  // Filters
  const [testFilter, setTestFilter] = useState("all");
  const [subSearch, setSubSearch] = useState("");

  const fetchData = async () => {
    try {
      // 1) Topshiriqlar
      const subRes = await fetch("/api/centers/submissions", { cache: "no-store" });
      if (subRes.status === 401) {
        router.replace("/markaz");
        return;
      }
      const subData = await subRes.json();
      setCenter(subData.center);
      setSubs(subData.submissions || []);

      // 2) Biriktirilgan testlar
      const testRes = await fetch("/api/centers/tests", { cache: "no-store" });
      if (testRes.ok) {
        const testData = await testRes.json();
        setTests(testData.tests || []);
      }
    } catch {
      toast.error("Ma'lumot yuklashda xatolik. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const logout = async () => {
    await fetch("/api/centers/logout", { method: "POST" });
    router.replace("/markaz");
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/centers/submissions/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSubs((prev) => prev.filter((s) => s.id !== toDelete.id));
      toast.success("O'chirildi");
    } catch {
      toast.error("O'chirishda xatolik");
    } finally {
      setToDelete(null);
    }
  };

  const filteredTests = useMemo(() => {
    if (testFilter === "all") return tests;
    return tests.filter((t) => t.type === testFilter);
  }, [tests, testFilter]);

  const filteredSubs = useMemo(() => {
    if (!subSearch.trim()) return subs;
    const q = subSearch.toLowerCase();
    return subs.filter(
      (s) =>
        s.student_name?.toLowerCase().includes(q) ||
        s.student_surname?.toLowerCase().includes(q) ||
        s.test_title?.toLowerCase().includes(q)
    );
  }, [subs, subSearch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 pb-20">
      <Toaster position="top-center" />

      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3.5">
          {center?.image ? (
            <img src={center.image} alt="" className="w-13 h-13 rounded-2xl object-cover border shadow-sm" />
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-600/20 text-white">
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
                {center?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              O'quv markazi boshqaruv paneli · {tests.length} ta test · {subs.length} ta topshiriq
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-indigo-600 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Yangilash</span>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* ── Tabs Navigation ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 w-full max-w-md border border-slate-200/60 shadow-inner">
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "tests"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Biriktirilgan Testlar</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "tests"
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {tests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "submissions"
              ? "bg-white text-indigo-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Topshiriqlar</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "submissions"
                ? "bg-indigo-50 text-indigo-600"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {subs.length}
          </span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: BIRIKTIRILGAN TESTLAR ───────────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === "tests" && (
        <div className="space-y-5">
          {/* Sub-filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {[
                { id: "all", label: "Barchasi" },
                { id: "full_mock", label: "Full Mock" },
                { id: "listening", label: "Listening" },
                { id: "reading", label: "Reading" },
                { id: "writing", label: "Writing" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTestFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    testFilter === f.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Ko'rsatilmoqda: <b>{filteredTests.length}</b> ta test
            </p>
          </div>

          {filteredTests.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <ListChecks className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-slate-700 font-bold text-base">Hozircha testlar mavjud emas</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Bu markazga test biriktirish uchun JSON faylda <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-indigo-600">"center": "{center?.slug}"</code> deb ko'rsatib yuklang.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTests.map((t) => {
                const meta = TYPE_META[t.type] || TYPE_META.reading;
                const Icon = meta.icon;
                const studentUrl = typeof window !== "undefined" ? `${window.location.origin}/markaz/test/${t.type}/${t.id}` : `/markaz/test/${t.type}/${t.id}`;

                return (
                  <div
                    key={`${t.type}-${t.id}`}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all p-5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Badge and Type */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${meta.badge}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          ID #{t.id}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors leading-snug">
                        {t.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {t.description}
                      </p>

                      {/* Meta Pills */}
                      <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {t.duration} daqiqa
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium">
                          <ListChecks className="w-3.5 h-3.5 text-slate-400" />
                          {t.questions} ta savol
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 font-medium capitalize">
                          Daraja: {t.level || "Medium"}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-slate-100">
                      <CopyButton text={studentUrl} label="Havolani olish" />

                      <button
                        onClick={() => router.push(`/markaz/test/${t.type}/${t.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Sinab ko'rish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: TOPSHIRIQLAR VA NATIJALAR ───────────────────────── */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeTab === "submissions" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="O'quvchi ismi yoki test nomi bo'yicha qidirish..."
              value={subSearch}
              onChange={(e) => setSubSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>

          {filteredSubs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h3 className="text-slate-700 font-bold text-base">Topshiriqlar topilmadi</h3>
              <p className="text-xs text-slate-400 mt-1">
                O'quvchilar testlarni topshirgach, natijalar avtomatik shu yerda aks etadi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubs.map((s) => {
                const meta = TYPE_META[s.test_type] || TYPE_META.reading;
                const Icon = meta.icon;
                const isOpen = expanded === s.id;

                return (
                  <div
                    key={s.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all hover:border-slate-300"
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-800">
                            {s.student_name} {s.student_surname}
                          </h3>
                          <p className="text-sm font-medium text-slate-600 mt-0.5">
                            Test: <span className="text-slate-800 font-semibold">{s.test_title}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Topshirildi: {fmtDate(s.created_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => setToDelete(s)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold border border-red-100 transition-colors"
                        >
                          O'chirish
                        </button>
                      </div>

                      {/* Summary chip(lar) */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        {s.test_type === "full_mock" ? (
                          <>
                            <SectionSummaryChip
                              meta={TYPE_META.listening}
                              score={s.server_results?.listening?.score}
                              total={s.server_results?.listening?.total}
                              band={s.server_results?.listening?.band}
                            />
                            <SectionSummaryChip
                              meta={TYPE_META.reading}
                              score={s.server_results?.reading?.score}
                              total={s.server_results?.reading?.total}
                              band={s.server_results?.reading?.band}
                            />
                            <div
                              className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 ${TYPE_META.writing.chip}`}
                            >
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <PenLine className="w-4 h-4" /> Writing
                              </div>
                              <p className={`text-2xl font-extrabold mt-1 ${TYPE_META.writing.num}`}>
                                {s.writing_answers?.length || 0}{" "}
                                <span className="text-sm font-medium">task</span>
                                {s.teacher_band != null && (
                                  <span className="ml-2 text-base">
                                    · Band {Number(s.teacher_band).toFixed(1)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </>
                        ) : (
                          <div className={`flex-1 min-w-[160px] rounded-xl border px-4 py-3 ${meta.chip}`}>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Icon className="w-4 h-4" /> {meta.label}
                            </div>
                            {s.test_type === "writing" ? (
                              <p className={`text-2xl font-extrabold mt-1 ${meta.num}`}>
                                {s.writing_answers?.length || 0}{" "}
                                <span className="text-sm font-medium">task</span>
                                {s.teacher_band != null && (
                                  <span className="ml-2 text-base">
                                    · Band {Number(s.teacher_band).toFixed(1)}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <p className={`text-2xl font-extrabold mt-1 ${meta.num}`}>
                                {s.correct_count}/{s.total_questions}
                                {s.band_score != null && (
                                  <span className="ml-2 text-base font-semibold">
                                    Band {Number(s.band_score).toFixed(1)}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setExpanded(isOpen ? null : s.id)}
                        className="mt-4 flex items-center gap-1.5 text-xs sm:text-sm text-indigo-600 font-bold hover:text-indigo-700 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isOpen ? "Yopish" : "Javoblarni batafsil ko'rish"}</span>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="border-t border-slate-100 bg-slate-50/70 p-5">
                        {s.test_type === "writing" ? (
                          <WritingDetails sub={s} onSaved={fetchData} />
                        ) : s.test_type === "full_mock" ? (
                          <FullMockDetails sub={s} onSaved={fetchData} />
                        ) : (
                          <ObjectiveDetails results={s.server_results?.results} />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {toDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Topshiriqni o'chirish</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5">
              <b>{toDelete.student_name} {toDelete.student_surname}</b>ning topshirig'i va natijalari butunlay o'chiriladi.
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                onClick={() => setToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-sm"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionSummaryChip({ meta, score, total, band }) {
  const Icon = meta.icon;
  return (
    <div className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 ${meta.chip}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="w-4 h-4" /> {meta.label}
      </div>
      <p className={`text-2xl font-extrabold mt-1 ${meta.num}`}>
        {score ?? 0}/{total ?? 0}
        {band != null && <span className="ml-2 text-base font-semibold">Band {Number(band).toFixed(1)}</span>}
      </p>
    </div>
  );
}

function FullMockDetails({ sub, onSaved }) {
  const sr = sub.server_results || {};
  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
          <Headphones className="w-4 h-4" /> Listening
        </h4>
        <ObjectiveDetails results={sr.listening?.results} />
      </div>
      <div>
        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4" /> Reading
        </h4>
        <ObjectiveDetails results={sr.reading?.results} />
      </div>
      <div>
        <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2">
          <PenLine className="w-4 h-4" /> Writing
        </h4>
        <WritingDetails sub={sub} onSaved={onSaved} />
      </div>
    </div>
  );
}

function ObjectiveDetails({ results: resultsProp }) {
  const results = resultsProp || {};
  const nums = Object.keys(results).sort((a, b) => Number(a) - Number(b));
  if (nums.length === 0) return <p className="text-sm text-slate-400">Tafsilotlar yo'q.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500 border-b border-slate-200">
            <th className="py-2 pr-3">#</th>
            <th className="py-2 pr-3">User Answer</th>
            <th className="py-2 pr-3">Correct Answer</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {nums.map((n) => {
            const r = results[n];
            const correct = r.correct;
            const ca = Array.isArray(r.correctAnswer) ? r.correctAnswer.join(" / ") : r.correctAnswer;
            return (
              <tr key={n} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-medium">Q{n}</td>
                <td className="py-2 pr-3">{r.userAnswer || <span className="text-slate-300">—</span>}</td>
                <td className="py-2 pr-3">{ca}</td>
                <td className="py-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {correct ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WritingDetails({ sub, onSaved }) {
  const tasks = sub.writing_answers || [];
  const [band, setBand] = useState(sub.teacher_band ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/centers/submissions/${sub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacher_band: band === "" ? null : Number(band), writing_reviewed: true }),
      });
      if (!res.ok) throw new Error();
      toast.success("Saqlandi");
      onSaved?.();
    } catch {
      toast.error("Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {tasks.map((t, i) => (
        <div key={i} className="bg-white rounded-xl border border-purple-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-purple-700">{t.title || `Task ${t.taskNumber || i + 1}`}</p>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <FileText className="w-3.5 h-3.5" /> {t.wordCount} words
              </p>
            </div>
            <CopyButton text={t.text} label="Copy Essay" />
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap max-h-72 overflow-y-auto">
            {t.text || <span className="text-slate-300">Bo'sh</span>}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-4">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-1">
          <Clock className="w-4 h-4" /> Band (o'qituvchi):
        </label>
        <input
          type="number"
          step="0.5"
          min="0"
          max="9"
          value={band}
          onChange={(e) => setBand(e.target.value)}
          className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm"
          placeholder="7.0"
        />
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{" "}
          Saqlash
        </button>
      </div>
    </div>
  );
}
