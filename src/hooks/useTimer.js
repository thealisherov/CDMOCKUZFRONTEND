"use client";

import { useState, useEffect, useRef } from "react";

/**
 * @param {number} initialSeconds  - Total seconds for the timer
 * @param {string} [storageKey]    - localStorage key to persist remaining time.
 *                                   Pass null/undefined to disable persistence.
 */
export function useTimer(initialSeconds = 60, storageKey = null) {
  // Always start with initialSeconds on both server and client
  // to avoid hydration mismatch. localStorage is read in useEffect.
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const initializedRef = useRef(false);
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // After mount: restore from localStorage if available (client only)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (storageKeyRef.current) {
        const saved = localStorage.getItem(storageKeyRef.current);
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed > 0 && parsed < initialSeconds) {
            setSecondsLeft(parsed);
          }
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist remaining seconds to localStorage every tick
  useEffect(() => {
    if (storageKeyRef.current && initializedRef.current) {
      localStorage.setItem(storageKeyRef.current, String(secondsLeft));
    }
  }, [secondsLeft]);

  // Countdown interval
  useEffect(() => {
    let interval = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft <= 0) {
      clearInterval(interval);
      setIsActive(false);
      // Clear from storage when expired
      if (storageKeyRef.current) {
        localStorage.removeItem(storageKeyRef.current);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  const start = () => setIsActive(true);
  const pause = () => setIsActive(false);

  const reset = () => {
    setSecondsLeft(initialSeconds);
    setIsActive(false);
    if (storageKeyRef.current) {
      localStorage.removeItem(storageKeyRef.current);
    }
  };

  const clearStorage = () => {
    if (storageKeyRef.current) {
      localStorage.removeItem(storageKeyRef.current);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return {
    secondsLeft,
    isActive,
    start,
    pause,
    reset,
    clearStorage,
    formattedTime: formatTime(secondsLeft),
  };
}
