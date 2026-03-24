'use client';

import React from 'react';
import parse from 'html-react-parser';

/**
 * ReviewTableCompletion — Read-only Review component for Table questions.
 * Shows correct/incorrect indicators and correct answers if needed.
 */
export default function ReviewTableCompletion({ data, userAnswers = {}, correctAnswersMap = {}, showCorrect }) {
  
  const options = {
    replace: (domNode) => {
      if (domNode.type === 'text') {
        const text = domNode.data;
        if (/\{\d+\}/.test(text)) {
          const parts = text.split(/(\{\d+\})/g);
          return (
            <React.Fragment>
              {parts.map((part, idx) => {
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

                  return (
                    <span key={idx} className="relative inline-flex items-center gap-1 mx-1 align-middle whitespace-nowrap">
                      <input
                        type="text"
                        value={userAns}
                        readOnly
                        className="px-2 py-0.5 text-center font-semibold text-[15px] border rounded"
                        style={{
                          minWidth: '100px',
                          borderColor,
                          background: bgColor,
                          color: textColor,
                        }}
                      />
                      {!isUnanswered && (
                        <span className="font-bold" style={{ color: isCorrect ? '#10b981' : '#ef4444' }}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                      {showCorrect && !isCorrect && correctAns && (
                        <span className="text-[0.85em] font-bold italic" style={{ color: '#10b981' }}>
                          (✓ {Array.isArray(correctAns) ? correctAns[0] : correctAns})
                        </span>
                      )}
                      {isUnanswered && (
                        <span className="text-[0.75em] font-semibold text-red-500">N/A</span>
                      )}
                    </span>
                  );
                }
                return <span key={idx}>{part}</span>;
              })}
            </React.Fragment>
          );
        }
      }
    }
  };

  return (
    <div className="mb-10 ielts-table-container">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle styled-table-wrapper">
          {parse(data.content, options)}
        </div>
      </div>

      <style jsx global>{`
        .styled-table-wrapper table {
          width: auto;
          min-width: 800px;
          max-width: 100%;
          border-collapse: separate;
          border-spacing: 2px;
          background-color: #fff;
          font-size: 16px;
          margin-bottom: 2rem;
        }
        .styled-table-wrapper th {
          background-color: #fff;
          border: 1px solid #111;
          padding: 10px 15px;
          text-align: left;
          font-weight: 700;
          color: #111;
          min-width: 120px;
        }
        .styled-table-wrapper td {
          border: 1px solid #111;
          padding: 10px 15px;
          color: #111;
          line-height: 1.5;
          vertical-align: middle;
        }
        .styled-table-wrapper b {
          font-weight: 700;
        }
        .styled-table-wrapper ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .styled-table-wrapper li {
          margin: 0;
        }
      `}</style>
    </div>
  );
}
