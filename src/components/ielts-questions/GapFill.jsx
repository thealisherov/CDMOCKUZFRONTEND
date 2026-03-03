'use client';

import React, { useState } from 'react';

/**
 * GapFill — "Complete the notes / sentences" component.
 * Applies test-taking template design.
 */
const GapFill = ({ data, onAnswer, startIndex = 1 }) => {
  const parts = data.content.split(/(\{\d+\})/g);
  const [answers, setAnswers] = useState({});
  
  const handleInputChange = (questionId, val) => {
    setAnswers(prev => ({ ...prev, [questionId]: val }));
    onAnswer(questionId, val);
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-3 leading-loose text-gray-800">
        <div className="leading-[2.5]">
          {parts.map((part, index) => {
            const match = part.match(/\{(\d+)\}/);
            if (match) {
              const questionNum = match[1];
              const questionId = questionNum;
              const value = answers[questionId] || '';
              
              // Calculate width based on user answer length minimally (no hints)
              const minWidth = Math.max(112, (value.length * 10) + 40); // 112px is w-28

              return (
                <span key={index} className="relative inline-block mx-2 align-middle">
                  <input
                    id={`gap-input-${questionId}`}
                    type="text"
                    value={value}
                    autoComplete="off"
                    spellCheck={false}
                    className="px-1 py-0 h-[1.3em] text-center border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-semibold text-blue-800 text-[inherit]"
                    style={{ width: `${minWidth}px` }}
                    onChange={(e) => handleInputChange(questionId, e.target.value)}
                  />
                  {!value && (
                    <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-900 pointer-events-none" style={{ fontSize: '0.9em' }}>
                      {questionNum}
                    </span>
                  )}
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
            return <span key={index} className="whitespace-pre-wrap">{part}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default GapFill;
