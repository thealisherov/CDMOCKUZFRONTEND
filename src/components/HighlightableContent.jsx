'use client';
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNotes } from '@/components/NotesContext';

/* ─────────────────────────────────────────────────────────────────────────────
 * SAFETY GUARD
 * Returns true only when it is safe to insert a <mark> via surroundContents.
 * A range is UNSAFE if its common ancestor contains any <input> or <textarea>
 * — those are React-managed nodes that must never be split by DOM mutation.
 * ───────────────────────────────────────────────────────────────────────────── */
function isSafeToMark(range) {
  if (!range) return false;
  const ancestor = range.commonAncestorContainer;
  const el = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentElement : ancestor;
  if (!el) return false;
  return !el.querySelector('input, textarea, select');
}

/* ─────────────────────────────────────────────────────────────────────────────
 * OFFSET HELPERS  (offset = character distance from container start)
 * Walking only TEXT_NODE children; inputs contribute their placeholder length
 * so offsets stay consistent between save and restore.
 * ───────────────────────────────────────────────────────────────────────────── */
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
      if (!foundStart && start >= idx && start <= next) {
        range.setStart(node, start - idx);
        foundStart = true;
      }
      if (foundStart && end >= idx && end <= next) {
        range.setEnd(node, end - idx);
        stop = true;
      }
      idx = next;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) walk(node.childNodes[i]);
    }
  })(container);

  return foundStart && stop ? range : null;
}

/* ─────────────────────────────────────────────────────────────────────────────
 * NoteToolbar — floating action bar above selection
 * ───────────────────────────────────────────────────────────────────────────── */
const NoteToolbar = memo(function NoteToolbar({ position, onAddNote, onHighlight, onEraser, safeToMark }) {
  if (!position) return null;
  return (
    <div
      className="fixed z-[200] flex items-center overflow-hidden rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.18)] border font-sans animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.left, top: position.top, transform: 'translate(-50%, -8px)', background: '#ffffff', borderColor: '#e2e2e2' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote(); }}
        className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold transition-colors border-r"
        style={{ color: '#1a1a1a', borderColor: '#e2e2e2' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" />
          <polyline points="14,3 14,8 21,8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        Note
      </button>

      {safeToMark && (
        <button
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onHighlight(); }}
          className="flex flex-col items-center justify-center py-1.5 px-3 transition-colors border-r"
          style={{ color: '#1a1a1a', borderColor: '#e2e2e2' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          title="Highlight"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            <path d="M3 21h18" strokeWidth={2} strokeLinecap="round"/>
          </svg>
          <div className="h-1 w-full bg-[#ddff00] mt-0.5 rounded-full"></div>
        </button>
      )}

      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onEraser(); }}
        className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold transition-colors text-red-600"
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        title="Eraser"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
  const [toolbarPos,    setToolbarPos]    = useState(null);
  const [rangeOffsets,  setRangeOffsets]  = useState(null);
  const [currentSafe,   setCurrentSafe]   = useState(false); // is current selection safe to mark?
  const contentRef   = useRef(null);
  const domReadyRef  = useRef(false);

  const notesCtx        = useNotes();
  const notes           = notesCtx?.notes           || [];
  const addNote         = notesCtx?.addNote         || (() => {});
  const setIsSidebarOpen= notesCtx?.setIsSidebarOpen|| (() => {});
  const highlightPrefix = notesCtx?.highlightPrefix || 'highlights_main_';
  const hlStorageKey    = `${highlightPrefix}${containerId}`;

  /* ── localStorage helpers ── */
  const loadHighlights = useCallback(() => {
    try { const s = localStorage.getItem(hlStorageKey); return s ? JSON.parse(s) : []; } catch { return []; }
  }, [hlStorageKey]);

  const saveHighlights = useCallback((hl) => {
    try { localStorage.setItem(hlStorageKey, JSON.stringify(hl)); } catch { /* ignore */ }
  }, [hlStorageKey]);

  /* ── Remove marks (NO normalize — would break React text nodes) ── */
  const removeHighlightMarks = useCallback((el) => {
    el.querySelectorAll('mark.highlight').forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    // DO NOT call el.normalize() — it merges adjacent text nodes and
    // invalidates React's internal references to those nodes.
  }, []);

  const removeNoteMarks = useCallback((el) => {
    el.querySelectorAll('mark[data-note-id]').forEach((mark) => {
      const parent = mark.parentNode;
      if (!parent) return;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    // DO NOT call el.normalize()
  }, []);

  /* ── Apply saved highlights ── */
  const applyHighlights = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    removeHighlightMarks(el);
    const highlights = loadHighlights();
    if (!highlights.length) return;

    [...highlights].sort((a, b) => b.start - a.start).forEach((hl) => {
      try {
        const range = restoreRange(el, hl.start, hl.end);
        if (!range) return;
        // KEY GUARD: never mutate React-managed text nodes (those near inputs)
        if (!isSafeToMark(range)) return;
        const mark = document.createElement('mark');
        mark.className = 'highlight';
        mark.setAttribute('data-hl-id', hl.id);
        mark.style.cssText = 'background-color:var(--test-hl-bg,#ffff00);color:var(--test-hl-fg,#000);';
        try { range.surroundContents(mark); }
        catch { const frag = range.extractContents(); mark.appendChild(frag); range.insertNode(mark); }
      } catch { /* silently skip */ }
    });
  }, [loadHighlights, removeHighlightMarks]);

  /* ── Apply note underlines ── */
  const applyNoteMarks = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    removeNoteMarks(el);
    const relevant = notes
      .filter((n) => n.containerId === containerId && n.type === 'note')
      .sort((a, b) => b.start - a.start);

    relevant.forEach((note) => {
      try {
        const range = restoreRange(el, note.start, note.end);
        if (!range) return;
        // KEY GUARD: skip React-managed areas
        if (!isSafeToMark(range)) return;
        const mark = document.createElement('mark');
        mark.setAttribute('data-note-id', note.id);
        mark.style.cssText = 'background:var(--test-note-bg,#dbeafe);color:var(--test-note-fg,inherit);border-bottom:2px solid var(--test-note-accent,#3b82f6);padding:0 1px;border-radius:2px;cursor:pointer;user-select:text;-webkit-user-select:text;';
        mark.addEventListener('click', () => { if (window.getSelection()?.isCollapsed) setIsSidebarOpen(true); });
        try { range.surroundContents(mark); }
        catch { const frag = range.extractContents(); mark.appendChild(frag); range.insertNode(mark); }
      } catch { /* silently skip */ }
    });
  }, [notes, containerId, setIsSidebarOpen, removeNoteMarks]);

  const applyAll = useCallback(() => {
    applyNoteMarks();
    applyHighlights();
  }, [applyNoteMarks, applyHighlights]);

  /* ── Re-apply when switching passage/part (containerId changes).
         NOT when children change (would fire on every keystroke and corrupt DOM). ── */
  useEffect(() => {
    const id = requestAnimationFrame(() => { domReadyRef.current = true; applyAll(); });
    return () => cancelAnimationFrame(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  /* ── Re-apply when notes list changes (user added/deleted a note) ── */
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

  /* ── Selection handler ── */
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setToolbarPos(null); setRangeOffsets(null); return;
    }
    // Skip if inside a form element itself
    if (sel.anchorNode) {
      const el = sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(el?.tagName)) return;
    }
    const range = sel.getRangeAt(0);
    if (!contentRef.current?.contains(range.commonAncestorContainer)) {
      setToolbarPos(null); setRangeOffsets(null); return;
    }
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    setToolbarPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    setRangeOffsets(getSelectionOffsets(contentRef.current, range));
    setCurrentSafe(isSafeToMark(range));
  }, []);

  /* ── Add note ── */
  const handleAddNote = useCallback(() => {
    if (!rangeOffsets?.text.trim()) return;
    addNote({
      id: 'note_' + Date.now() + Math.random().toString(36).substr(2, 5),
      containerId, type: 'note',
      start: rangeOffsets.start, end: rangeOffsets.end, text: rangeOffsets.text, note: '',
    });
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
    if (!isSafeToMark(range)) {
      // Selection is over React-managed content — skip DOM mark silently
      selection.removeAllRanges(); setToolbarPos(null); setRangeOffsets(null); return;
    }
    const offsets = getSelectionOffsets(el, range);
    if (!offsets.text.trim()) { selection.removeAllRanges(); setToolbarPos(null); return; }

    const highlights = loadHighlights();
    const overlap = highlights.some((h) => h.start < offsets.end && h.end > offsets.start);
    if (!overlap) {
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
    const filtered = loadHighlights().filter((h) => !(h.start < offsets.end && h.end > offsets.start));
    saveHighlights(filtered);
    selection.removeAllRanges(); setToolbarPos(null);
    requestAnimationFrame(() => applyHighlights());
  }, [loadHighlights, saveHighlights, applyHighlights]);

  /* ── Close toolbar on scroll / outside click ── */
  useEffect(() => {
    const h = () => { if (toolbarPos) setToolbarPos(null); };
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [toolbarPos]);

  useEffect(() => {
    const h = (e) => {
      if (toolbarPos && contentRef.current && !contentRef.current.contains(e.target)) setToolbarPos(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [toolbarPos]);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <>
      <NoteToolbar
        position={toolbarPos}
        onAddNote={handleAddNote}
        onHighlight={handleHighlight}
        onEraser={handleEraser}
        safeToMark={currentSafe}
      />
      <div
        ref={contentRef}
        className={`select-text ${className}`}
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
      >
        {children}
      </div>
    </>
  );
});

export default HighlightableContent;
