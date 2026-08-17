"use client";

import { useState, useMemo } from "react";
import { X, Upload, Loader2, FileCode, CheckCircle2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const SAMPLE_JSON = `[
  {
    "title": "Academic Essay Essentials",
    "content": "Reading skills are fundamental to academic success in international examinations. Developing speed and comprehension requires regular daily practice.",
    "language": "en",
    "category": "academic",
    "difficulty": "medium",
    "is_active": true
  },
  {
    "title": "Global Climate Dynamics",
    "content": "Climate change represents one of the most pressing challenges of our modern era. Rising temperatures contribute to significant changes in weather patterns.",
    "language": "en",
    "category": "academic",
    "difficulty": "hard",
    "is_active": true
  }
]`;

export default function ImportTypingJsonModal({ onClose, onImported }) {
  const [jsonText, setJsonText] = useState("");
  const [importing, setImporting] = useState(false);

  const parsed = useMemo(() => {
    if (!jsonText.trim()) return { data: null, error: null };
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) {
        return { data: null, error: "JSON array (ro'yxat) formatida bo'lishi kerak: [ { ... }, { ... } ]" };
      }
      const invalidItem = data.find(item => !item.content || typeof item.content !== "string");
      if (invalidItem) {
        return { data: null, error: "Har bir elementda 'content' (matn) maydoni bo'lishi shart." };
      }
      return { data, error: null };
    } catch (e) {
      return { data: null, error: `Sintaktik xato: ${e.message}` };
    }
  }, [jsonText]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJsonText(event.target?.result || "");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!parsed.data || parsed.data.length === 0) {
      toast.error("Import qilish uchun to'g'ri JSON kiriting!");
      return;
    }

    setImporting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const item of parsed.data) {
        try {
          const res = await fetch("/api/typing/texts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: item.title || "Imported Text",
              content: item.content,
              language: item.language || "en",
              category: item.category || "general",
              difficulty: item.difficulty || "medium",
              is_active: item.is_active ?? true
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} ta matn muvaffaqiyatli yuklandi!`);
        onImported?.();
        onClose?.();
      } else {
        toast.error("Hech qaysi matnni saqlab bo'lmadi");
      }
    } catch (err) {
      toast.error(`Import xatosi: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">JSON orqali ommaviy yuklash</h3>
              <p className="text-xs text-muted-foreground">
                Bir vaqtning o&apos;zida bir nechta matnlarni bazaga kiritish
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              JSON Kodini joylashtiring yoki fayl yuklang:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setJsonText(SAMPLE_JSON)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Namunani qo&apos;yish
              </button>
              <label className="cursor-pointer px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted transition-colors">
                Fayl tanlash (.json)
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <textarea
            rows={10}
            placeholder={SAMPLE_JSON}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full p-4 rounded-2xl border border-border bg-background text-xs font-mono leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none resize-y"
          />

          {/* Validation Feedback */}
          {parsed.error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parsed.error}</span>
            </div>
          )}

          {parsed.data && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                To&apos;g&apos;ri format! Jami <strong>{parsed.data.length}</strong> ta matn aniqlandi.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !parsed.data || parsed.data.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Yuklanmoqda...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Import qilish ({parsed.data?.length || 0})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
