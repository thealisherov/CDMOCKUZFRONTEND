"use client";

/**
 * Tayyor JSON'ni joylashtirib test yaratish (escape hatch).
 * Shape'dan tur avtodetekt qilinadi, validator warninglar bilan ko'rsatiladi.
 */

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, Loader2, Upload, AlertTriangle, CircleX } from "lucide-react";
import { validateTest, hasErrors } from "../lib/validators";
import { detectTypeFromData, prepareForSave } from "../lib/serialize";

export default function ImportJsonModal({ centers = [], onClose, onImported }) {
  const [jsonText, setJsonText] = useState("");
  const [testId, setTestId] = useState("");
  const [type, setType] = useState("");
  const [saving, setSaving] = useState(false);

  const parsed = useMemo(() => {
    if (!jsonText.trim()) return { data: null, error: null };
    try {
      const data = JSON.parse(jsonText);
      return { data, error: null };
    } catch (e) {
      return { data: null, error: e.message };
    }
  }, [jsonText]);

  const detectedType = useMemo(
    () => (parsed.data ? detectTypeFromData(parsed.data) : null),
    [parsed.data]
  );
  const effectiveType = type || detectedType || "";

  const issues = useMemo(() => {
    if (!parsed.data || !effectiveType) return [];
    try {
      return validateTest({
        test_id: testId.trim() || "import",
        type: effectiveType,
        data: parsed.data,
      });
    } catch {
      return [];
    }
  }, [parsed.data, effectiveType, testId]);

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  async function handleImport() {
    if (!parsed.data || !effectiveType || !testId.trim()) return;
    setSaving(true);
    try {
      const data = prepareForSave(effectiveType, parsed.data);
      const res = await fetch("/api/admin/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: testId.trim(), type: effectiveType, data }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.issues) {
          throw new Error(
            json.issues
              .filter((i) => i.severity === "error")
              .map((i) => i.message)
              .slice(0, 3)
              .join("; ") || json.error
          );
        }
        throw new Error(json.error || "Import xatosi");
      }
      toast.success("Test import qilindi");
      onImported?.();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" /> JSON import
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                test_id (unikal kalit) *
              </label>
              <input
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder='masalan: "Listening Volume 7.1"'
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Turi {detectedType && <span className="text-indigo-600">(aniqlandi: {detectedType})</span>}
              </label>
              <select
                value={effectiveType}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none"
              >
                <option value="">— tanlang —</option>
                <option value="listening">listening</option>
                <option value="reading">reading</option>
                <option value="writing">writing</option>
                <option value="full_mock">full_mock</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Test JSON (data maydoni) *
            </label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={12}
              spellCheck={false}
              placeholder='{"id": "...", "title": "...", "parts": [...]}'
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
            />
            {parsed.error && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <CircleX className="w-3.5 h-3.5" /> JSON xato: {parsed.error}
              </p>
            )}
          </div>

          {parsed.data && effectiveType && (errors.length > 0 || warnings.length > 0) && (
            <div className="space-y-2">
              {errors.map((i, idx) => (
                <div key={`e${idx}`} className="flex items-start gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/50 rounded-lg px-3 py-2">
                  <CircleX className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span><span className="font-mono text-[10px] opacity-70">{i.path}</span> — {i.message}</span>
                </div>
              ))}
              {warnings.map((i, idx) => (
                <div key={`w${idx}`} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 rounded-lg px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span><span className="font-mono text-[10px] opacity-70">{i.path}</span> — {i.message}</span>
                </div>
              ))}
            </div>
          )}

          {parsed.data?.center && (
            <p className="text-xs text-muted-foreground">
              Markaz testi: <span className="font-mono">{parsed.data.center}</span>
              {centers.length > 0 && !centers.some((c) => c.slug === parsed.data.center) && (
                <span className="text-red-600"> — bunday slug'li markaz topilmadi!</span>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleImport}
            disabled={saving || !parsed.data || !effectiveType || !testId.trim() || errors.length > 0}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Import qilish
          </button>
        </div>
      </div>
    </div>
  );
}
