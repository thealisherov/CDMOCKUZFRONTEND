"use client";

/**
 * Admin Panel — Full Mock Tests Manager
 * - Testlar ro'yxati (title, narx, expire, kodlar soni)
 * - Edit modal (narx, expire, title tahrirlash)
 * - Kod yaratish (ism/familiya bilan)
 * - Kodlar ro'yxati
 */

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Layers, Loader2, Pencil, Key, Plus, Copy, Check,
  Clock, DollarSign, Tag, X, Eye, EyeOff, RefreshCw,
} from "lucide-react";

export default function FullMockManager() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [codesTarget, setCodesTarget] = useState(null); // test id — kodlar modali
  const [codes, setCodes] = useState([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ person_name: "" });
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/fullmock");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Yuklashda xato");
      setTests(json.tests || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Edit handlers ──
  async function handleSave() {
    if (!editTarget) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/fullmock", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTarget),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Saqlashda xato");
      toast.success("Saqlandi");
      setEditTarget(null);
      load();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Codes handlers ──
  async function loadCodes(mockId) {
    setCodesLoading(true);
    try {
      const res = await fetch(`/api/admin/fullmock/codes?mock_id=${mockId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setCodes(json.codes || []);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCodesLoading(false);
    }
  }

  function openCodes(test) {
    setCodesTarget(test);
    loadCodes(test.id);
  }

  async function handleCreateCode() {
    if (!codesTarget || !createForm.person_name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/fullmock/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mock_id: codesTarget.id,
          person_name: createForm.person_name.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Yaratishda xato");
      toast.success(`Kod yaratildi: ${json.code.code}`);
      setCreateForm({ person_name: "" });
      loadCodes(codesTarget.id);
      load(); // kodlar sonini yangilash
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Kod nusxalandi: ${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  const statusBadge = (status) => {
    if (status === "used") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Ishlatilgan</span>;
    if (status === "expired") return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">Muddati tugagan</span>;
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">Faol</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Public Full Mock Testlar</h2>
            <p className="text-xs text-muted-foreground">{tests.length} ta test — narx, expire va kodlarni boshqarish</p>
          </div>
        </div>
        <button onClick={load} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors" title="Yangilash">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Tests grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-20 text-sm text-muted-foreground rounded-xl border border-border bg-card">
          Hozircha public full mock test yo'q. JSON import qilib, center_id bo'lmagan full_mock test qo'shing.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test, idx) => (
            <div
              key={test.id}
              className="rounded-xl border border-border bg-card p-5 space-y-3 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{test.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Full Mock #{idx + 1}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {test.is_active ? (
                    <Eye className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{test.price_uzs?.toLocaleString()} UZS / ${test.price_usd || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{test.expire_hours || 48} soat expire</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Key className="w-3.5 h-3.5" />
                  <span>{test.codes_active || 0} faol / {test.codes_total || 0} jami kod</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <button
                  onClick={() => setEditTarget({ id: test.id, title: test.title, price_uzs: test.price_uzs, price_usd: test.price_usd, expire_hours: test.expire_hours, is_active: test.is_active })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Tahrirlash
                </button>
                <button
                  onClick={() => openCodes(test)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  <Key className="w-3.5 h-3.5" /> Kodlar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Pencil className="w-5 h-5 text-purple-600" /> Tahrirlash
              </h3>
              <button onClick={() => setEditTarget(null)} className="p-2 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Sarlavha</label>
                <input
                  value={editTarget.title || ""}
                  onChange={(e) => setEditTarget(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Narx (UZS)</label>
                  <input
                    type="number" min={0}
                    value={editTarget.price_uzs ?? 0}
                    onChange={(e) => setEditTarget(p => ({ ...p, price_uzs: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Narx (USD)</label>
                  <input
                    type="number" min={0} step="0.01"
                    value={editTarget.price_usd ?? 0}
                    onChange={(e) => setEditTarget(p => ({ ...p, price_usd: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Expire vaqti (soat)</label>
                  <input
                    type="number" min={1}
                    value={editTarget.expire_hours ?? 48}
                    onChange={(e) => setEditTarget(p => ({ ...p, expire_hours: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 py-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editTarget.is_active}
                      onChange={(e) => setEditTarget(p => ({ ...p, is_active: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Faol</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Codes Modal ── */}
      {codesTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" /> Kirish kodlari
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{codesTarget.title}</p>
              </div>
              <button onClick={() => { setCodesTarget(null); setCodes([]); }} className="p-2 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create code form */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Ism Familiya</label>
                  <input
                    value={createForm.person_name}
                    onChange={(e) => setCreateForm(p => ({ ...p, person_name: e.target.value }))}
                    placeholder="Abdulaziz Karimov"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateCode()}
                  />
                </div>
                <button
                  onClick={handleCreateCode}
                  disabled={creating || !createForm.person_name.trim()}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Kod yaratish
                </button>
              </div>
            </div>

            {/* Codes list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {codesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground">
                  Hozircha kodlar yo'q. Yuqoridagi forma orqali yangi kod yarating.
                </div>
              ) : (
                <div className="space-y-2">
                  {codes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider text-purple-700 dark:text-purple-400 hover:text-purple-900 transition-colors"
                          title="Nusxalash"
                        >
                          {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {c.code}
                        </button>
                        <span className="text-xs text-muted-foreground">— {c.person_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {new Date(c.expires_at).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {statusBadge(c.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
