"use client";

import { useTimer } from "@/hooks/useTimer";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function Timer({ initialMinutes = 60, onExpire }) {
  const { secondsLeft, formattedTime, start } = useTimer(initialMinutes * 60);

  useEffect(() => {
    start();
  }, []); // Start on mount

  useEffect(() => {
    if (secondsLeft === 0) {
      onExpire?.();
    }
  }, [secondsLeft, onExpire]);

  const isLow = secondsLeft < 300; // 5 mins

  return (
    <div className={cn("flex items-center gap-1.5 font-mono text-base font-bold px-2 py-0.5 rounded", isLow ? "text-red-400 animate-pulse" : "text-inherit")}>
      <Clock className="w-4 h-4" />
      {formattedTime}
    </div>
  );
}
