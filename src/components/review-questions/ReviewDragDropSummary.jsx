'use client';
import React from 'react';

/**
 * ReviewDragDropSummary — read-only summary cloze.
 * Shows the selected word in the gap, colored green/red based on correctness.
 * Below the text, shows the word bank with placed items highlighted.
 */
export default function ReviewDragDropSummary({ data, startIndex = 1, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const fullText = data.content || '';

  const wordOptions = (data.options || []).map(opt => {
    const match = opt.match(/^([A-Z])[\.\s:)]+(.*)$/);
    if (match) return { value: match[1], label: match[2].trim(), full: opt };
    return { value: opt, label: opt, full: opt };
  });

  const parts = fullText.split(/(\{\d+\})/g);

  const allGapIds = parts
    .map(p => { const m = p.match(/^\{(\d+)\}$/); return m ? m[1] : null; })
    .filter(Boolean);

  return (
    <div className="mb-8 font-sans">
      {data.instruction && (
        <p className="mb-4 text-gray-700" style={{ fontSize: '1.1em' }}>{data.instruction}</p>
      )}

      {/* Summary with filled gaps */}
      <div
        className="p-6 border rounded-md mb-6 leading-loose text-[17px]"
        style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#111827' }}
      >
        {parts.map((part, idx) => {
          const match = part.match(/^\{(\d+)\}$/);
          if (match) {
            const gapId = match[1];
            const selectedVal = userAnswers[gapId] || '';
            const selectedWord = wordOptions.find(w => w.value === selectedVal);
            const serverData = correctAnswersMap[gapId];
            const isCorrect = serverData?.correct || false;
            const correctAns = serverData?.correctAnswer;
            const isEmpty = !selectedVal;

            let borderColor = '#d1d5db';
            let bgColor = '#f3f4f6';
            let textColor = '#6b7280';

            if (!isEmpty && isCorrect) { borderColor = '#10b981'; bgColor = '#dcfce7'; textColor = '#065f46'; }
            else if (!isEmpty && !isCorrect) { borderColor = '#ef4444'; bgColor = '#fee2e2'; textColor = '#991b1b'; }

            return (
              <span key={idx} className="inline-flex flex-col items-center mx-1 align-middle">
                <span
                  className="inline-flex items-center justify-center min-w-[100px] h-8 px-3 rounded border-2 font-semibold text-[15px]"
                  style={{ borderColor, backgroundColor: bgColor, color: textColor }}
                >
                  {isEmpty ? <span className="opacity-40">{gapId}</span> : (selectedWord ? selectedWord.label : selectedVal)}
                  {!isEmpty && <span className="ml-1 text-[11px]">{isCorrect ? '✓' : '✗'}</span>}
                </span>
                {showCorrect && !isCorrect && correctAns && (
                  <span className="text-[11px] font-semibold mt-0.5" style={{ color: '#10b981' }}>
                    → {Array.isArray(correctAns) ? correctAns[0] : correctAns}
                  </span>
                )}
              </span>
            );
          }

          return (
            <span key={idx} dangerouslySetInnerHTML={{ __html: part.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, ' ') }} />
          );
        })}
      </div>

      {/* Word Bank (read-only) */}
      <div className="p-5 border-2 border-dashed rounded-md" style={{ backgroundColor: '#fff', borderColor: '#d1d5db' }}>
        <p className="text-xs font-semibold mb-3 opacity-50 uppercase tracking-wider text-gray-600">Word Bank</p>
        <div className="flex flex-wrap gap-3">
          {wordOptions.map((item, idx) => {
            const usedInGap = allGapIds.find(gapId => userAnswers[gapId] === item.value);
            const serverData = usedInGap ? correctAnswersMap[usedInGap] : null;
            const correct = serverData?.correct || false;

            let style = { backgroundColor: '#fff', borderColor: '#d1d5db', color: '#374151', opacity: 1 };
            if (usedInGap && correct) style = { backgroundColor: '#dcfce7', borderColor: '#10b981', color: '#065f46', opacity: 0.8 };
            else if (usedInGap && !correct) style = { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b', opacity: 0.8 };
            else if (!usedInGap) style = { backgroundColor: '#fff', borderColor: '#d1d5db', color: '#374151', opacity: 1 };

            return (
              <div key={idx}
                className="px-4 py-2 border rounded shadow-sm text-[15px] select-none"
                style={{ ...style, minWidth: 60, textAlign: 'center', borderStyle: usedInGap ? 'dashed' : 'solid' }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
