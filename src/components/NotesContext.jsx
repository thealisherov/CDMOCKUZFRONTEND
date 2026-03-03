'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

export const NotesProvider = ({ children, testId }) => {
  const [notes, setNotes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (testId) {
      const stored = sessionStorage.getItem(`ielts_notes_${testId}`);
      if (stored) {
        try { setNotes(JSON.parse(stored)); } catch (e) {}
      }
    }
  }, [testId]);

  useEffect(() => {
    const toggle = () => setIsSidebarOpen(o => !o);
    window.addEventListener('TOGGLE_NOTES_SIDEBAR', toggle);
    return () => window.removeEventListener('TOGGLE_NOTES_SIDEBAR', toggle);
  }, []);

  const saveNotes = (newNotes) => {
    setNotes(newNotes);
    if (testId) {
      sessionStorage.setItem(`ielts_notes_${testId}`, JSON.stringify(newNotes));
    }
    // Dispatch event so that HighlightableContent knows to re-apply
    window.dispatchEvent(new CustomEvent('NOTES_UPDATED', { detail: newNotes }));
  };

  const addNote = (item) => {
    const updated = [...notes, item];
    saveNotes(updated);
    if (item.type === 'note') {
      setIsSidebarOpen(true);
    }
  };

  const updateNoteText = (id, text) => {
    const updated = notes.map(n => n.id === id ? { ...n, note: text } : n);
    saveNotes(updated);
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNoteText, deleteNote, isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
