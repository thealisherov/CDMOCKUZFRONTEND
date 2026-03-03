'use client';

import React, { useState } from 'react';

/**
 * HeadingDropZone — "List of Headings" question type (LEFT panel drop zone).
 * 
 * Sits directly above a paragraph and accepts drops from the right panel.
 */
const HeadingDropZone = ({ questionId, globalNum, onDrop, currentAnswer }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const heading = e.dataTransfer.getData('text/heading');
    if (heading && onDrop) {
      onDrop({ [questionId]: heading });
    }
  };

  const handleClear = () => {
    if (onDrop) {
      onDrop({ [questionId]: '' });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex items-center min-h-[42px] max-w-sm mb-4 rounded-md
        transition-all duration-200 ease-in-out border
        ${isOver 
          ? 'bg-blue-50 border-blue-400 border-dashed shadow-inner scale-[1.01]' 
          : currentAnswer 
            ? 'bg-white border-[#d2d2d2] shadow-sm' 
            : 'bg-[#f6f6f6] border-[#e0e0e0] hover:border-gray-400'
        }
      `}
    >
      {/* Question Number Badge */}
      <div className="flex-none flex items-center justify-center font-bold text-[14.5px] text-[#333] w-12 h-full min-h-[42px] px-3 border-r border-[#e0e0e0] select-none shadow-sm">
        {globalNum}
      </div>

      {/* Answer Area */}
      <div className="flex-grow flex items-center overflow-hidden pr-3">
        {currentAnswer ? (
          <span className="font-semibold text-[#111] text-[13.5px] truncate pt-0.5" title={currentAnswer}>
            {currentAnswer}
          </span>
        ) : (
          <span className="text-[#a0a0a0] text-[13px] pt-0.5 pointer-events-none select-none">
            {isOver ? "Drop heading here..." : ""}
          </span>
        )}
      </div>

      {/* Clear Button */}
      {currentAnswer && (
        <button
          onClick={handleClear}
          className="flex-none mr-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Remove heading"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default HeadingDropZone;
