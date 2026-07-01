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

  const expectedTimeRef = useRef(0);
  const isSeekingRef = useRef(false);

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
          // Only update our expected time if we are naturally progressing
          if (!isSeekingRef.current) {
             expectedTimeRef.current = audio.currentTime;
             localStorage.setItem(storageKey, String(audio.currentTime));
          }
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
      expectedTimeRef.current = 0;
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
                expectedTimeRef.current = t;
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
            expectedTimeRef.current = t;
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

  // Block global media controls (hardware keys, browser media hub, extensions)
  useEffect(() => {
    if ('mediaSession' in navigator) {
      // Set dummy metadata to override any parsed page info
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'IELTS Listening Practice',
        artist: 'Test in progress - Do not pause',
        album: 'Mega IELTS',
      });

      // Provide dummy handlers so browser doesn't execute default media actions
      const blockAction = () => {
        console.log("Media control action blocked for test integrity.");
      };

      const actions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'stop'];
      
      actions.forEach(action => {
        try {
          navigator.mediaSession.setActionHandler(action, blockAction);
        } catch (e) {
          // Ignore unsupported actions
        }
      });
    }

    return () => {
      // Cleanup handlers when unmounting
      if ('mediaSession' in navigator) {
        const actions = ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack', 'stop'];
        actions.forEach(action => {
          try {
            navigator.mediaSession.setActionHandler(action, null);
          } catch (e) {}
        });
      }
    };
  }, []);

  const handlePause = (e) => {
    stopSaving();
    // STRICT ANTI-CHEAT: If the audio is paused by an external control (like Media Hub) 
    // but the test is active (playSignal is true), FORCE it to keep playing!
    if (playSignal && audioRef.current && !audioRef.current.ended) {
      console.log("Anti-cheat: Prevented unauthorized pause.");
      audioRef.current.play().catch(() => {});
    }
  };

  const handleSeeked = (e) => {
    const audio = e.target;
    if (!playSignal) return;
    isSeekingRef.current = false;
  };

  const handleSeeking = (e) => {
    const audio = e.target;
    if (!playSignal) return;
    
    // STRICT ANTI-CHEAT: Prevent skipping forward or backward by extensions/tools
    const diff = Math.abs(audio.currentTime - expectedTimeRef.current);
    if (diff > 2) {
      console.log("Anti-cheat: Prevented unauthorized seek.");
      isSeekingRef.current = true;
      audio.currentTime = expectedTimeRef.current; // Force it back to legitimate time
    }
  };

  return (
    <audio
      ref={audioRef}
      src={src}
      preload="auto"
      className="hidden"
      disableRemotePlayback
      onEnded={stopSaving}
      onPause={handlePause}
      onPlay={startSaving}
      onSeeking={handleSeeking}
      onSeeked={handleSeeked}
      controlsList="nodownload noremoteplayback"
    />
  );
});

export default AudioPlayer;
