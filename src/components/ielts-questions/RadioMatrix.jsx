'use client';

import React, { useState } from 'react';

/**
 * RadioMatrix — "Matching Features" / "Map Labeling" component.
 *
 * Renders a table where rows = questions, columns = options (A, B, C…).
 * Only one option per row (radio behavior).
 *
 * Expected `data` shape:
 * {
 *   id: "block_2",
 *   type: "matrix_match",
 *   instruction: "Which paragraph contains the following information?",
 *   columnOptions: ["A", "B", "C", "D", "E", "F", "G", "H"],
 *   questions: [
 *     { id: "q14", text: "a reference to how..." },
 *     { id: "q15", text: "an explanation of..." },
 *   ]
 * }
 */
const RadioMatrix = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    onAnswer(questionId, option);
  };

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground overflow-hidden">
      {/* ── Header ── */}
      <div className="bg-primary/5 dark:bg-primary/10 border-b border-border px-5 py-3">
        <h3 className="font-semibold text-foreground text-[0.95rem] leading-snug">
          {data.instruction}
        </h3>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Column headers */}
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="p-3 text-left font-semibold text-foreground min-w-[200px]">
                Question
              </th>
              {data.columnOptions.map((opt) => (
                <th
                  key={opt}
                  className="p-3 text-center font-bold text-primary w-12"
                >
                  {opt}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.questions.map((q, qIdx) => {
              const globalNum =
                startIndex + qIdx;
              const isSelected = !!selectedAnswers[q.id];

              return (
                <tr
                  key={q.id}
                  className={`
                    border-b border-border/50 transition-colors
                    ${isSelected ? 'bg-primary/[0.03] dark:bg-primary/[0.06]' : ''}
                    hover:bg-muted/40
                  `}
                >
                  {/* Question text */}
                  <td className="p-3 text-foreground/90">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold mr-2 shrink-0">
                      {globalNum}
                    </span>
                    {q.text}
                  </td>

                  {/* Radio cells */}
                  {data.columnOptions.map((opt) => {
                    const isChecked = selectedAnswers[q.id] === opt;
                    return (
                      <td key={opt} className="p-2 text-center">
                        <label
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full cursor-pointer transition-all"
                          title={`${q.id} → ${opt}`}
                        >
                          <input
                            type="radio"
                            name={`matrix_${data.id}_${q.id}`}
                            value={opt}
                            checked={isChecked}
                            onChange={() => handleSelect(q.id, opt)}
                            className="sr-only"
                          />
                          {/* Custom radio visual */}
                          <span
                            className={`
                              inline-flex items-center justify-center
                              w-7 h-7 rounded-full border-2 text-xs font-bold
                              transition-all duration-150
                              ${
                                isChecked
                                  ? 'border-primary bg-primary text-primary-foreground scale-110 shadow-md shadow-primary/25'
                                  : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary'
                              }
                            `}
                          >
                            {opt}
                          </span>
                        </label>
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
};

export default RadioMatrix;
