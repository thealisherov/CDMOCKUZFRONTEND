'use client';

import React, { useCallback } from 'react';
import GapFill from './GapFill';
import RadioMatrix from './RadioMatrix';
import TrueFalse from './TrueFalse';
import MatchDropdown from './MatchDropdown';
import MatchHeadings from './MatchHeadings';
import MatchingDragDrop from './MatchingDragDrop';
import DragDropSummary from './DragDropSummary';
import CheckboxMultiple from './CheckboxMultiple';
import FlowChart from './FlowChart';
import TableCompletion from './TableCompletion';
import ShortAnswer from './ShortAnswer';

/**
 * QuestionRenderer — Stateless controller. All answer state lives in the
 * parent page (persisted to localStorage). Each sub-component receives
 * `userAnswers` so they remain fully controlled — switching parts never
 * causes answers to disappear.
 *
 * Props:
 *  - data            : Object   — JSON question block
 *  - onAnswersChange : Function(answersObj | id, value) — bubbles answers up
 *  - startIndex      : Number   — global starting question number
 *  - userAnswers     : Object   — current answers from the parent (controlled)
 *  - layout          : string   — optional layout hint passed through
 */
const QuestionRenderer = ({ data, onAnswersChange, startIndex = 1, userAnswers = {}, layout }) => {

  const handleAnswerChange = useCallback((questionId, value) => {
    if (onAnswersChange) {
      onAnswersChange(questionId, value);
    }
  }, [onAnswersChange]);

  const commonProps = {
    data,
    onAnswer: handleAnswerChange,
    startIndex,
    layout,
    userAnswers, // ← passed down so each component is fully controlled
  };

  const renderComponent = () => {
    switch (data.type) {
      case 'gap_fill':
        return <GapFill {...commonProps} />;

      case 'matrix_match':
      case 'matching_drag':
      case 'radio_matrix':
        return <RadioMatrix {...commonProps} />;


      case 'true_false':
      case 'yes_no':
      case 'multiple_choice':
        return <TrueFalse {...commonProps} />;

      case 'match_dropdown':
        return <MatchDropdown {...commonProps} />;


      case 'drag_drop_summary':
        return <DragDropSummary {...commonProps} />;

      case 'checkbox_multiple':
        return <CheckboxMultiple {...commonProps} />;

      case 'flow_chart':
        return <FlowChart {...commonProps} />;

      case 'match_headings':
        return <MatchHeadings {...commonProps} />;

      case 'table':
        return <TableCompletion {...commonProps} />;

      case 'short_answer':
      case 'short_answers':
        return <ShortAnswer {...commonProps} />;

      default:
        return (
          <div style={{
            padding: '24px', borderRadius: '8px',
            border: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#333',
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
