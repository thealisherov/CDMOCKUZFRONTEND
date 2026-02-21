'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * ResizableLayout
 * Implements a split-pane view where the divider can be dragged to resize panels.
 * On mobile (hidden lg), it falls back to a column layout (not resizable).
 */
export default function ResizableLayout({ leftContent, rightContent }) {
  const [leftWidth, setLeftWidth] = useState(50); // percentage width of the left panel
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Set global cursor styles to prevent text selection and show resize cursor
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    // Calculate percentage relative to the container width
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Constraint the width between 20% and 80% to avoid crushing content
    if (newLeftWidth > 20 && newLeftWidth < 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // Reset cursor styles
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    // Safety cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden w-full"
    >
      {/* Left Panel (Reading Passage) */}
      <div
        className="h-full overflow-y-auto border-r border-border custom-scrollbar"
        style={{ width: `${leftWidth}%` }}
      >
        {leftContent}
      </div>

      {/* Resizer Handle */}
      <div
        className="hidden lg:flex w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize items-center justify-center transition-colors shrink-0 z-10"
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      >
        <div className="w-0.5 h-8 bg-gray-400 rounded-full pointer-events-none" />
      </div>

      {/* Right Panel (Questions) */}
      <div
        className="h-full overflow-y-auto bg-muted/20 custom-scrollbar flex-1"
        style={{
          // On desktop, flex-1 fills the remaining space.
          // The left panel takes explicit % width.
        }}
      >
        {rightContent}
      </div>

      <style jsx global>{`
        /* Mobile override: stack vertically, ignore width percentages */
        @media (max-width: 1023px) {
          .lg\\:flex-row > div:first-child {
            width: 100% !important;
            height: 50%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
          .lg\\:flex-row > div:last-child {
            width: 100% !important;
            height: 50%;
          }
        }
      `}</style>
    </div>
  );
}
