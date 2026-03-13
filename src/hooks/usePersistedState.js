'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * useState + localStorage persistence.
 * On mount, restores from localStorage if a value exists.
 * Every state change is saved back.
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - default value (used when nothing in storage)
 */
export function usePersistedState(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const hydratedRef = useRef(false);

  // Hydrate from localStorage after first render (client-only)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setState(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist on every change
  useEffect(() => {
    if (!hydratedRef.current || !key) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state, key]);

  const clear = () => {
    setState(initialValue);
    if (key) {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    }
  };

  return [state, setState, clear];
}
