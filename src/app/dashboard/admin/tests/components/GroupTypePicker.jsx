"use client";

/**
 * Yangi savol guruhi turini tanlash modali — modul bo'yicha filtrlangan.
 */

import { X } from "lucide-react";
import { groupTypesForModule } from "../lib/groupTypeConfig";

export default function GroupTypePicker({ module, onSelect, onClose }) {
  const types = groupTypesForModule(module);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-border bg-card animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold">Savol turi tanlang</h3>
            <p className="text-xs text-muted-foreground">
              {module === "listening" ? "Listening" : "Reading"} modulida qo'llab-quvvatlanadigan turlar
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className="text-left rounded-xl border border-border p-3 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors group"
            >
              <div className="font-semibold text-sm group-hover:text-indigo-600 transition-colors">
                {t.label}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
              <div className="text-[10px] font-mono text-muted-foreground/70 mt-1">{t.key}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
