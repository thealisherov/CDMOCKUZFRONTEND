'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * MatchDropdown - Custom dropdown component matching IELTS mock design.
 * Used for "Match each sentence with correct person" or "Match Sentence Endings".
 */
const MatchDropdown = ({ data, onAnswer, startIndex = 1 }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null); // stores questionId of the open dropdown
  const dropdownRef = useRef(null);

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
    <div className="mb-8 font-sans" ref={dropdownRef}>
      {/* instruction */}
      {data.instruction && (
        <p className="text-black mb-4" style={{ fontSize: '1.1em' }}>
          {data.instruction}
        </p>
      )}

      {/* List Box (e.g. List of Researchers) */}
      {data.optionDescriptions && data.optionDescriptions.length > 0 && (
        <div className="mb-6 p-5 bg-[#f2f3f2] rounded-md border border-gray-200">
          <h3 className="text-center font-bold text-black mb-3 text-[18px]">
            List of Options
          </h3>
          <div className="space-y-1">
            {data.optionDescriptions.map((desc, idx) => (
              <p key={idx} className="text-black leading-relaxed" style={{ fontSize: '1.05em' }}>
                {renderOptionText(desc)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-5">
        {data.questions.map((q, qIdx) => {
          const globalNum = startIndex + qIdx;
          const questionId = String(globalNum);
          const selected = selectedAnswers[questionId];
          const isOpen = openDropdown === questionId;

          return (
            <div key={q.id || questionId} className="flex items-start gap-4">
              {/* Question Number Box */}
              <div className="flex-shrink-0 mt-0.5">
                <span className="inline-flex items-center justify-center w-[2em] h-[2em] border border-gray-300 text-black font-bold bg-white rounded-md shadow-sm select-none" style={{ fontSize: '1.1em' }}>
                  {globalNum}
                </span>
              </div>
              
              {/* Question Text */}
              <div className="flex-1 pt-1.5 font-medium text-black leading-normal" style={{ fontSize: '1.05em' }}>
                {q.text}
              </div>

              {/* Custom Dropdown */}
              <div className="relative pt-1">
                <button
                  onClick={() => toggleDropdown(questionId)}
                  className="flex items-center justify-between min-w-[60px] h-[34px] px-3 bg-[#f2f3f2] border border-gray-300 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <span className="text-black font-medium leading-none text-[15px]">
                    {selected ? selected : globalNum}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-600 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                  <div className="absolute right-0 top-full mt-1 w-full min-w-[80px] bg-white border border-gray-200 rounded-md shadow-lg z-50 py-1">
                    {optionLetters.map((opt) => (
                      <div
                        key={opt}
                        onClick={() => handleSelect(questionId, opt)}
                        className={`px-4 py-2 cursor-pointer text-center font-medium ${
                          selected === opt
                            ? 'bg-red-500 text-white'
                            : 'text-black hover:bg-red-500 hover:text-white'
                        } transition-colors`}
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
  );
};

export default MatchDropdown;
