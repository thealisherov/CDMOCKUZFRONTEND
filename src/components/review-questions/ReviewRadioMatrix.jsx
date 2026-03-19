'use client';
import React from 'react';

/**
 * ReviewRadioMatrix — IELTS CD Matching Features review.
 * Shows green/red highlighting + legend below.
 */
export default function ReviewRadioMatrix({
  data, startIndex = 1,
  userAnswers = {}, correctAnswersMap = {}, showCorrect,
}) {
  const columns = data.columnOptions || data.options || [];
  const legend  = data.legend || null;
  const legendTitle = data.legendTitle || data.legendLabel || null;
  const optionDescriptions = data.optionDescriptions || null;

  return (
    <div className="mb-8 font-sans">

      {/* ── Matrix table ── */}
      <div className="overflow-x-auto" style={{ border: '1px solid #d1d5db', background: '#fff' }}>
        <table className="w-full border-collapse" style={{ minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d1d5db', background: '#f9fafb' }}>
              <th style={{ padding: '10px 14px', borderRight: '2px solid #d1d5db', width: '55%', textAlign: 'left' }} />
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: '10px 0',
                    textAlign: 'center',
                    fontWeight: 900,
                    fontSize: '1em',
                    color: '#111827',
                    borderRight: '1px solid #e5e7eb',
                    minWidth: 52,
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
              const qId       = String(globalNum);
              const selected  = userAnswers[qId] || '';
              const serverData = correctAnswersMap[qId];
              const isCorrect  = serverData?.correct || false;
              const correctAns = serverData?.correctAnswer;
              const isUnanswered = !selected;

              return (
                <tr key={q.id || qId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {/* Question cell */}
                  <td style={{ padding: '10px 14px', borderRight: '2px solid #d1d5db', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {/* Number badge */}
                      <span
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: 24, height: 24, borderRadius: '50%',
                          background: isUnanswered ? '#9ca3af' : isCorrect ? '#10b981' : '#ef4444',
                          color: '#fff', fontWeight: 700, fontSize: '0.8em', flexShrink: 0,
                        }}
                      >
                        {globalNum}
                      </span>
                      <span
                        style={{ fontSize: '1em', color: '#1f2937', lineHeight: 1.45, paddingTop: 2 }}
                        dangerouslySetInnerHTML={{ __html: q.text }}
                      />
                    </div>
                    {/* Correct answer hint below question */}
                    {showCorrect && !isCorrect && correctAns && (
                      <div style={{ marginTop: 4, marginLeft: 34, fontSize: '0.82em', fontWeight: 600, color: '#10b981' }}>
                        ✓ Correct: {Array.isArray(correctAns) ? correctAns[0] : correctAns}
                      </div>
                    )}
                  </td>

                  {/* Radio cells */}
                  {columns.map((col) => {
                    const isSelected     = selected === col;
                    const isThisCorrect  = showCorrect && (
                      Array.isArray(correctAns) ? correctAns.includes(col) : correctAns === col
                    );

                    let bg = 'transparent';
                    if (isSelected && isCorrect)  bg = '#dcfce7';
                    else if (isSelected && !isCorrect) bg = '#fee2e2';
                    else if (isThisCorrect) bg = '#f0fdf4';

                    const ringColor = isSelected
                      ? (isCorrect ? '#10b981' : '#ef4444')
                      : isThisCorrect ? '#10b981' : '#d1d5db';
                    const fillColor = isSelected
                      ? (isCorrect ? '#10b981' : '#ef4444')
                      : isThisCorrect ? '#bbf7d0' : 'transparent';

                    return (
                      <td
                        key={col}
                        style={{
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb',
                          background: bg,
                          padding: '10px 0',
                          verticalAlign: 'middle',
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 20, height: 20, borderRadius: '50%',
                            border: `2px solid ${ringColor}`,
                            background: fillColor,
                          }}
                        >
                          {isSelected && (
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'block' }} />
                          )}
                          {!isSelected && isThisCorrect && showCorrect && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'block' }} />
                          )}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend table (A = Chinese, B = Indians ...) ── */}
      {(legend || optionDescriptions) && (
        <div
          style={{
            marginTop: 20,
            display: 'inline-block',
            border: '1px solid #d1d5db',
            background: '#fff',
            minWidth: 220,
            maxWidth: 380,
          }}
        >
          {legendTitle && (
            <div style={{
              padding: '8px 14px', fontWeight: 700, fontSize: '0.9em',
              color: '#111827', borderBottom: '1.5px solid #d1d5db',
              background: '#f9fafb',
            }}>
              {legendTitle}
            </div>
          )}

          {legend && Object.entries(legend).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', minHeight: 36 }}>
              <span style={{
                padding: '7px 14px', fontWeight: 700, fontSize: '0.9em', color: '#111827',
                borderRight: '1px solid #e5e7eb', minWidth: 44,
                display: 'flex', alignItems: 'center',
              }}>{key}</span>
              <span style={{
                padding: '7px 14px', fontSize: '0.9em', color: '#1f2937',
                display: 'flex', alignItems: 'center',
              }}>{val}</span>
            </div>
          ))}

          {!legend && optionDescriptions && optionDescriptions.map((desc, idx) => {
            const match  = desc.match(/^([A-Z])[.\s:)]\s*(.*)/);
            const letter = match ? match[1] : String.fromCharCode(65 + idx);
            const text   = match ? match[2] : desc;
            return (
              <div key={idx} style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', minHeight: 36 }}>
                <span style={{
                  padding: '7px 14px', fontWeight: 700, fontSize: '0.9em', color: '#111827',
                  borderRight: '1px solid #e5e7eb', minWidth: 44,
                  display: 'flex', alignItems: 'center',
                }}>{letter}</span>
                <span style={{
                  padding: '7px 14px', fontSize: '0.9em', color: '#1f2937',
                  display: 'flex', alignItems: 'center',
                }}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
