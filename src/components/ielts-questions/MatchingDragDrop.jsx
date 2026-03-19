'use client';

import React, { useState, useCallback } from 'react';

/**
 * MatchingDragDrop — IELTS CD-style drag-drop matching component.
 *
 * Used for "Match each finding with the correct place A-E" type questions.
 * Same visual design as the match_headings drag-drop:
 *  - Questions with text + drop zones (dashed border, centered number)
 *  - Options listed below as draggable bordered items
 *
 * Props:
 *  - data        : { questions, options, optionDescriptions, instruction, answers }
 *  - onAnswer    : Function(questionId, value)
 *  - startIndex  : Number
 *  - userAnswers : Object
 */
const MatchingDragDrop = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const [draggedOption, setDraggedOption] = useState(null);

  const questions = data.questions || [];
  const optionLetters = data.options || [];
  const optionDescriptions = data.optionDescriptions || [];

  // Track which option letters have been used
  const usedLetters = new Set();
  questions.forEach((q, qIdx) => {
    const questionId = String(startIndex + qIdx);
    const answer = userAnswers[questionId];
    if (answer) usedLetters.add(answer);
  });

  /**
   * Extract the letter prefix from an option description.
   * "A. The Périgord region" → "A"
   * "A The Périgord region" → "A"
   */
  const extractLetter = (desc) => {
    const m = desc.match(/^([A-Z])[.\s:)]/);
    return m ? m[1] : desc;
  };

  /**
   * Get the full description text for a letter.
   */
  const getDescriptionForLetter = (letter) => {
    const desc = optionDescriptions.find(d => extractLetter(d) === letter);
    return desc || letter;
  };

  /* ── Drag handlers ── */
  const handleDragStart = (e, letter, descText) => {
    e.dataTransfer.setData('text/matching-option', letter);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOption(letter);

    const dragEl = document.createElement('div');
    dragEl.textContent = descText;
    dragEl.style.cssText =
      'position:fixed;top:-1000px;padding:8px 16px;background:#333;color:#fff;border-radius:4px;font-size:14px;font-weight:700;max-width:400px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 12px rgba(0,0,0,.25);';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 0, 0);
    setTimeout(() => document.body.removeChild(dragEl), 0);
  };

  const handleDragEnd = () => {
    setDraggedOption(null);
  };

  /* ── Per-question DropZone (inline) ── */
  const QuestionDropZone = ({ questionId, globalNum, questionText }) => {
    const [isOver, setIsOver] = useState(false);
    const currentAnswer = userAnswers[questionId];
    const answerDesc = currentAnswer ? getDescriptionForLetter(currentAnswer) : null;

    const handleDragOver = (e) => {
      e.preventDefault();
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
      const letter = e.dataTransfer.getData('text/matching-option');
      if (letter && onAnswer) {
        onAnswer(questionId, letter);
      }
    };
    const handleClear = (e) => {
      e.stopPropagation();
      onAnswer(questionId, '');
    };

    return (
      <div style={{ marginBottom: 18 }}>
        {/* Question text */}
        <p
          style={{
            fontWeight: 700,
            fontSize: 15,
            lineHeight: 1.5,
            color: 'var(--test-fg, #111)',
            marginBottom: 6,
          }}
          dangerouslySetInnerHTML={{ __html: questionText }}
        />

        {/* Drop zone */}
        {currentAnswer ? (
          /* ═══ FILLED ═══ */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              border: '1.5px solid #7ecbf5',
              borderRadius: 4,
              background: '#fff',
              maxWidth: '100%',
              cursor: 'pointer',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: 14.5,
                lineHeight: 1.4,
                color: 'var(--test-fg, #111)',
              }}
            >
              {answerDesc}
            </span>
            <button
              onClick={handleClear}
              title="Remove"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                border: '1px solid #ccc',
                borderRadius: 3,
                background: '#f5f5f5',
                cursor: 'pointer',
                color: '#888',
                fontSize: 13,
                fontWeight: 700,
                lineHeight: 1,
                padding: 0,
                marginLeft: 4,
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fee2e2';
                e.currentTarget.style.borderColor = '#fca5a5';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f5f5f5';
                e.currentTarget.style.borderColor = '#ccc';
                e.currentTarget.style.color = '#888';
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          /* ═══ EMPTY ═══ */
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              position: 'relative',
              display: 'inline-block',
              minWidth: 600,
              maxWidth: '100%',
              height: 40,
              border: isOver
                ? '2px dashed #2563eb'
                : '1.5px dashed #999',
              borderRadius: 4,
              background: isOver ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Number badge centered */}
            <div
              style={{
                position: 'absolute',
                marginTop: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 38,
                height: 24,
                padding: '0 10px',
                background: 'var(--test-panel-bg, #fff)',
                fontWeight: 700,
                fontSize: 14,
                color: 'var(--test-fg, #333)',
                userSelect: 'none',
              }}
            >
              {globalNum}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-6 font-sans">
      {/* ── Questions with drop zones ── */}
      <div style={{ marginBottom: 24 }}>
        {questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          const questionId = String(globalNum);
          return (
            <QuestionDropZone
              key={q.id || questionId}
              questionId={questionId}
              globalNum={globalNum}
              questionText={q.text}
            />
          );
        })}
      </div>

      {/* ── Draggable option items ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {optionDescriptions.map((desc, idx) => {
          const letter = extractLetter(desc);
          const isUsed = usedLetters.has(letter);
          const isDragging = draggedOption === letter;

          return (
            <div
              key={idx}
              draggable={!isUsed}
              onDragStart={(e) => handleDragStart(e, letter, desc)}
              onDragEnd={handleDragEnd}
              style={{
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderBottom: idx < optionDescriptions.length - 1 ? 'none' : '1px solid #d1d5db',
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
                  : idx === optionDescriptions.length - 1
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
                  fontWeight: 500,
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  color: isUsed ? '#9ca3af' : 'var(--test-fg, #111827)',
                }}
              >
                {desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchingDragDrop;
