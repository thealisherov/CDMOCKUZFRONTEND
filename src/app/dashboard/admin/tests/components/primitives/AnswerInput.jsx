"use client";

/**
 * Javob kiritish: asosiy javob + alternativeAnswers chiplari.
 * answerShape: 'text' | 'letter' | 'romanNumeral' | 'choice'
 *  - letter/roman/choice: select (ruxsat etilgan qiymatlardan)
 *  - text: input + variant chiplar
 */

import { useState } from "react";
import { X, Plus, CheckCircle2 } from "lucide-react";

export default function AnswerInput({
  answer,
  alternativeAnswers = [],
  onChange, // (answer, alternativeAnswers) => void
  answerShape = "text",
  choices = [], // letter/roman/choice uchun ruxsat etilgan qiymatlar
  compact = false,
}) {
  const [altDraft, setAltDraft] = useState("");

  function addAlt() {
    const t = altDraft.trim();
    if (!t) return;
    onChange(answer, [...alternativeAnswers, t]);
    setAltDraft("");
  }
  function removeAlt(i) {
    onChange(answer, alternativeAnswers.filter((_, idx) => idx !== i));
  }

  if (answerShape !== "text") {
    return (
      <div className={compact ? "" : "flex items-center gap-2"}>
        {!compact && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
        <select
          value={answer ?? ""}
          onChange={(e) => onChange(e.target.value, alternativeAnswers)}
          className={`px-2.5 py-1.5 rounded-lg border text-sm font-semibold outline-none bg-card ${
            answer ? "border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300" : "border-border text-muted-foreground"
          }`}
        >
          <option value="">— javob —</option>
          {choices.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <input
          value={answer ?? ""}
          onChange={(e) => onChange(e.target.value, alternativeAnswers)}
          placeholder="to'g'ri javob..."
          className={`flex-1 px-3 py-1.5 rounded-lg border text-sm font-medium outline-none bg-card focus:ring-2 focus:ring-emerald-500/30 ${
            String(answer ?? "").trim() ? "border-emerald-300 dark:border-emerald-800" : "border-border"
          }`}
        />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap pl-6">
        {alternativeAnswers.map((alt, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs"
          >
            {alt}
            <button type="button" onClick={() => removeAlt(i)} className="hover:text-red-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <div className="inline-flex items-center gap-1">
          <input
            value={altDraft}
            onChange={(e) => setAltDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAlt();
              }
            }}
            placeholder="+ variant (ko'plik, boshqa yozilish...)"
            className="w-48 px-2 py-0.5 rounded-full border border-dashed border-border bg-transparent text-xs outline-none focus:border-emerald-400"
          />
          {altDraft.trim() && (
            <button type="button" onClick={addAlt} className="p-1 rounded-full hover:bg-muted text-emerald-600">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
