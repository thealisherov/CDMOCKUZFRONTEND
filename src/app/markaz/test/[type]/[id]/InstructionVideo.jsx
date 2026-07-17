"use client";

import { useRef, useState } from "react";
import { Play, ArrowRight, Volume2 } from "lucide-react";

/**
 * Bo'lim oldidan chiqadigan instruction video — katta, ekran markazida.
 * Video tugagach avtomatik davom etadi; "Davom etish" tugmasi ham bor
 * (hech qachon qotib qolmaslik uchun har doim bosiladigan).
 */
export default function InstructionVideo({ url, sectionLabel, onContinue }) {
  const videoRef = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);

  const tryPlay = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true));
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center p-4">
      <div className="mb-4 text-center">
        <p className="text-white/60 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
          <Volume2 className="w-4 h-4" /> Ko'rsatma
        </p>
        <h2 className="text-white text-xl sm:text-2xl font-bold mt-1">{sectionLabel}</h2>
      </div>

      <div className="relative w-full max-w-5xl">
        <video
          ref={videoRef}
          src={url}
          controls
          autoPlay
          playsInline
          preload="auto"
          onLoadedMetadata={tryPlay}
          onEnded={onContinue}
          className="w-full max-h-[74vh] rounded-2xl shadow-2xl bg-black"
        />
        {needsTap && (
          <button
            onClick={tryPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl"
          >
            <span className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full">
              <Play className="w-5 h-5" /> Videoni yoqish
            </span>
          </button>
        )}
      </div>

      <button
        onClick={onContinue}
        className="mt-6 flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
      >
        Davom etish <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-white/40 text-xs mt-3">Video tugagach bo'lim avtomatik boshlanadi</p>
    </div>
  );
}
