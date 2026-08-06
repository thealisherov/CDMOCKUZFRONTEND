"use client";

/**
 * Savol matni uchun textarea + format tugmalari.
 * Ruxsat etilgan HTML: <b> <i> <br> <ul> <li>. Maxsus belgilar:
 *   ______  — bo'sh joy (gap)
 *   |       — jadval ustun ajratkichi
 *   #hidden# — jadvalda yashirin qator (bir katakdagi 2-bo'sh joy)
 */

import { useRef, useState } from "react";
import { Bold, Italic, CornerDownLeft, List, Minus, Eye, EyeOff } from "lucide-react";

export default function RichTextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
  showBlankButton = true,
  showTableButtons = false,
  showHtmlButtons = true,
  showPreview: showPreviewDefault = false,
}) {
  const ref = useRef(null);
  const [showPreview, setShowPreview] = useState(showPreviewDefault);
  const v = value || "";

  function insertAtCursor(before, after = "") {
    const el = ref.current;
    if (!el) {
      onChange(v + before + after);
      return;
    }
    const start = el.selectionStart ?? v.length;
    const end = el.selectionEnd ?? v.length;
    const selected = v.slice(start, end);
    const next = v.slice(0, start) + before + selected + after + v.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + before.length + selected.length + after.length;
      el.setSelectionRange(pos, pos);
    });
  }

  const btn =
    "p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors";

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/40 flex-wrap">
        {showHtmlButtons && (
          <>
            <button type="button" onClick={() => insertAtCursor("<b>", "</b>")} className={btn} title="Qalin">
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => insertAtCursor("<i>", "</i>")} className={btn} title="Kursiv">
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => insertAtCursor("<br>")} className={btn} title="Yangi qator">
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertAtCursor("<ul><li>", "</li></ul>")}
              className={btn}
              title="Ro'yxat"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        {showBlankButton && (
          <button
            type="button"
            onClick={() => insertAtCursor("______")}
            className={`${btn} font-mono text-[10px] font-bold`}
            title="Bo'sh joy (gap) qo'shish"
          >
            ______
          </button>
        )}
        {showTableButtons && (
          <>
            <button
              type="button"
              onClick={() => insertAtCursor(" | ")}
              className={`${btn} font-mono text-xs font-bold`}
              title="Ustun ajratkich"
            >
              |
            </button>
            <button
              type="button"
              onClick={() => onChange("#hidden#")}
              className={`${btn} font-mono text-[10px]`}
              title="Yashirin qator (bir katakdagi ikkinchi javob)"
            >
              #hidden#
            </button>
          </>
        )}
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setShowPreview((s) => !s)}
          className={btn}
          title="HTML preview"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
      <textarea
        ref={ref}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        spellCheck={false}
        className="w-full px-3 py-2 text-sm bg-transparent outline-none resize-y font-mono"
      />
      {showPreview && v.trim() && (
        <div
          className="px-3 py-2 border-t border-dashed border-border text-sm bg-muted/20 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: v.replace(/_{3,}/g, '<span style="border-bottom:1.5px solid currentColor;padding:0 24px;opacity:.5"></span>') }}
        />
      )}
    </div>
  );
}
