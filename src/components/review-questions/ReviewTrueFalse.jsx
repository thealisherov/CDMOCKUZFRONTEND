'use client';
import React from 'react';

/**
 * ReviewTrueFalse — read-only, same layout as original TrueFalse/multiple_choice
 * Highlights selected answer green/red, shows correct answer in green if showCorrect
 */
export default function ReviewTrueFalse({ data, startIndex = 1, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  return (
    <div className="mb-8 font-sans">
      {/* Option descriptions */}
      {data.optionDescriptions && data.optionDescriptions.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="space-y-1.5">
            {data.optionDescriptions.map((desc, idx) => (
              <p key={idx} className="text-sm text-gray-700 leading-relaxed">{desc}</p>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {data.questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          const qId = String(globalNum);
          const selected = userAnswers[qId] || '';
          const serverData = correctAnswersMap[qId];
          const isCorrect = serverData?.correct || false;
          const correctAns = serverData?.correctAnswer;
          const isUnanswered = !selected;

          const usePerQ = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQ ? q.fullOptions : (data.options || []);

          return (
            <div key={q.id || qId}>
              {/* Question header */}
              <div className="flex gap-4 mb-3">
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex items-center justify-center w-[2em] h-[2em] font-bold select-none text-white rounded-sm"
                    style={{ fontSize: '1.1em', background: isUnanswered ? '#9ca3af' : isCorrect ? '#10b981' : '#ef4444' }}
                  >{globalNum}</span>
                </div>
                <div
                  className="flex-1 pt-1.5 font-medium text-gray-900 leading-normal"
                  style={{ fontSize: '1.1em' }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>

              {/* Options */}
              <div className="ml-[3.5em] space-y-2">
                {displayOptions.map((opt) => {
                  const value = usePerQ ? extractLetter(opt) : opt;
                  const isSelected = selected === value;
                  const isThisCorrect = showCorrect && (
                    Array.isArray(correctAns)
                      ? correctAns.includes(value)
                      : correctAns === value
                  );

                  let labelStyle = { color: '#374151' };
                  let radioStyle = { borderColor: '#9ca3af', background: 'transparent' };

                  if (isSelected && isCorrect) {
                    labelStyle = { color: '#065f46', fontWeight: 700 };
                    radioStyle = { borderColor: '#10b981', background: '#10b981' };
                  } else if (isSelected && !isCorrect) {
                    labelStyle = { color: '#991b1b', fontWeight: 700 };
                    radioStyle = { borderColor: '#ef4444', background: '#ef4444' };
                  } else if (isThisCorrect) {
                    labelStyle = { color: '#065f46', fontWeight: 600 };
                    radioStyle = { borderColor: '#10b981', background: '#dcfce7' };
                  }

                  return (
                    <div key={opt} className="flex items-center gap-3">
                      <span
                        className="w-[1.2em] h-[1.2em] rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={radioStyle}
                      >
                        {isSelected && <span className="w-[0.5em] h-[0.5em] rounded-full bg-white" />}
                        {!isSelected && isThisCorrect && <span className="w-[0.5em] h-[0.5em] rounded-full" style={{ background: '#10b981' }} />}
                      </span>
                      <span style={{ ...labelStyle, fontSize: '1.1em' }}>{opt}</span>
                      {isSelected && !isCorrect && (
                        <span className="text-xs font-bold text-red-500">✗ Wrong</span>
                      )}
                      {isSelected && isCorrect && (
                        <span className="text-xs font-bold text-green-600">✓</span>
                      )}
                      {!isSelected && isThisCorrect && (
                        <span className="text-xs font-bold text-green-600">✓ Correct</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {isUnanswered && showCorrect && correctAns && (
                <div className="ml-[3.5em] mt-1 text-sm font-semibold" style={{ color: '#10b981' }}>
                  ✓ Correct: {Array.isArray(correctAns) ? correctAns[0] : correctAns}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
