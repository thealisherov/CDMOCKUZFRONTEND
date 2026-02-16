'use client';

import React, { useState, useCallback, useEffect } from 'react';
import GapFill from './GapFill';
import RadioMatrix from './RadioMatrix';
import TrueFalse from './TrueFalse';

/**
 * QuestionRenderer — Main controller for the IELTS Question Engine.
 *
 * Props:
 *  - data        : Object  — the JSON block that describes one question section.
 *  - onAnswersChange : Function(answers) — called whenever the internal answers state changes.
 *  - startIndex  : Number  — global starting question number (optional, default: 1).
 *
 * The `data.type` field determines which sub-component is rendered:
 *   "gap_fill"      → GapFill
 *   "matrix_match"  → RadioMatrix
 *   "true_false"    → TrueFalse
 *   "multiple_choice" → TrueFalse (reused for radio-style options)
 */
const QuestionRenderer = ({ data, onAnswersChange, startIndex = 1 }) => {
  const [userAnswers, setUserAnswers] = useState({});

  // Bubble up answers whenever they change
  useEffect(() => {
    if (onAnswersChange) {
      onAnswersChange(userAnswers);
    }
  }, [userAnswers, onAnswersChange]);

  const handleAnswerChange = useCallback((questionId, value) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const commonProps = {
    data,
    onAnswer: handleAnswerChange,
    startIndex,
  };

  const renderComponent = () => {
    switch (data.type) {
      case 'gap_fill':
        return <GapFill {...commonProps} />;

      case 'matrix_match':
        return <RadioMatrix {...commonProps} />;

      case 'true_false':
      case 'yes_no':
      case 'multiple_choice':
        return <TrueFalse {...commonProps} />;

      default:
        return (
          <div style={{
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#fff',
            color: '#333',
          }}>
            <p style={{ color: '#999', fontStyle: 'italic' }}>
              ⚠ Unknown question type: <code style={{ fontFamily: 'monospace', color: '#c00' }}>{data.type}</code>
            </p>
          </div>
        );
    }
  };

  return (
    <div className="ielts-question-block">
      {renderComponent()}
    </div>
  );
};

export default QuestionRenderer;
