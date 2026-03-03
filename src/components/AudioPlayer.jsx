"use client";

import { useRef, useEffect } from "react";

export default function AudioPlayer({ src, playSignal }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (playSignal && audioRef.current) {
      audioRef.current.play().catch(err => console.error("Audio play failed:", err));
    }
  }, [playSignal]);

  return (
    <audio ref={audioRef} src={src} preload="auto" className="hidden" />
  );
}
