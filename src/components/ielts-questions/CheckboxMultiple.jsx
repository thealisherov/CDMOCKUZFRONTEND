'use client';

import React, { useState } from 'react';

/**
 * CheckboxMultiple - Component for Multiple Choice (Multiple Answers)
 * Allows users to select N checkboxes corresponding to N question numbers.
 */
const CheckboxMultiple = ({ data, onAnswer }) => {
  // Store selections keyed by the block-level question "id" (e.g. "21,22")
  // Value will be an array of selected options: ["A", "C"]
  const [selectedAnswers, setSelectedAnswers] = useState({});

  /**
   * Extract the letter from an option string like "A. something" or "A something"
   */
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  const handleToggle = (qListId, value, maxAllowed, questionNumbers) => {
    setSelectedAnswers((prev) => {
      const currentSelections = prev[qListId] || [];
      let nextSelections;

      if (currentSelections.includes(value)) {
        // Uncheck
        nextSelections = currentSelections.filter((v) => v !== value);
      } else {
        // Check -> add if we haven't reached the limit
        if (currentSelections.length < maxAllowed) {
          nextSelections = [...currentSelections, value];
        } else {
          return prev; // do nothing if limit reached
        }
      }

      // We sort the selections alphabetically so they map sequentially
      // For example, if a user clicks C then A, it'll store ["A", "C"]
      nextSelections.sort();

      // Emit to parent for each corresponding question number
      // If we have 2 question numbers (21, 22), we emit the selected options.
      // E.g. nextSelections = ["A", "C"], numbers = [21, 22] -> 21="A", 22="C"
      questionNumbers.forEach((num, index) => {
        onAnswer(String(num), nextSelections[index] || "");
      });

      return {
        ...prev,
        [qListId]: nextSelections,
      };
    });
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-8">
        {data.questions.map((q) => {
          const qListId = q.id; // e.g., "21,22"
          const questionNumbers = q.numbers || []; // e.g., [21, 22]
          const maxAllowed = questionNumbers.length; // usually 2 or 3
          
          const currentSelections = selectedAnswers[qListId] || [];

          // Format numbers to show in the UI: e.g. "21-22" or "21, 22"
          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}-${questionNumbers[questionNumbers.length - 1]}`
            : questionNumbers[0];

          // Determine which options to show
          const usePerQuestionOptions = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQuestionOptions ? q.fullOptions : (data.options || []);

          return (
            <div key={qListId}>
              {/* Question text */}
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 justify-center h-[2em] border border-gray-800 text-gray-900 font-bold bg-white select-none" style={{ minWidth: '2em', fontSize: '1.1em' }}>
                    {numbersLabel}
                  </span>
                </div>
                
                <div className="flex-1 pt-1.5 font-medium text-gray-900 leading-normal" style={{ fontSize: '1.1em' }}>
                  {q.text}
                </div>
              </div>

              {/* Options */}
              <div className="ml-[3.5em] space-y-3">
                {displayOptions.map((opt) => {
                  const value = usePerQuestionOptions ? extractLetter(opt) : opt;
                  const displayText = opt;
                  const isChecked = currentSelections.includes(value);

                  return (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group w-fit">
                      {/* Checkbox */}
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          value={value}
                          checked={isChecked}
                          onChange={() => handleToggle(qListId, value, maxAllowed, questionNumbers)}
                          className="peer appearance-none w-[1.3em] h-[1.3em] border-2 border-gray-400 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500 cursor-pointer transition-colors shrink-0"
                        />
                        {/* Checkmark SVG */}
                        <svg
                          className="absolute w-[0.8em] h-[0.8em] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>

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

export default CheckboxMultiple;
