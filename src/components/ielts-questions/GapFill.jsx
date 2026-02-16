'use client';

import React from 'react';

/**
 * GapFill — "Complete the notes / sentences" component.
 *
 * Expected `data` shape:
 * {
 *   id: "block_1",
 *   type: "gap_fill",
 *   instruction: "Complete the notes below. Write NO MORE THAN TWO WORDS...",
 *   content: "The museum was built in {1} and was originally a {2}. It is located near the {3}.",
 *   questionIds: ["q1", "q2", "q3"]        // optional explicit IDs
 * }
 *
 * Placeholders like {1}, {2} are replaced by inline text inputs.
 */
const GapFill = ({ data, onAnswer, startIndex = 1 }) => {
  // Split the content by {n} placeholders
  const parts = data.content.split(/(\{\d+\})/g);

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-border px-5 py-3">
        <h3 className="font-semibold text-foreground text-[0.95rem] leading-snug">
          {data.instruction}
        </h3>
      </div>

      {/* ── Body ── */}
      <div className="p-5">
        <div className="leading-[2.2] text-[0.95rem] text-foreground/90">
          {parts.map((part, index) => {
            const match = part.match(/\{(\d+)\}/);
            if (match) {
              const placeholderNum = match[1];
              const questionIndex = parseInt(placeholderNum, 10);
              const globalNum = startIndex + questionIndex - 1;
              const questionId =
                data.questionIds?.[questionIndex - 1] || `q${globalNum}`;

              return (
                <span key={index} className="inline-flex items-center mx-1 align-baseline">
                  {/* Question number badge */}
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-1 shrink-0">
                    {globalNum}
                  </span>
                  <input
                    id={`gap-input-${questionId}`}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    className="
                      inline-block w-32 px-2.5 py-1 rounded-md
                      border border-input bg-background text-foreground
                      font-medium text-sm
                      placeholder:text-muted-foreground/50
                      focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                      transition-shadow
                    "
                    onChange={(e) => onAnswer(questionId, e.target.value)}
                    placeholder={`Answer ${globalNum}`}
                  />
                </span>
              );
            }
            // Regular text
            return <span key={index}>{part}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default GapFill;
