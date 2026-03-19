'use client';

import React, { useState } from 'react';

/**
 * MatchHeadings — IELTS CD-style "List of Headings" (RIGHT panel).
 *
 * Displays heading options as clean bold text items with thin borders.
 * Users drag headings from here and drop them onto HeadingDropZone
 * components in the passage (left panel).
 *
 * Design matches official IELTS CD interface:
 * - Simple bordered items, bold text, no grip icons
 * - Used headings get faded and crossed out
 */
const MatchHeadings = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const [draggedHeading, setDraggedHeading] = useState(null);

  const headings = data.headings || [];

  // Determine which headings are already used (dropped somewhere)
  const usedHeadings = new Set();
  (data.questions || []).forEach((q, qIdx) => {
    const questionId = String(startIndex + qIdx);
    const answer = userAnswers[questionId];
    if (answer) {
      usedHeadings.add(answer);
    }
  });

  const handleDragStart = (e, heading) => {
    e.dataTransfer.setData('text/heading', heading);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedHeading(heading);

    // Custom drag image
    const dragEl = document.createElement('div');
    dragEl.textContent = heading;
    dragEl.style.cssText =
      'position:fixed;top:-1000px;padding:8px 16px;background:#333;color:#fff;border-radius:4px;font-size:14px;font-weight:700;max-width:400px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 12px rgba(0,0,0,.25);';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
  };

  const handleDragEnd = () => {
    setDraggedHeading(null);
  };

  return (
    <div className="mb-6 font-sans">
      {/* ── Heading items ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {headings.map((heading, idx) => {
          const isUsed = usedHeadings.has(heading);
          const isDragging = draggedHeading === heading;

          return (
            <div
              key={idx}
              draggable={!isUsed}
              onDragStart={(e) => handleDragStart(e, heading)}
              onDragEnd={handleDragEnd}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderBottom: idx < headings.length - 1 ? 'none' : '1px solid #d1d5db',
                background: isDragging
                  ? 'rgba(37, 99, 235, 0.05)'
                  : isUsed
                    ? '#f9fafb'
                    : 'var(--test-panel-bg, #fff)',
                cursor: isUsed ? 'default' : isDragging ? 'grabbing' : 'grab',
                opacity: isUsed ? 0.4 : isDragging ? 0.5 : 1,
                textDecoration: isUsed ? 'line-through' : 'none',
                userSelect: 'none',
                transition: 'all 0.15s ease',
                borderRadius: idx === 0
                  ? '4px 4px 0 0'
                  : idx === headings.length - 1
                    ? '0 0 4px 4px'
                    : 0,
              }}
              onMouseEnter={(e) => {
                if (!isUsed && !isDragging) {
                  e.currentTarget.style.background = '#f0f7ff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isUsed && !isDragging) {
                  e.currentTarget.style.background = 'var(--test-panel-bg, #fff)';
                }
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  color: isUsed
                    ? '#9ca3af'
                    : 'var(--test-fg, #111827)',
                }}
              >
                {heading}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchHeadings;
