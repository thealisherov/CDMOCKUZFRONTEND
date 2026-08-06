"use client";

/**
 * URL kiritish maydoni (audio/rasm/video) — inline preview bilan.
 * kind: 'audio' | 'image' | 'video' | 'any'
 */

import { useState } from "react";
import { Eye, EyeOff, CircleX } from "lucide-react";

const URL_RE = /^https?:\/\/\S+$/i;

export default function UrlInput({ label, value, onChange, kind = "any", placeholder, required }) {
  const [showPreview, setShowPreview] = useState(false);
  const v = value || "";
  const invalid = v.trim() && !URL_RE.test(v.trim());

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center gap-2">
        <input
          value={v}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "https://pub-....r2.dev/..."}
          className={`flex-1 px-3 py-2 rounded-lg border bg-card text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/30 ${
            invalid ? "border-red-400" : "border-border"
          }`}
        />
        {v.trim() && !invalid && kind !== "any" && (
          <button
            type="button"
            onClick={() => setShowPreview((s) => !s)}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground"
            title={showPreview ? "Preview yopish" : "Preview ko'rish"}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {invalid && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <CircleX className="w-3 h-3" /> Yaroqli http(s) URL emas
        </p>
      )}
      {showPreview && v.trim() && !invalid && (
        <div className="mt-2 rounded-lg border border-border p-2 bg-muted/30">
          {kind === "audio" && <audio controls src={v} className="w-full h-10" />}
          {kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={v} alt="preview" className="max-h-64 rounded-md mx-auto" />
          )}
          {kind === "video" && <video controls src={v} className="max-h-64 w-full rounded-md" />}
        </div>
      )}
    </div>
  );
}
