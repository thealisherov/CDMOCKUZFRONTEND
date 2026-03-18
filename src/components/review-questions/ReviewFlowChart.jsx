'use client';

import React from 'react';

/**
 * ReviewFlowChart — Read-only Review component for FlowChart questions.
 * Shows correct/incorrect styling on flowchart gaps.
 */
export default function ReviewFlowChart({ data, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  const fullText = data.content || '';
  const steps = fullText.split('\n').filter(s => s.trim() !== '');
  
  const optionsArray = data.fullOptions || data.options;
  const hasOptions = Array.isArray(optionsArray) && optionsArray.length > 0;
  
  const wordOptions = hasOptions ? optionsArray.map(opt => {
    const match = opt.match(/^([A-Z])[\.\s:)]+(.*)$/);
    if (match) return { value: match[1], label: match[2].trim(), full: opt };
    return { value: opt, label: opt, full: opt };
  }) : [];

  const renderContentWithGaps = (textBlock) => {
    const parts = textBlock.split(/(\{\d+\})/g);
    
    return parts.map((part, idx) => {
      const match = part.match(/^\{(\d+)\}$/);
      if (match) {
        const gapId = match[1];
        const userAns = userAnswers[gapId] || '';
        const serverData = correctAnswersMap[gapId];
        
        const isCorrect = serverData?.correct || false;
        const correctAns = serverData?.correctAnswer;
        const isUnanswered = !userAns || userAns.trim() === '';

        // Colors
        const borderColor = isUnanswered ? '#ef4444' : isCorrect ? '#10b981' : '#ef4444';
        const bgColor = isUnanswered ? '#fef2f2' : isCorrect ? '#f0fdf4' : '#fef2f2';
        const textColor = isUnanswered ? '#ef4444' : isCorrect ? '#065f46' : '#991b1b';

        // Check if we need to resolve value to label (for drag & drop)
        let displayVal = userAns;
        if (hasOptions && userAns) {
          const opt = wordOptions.find(w => w.value === userAns);
          if (opt) displayVal = opt.label;
        }

        const widthStyles = hasOptions
          ? { minWidth: '120px' }
          : { minWidth: `${Math.max(80, (userAns.length * 10) + 40)}px` };

        return (
          <span key={idx} className="relative inline-flex items-center gap-1 mx-1 align-middle">
            <input
              type="text"
              value={displayVal || ''}
              readOnly
              className={`px-2 py-0.5 text-center font-semibold text-[15.5px] ${hasOptions ? 'rounded border-[1.5px] border-dashed' : 'border rounded'}`}
              style={{
                ...widthStyles,
                borderColor,
                background: bgColor,
                color: textColor,
              }}
            />
            {!isUnanswered && (
              <span style={{ fontSize: '0.85em', fontWeight: 700, color: isCorrect ? '#10b981' : '#ef4444' }}>
                {isCorrect ? '✓' : '✗'}
              </span>
            )}
            {showCorrect && !isCorrect && correctAns && (
              <span className="text-[0.85em] font-bold italic" style={{ color: '#10b981' }}>
                (✓ {Array.isArray(correctAns) ? correctAns[0] : correctAns})
              </span>
            )}
            {isUnanswered && (
              <span className="text-[0.75em] font-semibold" style={{ color: '#ef4444' }}>N/A</span>
            )}
          </span>
        );
      }

      return (
        <span
          key={idx}
          dangerouslySetInnerHTML={{ __html: part }}
        />
      );
    });
  };

  return (
    <div className="mb-8 font-sans">
      {data.instruction && (
        <p className="mb-5 font-medium text-gray-800" style={{ fontSize: '1.05em' }}>
          {data.instruction}
        </p>
      )}

      <div className="flex flex-col items-center w-full lg:max-w-[700px]">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            {/* Box */}
            <div 
              className="w-full px-5 py-4 rounded-[3px] shadow-sm bg-white"
              style={{ fontSize: '15.5px', lineHeight: '1.6', color: '#000', border: '1px solid #777' }}
            >
              {renderContentWithGaps(step)}
            </div>
            
            {/* Arrow */}
            {idx < steps.length - 1 && (
              <div className="my-[4px]">
                <svg 
                  width="14" height="20" viewBox="0 0 14 20" 
                  fill="none" stroke="#000" strokeWidth="2.5" 
                  strokeLinecap="square" strokeLinejoin="miter" 
                >
                  <path d="M7 0v16M2 13l5 5 5-5" />
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
