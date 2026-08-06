"use client";

/**
 * Options (variantlar) ro'yxati editori.
 * format: 'letter' → "A matn", 'roman' → "i. matn", 'plain' → matn o'zi.
 *
 * MUHIM: letter formatda prefiks avtomatik boshqariladi — saqlangan string
 * doim "A ..." ko'rinishida bo'ladi (adapterlarning extractOptionLetters
 * regexi shuni talab qiladi).
 */

import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

const ROMANS = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x", "xi", "xii"];

export function letterFor(index) {
  return String.fromCharCode(65 + index); // A, B, C...
}
export function romanFor(index) {
  return ROMANS[index] || `x${index}`;
}

/** "A matn" / "A. matn" / "i. matn" → faqat matn qismi */
export function stripPrefix(option, format) {
  const s = String(option ?? "");
  if (format === "letter") return s.replace(/^[A-Z][\s.):]+\s*/, "");
  if (format === "roman") return s.replace(/^[ivxlc]+[.\s)]+\s*/i, "");
  return s;
}

export function buildOption(text, index, format) {
  const t = String(text ?? "").trim() === "" ? "" : text;
  // Bo'sh matn → yalang'och harf ("A") — xaritali matching formati
  if (format === "letter") return t ? `${letterFor(index)} ${t}` : letterFor(index);
  if (format === "roman") return t ? `${romanFor(index)}. ${t}` : `${romanFor(index)}.`;
  return text;
}

export default function OptionsListEditor({ options = [], onChange, format = "letter", label, minCount = 2 }) {
  const texts = options.map((o) => stripPrefix(o, format));

  function commit(nextTexts) {
    onChange(nextTexts.map((t, i) => buildOption(t, i, format)));
  }

  function setText(i, t) {
    const next = [...texts];
    next[i] = t;
    commit(next);
  }
  function add() {
    commit([...texts, ""]);
  }
  function remove(i) {
    commit(texts.filter((_, idx) => idx !== i));
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= texts.length) return;
    const next = [...texts];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>
      )}
      <div className="space-y-1.5">
        {texts.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-8 h-8 shrink-0 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">
              {format === "roman" ? romanFor(i) : letterFor(i)}
            </span>
            <input
              value={t}
              onChange={(e) => setText(i, e.target.value)}
              placeholder="variant matni..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === texts.length - 1} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => remove(i)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Variant qo'shish
      </button>
      {texts.length < minCount && (
        <p className="mt-1 text-xs text-amber-600">Kamida {minCount} ta variant kerak</p>
      )}
    </div>
  );
}
