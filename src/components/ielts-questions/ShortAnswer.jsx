'use client';

import React from 'react';

/**
 * ShortAnswer — IELTS CD style short answer questions.
 *
 * Design: numbered list, question text, then a small input box inline/at the end.
 * Matches the official IELTS Computer-Delivered short answer UI.
 *
 * Data shape expected:
 * {
 *   type: "short_answer",
 *   instruction: "Answer the questions below. Write NO MORE THAN THREE WORDS...",
 *   questions: [
 *     { number: 1, text: "How many days did the scientists spend under the waves?" },
 *     { number: 2, text: "What answer did Rob choose?" },
 *     ...
 *   ]
 * }
 */
const ShortAnswer = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const handleChange = (questionId, val) => {
    onAnswer(questionId, val);
  };

  const questions = data.questions || [];

  return (
    <div className="mb-8 font-sans">

      {/* Instruction banner */}
      {data.instruction && (
        <div
          className="mb-6 px-4 py-3 rounded-md text-sm font-medium leading-relaxed"
          style={{
            background: 'var(--test-strip-bg, #f5f5f5)',
            color: 'var(--test-strip-fg, #333)',
            border: '1px solid var(--test-border, #ddd)',
          }}
        >
          {data.instruction}
        </div>
      )}

      {/* Questions list */}
      <ol className="space-y-5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {questions.map((q, qIdx) => {
          // Support both explicit q.number and auto-index
          const globalNum = q.number !== undefined ? q.number : startIndex + qIdx;
          const questionId = String(globalNum);
          const value = userAnswers[questionId] || '';

          // Determine input width based on answer length
          const inputWidth = Math.max(120, (value.length * 9) + 48);

          return (
            <li key={questionId} className="flex items-baseline gap-3 group">
              {/* Number */}
              <span
                className="shrink-0 inline-flex items-center justify-center font-bold select-none"
                style={{
                  minWidth: '1.8em',
                  fontSize: '1.05em',
                  color: 'var(--test-fg, #111)',
                }}
              >
                {globalNum}.
              </span>

              {/* Question text + input inline */}
              <span
                className="flex-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 leading-relaxed font-medium"
                style={{ fontSize: '1.05em', color: 'var(--test-fg, #111)' }}
              >
                {/* Question text */}
                <span dangerouslySetInnerHTML={{ __html: q.text ? q.text.replace(/\[cite[^\]]*\]/ig, '') : '' }} />

                {/* Answer input box — IELTS CD style: small box at end of question */}
                <span className="relative inline-flex items-center" style={{ verticalAlign: 'baseline' }}>
                  <input
                    id={`sa-input-${questionId}`}
                    type="text"
                    value={value}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder=""
                    onChange={(e) => handleChange(questionId, e.target.value)}
                    style={{
                      width: `${inputWidth}px`,
                      maxWidth: '380px',
                      minWidth: '120px',
                      height: '1.9em',
                      padding: '0 8px',
                      fontSize: '0.95em',
                      fontFamily: 'inherit',
                      fontWeight: 600,
                      color: 'var(--test-fg, #1a3a6b)',
                      background: 'var(--test-panel-bg, #fff)',
                      border: '1.5px solid',
                      borderColor: value
                        ? 'var(--primary, #2563eb)'
                        : 'var(--test-border, #999)',
                      borderRadius: '2px',
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      verticalAlign: 'baseline',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--primary, #2563eb)';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37,99,235,0.15)';
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = value
                        ? 'var(--primary, #2563eb)'
                        : 'var(--test-border, #999)';
                    }}
                  />
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default ShortAnswer;
