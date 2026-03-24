'use client';

import React from 'react';
import parse from 'html-react-parser';

/**
 * TableCompletion — Renders a table-styled gap fill question.
 * Matches the IELTS table design: clean borders, header styling, and clear spacing.
 */
const TableCompletion = ({ data, onAnswer, userAnswers = {} }) => {
  const handleInputChange = (questionId, val) => {
    onAnswer(questionId, val);
  };

  const options = {
    replace: (domNode) => {
      // Handle the gaps in text nodes
      if (domNode.type === 'text') {
        const text = domNode.data;
        if (/\{\d+\}/.test(text)) {
          const parts = text.split(/(\{\d+\})/g);
          return (
            <React.Fragment>
              {parts.map((part, index) => {
                const match = part.match(/^\{(\d+)\}$/);
                if (match) {
                  const questionId = match[1];
                  const value = userAnswers[questionId] || '';
                  
                  // Adaptive width based on value length
                  const minWidth = Math.max(80, (value.length * 9) + 30);

                  return (
                    <span key={index} className="relative inline-block mx-1 align-middle">
                      <input
                        type="text"
                        value={value}
                        autoComplete="off"
                        spellCheck={false}
                        className="px-1 py-0 h-[1.4em] text-center border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-semibold text-blue-800"
                        style={{ width: `${minWidth}px`, maxWidth: '230px' }}
                        onChange={(e) => handleInputChange(questionId, e.target.value)}
                      />
                      {!value && (
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-500 pointer-events-none" style={{ fontSize: '0.85em' }}>
                          {questionId}
                        </span>
                      )}
                    </span>
                  );
                }
                return <span key={index}>{part}</span>;
              })}
            </React.Fragment>
          );
        }
      }
    }
  };

  return (
    <div className="mb-10 ielts-table-container">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle styled-table-wrapper">
          {parse(data.content, options)}
        </div>
      </div>

      <style jsx global>{`
        .styled-table-wrapper table {
          width: auto;
          min-width: 800px;
          max-width: 100%;
          border-collapse: separate;
          border-spacing: 2px;
          background-color: #fff;
          font-size: 16px;
          margin-bottom: 2rem;
        }
        .styled-table-wrapper th {
          background-color: #fff;
          border: 1px solid #111;
          padding: 10px 15px;
          text-align: left;
          font-weight: 700;
          color: #111;
          min-width: 120px;
        }
        .styled-table-wrapper td {
          border: 1px solid #111;
          padding: 10px 15px;
          color: #111;
          line-height: 1.5;
          vertical-align: middle;
        }
        .styled-table-wrapper b {
          font-weight: 700;
        }
        .styled-table-wrapper ul {
          list-style: disc outside none;
          padding-left: 20px;
          margin: 10px 0;
        }
        .styled-table-wrapper li {
          margin: 5px 0;
          display: list-item;
        }
      `}</style>
    </div>
  );
};

export default TableCompletion;
