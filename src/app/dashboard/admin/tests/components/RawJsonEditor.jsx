"use client";

/**
 * Raw JSON rejimi — escape hatch. Vizual builder bilan ikki tomonlama sinxron:
 * ochilganda joriy data JSON ko'rinishida, "Qo'llash" bosilganda parse qilinib
 * builder holatiga yoziladi (parse xatosi bo'lsa bloklanadi).
 */

import { useState } from "react";
import { Braces, Check, CircleX } from "lucide-react";

export default function RawJsonEditor({ data, onApply }) {
  const [text, setText] = useState(() => JSON.stringify(data, null, 2));
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);

  function format() {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function apply() {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("JSON obyekt bo'lishi kerak");
      }
      setError(null);
      onApply(parsed);
      setApplied(true);
      setTimeout(() => setApplied(false), 1500);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Braces className="w-4 h-4 text-indigo-600" />
        <span className="font-bold text-sm">Raw JSON rejimi</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={format}
          className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          Format
        </button>
        <button
          type="button"
          onClick={apply}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1"
        >
          {applied ? <Check className="w-3.5 h-3.5" /> : null}
          {applied ? "Qo'llandi" : "Qo'llash"}
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <CircleX className="w-3.5 h-3.5" /> JSON xato: {error}
        </p>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-[500px] w-full px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono outline-none resize-none leading-relaxed"
      />
    </div>
  );
}
