'use client';
import React from 'react';

/**
 * ReviewCheckboxMultiple — read-only, same layout as original CheckboxMultiple
 * Shows checked options with correct/wrong coloring
 */
export default function ReviewCheckboxMultiple({ data, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[\.\s:)]/);
    return match ? match[1] : optStr;
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-8">
        {data.questions.map((q) => {
          const questionNumbers = q.numbers || [];
          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}–${questionNumbers[questionNumbers.length - 1]}`
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

          // Count how many were correct
          const correctCount = currentSelections.filter(v => {
            const matchNum = questionNumbers.find(n => userAnswers[String(n)] === v);
            return matchNum ? (correctAnswersMap[String(matchNum)]?.correct || false) : false;
          }).length;

          return (
            <div key={q.id} className="rounded-xl overflow-hidden" style={{ border: '1.5px solid #d1d5db' }}>
              {/* Question header */}
              <div className="flex gap-4 px-5 py-4" style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex items-center px-2 justify-center h-[2em] border border-gray-700 text-gray-900 font-bold bg-white select-none"
                    style={{ minWidth: '2em', fontSize: '1.05em' }}
                  >{numbersLabel}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="pt-1 font-medium text-gray-900 leading-normal"
                    style={{ fontSize: '1.05em' }}
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  {/* Result badge */}
                  {showCorrect && (
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-[0.78em] font-semibold px-2.5 py-0.5 rounded-full border"
                        style={
                          correctCount === questionNumbers.length
                            ? { background: '#dcfce7', color: '#166534', borderColor: '#86efac' }
                            : correctCount > 0
                              ? { background: '#fef9c3', color: '#854d0e', borderColor: '#fde047' }
                              : { background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }
                        }
                      >
                        {correctCount === questionNumbers.length
                          ? `✓ All correct (${correctCount}/${questionNumbers.length})`
                          : correctCount > 0
                            ? `${correctCount}/${questionNumbers.length} correct`
                            : `✗ Incorrect`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="px-5 py-4 space-y-2.5" style={{ background: '#fff' }}>
                {displayOptions.map((opt) => {
                  const value = usePerQ ? extractLetter(opt) : opt;
                  const isChecked = currentSelections.includes(value);
                  const isThisCorrect = showCorrect && allCorrectAnswers.includes(value);

                  // Find correctness from server data
                  const matchingNum = questionNumbers.find(num => userAnswers[String(num)] === value);
                  const serverData = matchingNum ? correctAnswersMap[String(matchingNum)] : null;
                  const correct = serverData?.correct || false;

                  let bgColor = 'transparent';
                  let borderColor = '1.5px solid transparent';
                  let textColor = '#1f2937';

                  if (isChecked && correct) {
                    bgColor = '#dcfce7';
                    borderColor = '1.5px solid #86efac';
                    textColor = '#166534';
                  } else if (isChecked && !correct) {
                    bgColor = '#fee2e2';
                    borderColor = '1.5px solid #fca5a5';
                    textColor = '#991b1b';
                  } else if (!isChecked && isThisCorrect) {
                    bgColor = '#f0fdf4';
                    borderColor = '1.5px solid #86efac';
                    textColor = '#166534';
                  }

                  return (
                    <div
                      key={opt}
                      className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                      style={{ background: bgColor, border: borderColor }}
                    >
                      <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                        <span
                          className="w-[1.25em] h-[1.25em] border-2 flex items-center justify-center shrink-0 rounded-sm"
                          style={{
                            borderColor: isChecked
                              ? (correct ? '#16a34a' : '#dc2626')
                              : isThisCorrect
                                ? '#16a34a'
                                : '#d1d5db',
                            background: isChecked
                              ? (correct ? '#16a34a' : '#dc2626')
                              : isThisCorrect
                                ? '#dcfce7'
                                : 'transparent',
                          }}
                        >
                          {isChecked && (
                            <svg className="w-[0.75em] h-[0.75em] text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                          {!isChecked && isThisCorrect && (
                            <span className="w-[0.45em] h-[0.45em] rounded-sm" style={{ background: '#16a34a' }} />
                          )}
                        </span>
                      </div>

                      <span style={{ fontSize: '1.05em', color: textColor, fontWeight: (isChecked || isThisCorrect) ? 600 : 400 }}>
                        {opt}
                      </span>

                      <div className="ml-auto flex-shrink-0 self-center">
                        {isChecked && correct && <span className="text-xs font-bold text-green-600">✓ Correct</span>}
                        {isChecked && !correct && <span className="text-xs font-bold text-red-500">✗ Wrong</span>}
                        {!isChecked && isThisCorrect && <span className="text-xs font-bold text-green-600">← Correct answer</span>}
                      </div>
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
