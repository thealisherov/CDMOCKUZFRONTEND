'use client';

import React, { useState } from 'react';

/**
 * RadioMatrix — "Matching Features" / "Map Labeling" component.
 * Applies test-taking template design.
 */
const RadioMatrix = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    onAnswer(questionId, option);
  };

  return (
    <div className="mb-8 font-sans">
      <div className="flex flex-col gap-8 text-[inherit]">
        <div className="overflow-x-auto border shadow-sm" style={{ backgroundColor: 'var(--test-bg)', borderColor: 'var(--test-border)' }}>
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--test-strip-bg)', borderColor: 'var(--test-border)' }}>
                <th className="p-3 text-left w-1/2 border-r" style={{ borderColor: 'var(--test-border)', color: 'var(--test-fg)' }}>
                  Question
                </th>
                {data.columnOptions.map((opt) => (
                  <th key={opt} className="p-3 text-center w-16 font-bold border-r last:border-r-0" style={{ borderColor: 'var(--test-border)', color: 'var(--test-fg)' }}>
                    {opt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.questions.map((q, qIdx) => {
                const globalNum = startIndex + qIdx;
                const questionId = String(globalNum);

                return (
                  <tr
                    key={q.id || questionId}
                    className="border-b last:border-b-0 hover:bg-black/5 transition-colors"
                    style={{ borderColor: 'var(--test-border)' }}
                  >
                    {/* Question text */}
                    <td className="p-3 border-r" style={{ borderColor: 'var(--test-border)' }}>
                      <div className="flex gap-3 items-start">
                        <span className="font-bold min-w-[20px]" style={{ color: 'var(--test-fg)' }}>{globalNum}</span>
                        <span style={{ color: 'var(--test-fg)' }} className="leading-snug">{q.text}</span>
                      </div>
                    </td>

                    {/* Radio cells */}
                    {data.columnOptions.map((opt) => {
                      const isChecked = selectedAnswers[questionId] === opt;
                      return (
                        <td key={opt} className={`p-0 border-r last:border-r-0 text-center relative`} style={{ borderColor: 'var(--test-border)', backgroundColor: isChecked ? 'rgba(37, 99, 235, 0.1)' : 'transparent' }}>
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer w-full h-full">
                            <input
                              type="radio"
                              name={`matrix_${data.id}_${questionId}`}
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleSelect(questionId, opt)}
                              className="w-5 h-5 cursor-pointer accent-blue-600"
                              style={{ 
                                backgroundColor: 'var(--test-input-bg)',
                                borderColor: 'var(--test-border)',
                                color: '#2563eb'
                              }}
                            />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RadioMatrix;
