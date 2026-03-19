'use client';

import React from 'react';

/**
 * RadioMatrix — IELTS CD "Matching Features" question type.
 *
 * Design matches official IELTS Computer-Delivered format:
 *  ┌──────────────────────────────┬───┬───┬───┬───┬───┐
 *  │                              │ A │ B │ C │ D │ E │
 *  ├──────────────────────────────┼───┼───┼───┼───┼───┤
 *  │ 21  black powder             │ ○ │ ○ │ ○ │ ○ │ ○ │
 *  │ 22  rockets as war weapons   │ ○ │ ○ │ ○ │ ○ │ ○ │
 *  └──────────────────────────────┴───┴───┴───┴───┴───┘
 *
 *  ┌─────────────────────┐
 *  │ First invented by   │
 *  ├──────┬──────────────┤
 *  │ A    │ the Chinese  │
 *  │ B    │ the Indians  │
 *  └──────┴──────────────┘
 *
 * Data shape:
 * {
 *   type: "radio_matrix" | "matrix_match",
 *   columnOptions: ["A", "B", "C", "D", "E"],
 *   legendTitle: "First invented or used by",   // optional
 *   legend: { A: "the Chinese", B: "the Indians", ... }, // optional
 *   options: ["A", "B", ...],  // fallback if no columnOptions
 *   questions: [
 *     { number: 21, text: "black powder", answer: "A" },
 *     ...
 *   ]
 * }
 */
const RadioMatrix = ({ data, onAnswer, startIndex = 1, userAnswers = {} }) => {
  const handleSelect = (questionId, option) => {
    onAnswer(questionId, option);
  };

  const columns = data.columnOptions || data.options || [];
  // Build legend: either from data.legend object or data.optionDescriptions array
  const legend = data.legend || null;
  const legendTitle = data.legendTitle || data.legendLabel || null;
  // optionDescriptions: array like ["A  the Chinese", "B  the Indians"]
  const optionDescriptions = data.optionDescriptions || null;

  return (
    <div className="mb-8 font-sans">

      {/* ── Main matrix table ── */}
      <div
        className="overflow-x-auto"
        style={{
          border: '1px solid var(--test-border, #bbb)',
          background: 'var(--test-panel-bg, #fff)',
        }}
      >
        <table className="w-full border-collapse" style={{ minWidth: 500 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--test-border, #bbb)' }}>
              {/* Empty left header cell */}
              <th
                style={{
                  borderRight: '2px solid var(--test-border, #bbb)',
                  padding: '10px 14px',
                  width: '55%',
                  background: 'var(--test-panel-bg, #fff)',
                }}
              />
              {/* Column headers: A, B, C, D, E */}
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 0',
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: '1.05em',
                    color: 'var(--test-fg, #111)',
                    borderRight: '1px solid var(--test-border, #ccc)',
                    minWidth: 52,
                    background: 'var(--test-panel-bg, #fff)',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.questions.map((q, qIdx) => {
              const globalNum = q.number !== undefined ? q.number : startIndex + qIdx;
              const questionId = String(globalNum);
              const selected = userAnswers[questionId] || '';

              return (
                <tr
                  key={q.id || questionId}
                  style={{
                    borderBottom: '1px solid var(--test-border, #ddd)',
                    background: 'var(--test-panel-bg, #fff)',
                  }}
                >
                  {/* Question cell */}
                  <td
                    style={{
                      borderRight: '2px solid var(--test-border, #bbb)',
                      padding: '10px 14px',
                      verticalAlign: 'middle',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Number badge — IELTS CD style: box outline */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: 28,
                          height: 28,
                          border: '1.5px solid var(--test-fg, #333)',
                          fontWeight: 700,
                          fontSize: '0.95em',
                          color: 'var(--test-fg, #111)',
                          background: 'var(--test-panel-bg, #fff)',
                          flexShrink: 0,
                        }}
                      >
                        {globalNum}
                      </span>
                      <span
                        style={{
                          fontSize: '1.05em',
                          fontWeight: 500,
                          color: 'var(--test-fg, #111)',
                          lineHeight: 1.45,
                          paddingTop: 3,
                        }}
                        dangerouslySetInnerHTML={{ __html: q.text }}
                      />
                    </div>
                  </td>

                  {/* Radio button cells */}
                  {columns.map((col) => {
                    const isSelected = selected === col;
                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: 'center',
                          borderRight: '1px solid var(--test-border, #ccc)',
                          padding: '10px 0',
                          verticalAlign: 'middle',
                          background: isSelected
                            ? 'var(--primary-muted, rgba(37,99,235,0.08))'
                            : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleSelect(questionId, col)}
                      >
                        {/* IELTS CD styled radio button */}
                        <span
                          style={{
                            display: 'inline-block',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            border: isSelected
                              ? '6px solid var(--primary, #2563eb)'
                              : '1.5px solid var(--test-border, #888)',
                            background: 'var(--test-panel-bg, #fff)',
                            cursor: 'pointer',
                            transition: 'all 0.12s',
                            flexShrink: 0,
                            verticalAlign: 'middle',
                          }}
                        />
                        {/* Hidden real radio for accessibility */}
                        <input
                          type="radio"
                          name={`matrix_${data.id}_${questionId}`}
                          value={col}
                          checked={isSelected}
                          onChange={() => handleSelect(questionId, col)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                          tabIndex={-1}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend table (A = ..., B = ...) ── */}
      {(legend || optionDescriptions) && (
        <div
          style={{
            marginTop: 20,
            display: 'inline-block',
            border: '1px solid var(--test-border, #bbb)',
            background: 'var(--test-panel-bg, #fff)',
            minWidth: 220,
            maxWidth: 380,
          }}
        >
          {/* Legend title row */}
          {legendTitle && (
            <div
              style={{
                padding: '10px 14px',
                fontWeight: 700,
                fontSize: '0.95em',
                color: 'var(--test-fg, #111)',
                borderBottom: '1.5px solid var(--test-border, #bbb)',
                background: 'var(--test-strip-bg, #f5f5f5)',
              }}
            >
              {legendTitle}
            </div>
          )}

          {/* Legend rows from data.legend object { A: "the Chinese", ... } */}
          {legend && Object.entries(legend).map(([key, val]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--test-border, #ddd)',
                minHeight: 38,
              }}
            >
              <span
                style={{
                  padding: '8px 14px',
                  fontWeight: 700,
                  fontSize: '0.95em',
                  color: 'var(--test-fg, #111)',
                  borderRight: '1px solid var(--test-border, #ccc)',
                  minWidth: 44,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {key}
              </span>
              <span
                style={{
                  padding: '8px 14px',
                  fontSize: '0.95em',
                  color: 'var(--test-fg, #111)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {val}
              </span>
            </div>
          ))}

          {/* Legacy: optionDescriptions array ["A  the Chinese", ...] */}
          {!legend && optionDescriptions && optionDescriptions.map((desc, idx) => {
            const match = desc.match(/^([A-Z])[.\s:)]\s*(.*)/);
            const letter = match ? match[1] : String.fromCharCode(65 + idx);
            const text   = match ? match[2] : desc;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--test-border, #ddd)',
                  minHeight: 38,
                }}
              >
                <span
                  style={{
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: '0.95em',
                    color: 'var(--test-fg, #111)',
                    borderRight: '1px solid var(--test-border, #ccc)',
                    minWidth: 44,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {letter}
                </span>
                <span
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.95em',
                    color: 'var(--test-fg, #111)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {text}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RadioMatrix;
