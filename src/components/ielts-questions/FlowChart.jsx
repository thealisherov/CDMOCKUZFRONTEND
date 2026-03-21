'use client';

import React, { useState } from 'react';

/**
 * FlowChart — Renders vertically stacked question boxes with arrows in between.
 * Supports both Text Input (no options) and Drag-and-Drop (with word bank).
 */
const FlowChart = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverGap, setDragOverGap] = useState(null);

  const fullText = data.content || '';
  // Each line corresponds to one logical step in the flowchart
  const steps = fullText.split('\n').filter(s => s.trim() !== '');

  // Options logic
  const optionsArray = data.fullOptions || data.options;
  const hasOptions = Array.isArray(optionsArray) && optionsArray.length > 0;
  
  const wordOptions = hasOptions ? optionsArray.map(opt => {
    const match = opt.match(/^([A-Z])[\.\s:)]+(.*)$/);
    if (match) return { value: match[1], label: match[2].trim(), full: opt };
    return { value: opt, label: opt, full: opt };
  }) : [];

  const allGapIds = [];
  steps.forEach(s => {
    const matches = s.match(/\{(\d+)\}/g);
    if (matches) {
      matches.forEach(m => {
        const id = m.replace(/[{}]/g, '');
        if (!allGapIds.includes(id)) allGapIds.push(id);
      });
    }
  });

  const findCurrentGapOf = (value) => {
    for (const gapId of allGapIds) {
      if (userAnswers[gapId] === value) return gapId;
    }
    return null;
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.value);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, gapId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGap(gapId);
  };

  const handleDrop = (e, targetGapId) => {
    e.preventDefault();
    setDragOverGap(null);
    if (!draggedItem) return;

    const value = draggedItem.value;
    const previousGapId = findCurrentGapOf(value);
    if (previousGapId && previousGapId !== targetGapId) {
      onAnswer(previousGapId, '');
    }
    onAnswer(targetGapId, value);
    setDraggedItem(null);
  };

  const handleRemove = (gapId) => onAnswer(gapId, '');

  const usedValues = new Set(allGapIds.map(id => userAnswers[id]).filter(Boolean));

  const renderContentWithGaps = (textBlock) => {
    const parts = textBlock.split(/(\{\d+\})/g);
    
    return parts.map((part, idx) => {
      const match = part.match(/^\{(\d+)\}$/);
      if (match) {
        const gapId = match[1];
        const selectedVal = userAnswers[gapId] || '';

        if (hasOptions) {
          // Drag and Drop Gap
          const selectedWordObj = wordOptions.find(w => w.value === selectedVal);
          const isHovered = dragOverGap === gapId;

          return (
            <span
              key={idx}
              onDrop={(e) => handleDrop(e, gapId)}
              onDragOver={(e) => handleDragOver(e, gapId)}
              onDragLeave={() => setDragOverGap(null)}
              onClick={() => selectedVal && handleRemove(gapId)}
              title={selectedVal ? 'Click to remove' : 'Drag a word here'}
              className="inline-flex items-center justify-center min-w-[120px] h-8 mx-1 px-3 align-middle cursor-pointer transition-all select-none bg-white"
              style={{
                border: selectedVal ? '1.5px dashed #4b8df8' : isHovered ? '2px dashed #60a5fa' : '1.5px dotted #9ca3af',
                backgroundColor: isHovered ? 'rgba(37, 99, 235, 0.08)' : '#ffffff',
                transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {selectedVal ? (
                <span className="font-semibold text-black text-center" style={{ letterSpacing: '0.2px', fontSize: '0.95em' }}>
                  {selectedWordObj ? selectedWordObj.label : selectedVal}
                </span>
              ) : (
                <span className="font-bold text-black text-center w-full" style={{ fontSize: '0.85em' }}>{gapId}</span>
              )}
            </span>
          );
        } else {
          // Text Input Gap
          const minWidth = Math.max(112, (selectedVal.length * 10) + 40);
          return (
            <span key={idx} className="relative inline-block mx-2 align-middle">
              <input
                type="text"
                value={selectedVal}
                autoComplete="off"
                spellCheck={false}
                className="px-1 py-0 h-[1.3em] text-center border-b-[2.5px] border-gray-500 bg-transparent focus:border-blue-500 outline-none font-semibold text-blue-800"
                style={{ width: `${minWidth}px`, maxWidth: '230px' }}
                onChange={(e) => onAnswer(gapId, e.target.value)}
              />
              {!selectedVal && (
                <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-800 pointer-events-none" style={{ fontSize: '0.9em' }}>
                  {gapId}
                </span>
              )}
            </span>
          );
        }
      }

      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  };

  return (
    <div className="mb-8 font-sans">
      {data.instruction && (
        <p className="mb-5 font-medium text-gray-800" style={{ fontSize: '1.05em' }}>
          {data.instruction}
        </p>
      )}

      <div className={`flex flex-col gap-10 lg:flex-row ${hasOptions ? 'items-start' : 'items-center justify-center'}`}>
        
        {/* Flowchart Diagram (Left Side) */}
        <div className="flex-1 flex flex-col items-center w-full lg:max-w-[700px]">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Box */}
              <div 
                className="w-full px-5 py-4 rounded-[3px] shadow-sm bg-white"
                style={{ fontSize: '1em', lineHeight: '1.6', color: '#000', border: '1px solid #777' }}
              >
                {renderContentWithGaps(step)}
              </div>
              
              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="my-[4px]">
                  <svg 
                    width="14" height="20" viewBox="0 0 14 20" 
                    fill="none" stroke="#000" strokeWidth="2.5" 
                    strokeLinecap="square" strokeLinejoin="miter" 
                  >
                    <path d="M7 0v16M2 13l5 5 5-5" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Word Bank (Right Side) */}
        {hasOptions && (
          <div className="w-full lg:w-48 shrink-0 flex flex-col items-start lg:ml-6 mt-4 lg:mt-0">
            <div className="flex flex-col lg:items-start items-center gap-3 w-full">
              {wordOptions.map((item, idx) => {
                const isUsed = usedValues.has(item.value);
                return (
                  <div
                    key={idx}
                    draggable={!isUsed}
                    onDragStart={(e) => !isUsed && handleDragStart(e, item)}
                    onDragEnd={() => setDraggedItem(null)}
                    className={`px-3 py-1 bg-white font-[400] transition-all
                      ${isUsed 
                        ? 'text-transparent cursor-default opacity-0 invisible' 
                        : 'text-[#333] cursor-grab hover:bg-gray-50'
                      }
                    `}
                    style={{ 
                      userSelect: 'none', 
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      fontSize: '0.95em'
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowChart;
