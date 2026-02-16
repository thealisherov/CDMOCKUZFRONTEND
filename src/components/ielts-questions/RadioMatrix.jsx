'use client';

import React, { useState } from 'react';

/**
 * RadioMatrix — "Matching Features" / "Map Labeling" component.
 * IELTS CD style: clean table with simple radio circles.
 */
const RadioMatrix = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (questionId, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    onAnswer(questionId, option);
  };

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#333', minWidth: '200px' }}>
                Question
              </th>
              {data.columnOptions.map((opt) => (
                <th key={opt} style={{ padding: '8px', textAlign: 'center', fontWeight: '700', color: '#333', width: '40px' }}>
                  {opt}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.questions.map((q, qIdx) => {
              const globalNum = startIndex + qIdx;
              // Use global number as answer key
              const questionId = String(globalNum);

              return (
                <tr
                  key={q.id || questionId}
                  style={{
                    borderBottom: '1px solid #e0e0e0',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9f9f9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Question text */}
                  <td style={{ padding: '10px 12px', color: '#333' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '24px',
                      height: '24px',
                      border: '1px solid #999',
                      color: '#333',
                      fontSize: '11px',
                      fontWeight: '700',
                      marginRight: '8px',
                      flexShrink: 0,
                      backgroundColor: '#fff',
                    }}>
                      {globalNum}
                    </span>
                    {q.text}
                  </td>

                  {/* Radio cells */}
                  {data.columnOptions.map((opt) => {
                    const isChecked = selectedAnswers[questionId] === opt;
                    return (
                      <td key={opt} style={{ padding: '8px', textAlign: 'center' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`matrix_${data.id}_${questionId}`}
                            value={opt}
                            checked={isChecked}
                            onChange={() => handleSelect(questionId, opt)}
                            style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                          />
                          <span
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              border: `2px solid ${isChecked ? '#333' : '#999'}`,
                              backgroundColor: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'border-color 0.15s',
                            }}
                          >
                            {isChecked && (
                              <span style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#333',
                              }} />
                            )}
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
