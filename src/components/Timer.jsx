"use client";

import { useTimer } from "@/hooks/useTimer";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

/**
 * @param {number}   initialMinutes  - Total minutes for countdown
 * @param {function} onExpire        - Called when timer reaches 0
 * @param {string}   [storageKey]    - localStorage key for persistence across refreshes.
 *                                     Call clearTimer() on test exit to reset.
 * @param {string}   [className]
 */
export default function Timer({ initialMinutes = 60, onExpire, storageKey, className = "" }) {
  const { secondsLeft, formattedTime, start } = useTimer(initialMinutes * 60, storageKey);

  useEffect(() => {
    start();
  }, []); // Start on mount

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  // Oxirgi 3 daqiqa (180 s) → qizil, pulsatsiyali
  const isCritical = secondsLeft > 0 && secondsLeft <= 180;
  // Oxirgi 5 daqiqa (300 s) → sariq ogohlantiruv
  const isWarning  = secondsLeft > 180 && secondsLeft <= 300;

  return (
    <div
      className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-[18px] transition-all duration-500 select-none", className)}
      style={{
        background: isCritical
          ? 'rgba(220, 38, 38, 0.15)'
          : isWarning
            ? 'rgba(234, 179, 8, 0.15)'
            : 'rgba(0,0,0,0.06)',
        color: isCritical
          ? '#dc2626'
          : isWarning
            ? '#ca8a04'
            : 'currentColor',
        border: isCritical
          ? '1.5px solid rgba(220, 38, 38, 0.5)'
          : isWarning
            ? '1.5px solid rgba(234, 179, 8, 0.5)'
            : '1.5px solid transparent',
        animation: isCritical ? 'timerPulse 1s ease-in-out infinite' : 'none',
      }}
    >
      {/* Blink dot indicator */}
      <span
        style={{
          display: 'inline-block',
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: isCritical ? '#dc2626' : isWarning ? '#ca8a04' : 'currentColor',
          opacity: isCritical ? 1 : 0.5,
          animation: isCritical ? 'timerDotBlink 1s ease-in-out infinite' : 'none',
          flexShrink: 0,
        }}
      />
      {formattedTime}
      <style>{`
        @keyframes timerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.3); }
          50%       { box-shadow: 0 0 0 8px rgba(220, 38, 38, 0); }
        }
        @keyframes timerDotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
