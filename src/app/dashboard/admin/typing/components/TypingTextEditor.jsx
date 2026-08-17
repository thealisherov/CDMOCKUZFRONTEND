"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Save, FileText, Globe, Layers, BarChart2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function TypingTextEditor({ text, onClose, onSaved }) {
  const isEditing = Boolean(text?.id);

  const [title, setTitle] = useState(text?.title || "");
  const [content, setContent] = useState(text?.content || "");
  const [language, setLanguage] = useState(text?.language || "en");
  const [category, setCategory] = useState(text?.category || "academic");
  const [difficulty, setDifficulty] = useState(text?.difficulty || "medium");
  const [isActive, setIsActive] = useState(text?.is_active ?? true);
  const [saving, setSaving] = useState(false);

  const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Matn kiritilishi shart!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim() || "Untitled",
        content: content.trim(),
        language,
        category,
        difficulty,
        is_active: isActive
      };

      const url = isEditing ? `/api/typing/texts/${text.id}` : "/api/typing/texts";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Saqlashda xatolik yuz berdi");
      }

      toast.success(isEditing ? "Matn yangilandi!" : "Yangi matn qo'shildi!");
      onSaved?.(json.text);
      onClose?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {isEditing ? "Matnni tahrirlash" : "Yangi typing matni qo'shish"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Monkeytype formatidagi toza matn va parametrlar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Sarlavha (Title) *
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: Academic Writing Essentials"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          {/* Selectors grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-500" /> Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="academic">Academic / IELTS</option>
                <option value="quotes">Quotes / Hikmatlar</option>
                <option value="literature">Literature / Adabiyot</option>
                <option value="tech">Technology</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-emerald-500" /> Qiyinlik
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="easy">Easy (Oson)</option>
                <option value="medium">Medium (O&apos;rta)</option>
                <option value="hard">Hard (Qiyin)</option>
              </select>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Typing Matni (Plain Text) *
              </label>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                {wordCount} ta so&apos;z · {charCount} ta belgi
              </span>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Typing mashqi uchun matnni shu yerga kiriting..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 rounded-2xl border border-border bg-background text-sm font-mono leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none resize-y transition-all"
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              * Maxsus formatlash kerak emas. Matn toza harflar va tinish belgilaridan iborat bo&apos;lishi tavsiya etiladi.
            </p>
          </div>

          {/* Active Status Checkbox */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-muted/20">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-bold text-foreground cursor-pointer select-none">
              Ushbu matn faol (foydalanuvchilar typing testlarida ishlata oladi)
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saqlanmoqda...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> {isEditing ? "O'zgarishlarni saqlash" : "Matnni qo'shish"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
