"use client";

/**
 * Validatsiya natijalari paneli — error/warning ro'yxati.
 */

import { CircleX, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function ValidationPanel({ issues = [] }) {
  const [open, setOpen] = useState(true);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");

  if (!issues.length) {
    return (
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 px-3 py-2 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
        <CheckCircle2 className="w-4 h-4" /> Validatsiya toza — saqlash mumkin
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium hover:bg-muted/50 transition-colors"
      >
        {errors.length > 0 && (
          <span className="flex items-center gap-1 text-red-600">
            <CircleX className="w-3.5 h-3.5" /> {errors.length} xato
          </span>
        )}
        {warnings.length > 0 && (
          <span className="flex items-center gap-1 text-amber-600">
            <AlertTriangle className="w-3.5 h-3.5" /> {warnings.length} ogohlantirish
          </span>
        )}
        <div className="flex-1" />
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && (
        <div className="max-h-56 overflow-y-auto border-t border-border divide-y divide-border/50">
          {[...errors, ...warnings].map((issue, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 text-xs flex items-start gap-2 ${
                issue.severity === "error" ? "text-red-600" : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {issue.severity === "error" ? (
                <CircleX className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              )}
              <span>
                <span className="font-mono text-[10px] opacity-60">{issue.path}</span> — {issue.message}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
