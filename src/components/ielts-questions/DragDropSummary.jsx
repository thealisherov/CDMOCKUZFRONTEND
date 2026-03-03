'use client';

import React, { useState } from 'react';

/**
 * DragDropSummary
 * Used for "summary_completion_with_options"
 * Allows dragging words into gaps in a summary paragraph.
 */
const DragDropSummary = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);

  const fullText = data.content || '';

  // Parse options: e.g. "A. popular" -> { value: "A", label: "popular" }
  // or "popular" -> { value: "popular", label: "popular" }
  const wordOptions = (data.options || []).map(opt => {
    // try to match "A. Word" or "A Word"
    const match = opt.match(/^([A-Z])[\.\s:)]+(.*)$/);
    if (match) {
      return { value: match[1], label: match[2].trim(), full: opt };
    }
    return { value: opt, label: opt, full: opt };
  });

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    // Setting inner/outer data for safety 
    e.dataTransfer.setData('text/plain', item.value);
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDrop = (e, gapId) => {
    e.preventDefault();
    if (draggedItem) {
      const newValue = draggedItem.value;
      setSelectedAnswers(prev => ({ ...prev, [gapId]: newValue }));
      onAnswer(gapId, newValue);
      setDraggedItem(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleRemove = (gapId) => {
    setSelectedAnswers(prev => {
      const next = { ...prev };
      delete next[gapId];
      return next;
    });
    onAnswer(gapId, '');
  };

  // Splitting the content by `{number}` to insert drop zones inline
  // E.g. "somethig {37} other" -> ["somethig ", "{37}", " other"]
  const parts = fullText.split(/(\{\d+\})/g);

  return (
    <div className="mb-8 font-sans">
      {data.instruction && (
        <p className="text-black mb-4" style={{ fontSize: '1.1em' }}>
          {data.instruction}
        </p>
      )}

      {/* Summary Box */}
      <div className="p-6 bg-[#f7f8f9] border border-gray-200 rounded-md mb-6 text-black leading-loose text-[17px]">
        {parts.map((part, idx) => {
          const match = part.match(/^\{(\d+)\}$/);
          if (match) {
            const gapId = match[1];
            const selectedVal = selectedAnswers[gapId];
            const selectedWordObj = wordOptions.find(w => w.value === selectedVal);

            return (
              <span
                key={idx}
                onDrop={(e) => handleDrop(e, gapId)}
                onDragOver={handleDragOver}
                onClick={() => selectedVal && handleRemove(gapId)}
                title={selectedVal ? "Click to remove" : "Drag word here"}
                className={`inline-flex items-center justify-center min-w-[100px] h-8 mx-1 px-3 align-middle cursor-pointer transition-colors select-none ${
                  selectedVal
                    ? 'border-2 border-solid border-blue-400 bg-white text-blue-800'
                    : 'border-2 border-dashed border-gray-400 bg-white text-gray-400 hover:border-gray-500 hover:bg-gray-50'
                } rounded`}
              >
                {selectedVal ? (
                  <span className="font-semibold text-[15px]">
                     {selectedWordObj ? selectedWordObj.label : selectedVal}
                  </span>
                ) : (
                  <span className="text-[15px] font-medium">{gapId}</span>
                )}
              </span>
            );
          }

          // Normal text
          // replace double newlines with double breaks, single newlines with single spaces
          return (
            <span
              key={idx}
              dangerouslySetInnerHTML={{
                __html: part.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, ' ')
              }}
            />
          );
        })}
      </div>

      {/* Draggable Words Box */}
      <div className="p-5 border-2 border-dashed border-gray-300 rounded-md bg-white">
        <div className="flex flex-wrap gap-4">
          {wordOptions.map((item, idx) => (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={() => setDraggedItem(null)}
              className="px-4 py-2 border border-gray-300 bg-white rounded shadow-sm text-black cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-colors text-[16px] select-none"
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDropSummary;
