"use client";

import { Play, Pause, Volume2 } from "lucide-react";

export default function AudioPlayer({ src = "https://example.com/audio.mp3" }) {
  // Placeholder logic for custom audio player
  return (
    <div className="w-full bg-secondary p-4 rounded-lg flex items-center gap-4 border">
      <button className="bg-primary text-primary-foreground p-3 rounded-full hover:bg-primary/90 transition-colors">
        <Play className="h-5 w-5 fill-current" />
      </button>
      <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-primary rounded-full"></div>
      </div>
      <div className="text-sm font-mono text-muted-foreground">04:23 / 12:45</div>
      <button className="text-muted-foreground hover:text-foreground">
        <Volume2 className="h-5 w-5" />
      </button>
      <audio src={src} className="hidden" controls />
    </div>
  );
}
