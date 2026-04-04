'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotesContext = createContext(null);

export function NotesProvider({ testId, children }) {
  const storageKey = testId ? `notes_${testId}` : 'notes_global';
  const highlightPrefix = testId ? `highlights_${testId}_` : 'highlights_main_';

  const [notes, setNotes] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // localStorage ga saqlash + HighlightableContent ga xabar berish
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch { /* ignore */ }

    // notes o'zgarganda barcha HighlightableContent komponentlariga xabar ber
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('NOTES_UPDATED', { detail: { notes } }));
    }
  }, [notes, storageKey]);

  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener('TOGGLE_NOTES_SIDEBAR', handleToggle);
    return () => window.removeEventListener('TOGGLE_NOTES_SIDEBAR', handleToggle);
  }, []);

  const addNote = useCallback((noteData) => {
    const newNote = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      type: 'note',
      text: '',
      note: '',
      createdAt: new Date().toISOString(),
      ...noteData,
    };
    setNotes(prev => [...prev, newNote]);
    return newNote.id;
  }, []);

  const updateNoteText = useCallback((id, noteText) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, note: noteText } : n)));
  }, []);

  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const addHighlight = useCallback((text, color = '#FFEB3B') => {
    const newHighlight = {
      id: Date.now().toString(),
      type: 'highlight',
      text,
      color,
      createdAt: new Date().toISOString(),
    };
    setNotes(prev => [...prev, newHighlight]);
    return newHighlight.id;
  }, []);

  const clearNotes = useCallback(() => {
    setNotes([]);
  }, []);

  const clearHighlights = useCallback(() => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(highlightPrefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }, [highlightPrefix]);

  const value = {
    notes,
    isSidebarOpen,
    setIsSidebarOpen,
    addNote,
    updateNoteText,
    deleteNote,
    addHighlight,
    clearNotes,
    clearHighlights,
    highlightPrefix,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}