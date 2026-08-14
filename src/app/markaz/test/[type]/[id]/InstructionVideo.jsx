"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ArrowRight,
  Loader2,
  AlertCircle,
  HelpCircle,
  SkipForward,
} from "lucide-react";

/**
 * Professional, Ultra-Smooth, SEB-Compatible Custom Video Player
 *
 * Afzalliklari:
 * 1. Safe Exam Browser (SEB) dagi native controls bloklanishini to'liq chetlab o'tadi.
 * 2. Kiosk/CEF da unmuted autoplay bloklanganda muzlab qolmaydi — qulay start tugmasini ko'rsatadi.
 * 3. Yengil va samarali — ortiqcha kutubxonalarsiz, serverga yuk tushirmaydi (preload="metadata").
 * 4. Keng qamrovli xatoliklar boshqaruvi (Network / Codec error fallback).
 * 5. Klaviatura boshqaruvi (Space, F, M, Strelkalar).
 */
export default function InstructionVideo({ url, sectionLabel, onContinue }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedPercent, setBufferedPercent] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasError, setHasError] = useState(false);

  // Format time (mm:ss)
  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Play / Pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;

    if (v.paused || v.ended) {
      v.play()
        .then(() => {
          setIsPlaying(true);
          setIsStarted(true);
          setHasError(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsStarted(false);
        });
    } else {
      v.pause();
      setIsPlaying(false);
    }
  }, []);

  // Try initial autoplay safely
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const promise = v.play();
    if (promise !== undefined) {
      promise
        .then(() => {
          setIsPlaying(true);
          setIsStarted(true);
          setIsLoading(false);
        })
        .catch(() => {
          // Autoplay blocked by SEB or Browser policy (normal)
          setIsPlaying(false);
          setIsStarted(false);
          setIsLoading(false);
        });
    }
  }, [url]);

  // Handle controls auto-hide
  const triggerControlsActivity = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2800);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, []);

  // Time & Buffer update
  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);

    if (v.buffered && v.buffered.length > 0 && v.duration) {
      try {
        const end = v.buffered.end(v.buffered.length - 1);
        setBufferedPercent(Math.min(100, (end / v.duration) * 100));
      } catch {
        /* ignore */
      }
    }
  };

  // Seek bar scrub
  const handleSeek = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pos * duration;
    setCurrentTime(v.currentTime);
  };

  // Volume change
  const handleVolumeChange = (newVol) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    v.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) {
      v.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      v.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    if (isMuted) {
      v.muted = false;
      setIsMuted(false);
      v.volume = volume || 0.8;
    } else {
      v.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const cyclePlaybackRate = () => {
    const v = videoRef.current;
    if (!v) return;
    const rates = [1, 1.25, 1.5, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    v.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const elem = containerRef.current;
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is in an input
      if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;

      if (e.code === "Space" || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControlsActivity}
      onClick={triggerControlsActivity}
      className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col items-center justify-center p-3 sm:p-6 select-none overflow-hidden"
    >
      {/* ── Top Header Bar ────────────────────────────────────────── */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle className="w-3.5 h-3.5" />
            Ko'rsatma videosi
          </span>
          <h2 className="text-white font-bold text-base sm:text-lg tracking-tight">
            {sectionLabel}
          </h2>
        </div>

        {/* Skip / Continue Top Action */}
        <button
          onClick={onContinue}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/60 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
          title="Videoni o'tkazib to'g'ridan-to'g'ri testga o'tish"
        >
          <span>Testni boshlash</span>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
        </button>
      </div>

      {/* ── Video Player Container ───────────────────────────────── */}
      <div className="relative w-full max-w-5xl aspect-video max-h-[76vh] bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex items-center justify-center group">
        <video
          ref={videoRef}
          src={url}
          playsInline
          preload="metadata"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
              setIsLoading(false);
            }
          }}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => {
            setIsLoading(false);
            setIsPlaying(true);
            setHasError(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={onContinue}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          onClick={togglePlay}
          className="w-full h-full object-contain cursor-pointer"
        >
          {url?.includes(".webm") ? (
            <>
              <source src={url} type="video/webm" />
              <source src={url.replace(".webm", ".mp4")} type="video/mp4" />
            </>
          ) : (
            <>
              <source src={url} type="video/mp4" />
              <source src={url?.replace(".mp4", ".webm")} type="video/webm" />
            </>
          )}
        </video>

        {/* ── Error Fallback Screen ──────────────────────────────── */}
        {hasError && (
          <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-1">
              Videoni yuklashda uzilish bo'ldi
            </h3>
            <p className="text-zinc-400 text-sm max-w-md mb-6">
              Internet aloqasi yoki xavfsizlik cheklovi tufayli video ochilmadi. Xavotir olmang, testni to'g'ridan-to'g'ri davom ettirishingiz mumkin.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setHasError(false);
                  setIsLoading(true);
                  if (videoRef.current) {
                    videoRef.current.load();
                    videoRef.current.play().catch(() => {});
                  }
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Qayta urinish
              </button>
              <button
                onClick={onContinue}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30"
              >
                Testga o'tish <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Loading Spinner ────────────────────────────────────── */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl text-white">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <span className="text-sm font-medium">Video yuklanmoqda...</span>
            </div>
          </div>
        )}

        {/* ── Big Center Play Button (Initial Gesture & Tap) ────────── */}
        {!isPlaying && !isLoading && !hasError && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex flex-col items-center justify-center cursor-pointer z-20 transition-opacity duration-300"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="relative group/play flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300"
              aria-label="Videoni yoqish"
            >
              <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-25" />
              <Play className="w-9 h-9 sm:w-10 sm:h-10 ml-1 text-white fill-white" />
            </button>
            <p className="text-white text-sm sm:text-base font-semibold mt-4 drop-shadow-md bg-black/50 px-4 py-1.5 rounded-full border border-white/10">
              {isStarted ? "Davom ettirish uchun bosing" : "Ko'rsatmani boshlash uchun bosing"}
            </p>
          </div>
        )}

        {/* ── Sleek Glass Bottom Control Bar ──────────────────────── */}
        <div
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12 pb-3 px-4 z-20 transition-opacity duration-300 ${
            showControls || !isPlaying ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress / Scrub Bar */}
          <div
            onClick={handleSeek}
            className="relative w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all mb-3 group/bar"
          >
            {/* Buffered progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${bufferedPercent}%` }}
            />
            {/* Played progress */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-indigo-500 rounded-full pointer-events-none flex items-center justify-end"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-md scale-0 group-hover/bar:scale-100 transition-transform -mr-1" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
            {/* Left side: Play/Pause, Volume, Time */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label={isPlaying ? "To'xtatish" : "Yoqish"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-white" />
                ) : (
                  <Play className="w-5 h-5 fill-white" />
                )}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  aria-label="Ovoz sozlamasi"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5 text-red-400" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-zinc-200" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 h-1.5 accent-indigo-500 bg-white/20 rounded-lg cursor-pointer transition-all opacity-80 hover:opacity-100"
                />
              </div>

              {/* Time display */}
              <span className="font-mono text-zinc-300 text-xs tracking-tight">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right side: Speed, Fullscreen, Quick Skip */}
            <div className="flex items-center gap-2">
              {/* Playback speed */}
              <button
                onClick={cyclePlaybackRate}
                className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/10 hover:bg-white/20 transition-colors text-zinc-200"
                title="Tezlikni o'zgartirish"
              >
                {playbackRate}x
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="To'liq ekran"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5 text-zinc-200" />
                ) : (
                  <Maximize className="w-5 h-5 text-zinc-200" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Big Action Bar ─────────────────────────────────── */}
      <div className="w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
        <p className="text-zinc-400 text-xs text-center sm:text-left">
          Video tugagach bo'lim avtomatik boshlanadi yoki istalgan vaqtda{" "}
          <span className="text-indigo-400 font-medium">"Davom etish"</span> tugmasini bosishingiz mumkin.
        </p>

        <button
          onClick={onContinue}
          className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Davom etish (Testni boshlash)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
