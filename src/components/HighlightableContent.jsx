'use client';
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNotes } from '@/components/NotesContext';

/* ─── Helpers: offset-based range tracking ─── */
function getSelectionOffsets(container, range) {
  const pre = range.cloneRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length;
  const text = range.toString();
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

/* ─── Inline "Add Note / Highlight / Erase" Toolbar ─── */
const NoteToolbar = memo(function NoteToolbar({ position, onAddNote, onHighlight, onEraser }) {
  if (!position) return null;

  return (
    <div
      className="fixed z-[200] flex items-center overflow-hidden rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.18)] border font-sans animate-in fade-in zoom-in-95 duration-150"
      style={{
        left: position.left,
        top: position.top,
        transform: 'translate(-50%, -8px)',
        background: '#ffffff',
        borderColor: '#e2e2e2',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAddNote(); }}
        className="flex items-center gap-2 py-2 px-3 text-[13px] font-semibold transition-colors border-r"
        style={{ color: '#1a1a1a', borderColor: '#e2e2e2' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        {/* Sticky note icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15.5 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8.5L15.5 3z" />
          <polyline points="14,3 14,8 21,8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
        Note
      </button>

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

/**
 * HighlightableContent — wraps content to enable Highlighting, Erasing, and Note creation.
 */
const HighlightableContent = memo(function HighlightableContent({
  children,
  className = '',
  enabled = true,
  containerId = 'main',
}) {
  const [toolbarPos, setToolbarPos] = useState(null);
  const [rangeOffsets, setRangeOffsets] = useState(null);
  const contentRef = useRef(null);

  const notesCtx = useNotes();
  const notes = notesCtx?.notes || [];
  const addNote = notesCtx?.addNote || (() => {});
  const setIsSidebarOpen = notesCtx?.setIsSidebarOpen || (() => {});

  /* ── Apply / re-apply note marks whenever `notes` changes ── */
  const applyNoteMarks = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    // 1. Remove existing note marks
    el.querySelectorAll('mark[data-note-id]').forEach((mark) => {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    el.normalize();

    // 2. Filter notes for this container, sort descending to avoid offset shift
    const relevant = notes
      .filter((n) => n.containerId === containerId && n.type === 'note')
      .sort((a, b) => b.start - a.start);

    relevant.forEach((note) => {
      try {
        const range = restoreRange(el, note.start, note.end);
        if (!range) return;

        const mark = document.createElement('mark');
        mark.setAttribute('data-note-id', note.id);
        mark.style.cssText =
          'background:var(--test-note-bg,#dbeafe);color:var(--test-note-fg,inherit);border-bottom:2px solid var(--test-note-accent,#3b82f6);padding:0 1px;border-radius:2px;cursor:pointer;user-select:text;-webkit-user-select:text;';

        mark.addEventListener('click', () => {
          if (window.getSelection()?.isCollapsed) setIsSidebarOpen(true);
        });

        try {
          range.surroundContents(mark);
        } catch {
          const frag = range.extractContents();
          mark.appendChild(frag);
          range.insertNode(mark);
        }
      } catch {
        /* silently skip */
      }
    });
  }, [notes, containerId, setIsSidebarOpen]);

  useEffect(() => { applyNoteMarks(); }, [applyNoteMarks, children]);

  useEffect(() => {
    const h = () => applyNoteMarks();
    window.addEventListener('NOTES_UPDATED', h);
    return () => window.removeEventListener('NOTES_UPDATED', h);
  }, [applyNoteMarks]);

  /* ── Selection handler ── */
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
      setToolbarPos(null);
      setRangeOffsets(null);
      return;
    }

    // Skip if selection is inside form elements
    if (sel.anchorNode) {
      const el =
        sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : sel.anchorNode;
      if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(el?.tagName)) return;
    }

    const range = sel.getRangeAt(0);
    if (
      !contentRef.current ||
      !contentRef.current.contains(range.commonAncestorContainer)
    ) {
      setToolbarPos(null);
      setRangeOffsets(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    setToolbarPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    setRangeOffsets(getSelectionOffsets(contentRef.current, range));
  }, []);

  /* ── Add note action ── */
  const handleAddNote = useCallback(() => {
    if (!rangeOffsets || !rangeOffsets.text.trim()) return;

    addNote({
      id: 'note_' + Date.now() + Math.random().toString(36).substr(2, 5),
      containerId,
      type: 'note',
      start: rangeOffsets.start,
      end: rangeOffsets.end,
      text: rangeOffsets.text,
      note: '',
    });

    window.getSelection()?.removeAllRanges();
    setToolbarPos(null);
    setRangeOffsets(null);
    setIsSidebarOpen(true);
  }, [rangeOffsets, addNote, containerId, setIsSidebarOpen]);

  /* ── Highlight Logic ── */
  const handleHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    
    // If selected text is within a single node
    if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
      if (!range.startContainer.nodeValue.substring(range.startOffset, range.endOffset).trim()) {
         selection.removeAllRanges();
         setToolbarPos(null);
         return;
      }
      const mark = document.createElement('mark');
      mark.className = 'highlight'; // Must have .highlight class in CSS
      mark.style.cssText = 'background-color: var(--test-hl-bg, #ffff00); color: var(--test-hl-fg, #000000);';
      try {
        range.surroundContents(mark);
      } catch (e) {
        console.error('Highlight failed:', e);
      }
    } else {
      // Cross-boundary selection
      const treeWalker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
            if (node.parentNode && node.parentNode.nodeName === 'MARK') return NodeFilter.FILTER_REJECT;
            if (range.intersectsNode(node)) return NodeFilter.FILTER_ACCEPT;
            return NodeFilter.FILTER_REJECT;
          }
        }
      );

      const nodesToWrap = [];
      while (treeWalker.nextNode()) {
        nodesToWrap.push(treeWalker.currentNode);
      }

      nodesToWrap.forEach((node) => {
        const isStart = node === range.startContainer;
        const isEnd = node === range.endContainer;
        
        let textToWrap = node;
        
        try {
          if (isStart && isEnd) {
             const split2 = node.splitText(range.endOffset);
             const split1 = node.splitText(range.startOffset);
             textToWrap = split1;
          } else if (isStart) {
             const split1 = node.splitText(range.startOffset);
             textToWrap = split1;
          } else if (isEnd) {
             node.splitText(range.endOffset);
          }
          
          if (textToWrap.nodeValue.trim()) {
            const mark = document.createElement('mark');
            mark.className = 'highlight';
            mark.style.cssText = 'background-color: var(--test-hl-bg, #ffff00); color: var(--test-hl-fg, #000000);';
            textToWrap.parentNode.insertBefore(mark, textToWrap);
            mark.appendChild(textToWrap);
          }
        } catch (err) {
          console.warn('Skipped a node wrap', err);
        }
      });
    }

    selection.removeAllRanges();
    setToolbarPos(null);
  }, []);

  /* ── Eraser Logic ── */
  const handleEraser = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);

    if (contentRef.current) {
      const highlights = contentRef.current.querySelectorAll('mark.highlight');
      let removed = false;
      
      const marksToRemove = [];
      highlights.forEach(mark => {
        try {
          if (range.intersectsNode(mark)) {
            marksToRemove.push(mark);
          }
        } catch {
          // ignore
        }
      });
      
      marksToRemove.forEach(mark => {
        const parent = mark.parentNode;
        if (parent) {
          const fragment = document.createDocumentFragment();
          while (mark.firstChild) {
            fragment.appendChild(mark.firstChild);
          }
          parent.insertBefore(fragment, mark);
          parent.removeChild(mark);
          removed = true;
        }
      });
      
      if (removed) {
        contentRef.current.normalize();
      }
    }

    selection.removeAllRanges();
    setToolbarPos(null);
  }, []);

  /* ── Close toolbar on scroll ── */
  useEffect(() => {
    const h = () => { if (toolbarPos) setToolbarPos(null); };
    window.addEventListener('scroll', h, true);
    return () => window.removeEventListener('scroll', h, true);
  }, [toolbarPos]);

  /* ── Close toolbar on click outside ── */
  useEffect(() => {
    const h = (e) => {
      // Close toolbar if click is completely outside contentRef
      if (toolbarPos && contentRef.current && !contentRef.current.contains(e.target)) {
        // Direct state update since toolbar buttons stop propagation now
        setToolbarPos(null);
      }
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
