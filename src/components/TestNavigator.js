'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TestNavigator({ parts, activePart, onPartChange }) {
  if (!parts || parts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 flex justify-center items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center gap-2 overflow-x-auto max-w-full px-2 no-scrollbar">
        {parts.map((partLabel, index) => (
          <Button
            key={index}
            variant={activePart === index ? 'default' : 'outline'}
            onClick={() => onPartChange(index)}
            className={cn(
              "min-w-[40px] px-6 transition-all duration-200 rounded-full",
              activePart === index
                ? "font-bold shadow-md scale-105"
                : "text-muted-foreground hover:text-foreground border-transparent bg-secondary/50 hover:bg-secondary"
            )}
          >
            {partLabel}
          </Button>
        ))}
      </div>
    </div>
  );
}
