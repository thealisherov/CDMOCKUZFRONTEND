'use client';

import React from 'react';

/**
 * CheckboxMultiple — IELTS CD-style multiple-choice multiple-answer.
 * Design matches official IELTS CD interface from the screenshot:
 * - "1–2" badge top-left with a thin border box
 * - Question text + sub-question
 * - Checkbox rows: empty square when unchecked, blue filled + highlight when checked
 * - No card/panel container — clean white background
 */
const CheckboxMultiple = ({ data, onAnswer, userAnswers = {} }) => {
  const extractLetter = (optStr) => {
    const match = optStr.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : optStr;
  };

  const handleToggle = (qListId, value, maxAllowed, questionNumbers) => {
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

    questionNumbers.forEach((num, index) => {
      onAnswer(String(num), nextSelections[index] || '');
    });
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-10">
        {data.questions.map((q) => {
          const qListId = q.id;
          const questionNumbers = q.numbers || [];
          const maxAllowed = questionNumbers.length;

          const currentSelections = questionNumbers
            .map((num) => userAnswers[String(num)])
            .filter((v) => v && v.trim() !== '');

          const isAtLimit = currentSelections.length >= maxAllowed;

          const numbersLabel = questionNumbers.length > 1
            ? `${questionNumbers[0]}–${questionNumbers[questionNumbers.length - 1]}`
            : String(questionNumbers[0]);

          const usePerQuestionOptions = data.hasPerQuestionOptions && q.fullOptions;
          const displayOptions = usePerQuestionOptions ? q.fullOptions : (data.options || []);

          return (
            <div key={qListId}>
              {/* ── Question header row ── */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
                {/* Number badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2px 8px',
                    border: '1.5px solid #222',
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: '0.98em',
                    color: 'var(--test-fg, #111)',
                    background: 'transparent',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    minWidth: 36,
                  }}
                >
                  {numbersLabel}
                </span>
                {/* Question text */}
                <div
                  style={{
                    fontSize: '1em',
                    fontWeight: 400,
                    lineHeight: 1.55,
                    color: 'var(--test-fg, #111)',
                  }}
                  dangerouslySetInnerHTML={{ __html: q.text }}
                />
              </div>

              {/* ── Options ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {displayOptions.map((opt, idx) => {
                  const value = usePerQuestionOptions ? extractLetter(opt) : opt;
                  const isChecked = currentSelections.includes(value);
                  const isDisabled = !isChecked && isAtLimit;

                  // Strip leading letter+dot e.g. "A. They are less..." → "They are less..."
                  const labelText = opt.replace(/^[A-Z][.\s:)]\s*/, '').trim();

                  return (
                    <label
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '9px 12px',
                        background: isChecked
                          ? '#dbeafe'   /* light blue — matches screenshot */
                          : 'transparent',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        opacity: isDisabled ? 0.5 : 1,
                        userSelect: 'none',
                        transition: 'background 0.12s',
                        borderRadius: 2,
                      }}
                      onMouseEnter={(e) => {
                        if (!isChecked && !isDisabled) {
                          e.currentTarget.style.background = '#f0f7ff';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isChecked && !isDisabled) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      {/* Custom checkbox */}
                      <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0 }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && handleToggle(qListId, value, maxAllowed, questionNumbers)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                        />
                        {/* Box */}
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            border: isChecked ? '2px solid #2563eb' : '2px solid #9ca3af',
                            borderRadius: 3,
                            background: isChecked ? '#2563eb' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.12s',
                          }}
                        >
                          {isChecked && (
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6.5L4.5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Label text */}
                      <span
                        style={{
                          fontSize: '1em',
                          lineHeight: 1.5,
                          color: isChecked
                            ? '#1e40af'
                            : isDisabled
                              ? '#9ca3af'
                              : 'var(--test-fg, #111)',
                          fontWeight: isChecked ? 500 : 400,
                        }}
                      >
                        {labelText}
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
