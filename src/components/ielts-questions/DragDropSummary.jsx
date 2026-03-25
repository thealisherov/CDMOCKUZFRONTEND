'use client';

import React, { useState } from 'react';
import parse, { domToReact } from 'html-react-parser';

/**
 * DragDropSummary — Controlled component.
 * Rule: each word option can only occupy ONE gap at a time.
 * If the option is already placed somewhere, it is removed from that gap first.
 */
const DragDropSummary = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverGap, setDragOverGap]   = useState(null); // for visual hover feedback

  const fullText = data.content || '';

  // Parse word options: "A. popular" → { value: "A", label: "popular" }
  const wordOptions = (data.options || []).map(opt => {
    const match = opt.match(/^([A-Z])[\.\s:)]+(.*)$/);
    if (match) return { value: match[1], label: match[2].trim(), full: opt };
    return { value: opt, label: opt, full: opt };
  });

  // Split content into text parts and {N} gap tokens
  const parts = fullText.split(/(\{\d+\})/g);

  // Collect all gap IDs that appear in the content
  const allGapIds = parts
    .map(p => { const m = p.match(/^\{(\d+)\}$/); return m ? m[1] : null; })
    .filter(Boolean);

  /**
   * Returns the gapId where the given value is currently placed, or null.
   */
  const findCurrentGapOf = (value) => {
    for (const gapId of allGapIds) {
      if (userAnswers[gapId] === value) return gapId;
    }
    return null;
  };

  // ── Drag handlers ────────────────────────────────────────────────────────

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

  const handleDragLeave = () => {
    setDragOverGap(null);
  };

  const handleDrop = (e, targetGapId) => {
    e.preventDefault();
    setDragOverGap(null);

    if (!draggedItem) return;
    const value = draggedItem.value;

    // If the dragged item is already in some other gap, clear it first
    const previousGapId = findCurrentGapOf(value);
    if (previousGapId && previousGapId !== targetGapId) {
      onAnswer(previousGapId, '');
    }

    // Place into the target gap
    onAnswer(targetGapId, value);
    setDraggedItem(null);
  };

  /**
   * Clicking on a filled gap removes its value (frees it back to the word bank).
   */
  const handleRemove = (gapId) => {
    onAnswer(gapId, '');
  };

  /**
   * Also allow dragging FROM a filled gap back to the word bank
   * (by clicking 'x' or clicking the gap itself).
   */

  // Which values are currently used in any gap
  const usedValues = new Set(allGapIds.map(id => userAnswers[id]).filter(Boolean));

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'text') {
        const text = domNode.data;
        if (/\{\d+\}/.test(text)) {
          const parts = text.split(/(\{\d+\})/g);
          return (
            <React.Fragment>
              {parts.map((part, idx) => {
                const match = part.match(/^\{(\d+)\}$/);
                if (match) {
                  const gapId = match[1];
                  const selectedVal = userAnswers[gapId] || '';
                  const selectedWordObj = wordOptions.find(w => w.value === selectedVal);
                  const isHovered = dragOverGap === gapId;

                  return (
                    <span
                      key={idx}
                      onDrop={(e) => handleDrop(e, gapId)}
                      onDragOver={(e) => handleDragOver(e, gapId)}
                      onDragLeave={handleDragLeave}
                      onClick={() => selectedVal && handleRemove(gapId)}
                      title={selectedVal ? 'Click to remove' : 'Drag a word here'}
                      className="inline-flex items-center justify-center min-w-[110px] h-8 mx-1 px-3 align-middle cursor-pointer transition-all select-none rounded"
                      style={{
                        border: selectedVal
                          ? '2px solid #2563eb'
                          : isHovered
                            ? '2px solid #60a5fa'
                            : '2px dashed var(--test-border)',
                        backgroundColor: isHovered
                          ? 'rgba(37, 99, 235, 0.08)'
                          : selectedVal
                            ? 'rgba(37, 99, 235, 0.06)'
                            : 'var(--test-bg)',
                        opacity: 1,
                        transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {selectedVal ? (
                        <span className="font-semibold" style={{ color: '#2563eb', fontSize: '0.95em' }}>
                          {selectedWordObj ? selectedWordObj.label : selectedVal}
                        </span>
                      ) : (
                        <span className="font-medium opacity-50" style={{ fontSize: '0.85em' }}>{gapId}</span>
                      )}
                    </span>
                  );
                }

                if (part.includes('\n')) {
                  return (
                    <span key={idx}>
                      {part.split('\n').map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </span>
                  );
                }
                return <span key={idx}>{part}</span>;
              })}
            </React.Fragment>
          );
        }
      }
    }
  };

  return (
    <div className="mb-8 font-sans">
      {data.instruction && (
        <p className="mb-4" style={{ fontSize: '1.1em', color: 'var(--test-fg)' }}>
          {data.instruction}
        </p>
      )}

      {/* Summary Box with inline drop zones */}
      <div 
        className="p-6 border rounded-md mb-6 leading-loose [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:my-2 [&_li]:mb-2"
        style={{ background: 'var(--opts-bg)', borderColor: 'var(--test-border)', fontSize: '1.05em', color: 'var(--test-fg)' }}
      >
        {parse(fullText, options)}
      </div>

      {/* Draggable Word Bank */}
      <div
        className="p-5 border-2 border-dashed rounded-md"
        style={{ backgroundColor: 'var(--test-bg)', borderColor: 'var(--test-border)' }}
      >
        <p className="text-xs font-semibold mb-3 opacity-50 uppercase tracking-wider" style={{ color: 'var(--test-fg)' }}>
          Word Bank — drag words into the gaps above
        </p>
        <div className="flex flex-wrap gap-3">
          {wordOptions.map((item, idx) => {
            const isUsed = usedValues.has(item.value);
            return (
              <div
                key={idx}
                draggable={!isUsed}
                onDragStart={(e) => !isUsed && handleDragStart(e, item)}
                onDragEnd={() => setDraggedItem(null)}
                className="px-4 py-2 border rounded shadow-sm select-none transition-all"
                style={{
                  fontSize: '0.95em',
                  backgroundColor: isUsed ? 'transparent' : 'var(--test-input-bg)',
                  borderColor: isUsed ? 'var(--test-border)' : 'var(--test-border)',
                  borderStyle: isUsed ? 'dashed' : 'solid',
                  color: isUsed ? 'transparent' : 'var(--test-fg)',
                  cursor: isUsed ? 'default' : 'grab',
                  opacity: isUsed ? 0.3 : 1,
                  userSelect: 'none',
                  minWidth: 60,
                  textAlign: 'center',
                }}
                title={isUsed ? 'Already placed in a gap' : 'Drag to a gap'}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DragDropSummary;
