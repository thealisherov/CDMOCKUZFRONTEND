"use client";

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react";

/**
 * AudioPlayer
 *
 * @param {string}  src         - Audio file URL
 * @param {boolean} playSignal  - Set to true to begin playback (requires user gesture)
 * @param {string}  [storageKey]- localStorage key to persist & restore audio position.
 *                                Saves currentTime every second while playing.
 *                                When playSignal fires, resumes from saved position.
 */
const AudioPlayer = forwardRef(function AudioPlayer({ src, playSignal, storageKey }, ref) {
  const audioRef = useRef(null);
  const saveIntervalRef = useRef(null);

  const stopSaving = useCallback(() => {
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  }, []);

  // Save currentTime to localStorage every second while audio is playing
  const startSaving = useCallback(() => {
    if (!storageKey) return;
    stopSaving();
    saveIntervalRef.current = setInterval(() => {
      const audio = audioRef.current;
      if (audio && !audio.paused && !audio.ended) {
        try {
          localStorage.setItem(storageKey, String(audio.currentTime));
        } catch { /* ignore */ }
      }
    }, 1000);
  }, [storageKey, stopSaving]);

  // Expose stop & reset method and playAudio to parent via ref
  useImperativeHandle(ref, () => ({
    stopAndReset: () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      stopSaving();
      if (storageKey) {
        try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      }
    },
    playAudio: () => {
      const audio = audioRef.current;
      if (audio) {
        if (storageKey) {
          try {
            const saved = localStorage.getItem(storageKey);
            if (saved !== null) {
              const t = parseFloat(saved);
              if (!isNaN(t) && t > 0) {
                audio.currentTime = t;
              }
            }
          } catch { /* ignore */ }
        }
        audio.play().catch(err => console.warn("Audio play:", err));
        startSaving();
      }
    }
  }), [stopSaving, storageKey, startSaving]);

  // When playSignal becomes true: restore saved position, then play
  useEffect(() => {
    if (!playSignal || !audioRef.current) return;

    const audio = audioRef.current;

    // Restore saved position from localStorage
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved !== null) {
          const t = parseFloat(saved);
          if (!isNaN(t) && t > 0) {
            audio.currentTime = t;
          }
        }
      } catch { /* ignore */ }
    }

    audio.play().catch(err => console.warn("Audio play:", err));
    startSaving();
  }, [playSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop saving when component unmounts
  useEffect(() => {
    return () => stopSaving();
  }, [stopSaving]);

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      className="hidden"
      onEnded={stopSaving}
      onPause={stopSaving}
      onPlay={startSaving}
    />
  );
});

export default AudioPlayer;
