"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, LogOut, Loader2, Trash2, Headphones, BookOpen, PenLine, Layers,
  Copy, Check, ChevronDown, ChevronUp, Clock, FileText, AlertTriangle, Save, RefreshCw
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const TYPE_META = {
  listening: { icon: Headphones, label: "Listening", chip: "bg-blue-50 text-blue-700 border-blue-100", num: "text-blue-600" },
  reading:   { icon: BookOpen,   label: "Reading",   chip: "bg-green-50 text-green-700 border-green-100", num: "text-green-600" },
  writing:   { icon: PenLine,    label: "Writing",   chip: "bg-purple-50 text-purple-700 border-purple-100", num: "text-purple-600" },
  full_mock: { icon: Layers,     label: "Full Mock", chip: "bg-indigo-50 text-indigo-700 border-indigo-100", num: "text-indigo-600" },
};

function fmtDate(s) {
  try { return new Date(s).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return s; }
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => { try { await navigator.clipboard.writeText(text || ""); setCopied(true); setTimeout(() => setCopied(false), 1200); } catch {} }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Nusxalandi" : "Copy"}
    </button>
  );
}

export default function PanelClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [center, setCenter] = useState(null);
  const [subs, setSubs] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/centers/submissions", { cache: "no-store" });
      if (res.status === 401) { router.replace("/markaz"); return; }
      const d = await res.json();
      setCenter(d.center);
      setSubs(d.submissions || []);
    } catch {
      // Tarmoq xatosi — panelni tashlab yubormaymiz, xabar beramiz
      toast.error("Ma'lumot yuklashda xatolik. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const logout = async () => { await fetch("/api/centers/logout", { method: "POST" }); router.replace("/markaz"); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/centers/submissions/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSubs(prev => prev.filter(s => s.id !== toDelete.id));
      toast.success("O'chirildi");
    } catch { toast.error("O'chirishda xatolik"); }
    finally { setToDelete(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
          {center?.image
            ? <img src={center.image} alt="" className="w-12 h-12 rounded-xl object-cover border" />
            : <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>}
          <div>
            <h1 className="text-xl font-bold text-slate-800">{center?.name}</h1>
            <p className="text-sm text-slate-500">O'qituvchi paneli · {subs.length} ta topshiriq</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-white disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Yangilash
          </button>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-white">
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Hali topshiriqlar yo'q.
        </div>
      ) : (
        <div className="space-y-4">
          {subs.map((s) => {
            const meta = TYPE_META[s.test_type] || TYPE_META.reading;
            const Icon = meta.icon;
            const isOpen = expanded === s.id;
            return (
              <div key={s.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{s.student_name} {s.student_surname}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Test: {s.test_title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Submitted: {fmtDate(s.created_at)}</p>
                    </div>
                    <button onClick={() => setToDelete(s)} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600">
                      Delete
                    </button>
                  </div>

                  {/* Summary chip(lar) */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {s.test_type === "full_mock" ? (
                      <>
                        <SectionSummaryChip meta={TYPE_META.listening} score={s.server_results?.listening?.score} total={s.server_results?.listening?.total} band={s.server_results?.listening?.band} />
                        <SectionSummaryChip meta={TYPE_META.reading} score={s.server_results?.reading?.score} total={s.server_results?.reading?.total} band={s.server_results?.reading?.band} />
                        <div className={`flex-1 min-w-[150px] rounded-xl border px-4 py-3 ${TYPE_META.writing.chip}`}>
                          <div className="flex items-center gap-2 text-sm font-semibold"><PenLine className="w-4 h-4" /> Writing</div>
                          <p className={`text-2xl font-extrabold mt-1 ${TYPE_META.writing.num}`}>
                            {(s.writing_answers?.length || 0)} <span className="text-sm font-medium">task</span>
                            {s.teacher_band != null && <span className="ml-2 text-base">· Band {Number(s.teacher_band).toFixed(1)}</span>}
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
                            {(s.writing_answers?.length || 0)} <span className="text-sm font-medium">task</span>
                            {s.teacher_band != null && <span className="ml-2 text-base">· Band {Number(s.teacher_band).toFixed(1)}</span>}
                          </p>
                        ) : (
                          <p className={`text-2xl font-extrabold mt-1 ${meta.num}`}>
                            {s.correct_count}/{s.total_questions}
                            {s.band_score != null && <span className="ml-2 text-base font-semibold">Band {Number(s.band_score).toFixed(1)}</span>}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setExpanded(isOpen ? null : s.id)}
                    className="mt-4 flex items-center gap-1.5 text-sm text-indigo-600 font-medium"
                  >
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {isOpen ? "Yopish" : "Batafsil ko'rish"}
                  </button>
                </div>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                    {s.test_type === "writing"
                      ? <WritingDetails sub={s} onSaved={fetchData} />
                      : s.test_type === "full_mock"
                        ? <FullMockDetails sub={s} onSaved={fetchData} />
                        : <ObjectiveDetails results={s.server_results?.results} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-lg text-slate-800">O'chirish</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5"><b>{toDelete.student_name} {toDelete.student_surname}</b>ning topshirig'i o'chiriladi.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setToDelete(null)} className="px-4 py-2 rounded-lg border text-sm">Bekor</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">O'chirish</button>
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
      <div className="flex items-center gap-2 text-sm font-semibold"><Icon className="w-4 h-4" /> {meta.label}</div>
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
        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2"><Headphones className="w-4 h-4" /> Listening</h4>
        <ObjectiveDetails results={sr.listening?.results} />
      </div>
      <div>
        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Reading</h4>
        <ObjectiveDetails results={sr.reading?.results} />
      </div>
      <div>
        <h4 className="font-bold text-purple-700 mb-2 flex items-center gap-2"><PenLine className="w-4 h-4" /> Writing</h4>
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
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
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
    } catch { toast.error("Saqlashda xatolik"); }
    finally { setSaving(false); }
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
            <CopyButton text={t.text} />
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap max-h-72 overflow-y-auto">
            {t.text || <span className="text-slate-300">Bo'sh</span>}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 p-4">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-1"><Clock className="w-4 h-4" /> Band (o'qituvchi):</label>
        <input type="number" step="0.5" min="0" max="9" value={band} onChange={(e) => setBand(e.target.value)}
          className="w-24 px-3 py-1.5 rounded-lg border border-slate-200 text-sm" placeholder="7.0" />
        <button onClick={save} disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Saqlash
        </button>
      </div>
    </div>
  );
}
