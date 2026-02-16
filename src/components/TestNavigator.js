'use client';

import { Check } from 'lucide-react';

/**
 * TestNavigator — IELTS CD bottom navigator.
 *
 * Dizayn berilgan BottomNavigator kodidan 100% ko'chirilgan:
 * - h-20 (80px), shadow yuqoriga
 * - Aktiv part: bold label + w-9 h-9 savol tugmalari
 * - Inaktiv part: label + answered/total count
 * - Submit: o'ng chekkada checkmark + "Submit" matni
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
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '80px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        backgroundColor: '#fff',
        borderTop: '1px solid #d1d5db',
        color: '#111',
        boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, Helvetica, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* ═══ Main Navigation Area ═══ */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          overflowX: 'auto',
          padding: '8px 0',
        }}
      >
        {parts.map((label, idx) => {
          const stats = getPartStats(idx);
          const isActive = idx === activePart;

          if (isActive) {
            /* ─── ACTIVE PART ─── */
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexShrink: 0,
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                {/* Part label */}
                <div
                  style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    color: '#111',
                  }}
                >
                  {label}
                </div>

                {/* Question number buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  {stats.questions.map((qNum) => {
                    const isAnswered = answeredSet.has(String(qNum));
                    return (
                      <button
                        key={qNum}
                        onClick={() => scrollToQuestion(qNum)}
                        style={{
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          border: isAnswered ? '2px solid #333' : '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: isAnswered ? '#f3f4f6' : 'transparent',
                          color: '#111',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          textDecoration: isAnswered ? 'underline' : 'none',
                          textDecorationThickness: '2px',
                          textUnderlineOffset: '2px',
                          outline: 'none',
                          flexShrink: 0,
                        }}
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  flexShrink: 0,
                  outline: 'none',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <span
                  style={{
                    fontWeight: '700',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    opacity: 0.8,
                    color: '#111',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    opacity: 0.6,
                    color: '#111',
                  }}
                >
                  {stats.answered} / {stats.total}
                </span>
              </button>
            );
          }
        })}
      </div>

      {/* ═══ Right Side: Submit Button ═══ */}
      {onSubmit && (
        <div style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
          <button
            onClick={onSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '14px',
              backgroundColor: '#fff',
              color: '#111',
              cursor: 'pointer',
              transition: 'all 0.15s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              outline: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            {/* Checkmark Icon */}
            <svg
              style={{ width: '20px', height: '20px', opacity: 0.8 }}
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
