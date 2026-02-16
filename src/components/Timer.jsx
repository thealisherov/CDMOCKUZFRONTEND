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
    <div className={cn("flex items-center gap-2 font-mono text-xl font-bold bg-secondary px-3 py-1 rounded-md border", isLow ? "text-red-500 border-red-500 animate-pulse" : "text-foreground")}>
      <Clock className="w-5 h-5" />
      {formattedTime}
    </div>
  );
}
