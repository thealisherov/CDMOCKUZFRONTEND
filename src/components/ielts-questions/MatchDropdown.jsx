'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * MatchDropdown - Custom dropdown component matching IELTS mock design.
 * Used for "Match each sentence with correct person" or "Match Sentence Endings".
 */
const MatchDropdown = ({ data, onAnswer, startIndex = 1, layout }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // stores questionId of the open dropdown
  const dropdownRef = useRef(null);

  const isStacked = layout === 'stacked';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (questionId, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    setOpenDropdown(null);
    onAnswer(questionId, value);
  };

  const toggleDropdown = (questionId) => {
    setOpenDropdown((prev) => (prev === questionId ? null : questionId));
  };

  /**
   * Helper to bold the option letter (e.g. "A James" -> bold "A", normal "James")
   */
  const renderOptionText = (text) => {
    const match = text.match(/^([A-Z])[\.\s:)]*(.*)$/);
    if (match) {
      return (
        <span>
          <span className="font-bold">{match[1]}</span> {match[2]}
        </span>
      );
    }
    return text;
  };

  // The letters to show in the dropdown list (e.g. ["A", "B", "C", "D", "E"])
  const optionLetters = data.options || [];

  return (
    <div className={`mb-8 font-sans ${isStacked ? 'w-full' : 'w-full lg:w-[60%]'}`} ref={dropdownRef}>
      {/* instruction */}
      {data.instruction && (
        <p className="mb-4" style={{ fontSize: '1.1em', color: 'var(--test-fg)' }}>
          {data.instruction}
        </p>
      )}

      {/* Layout wrapper for side-by-side or stacked display */}
      <div className={`flex flex-col ${isStacked ? 'gap-6' : 'lg:flex-row gap-10'} items-start mt-6`}>
        
        {/* List Box (e.g. List of Researchers) */}
        {data.optionDescriptions && data.optionDescriptions.length > 0 && (
          <div className={`w-full ${isStacked ? '' : 'lg:w-1/2'} p-6 rounded-md border`} style={{ backgroundColor: 'var(--test-strip-bg)', borderColor: 'var(--test-border)', color: 'var(--test-fg)' }}>
            <h3 className="text-center font-bold mb-5 text-[18px]" style={{ color: 'var(--test-fg)' }}>
              List of Options
            </h3>
            <div className="space-y-3">
              {data.optionDescriptions.map((desc, idx) => (
                <p key={idx} className="leading-relaxed" style={{ fontSize: '1.05em', color: 'var(--test-fg)' }}>
                  {renderOptionText(desc)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Questions list */}
        <div className={`w-full ${isStacked ? '' : 'lg:w-1/2'} space-y-5`}>
          {data.questions.map((q, qIdx) => {
            const globalNum = startIndex + qIdx;
            const questionId = String(globalNum);
            const selected = selectedAnswers[questionId];
            const isOpen = openDropdown === questionId;

            return (
              <div key={q.id || questionId} className="flex items-center gap-6 mb-2">
                {/* Question Number Box */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-[2em] h-[2em] border font-bold rounded-md shadow-sm select-none" style={{ fontSize: '1.1em', backgroundColor: 'var(--test-header-bg)', color: 'var(--test-header-fg)', borderColor: 'var(--test-border)' }}>
                    {globalNum}
                  </span>
                </div>
                
                {/* Question Text */}
                <div className="flex-1 font-medium leading-normal" style={{ fontSize: '1.05em', color: 'var(--test-fg)' }}>
                  {q.text}
                </div>

                {/* Custom Dropdown */}
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => toggleDropdown(questionId)}
                    className="flex items-center justify-between min-w-[60px] h-[34px] px-3 border rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: 'var(--test-input-bg)', borderColor: 'var(--test-border)', color: 'var(--test-fg)' }}
                  >
                    <span className="font-medium leading-none text-[15px]">
                      {selected ? selected : globalNum}
                    </span>
                    <svg
                      className="w-4 h-4 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: 'var(--test-fg)' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute right-0 top-full mt-1 w-full min-w-[80px] border rounded-md shadow-lg z-50 py-1" style={{ backgroundColor: 'var(--opts-bg)', borderColor: 'var(--opts-border)' }}>
                      {optionLetters.map((opt) => (
                        <div
                          key={opt}
                          onClick={() => handleSelect(questionId, opt)}
                          className={`px-4 py-2 cursor-pointer text-center font-medium transition-colors`}
                          style={{
                            backgroundColor: selected === opt ? 'rgba(239, 68, 68, 0.9)' : 'transparent',
                            color: selected === opt ? '#fff' : 'var(--opts-fg)',
                          }}
                          onMouseEnter={(e) => {
                            if (selected !== opt) {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selected !== opt) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MatchDropdown;
