'use client';
import React from 'react';
import { useNotes } from '@/components/NotesContext';
import { X } from 'lucide-react';

export default function NotesSidebar() {
  const { notes, isSidebarOpen, setIsSidebarOpen, updateNoteText, deleteNote } = useNotes();

  if (!isSidebarOpen) return null;

  const onlyNotes = notes.filter(n => n.type === 'note');

  return (
    <>
      {/* Transparent backdrop — click outside to close */}
      <div
        className="fixed inset-0 z-[109]"
        onClick={() => setIsSidebarOpen(false)}
      />
      <div className="w-[340px] bg-gray-50 border-l border-gray-200 h-full flex flex-col shadow-2xl z-[110] absolute right-0 top-0 font-sans transition-transform">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <h2 className="font-bold text-[18px] text-gray-800">Notes</h2>
        <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {onlyNotes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">No notes yet. Select text and click "Note" to create one.</p>
        ) : (
          onlyNotes.map(n => (
            <div key={n.id} className="bg-[#bfd4f2] overflow-hidden rounded-lg border border-[#a6c1e3] flex flex-col shadow-sm">
              <div className="px-3 pt-3 pb-1">
                <span className="font-bold text-[14px] text-gray-900 italic line-clamp-2" title={n.text}>{n.text}</span>
              </div>
              <div className="p-2">
                <textarea 
                  className="w-full text-[14px] p-2 bg-white border border-[#a6c1e3] rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
                  rows={3}
                  placeholder="Start typing your note..."
                  value={n.note || ''}
                  onChange={(e) => updateNoteText(n.id, e.target.value)}
                />
              </div>
              <div className="px-3 pb-2 flex justify-end">
                <button 
                  onClick={() => deleteNote(n.id)}
                  className="text-[13px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </>
  );
}
