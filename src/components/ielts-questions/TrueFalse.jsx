'use client';

import React, { useState } from 'react';

/**
 * TrueFalse — "True / False / Not Given", "Yes / No / Not Given",
 *             and "Multiple Choice" component.
 *
 * Renders questions vertically with radio options aligned horizontally.
 *
 * Expected `data` shape:
 * {
 *   id: "block_3",
 *   type: "true_false",          // or "yes_no" / "multiple_choice"
 *   instruction: "Do the following statements agree with the information...",
 *   options: ["TRUE", "FALSE", "NOT GIVEN"],
 *   questions: [
 *     { id: "q27", text: "The statement text." },
 *     { id: "q28", text: "Another statement." },
 *   ]
 * }
 */
const TrueFalse = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (questionId, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    onAnswer(questionId, value);
  };

  // Determine the color accent for option pills based on question type
  const getOptionStyle = (opt, isSelected) => {
    if (!isSelected) {
      return 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground';
    }

    const optUpper = opt.toUpperCase();
    if (optUpper === 'TRUE' || optUpper === 'YES') {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-sm';
    }
    if (optUpper === 'FALSE' || optUpper === 'NO') {
      return 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 shadow-sm';
    }
    if (optUpper === 'NOT GIVEN') {
      return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-sm';
    }
    // Default for any other option (e.g. A, B, C, D)
    return 'border-primary bg-primary/10 text-primary shadow-sm';
  };

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-border px-5 py-3">
        <h3 className="font-semibold text-foreground text-[0.95rem] leading-snug">
          Questions
        </h3>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          {data.instruction}
        </p>
      </div>

      {/* ── Question List ── */}
      <div className="divide-y divide-border/50">
        {data.questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          const selected = selectedAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`
                px-5 py-4 transition-colors
                ${selected ? 'bg-primary/[0.02] dark:bg-primary/[0.04]' : ''}
              `}
            >
              {/* Question text */}
              <div className="flex items-start mb-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-3 mt-0.5 shrink-0">
                  {globalNum}
                </span>
                <p className="text-foreground/90 text-[0.92rem] leading-relaxed">
                  {q.text}
                </p>
              </div>

              {/* Option pills */}
              <div className="flex items-center gap-2 ml-9 flex-wrap">
                {data.options.map((opt) => {
                  const isSelected = selected === opt;
                  return (
                    <label
                      key={opt}
                      className={`
                        inline-flex items-center gap-1.5
                        px-3.5 py-1.5 rounded-full border
                        text-xs font-semibold uppercase tracking-wide
                        cursor-pointer select-none
                        transition-all duration-150
                        ${getOptionStyle(opt, isSelected)}
                      `}
                    >
                      <input
                        type="radio"
                        name={`tf_${data.id}_${q.id}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, opt)}
                        className="sr-only"
                      />
                      {/* Mini radio dot */}
                      <span
                        className={`
                          w-3 h-3 rounded-full border-2 transition-all duration-150 shrink-0
                          ${
                            isSelected
                              ? 'border-current bg-current shadow-inner'
                              : 'border-current/40 bg-transparent'
                          }
                        `}
                      />
                      {opt}
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

export default TrueFalse;
