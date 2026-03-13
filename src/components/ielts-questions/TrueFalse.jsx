'use client';

import React, { useState } from 'react';

/**
 * TrueFalse — IELTS CD style radio buttons.
 * Handles: true_false, yes_no, multiple_choice question types.
 *
 * Supports two option modes:
 *  1. Block-level options: data.options = ['A', 'B', 'C'] — same for all questions
 *  2. Per-question options: data.hasPerQuestionOptions = true, q.fullOptions = ['A. text', 'B. text']
 *
 * Also supports showing option descriptions (e.g. matching_sentence_endings):
 *  data.optionDescriptions = ['A optimists have...', 'B long life is...']
 */
const TrueFalse = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const handleSelect = (questionId, value) => {
    onAnswer(questionId, value);
  };

  /**
   * Extract the letter from an option string like "A. something" or "A something"
   */
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  return (
    <div className="mb-8 font-sans">
      {/* Show option descriptions if available (e.g. matching_sentence_endings) */}
      {data.optionDescriptions && data.optionDescriptions.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-1.5">
            {data.optionDescriptions.map((desc, idx) => (
              <p key={idx} className="text-sm text-gray-700 leading-relaxed">
                {desc}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {data.questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          const questionId = String(globalNum);
          const selected = userAnswers[questionId];

          // Determine which options to show for this question
          const usePerQuestionOptions = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQuestionOptions
            ? q.fullOptions
            : (data.options || []);

          return (
            <div key={q.id || questionId}>
              {/* Question text */}
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-[2em] h-[2em] border border-gray-800 text-gray-900 font-bold bg-white select-none" style={{ fontSize: '1.1em' }}>
                    {globalNum}
                  </span>
                </div>
                
                <div 
                  className="flex-1 pt-1.5 font-medium text-gray-900 leading-normal [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2" 
                  style={{ fontSize: '1.1em' }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>

              {/* Options */}
              <div className="ml-[3.5em] space-y-3">
                {displayOptions.map((opt) => {
                  // For per-question full options, the value sent is just the letter
                  const value = usePerQuestionOptions ? extractLetter(opt) : opt;
                  const displayText = opt;

                  return (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group w-fit">
                      <input
                        type="radio"
                        name={`tf_${data.id}_${questionId}`}
                        value={value}
                        checked={selected === value}
                        onChange={() => handleSelect(questionId, value)}
                        className="w-[1.2em] h-[1.2em] border-2 border-gray-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-gray-800 group-hover:text-gray-900 font-medium" style={{ fontSize: '1.1em' }}>
                        {displayText}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrueFalse;
