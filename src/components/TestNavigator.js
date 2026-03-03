'use client';

import { Check } from 'lucide-react';

/**
 * TestNavigator — IELTS CD bottom navigator.
 * Extracted design from test-taking BottomNavigator template using Tailwind CSS.
 */
export default function TestNavigator({
  parts = [],
  activePart = 0,
  onPartChange,
  questionNumbers = [],
  answeredIds = [],
  partQuestionRanges = [],
  onSubmit,
}) {
  if (!parts || parts.length === 0) return null;

  const answeredSet = new Set(answeredIds.map(String));

  const getPartStats = (partIndex) => {
    const range = partQuestionRanges[partIndex];
    if (!range) return { total: 0, answered: 0, questions: [] };
    const questions = [];
    for (let i = range.start; i <= range.end; i++) {
      questions.push(i);
    }
    const answered = questions.filter((q) => answeredSet.has(String(q))).length;
    return { total: questions.length, answered, questions };
  };

  const scrollToQuestion = (qNum) => {
    const element = document.getElementById(`question-${qNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 z-40 flex items-center justify-between px-4 bg-white border-t border-gray-300 text-gray-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] select-none">
      {/* ═══ Main Navigation Area ═══ */}
      <div className="flex-1 flex items-center gap-8 overflow-x-auto py-2 no-scrollbar">
        {parts.map((label, idx) => {
          const stats = getPartStats(idx);
          const isActive = idx === activePart;

          if (isActive) {
            /* ─── ACTIVE PART ─── */
            return (
              <div key={idx} className="flex items-center gap-4 flex-shrink-0 animate-in fade-in duration-200">
                {/* Part label */}
                <div className="font-bold text-sm uppercase whitespace-nowrap text-gray-900">
                  {label}
                </div>

                {/* Question number buttons */}
                <div className="flex gap-2">
                  {stats.questions.map((qNum) => {
                    const isAnswered = answeredSet.has(String(qNum));
                    return (
                      <button
                        key={qNum}
                        onClick={() => scrollToQuestion(qNum)}
                        className={`w-9 h-9 flex items-center justify-center text-sm font-bold border rounded transition-all flex-shrink-0 outline-none
                          ${isAnswered 
                            ? 'bg-gray-100 border-gray-900 text-gray-900 underline decoration-2 underline-offset-2' 
                            : 'bg-transparent border-gray-300 text-gray-900 hover:border-gray-900'
                          }
                        `}
                      >
                        {qNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          } else {
            /* ─── INACTIVE PART ─── */
            return (
              <button
                key={idx}
                onClick={() => onPartChange(idx)}
                className="flex flex-col items-center justify-center px-4 py-1 rounded border-none bg-transparent cursor-pointer flex-shrink-0 outline-none transition-colors hover:bg-gray-100 group"
              >
                <span className="font-bold text-sm uppercase opacity-80 group-hover:opacity-100 text-gray-900 whitespace-nowrap">
                  {label}
                </span>
                <span className="text-xs opacity-60 group-hover:opacity-80 text-gray-900">
                  {stats.answered} / {stats.total}
                </span>
              </button>
            );
          }
        })}
      </div>

      {/* ═══ Right Side: Submit Button ═══ */}
      {onSubmit && (
        <div className="flex items-center ml-4">
          <button
            onClick={onSubmit}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded font-bold text-sm bg-white text-gray-900 cursor-pointer transition-colors shadow-sm outline-none hover:bg-gray-100"
          >
            {/* Checkmark Icon */}
            <svg
              className="w-5 h-5 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span>Submit</span>
          </button>
        </div>
      )}
    </div>
  );
}
