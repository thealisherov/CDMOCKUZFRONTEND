"use client";

import { X, Star, MessageCircle } from "lucide-react";
import { useEffect } from "react";

export default function AllCommentsModal({ isOpen, onClose, comments }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-xl animate-in zoom-in-95 duration-200"
        style={{ background: "var(--card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
            <MessageCircle className="w-5 h-5 text-primary" />
            Barcha Fikrlar (<span className="text-primary">{comments.length}</span>)
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors opacity-70 hover:opacity-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {comments.map((comment, i) => (
            <div key={`${comment.id}-${i}`} className="p-4 rounded-xl border bg-background/50 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm"
                  style={{ background: comment.color || 'var(--primary)' }}
                >
                  {comment.avatar || (comment.name && comment.name[0]) || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] leading-tight" style={{ color: "var(--foreground)" }}>
                    {comment.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`w-3 h-3 ${j < comment.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    {comment.band && (
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                        Band {comment.band}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground ml-1">
                      {comment.date || (comment.created_at && new Date(comment.created_at).toLocaleDateString()) || ''}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed mt-3" style={{ color: "var(--foreground)" }}>
                {comment.text}
              </p>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Hozircha fikrlar yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
