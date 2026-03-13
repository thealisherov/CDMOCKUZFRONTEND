'use client';
import React from 'react';

/**
 * ReviewMatchDropdown — read-only match dropdown preserving original table layout
 * Shows user's selected letter + correct/wrong indicator
 */
export default function ReviewMatchDropdown({ data, startIndex = 1, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const renderOptionText = (text) => {
    const match = text.match(/^([A-Z])[\.\s:)]*(.*)$/);
    if (match) return <span><span className="font-bold">{match[1]}</span> {match[2]}</span>;
    return text;
  };

  return (
    <div className="mb-8 font-sans w-full">
      <div className={`flex flex-col ${data.optionDescriptions?.length ? 'lg:flex-row gap-10' : ''} items-start mt-2`}>
        {/* Option descriptions box */}
        {data.optionDescriptions && data.optionDescriptions.length > 0 && (
          <div className="w-full lg:w-1/2 p-6 rounded-md border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#111827' }}>
            <h3 className="text-center font-bold mb-5 text-[18px]">List of Options</h3>
            <div className="space-y-3">
              {data.optionDescriptions.map((desc, idx) => (
                <p key={idx} className="leading-relaxed text-gray-700">{renderOptionText(desc)}</p>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        <div className={`w-full ${data.optionDescriptions?.length ? 'lg:w-1/2' : ''} space-y-4`}>
          {data.questions.map((q, qIdx) => {
            const globalNum = startIndex + qIdx;
            const qId = String(globalNum);
            const selected = userAnswers[qId] || '';
            const serverData = correctAnswersMap[qId];
            const isCorrect = serverData?.correct || false;
            const correctAns = serverData?.correctAnswer;
            const isUnanswered = !selected;

            const pillBg = isUnanswered ? '#f3f4f6' : isCorrect ? '#dcfce7' : '#fee2e2';
            const pillColor = isUnanswered ? '#6b7280' : isCorrect ? '#065f46' : '#991b1b';
            const pillBorder = isUnanswered ? '#d1d5db' : isCorrect ? '#10b981' : '#ef4444';

            return (
              <div key={q.id || qId} className="flex items-center gap-4">
                {/* Number */}
                <div className="flex-shrink-0">
                  <span
                    className="inline-flex items-center justify-center w-[2em] h-[2em] border font-bold rounded-md shadow-sm select-none text-white"
                    style={{ fontSize: '1.05em', backgroundColor: isUnanswered ? '#9ca3af' : isCorrect ? '#10b981' : '#ef4444', borderColor: 'transparent' }}
                  >{globalNum}</span>
                </div>

                {/* Question text */}
                <div
                  className="flex-1 font-medium leading-normal text-gray-800"
                  style={{ fontSize: '1.05em' }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />

                {/* Selected answer pill */}
                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <div
                    className="px-3 py-1 rounded border font-bold text-sm"
                    style={{ backgroundColor: pillBg, color: pillColor, borderColor: pillBorder }}
                  >
                    {selected || '—'} {!isUnanswered && (isCorrect ? '✓' : '✗')}
                  </div>
                  {showCorrect && !isCorrect && correctAns && (
                    <div className="text-xs font-semibold" style={{ color: '#10b981' }}>
                      ✓ {Array.isArray(correctAns) ? correctAns[0] : correctAns}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
