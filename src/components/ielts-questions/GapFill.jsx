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

            return (
              <span key={index} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 4px', verticalAlign: 'baseline' }}>
                {/* Boxed question number */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  border: '1px solid #999',
                  color: '#333',
                  fontSize: '11px',
                  fontWeight: '700',
                  marginRight: '4px',
                  flexShrink: 0,
                  backgroundColor: '#fff',
                }}>
                  {questionNum}
                </span>
                <input
                  id={`gap-input-${questionId}`}
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  style={{
                    display: 'inline-block',
                    width: '112px',
                    padding: '4px 8px',
                    border: '2px solid #4a7ab5',
                    backgroundColor: '#fff',
                    color: '#333',
                    fontWeight: '500',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#2a5a95'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#4a7ab5'; }}
                  onChange={(e) => onAnswer(questionId, e.target.value)}
                  placeholder=""
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
