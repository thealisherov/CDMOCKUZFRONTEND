'use client';
import React from 'react';

/**
 * ReviewCheckboxMultiple — read-only, same layout as original CheckboxMultiple
 * Shows checked options with correct/wrong coloring
 */
export default function ReviewCheckboxMultiple({ data, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-8">
        {data.questions.map((q) => {
          const questionNumbers = q.numbers || [];
          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}-${questionNumbers[questionNumbers.length - 1]}`
            : questionNumbers[0];

          const currentSelections = questionNumbers
            .map((num) => userAnswers[String(num)])
            .filter((v) => v && v.trim() !== '');

          // Collect all correct answers for these question numbers
          const allCorrectAnswers = questionNumbers
            .map((num) => correctAnswersMap[String(num)]?.correctAnswer)
            .filter(Boolean)
            .flat();

          const usePerQ = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQ ? q.fullOptions : (data.options || []);

          return (
            <div key={q.id}>
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex items-center px-2 justify-center h-[2em] border border-gray-800 text-gray-900 font-bold bg-white select-none"
                    style={{ minWidth: '2em', fontSize: '1.1em' }}
                  >{numbersLabel}</span>
                </div>
                <div
                  className="flex-1 pt-1.5 font-medium text-gray-900 leading-normal"
                  style={{ fontSize: '1.1em' }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>

              <div className="ml-[3.5em] space-y-3">
                {displayOptions.map((opt) => {
                  const value = usePerQ ? extractLetter(opt) : opt;
                  const isChecked = currentSelections.includes(value);
                  const isThisCorrect = showCorrect && allCorrectAnswers.includes(value);

                  // Determine colors
                  let checkboxStyle = { borderColor: '#9ca3af', background: 'transparent' };
                  let textStyle = { color: '#374151' };

                  if (isChecked) {
                    // Find which question number this selection maps to
                    const matchingNum = questionNumbers.find(num => userAnswers[String(num)] === value);
                    const serverData = matchingNum ? correctAnswersMap[String(matchingNum)] : null;
                    const correct = serverData?.correct || false;
                    checkboxStyle = { borderColor: correct ? '#10b981' : '#ef4444', background: correct ? '#10b981' : '#ef4444' };
                    textStyle = { color: correct ? '#065f46' : '#991b1b', fontWeight: 700 };
                  } else if (isThisCorrect) {
                    checkboxStyle = { borderColor: '#10b981', background: '#dcfce7' };
                    textStyle = { color: '#065f46', fontWeight: 600 };
                  }

                  // Find if this checked item is correct
                  const matchingNum = questionNumbers.find(num => userAnswers[String(num)] === value);
                  const serverData = matchingNum ? correctAnswersMap[String(matchingNum)] : null;
                  const correct = serverData?.correct || false;

                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center">
                        <span
                          className="w-[1.3em] h-[1.3em] border-2 flex items-center justify-center shrink-0"
                          style={checkboxStyle}
                        >
                          {isChecked && (
                            <svg className="w-[0.8em] h-[0.8em] text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {!isChecked && isThisCorrect && (
                            <span className="w-[0.5em] h-[0.5em] rounded-sm" style={{ background: '#10b981' }} />
                          )}
                        </span>
                      </div>
                      <span style={{ ...textStyle, fontSize: '1.1em' }}>{opt}</span>
                      {isChecked && !correct && <span className="text-xs font-bold text-red-500">✗ Wrong</span>}
                      {isChecked && correct && <span className="text-xs font-bold text-green-600">✓</span>}
                      {!isChecked && isThisCorrect && <span className="text-xs font-bold text-green-600">✓ Correct</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
