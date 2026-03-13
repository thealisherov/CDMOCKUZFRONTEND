'use client';
import React, { useRef, useEffect } from 'react';
import { useNotes } from '@/components/NotesContext';
import { X, Trash2, StickyNote } from 'lucide-react';

export default function NotesSidebar() {
  const { notes, isSidebarOpen, setIsSidebarOpen, updateNoteText, deleteNote } = useNotes();
  const latestRef = useRef(null);

  const onlyNotes = notes.filter(n => n.type === 'note');

  // Auto-focus the latest note's textarea when a new note is added
  useEffect(() => {
    if (isSidebarOpen && latestRef.current) {
      latestRef.current.focus();
    }
  }, [onlyNotes.length, isSidebarOpen]);

  if (!isSidebarOpen) return null;

  return (
    <>
      {/* Transparent backdrop — click outside to close */}
      <div
        className="fixed inset-0 z-[109]"
        onClick={() => setIsSidebarOpen(false)}
      />
      <div
        className="w-[360px] h-full flex flex-col shadow-2xl z-[110] absolute right-0 top-0 font-sans"
        style={{
          background: 'var(--test-panel-bg, #f9fafb)',
          borderLeft: '1px solid var(--test-border, #e5e7eb)',
          animation: 'slideInRight 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{
            background: 'var(--test-header-bg, #ffffff)',
            borderColor: 'var(--test-border, #e5e7eb)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <StickyNote className="w-5 h-5" style={{ color: 'var(--test-header-fg, #1f2937)' }} />
            <h2 className="font-bold text-[17px]" style={{ color: 'var(--test-header-fg, #1f2937)' }}>
              Notes
            </h2>
            {onlyNotes.length > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--test-note-bg, #dbeafe)',
                  color: 'var(--test-note-accent, #3b82f6)',
                }}
              >
                {onlyNotes.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 rounded-md hover:opacity-70 transition-opacity"
            style={{ color: 'var(--test-header-fg, #6b7280)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {onlyNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-60 px-6 text-center">
              <StickyNote className="w-10 h-10 mb-3 opacity-40" style={{ color: 'var(--test-fg, #6b7280)' }} />
              <p className="text-[14px] font-medium" style={{ color: 'var(--test-fg, #6b7280)' }}>
                No notes yet
              </p>
              <p className="text-[12px] mt-1" style={{ color: 'var(--test-fg, #9ca3af)' }}>
                Select text and click "Add Note" to create one.
              </p>
            </div>
          ) : (
            onlyNotes.map((n, i) => {
              const isLast = i === onlyNotes.length - 1;
              return (
                <div
                  key={n.id}
                  className="overflow-hidden rounded-xl border flex flex-col"
                  style={{
                    background: 'var(--test-note-bg, #eff6ff)',
                    borderColor: 'var(--test-note-border, #bfdbfe)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Quoted text */}
                  <div
                    className="px-3.5 pt-3 pb-1.5 flex items-start gap-2"
                    style={{ borderBottom: '1px solid var(--test-note-border, #bfdbfe)' }}
                  >
                    <span
                      className="text-[18px] leading-none mt-0.5 select-none"
                      style={{ color: 'var(--test-note-accent, #3b82f6)', opacity: 0.5 }}
                    >"</span>
                    <span
                      className="text-[13px] leading-relaxed italic line-clamp-3 flex-1"
                      style={{ color: 'var(--test-note-fg, #374151)' }}
                      title={n.text}
                    >
                      {n.text}
                    </span>
                  </div>

                  {/* Note textarea */}
                  <div className="px-3 py-2">
                    <textarea
                      ref={isLast ? latestRef : undefined}
                      className="w-full text-[13px] p-2.5 border rounded-lg resize-none focus:outline-none focus:ring-2 transition-shadow"
                      style={{
                        background: 'var(--test-input-bg, #ffffff)',
                        color: 'var(--test-fg, #000000)',
                        borderColor: 'var(--test-note-border, #bfdbfe)',
                        focusRingColor: 'var(--test-note-accent, #3b82f6)',
                      }}
                      rows={2}
                      placeholder="Write your note..."
                      value={n.note || ''}
                      onChange={(e) => updateNoteText(n.id, e.target.value)}
                    />
                  </div>

                  {/* Footer */}
                  <div className="px-3 pb-2.5 flex items-center justify-between">
                    <span className="text-[11px] opacity-40" style={{ color: 'var(--test-fg, #6b7280)' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => deleteNote(n.id)}
                      className="flex items-center gap-1 text-[12px] font-medium px-2 py-1 rounded-md transition-colors"
                      style={{ color: '#ef4444' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-in animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.5; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
