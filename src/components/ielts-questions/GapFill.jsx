'use client';

import React from 'react';
import parse, { domToReact } from 'html-react-parser';

/**
 * GapFill — "Complete the notes / sentences" component.
 * Applies test-taking template design.
 * Fully controlled by `userAnswers`.
 */
const GapFill = ({ data, onAnswer, userAnswers = {} }) => {
  const handleInputChange = (questionId, val) => {
    onAnswer(questionId, val);
  };

  const options = {
    replace: (domNode) => {
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
                  const minWidth = Math.max(112, (value.length * 10) + 40);

                  return (
                    <span key={index} className="relative inline-block mx-2 align-middle">
                      <input
                        id={`gap-input-${questionId}`}
                        type="text"
                        value={value}
                        autoComplete="off"
                        spellCheck={false}
                        className="px-1 py-0 h-[1.3em] text-center border border-gray-400 rounded bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-semibold text-blue-800 text-[inherit]"
                        style={{ width: `${minWidth}px`, maxWidth: '230px' }}
                        onChange={(e) => handleInputChange(questionId, e.target.value)}
                      />
                      {!value && (
                        <span className="absolute inset-0 flex items-center justify-center font-bold text-gray-900 pointer-events-none" style={{ fontSize: '0.9em' }}>
                          {questionId}
                        </span>
                      )}
                    </span>
                  );
                }

                if (part.includes('\n')) {
                  return (
                    <span key={index}>
                      {part.split('\n').map((line, i, arr) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </React.Fragment>
                      ))}
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
    <div className="mb-8 font-sans">
      <div className="space-y-3 leading-loose text-gray-800 ielts-html-content">
        <div className="leading-[2.5] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:mb-2 [&_li]:mt-1">
          {parse(data.content, options)}
        </div>
      </div>
      <style jsx global>{`
        .ielts-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid #777;
        }
        .ielts-html-content th, .ielts-html-content td {
          border: 1px solid #777;
          padding: 8px 12px;
          text-align: left;
        }
        .ielts-html-content th { background-color: #f7f7f7; }
      `}</style>
    </div>
  );
};

export default GapFill;
