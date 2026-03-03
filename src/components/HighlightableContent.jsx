'use client';
import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import { useNotes } from '@/components/NotesContext';

function getSelectionOffsets(container, range) {
  const preSelectionRange = range.cloneRange();
  preSelectionRange.selectNodeContents(container);
  preSelectionRange.setEnd(range.startContainer, range.startOffset);
  const start = preSelectionRange.toString().length;
  const text = range.toString();
  return { start, end: start + text.length, text };
}

function restoreRange(container, start, end) {
  let charIndex = 0;
  const range = document.createRange();
  let foundStart = false;
  let stop = false;

  function traverseNodes(node) {
    if (stop) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const nextCharIndex = charIndex + node.length;
      if (!foundStart && start >= charIndex && start <= nextCharIndex) {
        range.setStart(node, start - charIndex);
        foundStart = true;
      }
      if (foundStart && end >= charIndex && end <= nextCharIndex) {
        range.setEnd(node, end - charIndex);
        stop = true;
      }
      charIndex = nextCharIndex;
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        traverseNodes(node.childNodes[i]);
      }
    }
  }
  traverseNodes(container);
  if (!foundStart || !stop) return null;
  return range;
}

const InlineToolbar = ({ position, onAction }) => {
  if (!position) return null;

  return (
    <div 
      className="fixed z-50 flex items-center bg-white rounded-lg shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden font-sans"
      style={{ left: position.left, top: position.top, transform: 'translate(-50%, -10px)' }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        onClick={() => onAction('note')}
        className="flex flex-col items-center justify-center py-2 px-3 hover:bg-gray-50 text-gray-800 transition-colors border-r border-gray-100 min-w-[65px]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
        <span className="text-[12px] font-medium tracking-tight">Note</span>
      </button>

      <button
        onClick={() => onAction('highlight')}
        className="flex flex-col items-center justify-center py-2 px-3 hover:bg-gray-50 text-gray-800 transition-colors min-w-[65px]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
           <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
        </svg>
        <span className="text-[12px] font-medium tracking-tight">Highlight</span>
      </button>
    </div>
  );
};

const HighlightableContent = memo(function HighlightableContent({ 
  children,
  className = '',
  enabled = true,
  containerId = 'main'
}) {
  const [toolbarPos, setToolbarPos] = useState(null);
  const [currentRangeOffsets, setCurrentRangeOffsets] = useState(null);
  const contentRef = useRef(null);
  
  const notesContext = useNotes();
  // Safe extraction just in case it's used without Provider
  const notes = notesContext?.notes || [];
  const addNote = notesContext?.addNote || (() => {});
  const setIsSidebarOpen = notesContext?.setIsSidebarOpen || (() => {});

  const applyHighlights = useCallback(() => {
    if (!contentRef.current || !notes.length) return;
    
    // Un-wrap old marks
    const marks = contentRef.current.querySelectorAll('mark[data-id]');
    marks.forEach(mark => {
      const parent = mark.parentNode;
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
    });
    contentRef.current.normalize();

    // Group notes by length (shortest first) or start index - applying backwards prevents early offsets from getting skewed
    const sortedNotes = [...notes].sort((a,b) => b.start - a.start);

    sortedNotes.forEach(note => {
      if (note.containerId !== containerId) return;
      try {
        const range = restoreRange(contentRef.current, note.start, note.end);
        if (range) {
          const mark = document.createElement('mark');
          mark.setAttribute('data-id', note.id);
          mark.style.backgroundColor = note.type === 'note' ? '#bfd4f2' : '#ffee58';
          mark.style.color = 'inherit';
          
          if (note.type === 'note') {
             mark.className = 'cursor-pointer px-[2px] rounded-[3px] select-text';
             mark.onclick = (e) => {
               if (window.getSelection().isCollapsed) setIsSidebarOpen(true);
             };
          } else {
             mark.className = 'px-[2px] rounded-[3px] select-text';
          }
          
          try {
             range.surroundContents(mark);
          } catch (e) {
             const fragment = range.extractContents();
             mark.appendChild(fragment);
             range.insertNode(mark);
          }
        }
      } catch (e) {
        // Ignore dom wrapping failures silently
      }
    });
  }, [notes, containerId, setIsSidebarOpen]);

  useEffect(() => {
    applyHighlights();
  }, [applyHighlights, children]); // Re-apply when DOM changes

  useEffect(() => {
    const handleUpdate = () => applyHighlights();
    window.addEventListener('NOTES_UPDATED', handleUpdate);
    return () => window.removeEventListener('NOTES_UPDATED', handleUpdate);
  }, [applyHighlights]);

  // Handle Selection
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setToolbarPos(null);
      return;
    }

    if (selection.anchorNode) {
       const el = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode;
       if (['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(el.tagName)) {
         return;
       }
    }

    const range = selection.getRangeAt(0);
    if (!contentRef.current || !contentRef.current.contains(range.commonAncestorContainer)) {
      setToolbarPos(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return; // edge case

    setToolbarPos({
      top: rect.top - 10,
      left: rect.left + (rect.width / 2)
    });
    
    setCurrentRangeOffsets(getSelectionOffsets(contentRef.current, range));
  };
  
  const handleAction = (type) => {
    if (currentRangeOffsets) {
       const newNote = {
         id: 'note_' + Date.now() + Math.random().toString(36).substr(2, 5),
         containerId,
         type,
         start: currentRangeOffsets.start,
         end: currentRangeOffsets.end,
         text: currentRangeOffsets.text,
         note: ''
       };
       addNote(newNote);
       window.getSelection().removeAllRanges();
       setToolbarPos(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => { if (toolbarPos) setToolbarPos(null); };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [toolbarPos]);

  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <>
      <InlineToolbar position={toolbarPos} onAction={handleAction} />
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
