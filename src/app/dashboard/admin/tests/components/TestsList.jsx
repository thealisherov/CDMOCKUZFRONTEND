"use client";

/**
 * Admin testlar ro'yxati: filtrlash, tahrirlash, nusxalash, JSON import/export, o'chirish.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  FileText, Plus, Search, Loader2, Pencil, Copy, Download, Trash2,
  Upload, Headphones, BookOpen, PenTool, Layers, Building2, Globe, RefreshCw,
} from "lucide-react";
import ImportJsonModal from "./ImportJsonModal";

const TYPE_META = {
  listening: { label: "Listening", icon: Headphones, cls: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300" },
  reading: { label: "Reading", icon: BookOpen, cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  writing: { label: "Writing", icon: PenTool, cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  full_mock: { label: "Full Mock", icon: Layers, cls: "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
};

export default function TestsList() {
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [centerFilter, setCenterFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null); // {test, renumberRisk}
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tests");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Yuklashda xato");
      setTests(json.tests || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/admin/centers")
      .then((r) => r.json())
      .then((j) => setCenters(j.centers || j || []))
      .catch(() => {});
  }, [load]);

  const filtered = useMemo(() => {
    let list = tests;
    if (typeFilter !== "all") list = list.filter((t) => t.type === typeFilter);
    if (centerFilter === "platform") list = list.filter((t) => !t.center_id);
    else if (centerFilter !== "all") list = list.filter((t) => t.center === centerFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) => t.test_id.toLowerCase().includes(q) || (t.title || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [tests, typeFilter, centerFilter, search]);

  async function handleExport(test) {
    try {
      const res = await fetch(`/api/admin/tests/${test.id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Xato");
      const blob = new Blob([JSON.stringify(json.test.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${test.test_id.replace(/[^a-zA-Z0-9._-]+/g, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("JSON yuklab olindi");
    } catch (e) {
      toast.error(e.message);
    }
  }

  function openDelete(test) {
    // Renumber xavfi: shu turdagi platforma testlari orasida oxirgisi emasmi?
    const laterExists = tests.some(
      (t) => !t.center_id && t.type === test.type && t.id !== test.id &&
        !test.center_id && new Date(t.created_at) > new Date(test.created_at)
    );
    setDeleteConfirmText("");
    setDeleteTarget({ test, renumberRisk: laterExists });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/tests/${deleteTarget.test.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "O'chirishda xato");
      toast.success("Test o'chirildi");
      if (json.renumbered) {
        toast("Diqqat: keyingi testlarning ochiq raqamlari o'zgardi!", { icon: "⚠️", duration: 6000 });
      }
      setDeleteTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600 dark:bg-indigo-950">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Testlar</h1>
            <p className="text-sm text-muted-foreground">
              {tests.length} ta test — yaratish, tahrirlash, import/export
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border font-medium text-sm hover:bg-muted transition-colors"
          >
            <Upload className="w-4 h-4" /> Import JSON
          </button>
          <button
            onClick={() => router.push("/dashboard/admin/tests/new")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Yangi test
          </button>
        </div>
      </div>

      {/* Filtrlar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="test_id yoki sarlavha bo'yicha qidirish..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1 bg-card">
          {["all", "listening", "reading", "writing", "full_mock"].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                typeFilter === t ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t === "all" ? "Hammasi" : TYPE_META[t].label}
            </button>
          ))}
        </div>
        <select
          value={centerFilter}
          onChange={(e) => setCenterFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none"
        >
          <option value="all">Barcha manbalar</option>
          <option value="platform">Platforma</option>
          {centers.map((c) => (
            <option key={c.id || c.slug} value={c.slug}>
              {c.name || c.slug}
            </option>
          ))}
        </select>
      </div>

      {/* Jadval */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            Testlar topilmadi
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Test</th>
                  <th className="px-4 py-3 font-semibold">Turi</th>
                  <th className="px-4 py-3 font-semibold">Manba</th>
                  <th className="px-4 py-3 font-semibold">№</th>
                  <th className="px-4 py-3 font-semibold">Savollar</th>
                  <th className="px-4 py-3 font-semibold">Tution</th>
                  <th className="px-4 py-3 font-semibold">Sana</th>
                  <th className="px-4 py-3 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((test) => {
                  const meta = TYPE_META[test.type] || TYPE_META.reading;
                  const Icon = meta.icon;
                  return (
                    <tr key={test.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{test.title || "(sarlavhasiz)"}</div>
                        <div className="text-xs text-muted-foreground font-mono">{test.test_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.cls}`}>
                          <Icon className="w-3.5 h-3.5" /> {meta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {test.center_id ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="w-3.5 h-3.5" /> {test.center || "markaz"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Globe className="w-3.5 h-3.5" /> Platforma
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {test.publicNumber ? `#${test.publicNumber}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{test.totalQuestions ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${test.testTution === "paid" || test.testTution === "premium" ? "text-amber-600" : "text-emerald-600"}`}>
                          {test.testTution === "paid" || test.testTution === "premium" ? "Premium" : "Bepul"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(test.created_at).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => router.push(`/dashboard/admin/tests/${test.id}`)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Tahrirlash"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => router.push(`/dashboard/admin/tests/${test.id}?duplicate=1`)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Nusxalash"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExport(test)}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="JSON eksport"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDelete(test)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-red-600">Testni o'chirish</h3>
            <p className="text-sm">
              <span className="font-semibold">{deleteTarget.test.title || deleteTarget.test.test_id}</span> testini
              butunlay o'chirmoqchimisiz?
            </p>
            {deleteTarget.renumberRisk && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <p className="font-semibold">⚠️ Diqqat: raqamlash o'zgaradi!</p>
                <p>
                  Bu testdan keyin yaratilgan barcha {TYPE_META[deleteTarget.test.type]?.label} testlarning
                  ochiq raqamlari (#) bittaga suriladi. Foydalanuvchilarning eski urinishlari
                  (TestAttempts) boshqa testga ko'rsatib qolishi mumkin.
                </p>
                <p>
                  Tasdiqlash uchun <span className="font-mono font-bold">OCHIRISH</span> deb yozing:
                </p>
                <input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-card text-sm outline-none"
                  placeholder="OCHIRISH"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || (deleteTarget.renumberRisk && deleteConfirmText !== "OCHIRISH")}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />} O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {importOpen && (
        <ImportJsonModal
          centers={centers}
          onClose={() => setImportOpen(false)}
          onImported={() => {
            setImportOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}
