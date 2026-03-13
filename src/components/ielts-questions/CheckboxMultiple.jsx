'use client';

import React from 'react';

/**
 * CheckboxMultiple — Controlled component.
 * Selections driven by userAnswers prop from the parent page.
 */
const CheckboxMultiple = ({ data, onAnswer, userAnswers = {} }) => {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  const handleToggle = (qListId, value, maxAllowed, questionNumbers) => {
    // Reconstruct current selections for this group from parent userAnswers
    const currentSelections = questionNumbers
      .map((num) => userAnswers[String(num)])
      .filter((v) => v && v.trim() !== '');

    let nextSelections;
    if (currentSelections.includes(value)) {
      nextSelections = currentSelections.filter((v) => v !== value);
    } else {
      if (currentSelections.length < maxAllowed) {
        nextSelections = [...currentSelections, value];
      } else {
        return; // limit reached
      }
    }

    nextSelections.sort();

    // Emit each question number separately
    questionNumbers.forEach((num, index) => {
      onAnswer(String(num), nextSelections[index] || '');
    });
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-8">
        {data.questions.map((q) => {
          const qListId = q.id;
          const questionNumbers = q.numbers || [];
          const maxAllowed = questionNumbers.length;

          // Reconstruct current selections from parent state
          const currentSelections = questionNumbers
            .map((num) => userAnswers[String(num)])
            .filter((v) => v && v.trim() !== '');

          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}-${questionNumbers[questionNumbers.length - 1]}`
            : questionNumbers[0];

          const usePerQuestionOptions = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQuestionOptions ? q.fullOptions : (data.options || []);

          return (
            <div key={qListId}>
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2 justify-center h-[2em] border border-gray-800 text-gray-900 font-bold bg-white select-none" style={{ minWidth: '2em', fontSize: '1.1em' }}>
                    {numbersLabel}
                  </span>
                </div>
                <div 
                  className="flex-1 pt-1.5 font-medium text-gray-900 leading-normal [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2" 
                  style={{ fontSize: '1.1em' }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>

              <div className="ml-[3.5em] space-y-3">
                {displayOptions.map((opt) => {
                  const value = usePerQuestionOptions ? extractLetter(opt) : opt;
                  const isChecked = currentSelections.includes(value);

                  return (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group w-fit">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          value={value}
                          checked={isChecked}
                          onChange={() => handleToggle(qListId, value, maxAllowed, questionNumbers)}
                          className="peer appearance-none w-[1.3em] h-[1.3em] border-2 border-gray-400 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500 cursor-pointer transition-colors shrink-0"
                        />
                        <svg
                          className="absolute w-[0.8em] h-[0.8em] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800 group-hover:text-gray-900 font-medium" style={{ fontSize: '1.1em' }}>
                        {opt}
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
