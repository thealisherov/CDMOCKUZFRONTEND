'use client';

import React, { useState } from 'react';

/**
 * TrueFalse — IELTS CD style radio buttons.
 * Handles: true_false, yes_no, multiple_choice question types.
 */
const TrueFalse = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (questionId, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    onAnswer(questionId, value);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {data.questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          // Use global number as answer key for consistent tracking
          const questionId = String(globalNum);
          const selected = selectedAnswers[questionId];

          return (
            <div key={q.id || questionId}>
              {/* Question text */}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
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
                  marginTop: '2px',
                  flexShrink: 0,
                  backgroundColor: '#fff',
                }}>
                  {globalNum}
                </span>
                <p style={{ color: '#333', fontSize: '0.92rem', lineHeight: '1.6', margin: 0 }}>
                  {q.text}
                </p>
              </div>

              {/* Options — simple radio circles */}
              <div style={{ marginLeft: '32px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {data.options.map((opt) => {
                  const isSelected = selected === opt;
                  return (
                    <label
                      key={opt}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '2px 0',
                      }}
                    >
                      <input
                        type="radio"
                        name={`tf_${data.id}_${questionId}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleSelect(questionId, opt)}
                        style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
                      />
                      {/* Radio circle */}
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#333' : '#999'}`,
                          backgroundColor: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          transition: 'border-color 0.15s',
                        }}
                      >
                        {isSelected && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#333',
                          }} />
                        )}
                      </span>
                      <span style={{
                        fontSize: '13px',
                        color: isSelected ? '#333' : '#555',
                        fontWeight: isSelected ? '500' : '400',
                      }}>
                        {opt}
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

export default TrueFalse;
