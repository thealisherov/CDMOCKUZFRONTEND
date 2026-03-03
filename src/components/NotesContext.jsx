'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotesContext = createContext(null);

export function NotesProvider({ testId, children }) {
  const storageKey = testId ? `notes_${testId}` : 'notes_global';

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

  // Save notes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
    } catch {
      // ignore storage errors
    }
  }, [notes, storageKey]);

  // Listen for toggle event dispatched from the header button
  useEffect(() => {
    const handleToggle = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener('TOGGLE_NOTES_SIDEBAR', handleToggle);
    return () => window.removeEventListener('TOGGLE_NOTES_SIDEBAR', handleToggle);
  }, []);

  // Add a new note (type: 'note' | 'highlight')
  const addNote = useCallback((noteData) => {
    const newNote = {
      id: Date.now().toString(),
      type: 'note',
      text: '',
      note: '',
      createdAt: new Date().toISOString(),
      ...noteData,
    };
    setNotes(prev => [...prev, newNote]);
    return newNote.id;
  }, []);

  // Update the user-written note text for a note item
  const updateNoteText = useCallback((id, noteText) => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? { ...n, note: noteText } : n))
    );
  }, []);

  // Delete a note by id
  const deleteNote = useCallback((id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  // Add a highlight (type: 'highlight')
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

  // Clear all notes for this test
  const clearNotes = useCallback(() => {
    setNotes([]);
  }, []);

  const value = {
    notes,
    isSidebarOpen,
    setIsSidebarOpen,
    addNote,
    updateNoteText,
    deleteNote,
    addHighlight,
    clearNotes,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return ctx;
}
