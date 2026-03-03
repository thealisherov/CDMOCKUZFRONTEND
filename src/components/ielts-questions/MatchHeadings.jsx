'use client';

import React, { useState, useCallback } from 'react';

/**
 * MatchHeadings — "List of Headings" question type (RIGHT panel).
 *
 * Displays the heading options as draggable cards.
 * Users drag headings from here and drop them onto HeadingDropZone
 * components in the passage (left panel).
 *
 * Props:
 *  - data        : Object  — { headings: string[], questions: [{id, text, paragraphLetter}], answers }
 *  - onAnswer    : Function(questionId, value)
 *  - startIndex  : Number
 *  - userAnswers : Object — current answers from parent (to track used headings)
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

    // Create a custom drag image
    const dragEl = document.createElement('div');
    dragEl.textContent = heading;
    dragEl.style.cssText = 'position:fixed;top:-1000px;padding:8px 16px;background:#333;color:#fff;border-radius:6px;font-size:13px;font-weight:500;max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
  };

  const handleDragEnd = () => {
    setDraggedHeading(null);
  };

  return (
    <div className="mb-8 font-sans">
      {/* List of Headings header */}
      <div className="mb-3">
        <h4 className="font-bold text-[#333] text-sm tracking-wide uppercase">
          List of Headings
        </h4>
      </div>

      {/* Heading cards */}
      <div className="space-y-1.5">
        {headings.map((heading, idx) => {
          const isUsed = usedHeadings.has(heading);
          const isDragging = draggedHeading === heading;

          return (
            <div
              key={idx}
              draggable={!isUsed}
              onDragStart={(e) => handleDragStart(e, heading)}
              onDragEnd={handleDragEnd}
              className={`
                relative px-5 py-2 border border-gray-200 rounded-lg text-[13px] leading-snug
                transition-all duration-150 select-none shadow-sm
                ${isUsed
                  ? 'bg-gray-50 text-gray-400 cursor-default line-through opacity-60'
                  : isDragging
                    ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-md scale-[1.02] cursor-grabbing'
                    : 'bg-white text-gray-800 cursor-grab hover:border-gray-400 hover:shadow active:scale-[1.01]'
                }
              `}
            >
              <span className="font-medium">{heading}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchHeadings;
