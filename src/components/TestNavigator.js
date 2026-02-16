'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * TestNavigator — IELTS CD pastki navigatsiya paneli.
 *
 * Props:
 *  - parts              : string[]            Part nomlari ["Part 1", "Part 2", ...]
 *  - activePart         : number              Hozirgi aktiv part indeksi
 *  - onPartChange       : (index) => void     Part almashtirganda
 *  - questionNumbers    : number[]            Barcha savol raqamlari [1..40]
 *  - answeredIds        : string[]            Javob berilgan savol ID/raqamlari
 *  - partQuestionRanges : {start,end}[]       Har bir part uchun savol diapazoni
 *  - onSubmit           : () => void          ✓ tugma bosilganda
 *  - onPrevPage         : () => void | null   ← tugma (undefined bo'lsa ko'rinmaydi)
 *  - onNextPage         : () => void | null   → tugma
 */
export default function TestNavigator({
  parts = [],
  activePart = 0,
  onPartChange,
  questionNumbers = [],
  answeredIds = [],
  partQuestionRanges = [],
  onSubmit,
  onPrevPage,
  onNextPage,
}) {
  if (!parts || parts.length === 0) return null;

  const answeredSet = new Set(answeredIds.map(String));

  const getPartAnswered = (partIndex) => {
    const range = partQuestionRanges[partIndex];
    if (!range) return 0;
    let count = 0;
    for (let i = range.start; i <= range.end; i++) {
      if (answeredSet.has(String(i))) count++;
    }
    return count;
  };

  const getPartTotal = (partIndex) => {
    const range = partQuestionRanges[partIndex];
    if (!range) return 0;
    return range.end - range.start + 1;
  };

  // Question numbers for the active part
  const activeRange = partQuestionRanges[activePart];
  const activeQuestions = activeRange
    ? questionNumbers.slice(activeRange.start - 1, activeRange.end)
    : [];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: '#e8e8e8',
        borderTop: '1px solid #bbb',
        height: '50px',
        userSelect: 'none',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>

        {/* ─── Part Tabs ─── */}
        {parts.map((label, index) => {
          const isActive = activePart === index;
          const answered = getPartAnswered(index);
          const total = getPartTotal(index);

          return (
            <button
              key={index}
              onClick={() => onPartChange(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
                height: '100%',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '400',
                color: '#222',
                background: isActive ? '#fff' : 'transparent',
                border: 'none',
                borderRight: '1px solid #ccc',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                outline: 'none',
              }}
            >
              <span>{label}</span>
              {!isActive && total > 0 && (
                <span style={{ fontSize: '12px', color: '#777', fontWeight: '400' }}>
                  {answered}/{total}
                </span>
              )}
            </button>
          );
        })}

        {/* ─── Question number pills for active part ─── */}
        <div
          className="no-scrollbar"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '0 12px',
            overflowX: 'auto',
          }}
        >
          {activeQuestions.map((num) => {
            const isAnswered = answeredSet.has(String(num));
            return (
              <span
                key={num}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '34px',
                  height: '34px',
                  padding: '0 2px',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: isAnswered ? '#fff' : '#333',
                  backgroundColor: isAnswered ? '#333' : '#fff',
                  border: '1px solid #777',
                  borderRadius: '3px',
                  cursor: 'default',
                  userSelect: 'none',
                }}
              >
                {num}
              </span>
            );
          })}
        </div>

        {/* ─── Navigation arrows ← → ─── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 8px' }}>
          {onPrevPage && (
            <button
              onClick={onPrevPage}
              aria-label="Previous"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d0d0d0',
                border: '1px solid #aaa',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#333',
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
          )}
          {onNextPage && (
            <button
              onClick={onNextPage}
              aria-label="Next"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d0d0d0',
                border: '1px solid #aaa',
                borderRadius: '3px',
                cursor: 'pointer',
                color: '#333',
              }}
            >
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          )}
        </div>

        {/* ─── Submit ✓ button ─── */}
        {onSubmit && (
          <button
            onClick={onSubmit}
            aria-label="Submit"
            style={{
              width: '34px',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#d0d0d0',
              border: 'none',
              borderLeft: '1px solid #aaa',
              cursor: 'pointer',
              color: '#333',
              flexShrink: 0,
            }}
          >
            <Check style={{ width: '18px', height: '18px' }} />
          </button>
        )}
      </div>
    </div>
  );
}
