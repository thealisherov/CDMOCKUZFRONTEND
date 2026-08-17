"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search, Plus, Upload, Globe, BarChart2, Layers,
  Trash2, Pencil, CheckCircle2, XCircle, Loader2, FileText, RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import TypingTextEditor from "./TypingTextEditor";
import ImportTypingJsonModal from "./ImportTypingJsonModal";

export default function TypingTextsList() {
  const [texts, setTexts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [langFilter, setLangFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  // Modals
  const [editingText, setEditingText] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/typing/texts?all=true");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Matnlarni yuklashda xatolik");
      setTexts(json.texts || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTexts();
  }, []);

  // Active status toggle
  const handleToggleActive = async (textItem) => {
    try {
      const nextStatus = !textItem.is_active;
      const res = await fetch(`/api/typing/texts/${textItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextStatus })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Statusni o'zgartirib bo'lmadi");

      setTexts(prev => prev.map(t => (t.id === textItem.id ? { ...t, is_active: nextStatus } : t)));
      toast.success(nextStatus ? "Matn faollashtirildi" : "Matn nofaol qilindi");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Haqiqatan ham ushbu matnni o'chirmoqchimisiz?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/typing/texts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "O'chirishda xatolik");

      setTexts(prev => prev.filter(t => t.id !== id));
      toast.success("Matn o'chirildi!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered texts
  const filteredTexts = useMemo(() => {
    return texts.filter(t => {
      if (langFilter !== "all" && t.language !== langFilter) return false;
      if (diffFilter !== "all" && t.difficulty !== diffFilter) return false;
      if (catFilter !== "all" && t.category !== catFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = (t.title || "").toLowerCase().includes(q);
        const matchesContent = (t.content || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesContent) return false;
      }
      return true;
    });
  }, [texts, langFilter, diffFilter, catFilter, search]);

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Yangi Matn
          </button>
          <button
            onClick={() => setIsImporting(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted font-bold text-xs sm:text-sm text-foreground transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" /> JSON Import
          </button>
          <button
            onClick={fetchTexts}
            title="Yangilash"
            className="p-2.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sarlavha yoki matn bo'yicha..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-xs sm:text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Difficulty Filter */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border text-xs">
          <span className="text-muted-foreground font-semibold px-2">Qiyinlik:</span>
          {["all", "easy", "medium", "hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                diffFilter === d
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border text-xs">
          <span className="text-muted-foreground font-semibold px-2">Kategoriya:</span>
          {["all", "academic", "quotes", "literature", "tech"].map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                catFilter === c
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Texts Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredTexts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-foreground">Matnlar topilmadi</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Filtr shartlariga mos keladigan matn yo&apos;q yoki hali matnlar qo&apos;shilmagan.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
          >
            Yangi matn kiritish
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Sarlavha & Matn</th>
                  <th className="py-3.5 px-3">Kategoriya</th>
                  <th className="py-3.5 px-3">Qiyinlik</th>
                  <th className="py-3.5 px-3">So&apos;zlar</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTexts.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="font-bold text-foreground">{t.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 font-mono opacity-80">
                        {t.content}
                      </p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="capitalize text-xs font-semibold text-muted-foreground">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        t.difficulty === "easy"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : t.difficulty === "hard"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}>
                        {t.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-muted-foreground">
                      {t.word_count || t.content?.split(/\s+/).length || 0} ta
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => handleToggleActive(t)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                          t.is_active
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {t.is_active ? "Faol" : "Nofaol"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingText(t)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors disabled:opacity-50"
                          title="O'chirish"
                        >
                          {deletingId === t.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {(isCreating || editingText) && (
        <TypingTextEditor
          text={editingText}
          onClose={() => {
            setIsCreating(false);
            setEditingText(null);
          }}
          onSaved={() => {
            fetchTexts();
          }}
        />
      )}

      {/* Import Modal */}
      {isImporting && (
        <ImportTypingJsonModal
          onClose={() => setIsImporting(false)}
          onImported={() => {
            fetchTexts();
          }}
        />
      )}
    </div>
  );
}
