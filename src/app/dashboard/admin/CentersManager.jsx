"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2, Plus, Trash2, Copy, Check, X, Eye, EyeOff,
  Users as UsersIcon, ShieldCheck, Send, ImageIcon, Loader2, AlertTriangle, PlayCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const EMPTY = {
  name: "", slug: "", telegram_channel: "", image_url: "",
  student_login: "", student_password: "",
  admin_login: "", admin_password: "",
};

function CopyField({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);
  const [show, setShow] = useState(false);
  const isSecret = /parol|password/i.test(label);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { /* ignore */ }
  };
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
      <span className={`flex-1 truncate text-sm ${mono ? "font-mono" : ""}`}>
        {isSecret && !show ? "••••••••" : (value || "—")}
      </span>
      {isSecret && (
        <button onClick={() => setShow(s => !s)} className="text-gray-400 hover:text-gray-600" title="Ko'rsatish">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
      <button onClick={copy} className="text-gray-400 hover:text-indigo-600" title="Nusxa olish">
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function CentersManager() {
  const { user } = useAuth();
  const supabase = createClient();
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const fetchCenters = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/centers");
      const data = await res.json();
      if (res.ok) setCenters(data.centers || []);
      else toast.error(data.error || "Yuklashda xatolik");
    } catch {
      toast.error("Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCenters(); }, []);

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/center-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setForm(f => ({ ...f, image_url: data.publicUrl }));
      toast.success("Rasm yuklandi");
    } catch (err) {
      toast.error("Rasm yuklashda xatolik: " + (err.message || ""));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast.success("Markaz yaratildi");
      setForm(EMPTY);
      setShowForm(false);
      fetchCenters();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      const res = await fetch(`/api/admin/centers/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !c.is_active }),
      });
      if (!res.ok) throw new Error();
      setCenters(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
    } catch {
      toast.error("O'zgartirishda xatolik");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      const res = await fetch(`/api/admin/centers/${toDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("O'chirildi");
      setCenters(prev => prev.filter(x => x.id !== toDelete.id));
    } catch {
      toast.error("O'chirishda xatolik");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <Toaster position="top-center" />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-600" /> O'quv Markazlar</h2>
          <p className="text-sm text-muted-foreground">O'quvchilar <code className="px-1 bg-muted rounded">/markaz</code> sahifasidan markaz login/parol bilan kiradi.</p>
        </div>
        <button
          onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Bekor qilish" : "Yangi markaz"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="border border-border rounded-xl p-5 space-y-4 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Markaz nomi *" value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v, slug: f.slug || v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") }))}
              placeholder="iStudy Learning Center" />
            <Field label="Slug * (JSON dagi center)" value={form.slug} mono
              onChange={v => setForm(f => ({ ...f, slug: v }))} placeholder="istudy" />
            <Field label="Telegram kanal" value={form.telegram_channel}
              onChange={v => setForm(f => ({ ...f, telegram_channel: v }))} placeholder="@istudy_ielts" />
            <div>
              <label className="text-xs font-medium text-muted-foreground">Markaz rasmi</label>
              <div className="mt-1 flex items-center gap-3">
                {form.image_url
                  ? <img src={form.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                  : <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-400" /></div>}
                <label className="cursor-pointer text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-muted flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                  Yuklash
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} disabled={uploading} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-3 space-y-3">
              <p className="text-xs font-semibold text-blue-700 flex items-center gap-1.5"><UsersIcon className="w-4 h-4" /> O'quvchi kirish kodi</p>
              <Field label="Login *" value={form.student_login} mono onChange={v => setForm(f => ({ ...f, student_login: v }))} placeholder="istudy_student" />
              <Field label="Parol *" value={form.student_password} mono onChange={v => setForm(f => ({ ...f, student_password: v }))} placeholder="1234" />
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3 space-y-3">
              <p className="text-xs font-semibold text-purple-700 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Markaz admini (o'qituvchi)</p>
              <Field label="Login *" value={form.admin_login} mono onChange={v => setForm(f => ({ ...f, admin_login: v }))} placeholder="istudy_admin" />
              <Field label="Parol *" value={form.admin_password} mono onChange={v => setForm(f => ({ ...f, admin_password: v }))} placeholder="secret" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Yaratish
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : centers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Hali markaz yo'q. "Yangi markaz" tugmasi bilan qo'shing.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {centers.map(c => (
            <div key={c.id} className="border border-border rounded-xl p-4 bg-card">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {c.image_url
                    ? <img src={c.image_url} alt="" className="w-11 h-11 rounded-lg object-cover border" />
                    : <div className="w-11 h-11 rounded-lg bg-indigo-50 flex items-center justify-center"><Building2 className="w-5 h-5 text-indigo-500" /></div>}
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate">{c.slug}{c.telegram_channel ? ` · ${c.telegram_channel}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleActive(c)}
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {c.is_active ? "Faol" : "O'chiq"}
                  </button>
                  <button onClick={() => setToDelete(c)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50/40 border border-blue-100 px-3 py-2 mb-2">
                <p className="text-[11px] font-semibold text-blue-700 mb-0.5 flex items-center gap-1"><UsersIcon className="w-3.5 h-3.5" /> O'quvchi</p>
                <CopyField label="Login" value={c.student_login} />
                <CopyField label="Parol" value={c.student_password} />
              </div>
              <div className="rounded-lg bg-purple-50/40 border border-purple-100 px-3 py-2">
                <p className="text-[11px] font-semibold text-purple-700 mb-0.5 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> O'qituvchi</p>
                <CopyField label="Login" value={c.admin_login} />
                <CopyField label="Parol" value={c.admin_password} />
              </div>

              <div className="flex items-center gap-2 mt-3">
                <a
                  href={`/api/admin/centers/${c.id}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  <PlayCircle className="w-4 h-4" /> Testni sinash
                </a>
                <a
                  href={`/api/admin/centers/${c.id}/preview?as=admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                  title="O'qituvchi panelini ko'rish"
                >
                  <ShieldCheck className="w-4 h-4" /> Panel
                </a>
              </div>

              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1">
                <Send className="w-3 h-3" /> Bu markaz testlarida JSON: <code className="font-mono">"center": "{c.slug}"</code>
              </p>
            </div>
          ))}
        </div>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="bg-card rounded-xl p-6 max-w-sm w-full border border-border">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="font-bold text-lg">Markazni o'chirish</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              <b>{toDelete.name}</b> va uning barcha testlari hamda submissionlari o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setToDelete(null)} className="px-4 py-2 rounded-lg border border-border text-sm">Bekor</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium">O'chirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-indigo-400 ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
