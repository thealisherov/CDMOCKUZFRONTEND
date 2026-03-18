'use client';

import React from 'react';

/**
 * CheckboxMultiple — Controlled component.
 * Selections driven by userAnswers prop from the parent page.
 */
const CheckboxMultiple = ({ data, onAnswer, userAnswers = {} }) => {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[\.\s:)]/);
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

          const isAtLimit = currentSelections.length >= maxAllowed;

          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}–${questionNumbers[questionNumbers.length - 1]}`
            : questionNumbers[0];

          const usePerQuestionOptions = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQuestionOptions ? q.fullOptions : (data.options || []);

          return (
            <div key={qListId} className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #d1d5db' }}>
              {/* Question header */}
              <div className="flex gap-4 px-5 py-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex items-center px-2 justify-center h-[2em] border border-gray-700 text-gray-900 font-bold bg-white select-none"
                    style={{ minWidth: '2em', fontSize: '1.05em' }}
                  >
                    {numbersLabel}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="pt-1 font-medium text-gray-900 leading-normal [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-2"
                    style={{ fontSize: '1.05em' }}
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  {/* Selection badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 text-[0.78em] font-semibold px-2.5 py-0.5 rounded-full border"
                      style={
                        isAtLimit
                          ? { background: '#fef3c7', color: '#92400e', borderColor: '#fbbf24' }
                          : { background: '#eff6ff', color: '#1d4ed8', borderColor: '#93c5fd' }
                      }
                    >
                      {isAtLimit
                        ? `✓ ${currentSelections.length} / ${maxAllowed} selected`
                        : `Select ${maxAllowed} answer${maxAllowed > 1 ? 's' : ''} · ${currentSelections.length} / ${maxAllowed}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="px-5 py-4 space-y-2.5" style={{ background: '#fff' }}>
                {displayOptions.map((opt) => {
                  const value = usePerQuestionOptions ? extractLetter(opt) : opt;
                  const isChecked = currentSelections.includes(value);
                  const isDisabled = !isChecked && isAtLimit;

                  return (
                    <label
                      key={opt}
                      className="flex items-start gap-3 cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-150"
                      style={{
                        background: isChecked
                          ? '#eff6ff'
                          : isDisabled
                            ? '#f9fafb'
                            : 'transparent',
                        border: isChecked
                          ? '1.5px solid #3b82f6'
                          : '1.5px solid transparent',
                        opacity: isDisabled ? 0.5 : 1,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          value={value}
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && handleToggle(qListId, value, maxAllowed, questionNumbers)}
                          className="peer appearance-none w-[1.25em] h-[1.25em] border-2 border-gray-400 checked:bg-blue-600 checked:border-blue-600 focus:ring-blue-500 cursor-pointer transition-colors shrink-0 rounded-sm"
                          style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                        />
                        <svg
                          className="absolute w-[0.75em] h-[0.75em] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                          fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span
                        className="font-medium leading-snug"
                        style={{
                          fontSize: '1.05em',
                          color: isChecked ? '#1d4ed8' : isDisabled ? '#9ca3af' : '#1f2937',
                          fontWeight: isChecked ? 600 : 400,
                        }}
                      >
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
