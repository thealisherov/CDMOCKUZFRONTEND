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

  const isLowTime = secondsLeft < 300; // Less than 5 minutes

  return (
    <div className="text-center">
      <p className={cn("font-bold text-lg", isLowTime ? "text-[#D31212]" : "", className)}>
        {formattedTime} left
      </p>
    </div>
  );
}
