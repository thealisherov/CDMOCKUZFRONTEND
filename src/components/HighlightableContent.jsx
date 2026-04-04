'use client';
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNotes } from '@/components/NotesContext';

/* ─────────────────────────────────────────────────────────────────────────────
 * CSS Custom Highlight API — ZERO DOM mutations for BOTH highlights AND notes.
 *
 * Highlights → ::highlight(hl-{containerId})   { background: yellow }
 * Notes      → ::highlight(note-{containerId}) { background: #dbeafe }
 *
 * Click detection on notes uses caretRangeFromPoint — no DOM marks needed.
 *
 * Support: Chrome 105+, Edge 105+, Safari 17.2+, Firefox 117+
 * Fallback for older browsers: DOM <mark> only in truly safe zones.
 * ───────────────────────────────────────────────────────────────────────────── */

const CSS_HL_SUPPORTED =
  typeof window !== 'undefined' &&
  typeof CSS !== 'undefined' &&
  !!CSS.highlights &&
  typeof Highlight !== 'undefined';

/* ── Inject a ::highlight() CSS rule once per name ── */
function ensureHighlightStyle(hlName, bg, fg, extra = '') {
  const id = `hl-style-${hlName}`;
  if (document.getElementById(id)) return;
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `::highlight(${hlName}){background-color:${bg};color:${fg};${extra}}`;
  document.head.appendChild(style);
}

/* ── DOM mark safety guard (for fallback path only) ── */
function isSafeToMark(range) {
  if (!range) return false;
  const ancestor = range.commonAncestorContainer;
  const el = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentElement : ancestor;
  if (!el) return false;
  const interactives = el.querySelectorAll ? el.querySelectorAll('input,textarea,select') : [];
  for (const inp of interactives) {
    try { if (range.intersectsNode(inp)) return false; } catch { /* ignore */ }
  }
  return true;
}

/* ── Offset helpers ── */
function getSelectionOffsets(container, range) {
  const pre = range.cloneRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const text   = range.toString();
  return { start, end: start + text.length, text };
}

function restoreRange(container, start, end) {
  let idx = 0;
  const range = document.createRange();
  let foundStart = false, stop = false;
  (function walk(node) {
    if (stop) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const next = idx + node.length;
      if (!foundStart && start >= idx && start <= next) { range.setStart(node, start - idx); foundStart = true; }
      if (foundStart && end >= idx && end <= next) { range.setEnd(node, end - idx); stop = true; }
      idx = next;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    }
  })(container);
  return foundStart && stop ? range : null;
}

/* ── Get text offset of a click/caret position ── */
function getCaretOffset(container, clientX, clientY) {
  try {
    let range;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (!pos) return -1;
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.setEnd(pos.offsetNode, pos.offset);
    }
    if (!range || !container.contains(range.startContainer)) return -1;
    return getSelectionOffsets(container, range).start;
  } catch { return -1; }
}

/* ─────────────────────────────────────────────────────────────────────────────
 * NoteToolbar
 * ───────────────────────────────────────────────────────────────────────────── */
const NoteToolbar = memo(function NoteToolbar({ position, onAddNote, onHighlight, onEraser }) {
  if (!position) return null;
  return (
    <div
      className="fixed z-[200] flex items-center overflow-hidden rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.18)] border font-sans animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.left, top: position.top, transform: 'translate(-50%, -8px)', background: '#ffffff', borderColor: '#e2e2e2' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Note */}
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote(); }}
        className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold transition-colors border-r"
        style={{ color: '#1a1a1a', borderColor: '#e2e2e2' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z"/>
          <polyline points="14,3 14,8 21,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
        </svg>
        Note
      </button>

      {/* Highlight */}
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onHighlight(); }}
        className="flex flex-col items-center justify-center py-1.5 px-3 transition-colors border-r"
        style={{ color: '#1a1a1a', borderColor: '#e2e2e2' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        title="Highlight"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          <path d="M3 21h18" strokeWidth={2} strokeLinecap="round"/>
        </svg>
        <div className="h-1 w-full bg-[#ddff00] mt-0.5 rounded-full"></div>
      </button>

      {/* Eraser */}
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onEraser(); }}
        className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold transition-colors text-red-600"
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        title="Eraser"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────────────
 * HighlightableContent
 * ───────────────────────────────────────────────────────────────────────────── */
const HighlightableContent = memo(function HighlightableContent({
  children,
  className = '',
  enabled = true,
  containerId = 'main',
}) {
  const [toolbarPos,   setToolbarPos]   = useState(null);
  const [rangeOffsets, setRangeOffsets] = useState(null);
  const contentRef  = useRef(null);
  const domReadyRef = useRef(false);

  const notesCtx         = useNotes();
  const notes            = notesCtx?.notes            || [];
  const addNote          = notesCtx?.addNote          || (() => {});
  const setIsSidebarOpen = notesCtx?.setIsSidebarOpen || (() => {});
  const highlightPrefix  = notesCtx?.highlightPrefix  || 'highlights_main_';
  const hlStorageKey     = `${highlightPrefix}${containerId}`;
  const hlName           = `hl-${containerId}`;
  const noteHlName       = `note-${containerId}`;

  /* ── localStorage ── */
  const loadHighlights = useCallback(() => {
    try { const s = localStorage.getItem(hlStorageKey); return s ? JSON.parse(s) : []; } catch { return []; }
  }, [hlStorageKey]);

  const saveHighlights = useCallback((hl) => {
    try { localStorage.setItem(hlStorageKey, JSON.stringify(hl)); } catch { /* ignore */ }
  }, [hlStorageKey]);

  /* ─────────────────────────────────────────────────────────────────────────
   * applyHighlights — PRIMARY: CSS API (zero DOM mutation)
   * FALLBACK: DOM marks only in areas without inputs
   * ───────────────────────────────────────────────────────────────────────── */
  const applyHighlights = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    if (CSS_HL_SUPPORTED) {
      CSS.highlights.delete(hlName);
      const highlights = loadHighlights();
      if (!highlights.length) return;
      ensureHighlightStyle(hlName, 'var(--test-hl-bg,#ffff00)', 'var(--test-hl-fg,#000)');
      const ranges = highlights.map(hl => { try { return restoreRange(el, hl.start, hl.end); } catch { return null; } }).filter(Boolean);
      if (ranges.length) CSS.highlights.set(hlName, new Highlight(...ranges));
      return;
    }

    // DOM fallback
    el.querySelectorAll('mark.highlight').forEach((m) => {
      const p = m.parentNode; if (!p) return;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
    });
    const highlights = loadHighlights();
    if (!highlights.length) return;
    [...highlights].sort((a, b) => b.start - a.start).forEach((hl) => {
      try {
        const range = restoreRange(el, hl.start, hl.end);
        if (!range || !isSafeToMark(range)) return;
        const mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.style.cssText = 'background-color:var(--test-hl-bg,#ffff00);color:var(--test-hl-fg,#000);';
        try { range.surroundContents(mark); } catch { const f = range.extractContents(); mark.appendChild(f); range.insertNode(mark); }
      } catch { /* ignore */ }
    });
  }, [loadHighlights, hlName]);

  /* ─────────────────────────────────────────────────────────────────────────
   * applyNoteMarks — PRIMARY: CSS API (zero DOM mutation, no text splitting)
   * FALLBACK: DOM marks only in truly safe zones
   * ───────────────────────────────────────────────────────────────────────── */
  const applyNoteMarks = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    if (CSS_HL_SUPPORTED) {
      CSS.highlights.delete(noteHlName);
      const relevant = notes
        .filter(n => n.containerId === containerId && n.type === 'note')
        .sort((a, b) => b.start - a.start);
      if (!relevant.length) return;
      ensureHighlightStyle(
        noteHlName,
        'var(--test-note-bg,#dbeafe)',
        'var(--test-note-fg,inherit)',
        'text-decoration:underline;text-decoration-color:var(--test-note-accent,#3b82f6);'
      );
      const ranges = relevant.map(n => { try { return restoreRange(el, n.start, n.end); } catch { return null; } }).filter(Boolean);
      if (ranges.length) CSS.highlights.set(noteHlName, new Highlight(...ranges));
      return;
    }

    // DOM fallback — only in safe areas (no inputs nearby)
    el.querySelectorAll('mark[data-note-id]').forEach((m) => {
      const p = m.parentNode; if (!p) return;
      while (m.firstChild) p.insertBefore(m.firstChild, m);
      p.removeChild(m);
    });
    notes
      .filter(n => n.containerId === containerId && n.type === 'note')
      .sort((a, b) => b.start - a.start)
      .forEach((note) => {
        try {
          const range = restoreRange(el, note.start, note.end);
          if (!range || !isSafeToMark(range)) return;
          const mark = document.createElement('mark');
          mark.setAttribute('data-note-id', note.id);
          mark.style.cssText = 'background:var(--test-note-bg,#dbeafe);border-bottom:2px solid var(--test-note-accent,#3b82f6);padding:0 1px;cursor:pointer;';
          mark.addEventListener('click', () => { if (window.getSelection()?.isCollapsed) setIsSidebarOpen(true); });
          try { range.surroundContents(mark); } catch { const f = range.extractContents(); mark.appendChild(f); range.insertNode(mark); }
        } catch { /* ignore */ }
      });
  }, [notes, containerId, setIsSidebarOpen, noteHlName]);

  const applyAll = useCallback(() => { applyNoteMarks(); applyHighlights(); }, [applyNoteMarks, applyHighlights]);

  /* ── Effects ── */
  // Re-apply when containerId changes (switching passage/part).
  // Uses a double-rAF + 250ms retry because Next.js hydration may not have
  // populated contentRef.current with text nodes yet on the first animation frame.
  useEffect(() => {
    const ids = { raf1: 0, raf2: 0, timer: 0 };

    ids.raf1 = requestAnimationFrame(() => {
      ids.raf2 = requestAnimationFrame(() => {
        domReadyRef.current = true;
        applyAll();
        // Retry after a short delay to catch late hydration
        ids.timer = setTimeout(() => applyAll(), 250);
      });
    });

    return () => {
      cancelAnimationFrame(ids.raf1);
      cancelAnimationFrame(ids.raf2);
      clearTimeout(ids.timer);
      if (CSS_HL_SUPPORTED) {
        try { CSS.highlights.delete(hlName); CSS.highlights.delete(noteHlName); } catch { /* ignore */ }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  // Re-apply when notes list changes (note added/removed/updated)
  useEffect(() => {
    if (!domReadyRef.current) return;
    const id = requestAnimationFrame(() => applyAll());
    return () => cancelAnimationFrame(id);
  }, [applyAll]);

  useEffect(() => {
    const h = () => { if (domReadyRef.current) applyAll(); };
    window.addEventListener('NOTES_UPDATED', h);
    return () => window.removeEventListener('NOTES_UPDATED', h);
  }, [applyAll]);

  /* ── Click on note indicator: open sidebar ── */
  const handleClick = useCallback((e) => {
    // Only trigger if it was a simple click (not text selection)
    if (window.getSelection()?.toString().trim().length > 0) return;
    const el = contentRef.current;
    if (!el || !notes.length) return;

    const offset = getCaretOffset(el, e.clientX, e.clientY);
    if (offset < 0) return;

    const hasNote = notes.some(
      n => n.containerId === containerId && n.type === 'note' && n.start <= offset && n.end >= offset
    );
    if (hasNote) setIsSidebarOpen(true);
  }, [notes, containerId, setIsSidebarOpen]);

  /* ── Selection handler ── */
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) { setToolbarPos(null); setRangeOffsets(null); return; }
    if (sel.anchorNode) {
      const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(el?.tagName)) return;
    }
    const range = sel.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) { setToolbarPos(null); setRangeOffsets(null); return; }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;
    setToolbarPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    setRangeOffsets(getSelectionOffsets(contentRef.current, range));
  }, []);

  /* ── Add note ── */
  const handleAddNote = useCallback(() => {
    if (!rangeOffsets?.text.trim()) return;
    addNote({ id: 'note_' + Date.now() + Math.random().toString(36).substr(2, 5), containerId, type: 'note', start: rangeOffsets.start, end: rangeOffsets.end, text: rangeOffsets.text, note: '' });
    window.getSelection()?.removeAllRanges();
    setToolbarPos(null); setRangeOffsets(null);
    setIsSidebarOpen(true);
  }, [rangeOffsets, addNote, containerId, setIsSidebarOpen]);

  /* ── Highlight ── */
  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    const el = contentRef.current;
    if (!el?.contains(range.commonAncestorContainer)) return;
    const offsets = getSelectionOffsets(el, range);
    if (!offsets.text.trim()) { selection.removeAllRanges(); setToolbarPos(null); return; }
    const highlights = loadHighlights();
    if (!highlights.some(h => h.start < offsets.end && h.end > offsets.start)) {
      highlights.push({ id: 'hl_' + Date.now() + Math.random().toString(36).substr(2, 5), ...offsets });
      saveHighlights(highlights);
    }
    selection.removeAllRanges(); setToolbarPos(null); setRangeOffsets(null);
    requestAnimationFrame(() => applyHighlights());
  }, [loadHighlights, saveHighlights, applyHighlights]);

  /* ── Eraser ── */
  const handleEraser = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    const el = contentRef.current;
    if (!el) return;
    const offsets = getSelectionOffsets(el, range);
    saveHighlights(loadHighlights().filter(h => !(h.start < offsets.end && h.end > offsets.start)));
    selection.removeAllRanges(); setToolbarPos(null);
    requestAnimationFrame(() => applyHighlights());
  }, [loadHighlights, saveHighlights, applyHighlights]);

  /* ── Close toolbar ── */
  useEffect(() => {
    const h = () => { if (toolbarPos) setToolbarPos(null); };
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [toolbarPos]);

  useEffect(() => {
    const h = (e) => { if (toolbarPos && contentRef.current && !contentRef.current.contains(e.target)) setToolbarPos(null); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [toolbarPos]);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <>
      <NoteToolbar position={toolbarPos} onAddNote={handleAddNote} onHighlight={handleHighlight} onEraser={handleEraser} />
      <div
        ref={contentRef}
        className={`select-text ${className}`}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
        onClick={handleClick}
      >
        {children}
      </div>
    </>
  );
});

export default HighlightableContent;
