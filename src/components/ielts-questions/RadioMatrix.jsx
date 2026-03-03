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
      <div className="flex flex-col gap-8">
        <div className="overflow-x-auto border border-gray-400 bg-white shadow-sm">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="p-3 text-left w-1/2 border-r border-gray-300">
                  Question
                </th>
                {data.columnOptions.map((opt) => (
                  <th key={opt} className="p-3 text-center w-16 font-bold text-gray-900 border-r border-gray-300 last:border-r-0">
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
                    className="border-b border-gray-300 last:border-b-0 hover:bg-blue-50 transition-colors"
                  >
                    {/* Question text */}
                    <td className="p-3 border-r border-gray-300">
                      <div className="flex gap-3 items-start">
                        <span className="font-bold text-gray-900 min-w-[20px]">{globalNum}</span>
                        <span className="text-gray-800 leading-snug">{q.text}</span>
                      </div>
                    </td>

                    {/* Radio cells */}
                    {data.columnOptions.map((opt) => {
                      const isChecked = selectedAnswers[questionId] === opt;
                      return (
                        <td key={opt} className={`p-0 border-r border-gray-300 last:border-r-0 text-center relative ${isChecked ? 'bg-blue-100' : ''}`}>
                          <label className="absolute inset-0 flex items-center justify-center cursor-pointer w-full h-full">
                            <input
                              type="radio"
                              name={`matrix_${data.id}_${questionId}`}
                              value={opt}
                              checked={isChecked}
                              onChange={() => handleSelect(questionId, opt)}
                              className="w-5 h-5 border-2 border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
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
