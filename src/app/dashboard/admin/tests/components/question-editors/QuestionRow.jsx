"use client";

/**
 * Bitta savol qatori uchun umumiy ramka: raqam badge + tartiblash/o'chirish.
 */

import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function QuestionRow({ number, index, count, onMove, onDelete, children }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
        {number != null && number > 0 ? number : "•"}
      </span>
      <div className="flex-1 min-w-0 space-y-2">{children}</div>
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === count - 1}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/** Savol qo'shish tugmasi */
export function AddQuestionButton({ onClick, label = "Savol qo'shish" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-2 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
    >
      + {label}
    </button>
  );
}

/** Umumiy savol amallari (editorlar ichida ishlatiladi) */
export function questionListActions(mutateGroup, emptyQuestionFactory) {
  return {
    add: () => mutateGroup((g) => { g.questions.push(emptyQuestionFactory()); }),
    remove: (i) => mutateGroup((g) => { g.questions.splice(i, 1); }),
    move: (i, dir) =>
      mutateGroup((g) => {
        const j = i + dir;
        if (j < 0 || j >= g.questions.length) return;
        [g.questions[i], g.questions[j]] = [g.questions[j], g.questions[i]];
      }),
  };
}

/** Options ro'yxatidan harflar: "A ..." → ['A','B',...] */
export function lettersFromOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => {
      const m = typeof o === "string" ? o.trim().match(/^([A-Z])([\s.):]|$)/) : null;
      return m ? m[1] : null;
    })
    .filter(Boolean);
}
