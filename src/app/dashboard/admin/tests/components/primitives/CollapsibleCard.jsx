"use client";

/**
 * Yig'iladigan karta — part/passage/task/guruh konteynerlari uchun.
 * Sarlavha + badge + tartiblash/o'chirish tugmalari.
 */

import { useState } from "react";
import { ChevronDown, ChevronRight, ArrowUp, ArrowDown, Trash2 } from "lucide-react";

export default function CollapsibleCard({
  title,
  subtitle,
  badge,
  defaultOpen = true,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp = true,
  canMoveDown = true,
  headerExtra,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          {open ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
          {badge && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold shrink-0">
              {badge}
            </span>
          )}
          <span className="font-semibold text-sm truncate">{title}</span>
          {subtitle && <span className="text-xs text-muted-foreground truncate">{subtitle}</span>}
        </button>
        {headerExtra}
        {(onMoveUp || onMoveDown) && (
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
              title="Yuqoriga"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground disabled:opacity-30"
              title="Pastga"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950 text-muted-foreground hover:text-red-600 shrink-0"
            title="O'chirish"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}
