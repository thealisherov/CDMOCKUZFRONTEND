'use client';

import React from 'react';

/**
 * GapFill — "Complete the notes / sentences" component.
 * IELTS CD style: numbered labels with bordered input boxes.
 * 
 * IMPORTANT: The placeholder numbers in content (e.g. {1}, {23})
 * are used directly as question IDs and display numbers.
 * The startIndex prop is IGNORED because the content already
 * contains global question numbers.
 */
const GapFill = ({ data, onAnswer, startIndex = 1 }) => {
  const parts = data.content.split(/(\{\d+\})/g);

  return (
    <div>
      <div style={{ lineHeight: '2.4', fontSize: '0.92rem', color: '#333' }}>
        {parts.map((part, index) => {
          const match = part.match(/\{(\d+)\}/);
          if (match) {
            // The number in the placeholder IS the global question number
            const questionNum = match[1];
            const questionId = questionNum;

            const answerText = data.answers && data.answers[questionNum] ? data.answers[questionNum] : '';
            // Calculate width: minimum 140px, plus space for longer answers
            const minWidth = Math.max(140, (answerText.length * 12) + 50);

            return (
              <span
                key={index}
                className="gap-fill-container border border-gray-300 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  margin: '0 6px',
                  verticalAlign: 'middle',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                  height: '36px',
                  width: `${minWidth}px`,
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  height: '100%',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: '700',
                  flexShrink: 0,
                  backgroundColor: '#f5f5f5',
                  borderRight: '1px solid #e0e0e0',
                  borderTopLeftRadius: '3px',
                  borderBottomLeftRadius: '3px',
                }}>
                  {questionNum}
                </span>
                <input
                  id={`gap-input-${questionId}`}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-full bg-transparent border-none outline-none text-gray-800 text-sm px-2"
                  onChange={(e) => onAnswer(questionId, e.target.value)}
                />
              </span>
            );
          }
          // Preserve newlines
          if (part.includes('\n')) {
            return (
              <span key={index}>
                {part.split('\n').map((line, i, arr) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
};

export default GapFill;
