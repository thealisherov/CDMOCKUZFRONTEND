import { useState, useCallback, useEffect } from 'react';

export default function ResizableSplitPane({ 
  left, 
  right, 
  initialLeftWidth = 50, // Percentage
  minLeftWidth = 20,
  maxLeftWidth = 80,
  isVertical = false // Future support for vertical split if needed
}) {
  const [leftWidth, setLeftWidth] = useState(initialLeftWidth);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      if (isVertical) {
        // Not implemented yet
      } else {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth >= minLeftWidth && newWidth <= maxLeftWidth) {
          setLeftWidth(newWidth);
        }
      }
    }
  }, [isDragging, minLeftWidth, maxLeftWidth, isVertical]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} h-full overflow-hidden`} style={{ background: 'var(--test-bg)' }}>
      {/* Left Pane */}
      <div 
        style={{ width: `${leftWidth}%` }} 
        className="h-full overflow-hidden relative"
      >
        {left}
        {/* Overlay when dragging to prevent iframe/selection interference */}
        {isDragging && <div className="absolute inset-0 z-50 cursor-col-resize" />}
      </div>

      {/* Resizer Handle */}
      <div
        className={`w-4 flex items-center justify-center cursor-col-resize z-10 select-none transition-colors border-l border-r shadow-sm ${isDragging ? 'bg-blue-400' : 'hover:bg-blue-200'}`}
        style={{
          background: 'var(--test-strip-bg)',
          borderColor: 'var(--test-border)',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="flex flex-col gap-1">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* Right Pane */}
      <div 
        style={{ width: `${100 - leftWidth}%` }} 
        className="h-full overflow-hidden relative"
      >
        {right}
        {isDragging && <div className="absolute inset-0 z-50 cursor-col-resize" />}
      </div>
    </div>
  );
}
