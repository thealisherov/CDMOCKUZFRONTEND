'use client';
import React from 'react';

/**
 * ReviewRadioMatrix — read-only table with green/red cell highlights
 */
export default function ReviewRadioMatrix({ data, startIndex = 1, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  return (
    <div className="mb-8 font-sans">
      <div className="overflow-x-auto border shadow-sm rounded" style={{ backgroundColor: '#fff', borderColor: '#e5e7eb' }}>
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
              <th className="p-3 text-left w-1/2 border-r" style={{ borderColor: '#e5e7eb', color: '#111827' }}>Question</th>
              {data.columnOptions.map((opt) => (
                <th key={opt} className="p-3 text-center w-16 font-bold border-r last:border-r-0" style={{ borderColor: '#e5e7eb', color: '#111827' }}>{opt}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.questions.map((q, qIdx) => {
              const globalNum = startIndex + qIdx;
              const qId = String(globalNum);
              const selected = userAnswers[qId] || '';
              const serverData = correctAnswersMap[qId];
              const isCorrect = serverData?.correct || false;
              const correctAns = serverData?.correctAnswer;
              const isUnanswered = !selected;

              return (
                <tr key={q.id || qId} className="border-b last:border-b-0" style={{ borderColor: '#e5e7eb' }}>
                  <td className="p-3 border-r" style={{ borderColor: '#e5e7eb' }}>
                    <div className="flex gap-3 items-start">
                      <span
                        className="font-bold min-w-[24px] w-6 h-6 rounded-full inline-flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: isUnanswered ? '#9ca3af' : isCorrect ? '#10b981' : '#ef4444' }}
                      >{globalNum}</span>
                      <span className="text-gray-800 leading-snug">{q.text}</span>
                    </div>
                    {showCorrect && !isCorrect && correctAns && (
                      <div className="mt-1 ml-9 text-xs font-semibold" style={{ color: '#10b981' }}>
                        ✓ Correct answer: {Array.isArray(correctAns) ? correctAns[0] : correctAns}
                      </div>
                    )}
                  </td>
                  {data.columnOptions.map((opt) => {
                    const isSelected = selected === opt;
                    const isThisCorrect = showCorrect && (Array.isArray(correctAns) ? correctAns.includes(opt) : correctAns === opt);

                    let bgColor = 'transparent';
                    if (isSelected && isCorrect) bgColor = '#dcfce7';
                    else if (isSelected && !isCorrect) bgColor = '#fee2e2';
                    else if (isThisCorrect) bgColor = '#f0fdf4';

                    return (
                      <td key={opt} className="p-0 border-r last:border-r-0 text-center relative" style={{ borderColor: '#e5e7eb', backgroundColor: bgColor }}>
                        <div className="flex items-center justify-center py-3">
                          <span
                            className="w-5 h-5 rounded-full border-2 inline-flex items-center justify-center"
                            style={{
                              borderColor: isSelected ? (isCorrect ? '#10b981' : '#ef4444') : isThisCorrect ? '#10b981' : '#d1d5db',
                              background: isSelected ? (isCorrect ? '#10b981' : '#ef4444') : isThisCorrect ? '#bbf7d0' : 'transparent',
                            }}
                          >
                            {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                          </span>
                        </div>
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
  );
}
