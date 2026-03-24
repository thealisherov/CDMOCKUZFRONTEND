'use client';

import React, { useState, useMemo } from 'react';
import { Check, X, Trophy, Target, BarChart3, RotateCcw, LogOut, Eye } from 'lucide-react';

// ── Official IELTS Band Score Tables ─────────────────────────────────────────

/**
 * Listening Band Score (from official IELTS table)
 * Correct Answers → Band Score
 */
function getListeningBand(correct) {
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 32) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 26) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 18) return 5.5;
  if (correct >= 16) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 11) return 4.0;
  if (correct >= 8) return 3.5;
  if (correct >= 6) return 3.0;
  if (correct >= 4) return 2.5;
  if (correct >= 2) return 2.0;
  if (correct >= 1) return 1.5;
  return 1.0;
}

/**
 * Reading (Academic) Band Score (from official IELTS table)
 */
function getReadingBand(correct) {
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 33) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 27) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 19) return 5.5;
  if (correct >= 15) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 10) return 4.0;
  if (correct >= 8) return 3.5;
  if (correct >= 6) return 3.0;
  if (correct >= 4) return 2.5;
  if (correct >= 2) return 2.0;
  if (correct >= 1) return 1.5;
  return 1.0;
}

// ── Band score visual helpers ──────────────────────────────────────────────
function getBandColor(band) {
  if (band >= 8)   return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }; // emerald
  if (band >= 7)   return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }; // blue
  if (band >= 6)   return { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' }; // violet
  if (band >= 5)   return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }; // yellow
  if (band >= 4)   return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' }; // orange
  return           { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };         // red
}

function getBandLabel(band) {
  if (band >= 9)   return 'Expert';
  if (band >= 8)   return 'Very Good';
  if (band >= 7)   return 'Good';
  if (band >= 6)   return 'Competent';
  if (band >= 5)   return 'Modest';
  if (band >= 4)   return 'Limited';
  return           'Intermittent';
}

// ─────────────────────────────────────────────────────────────────────────────

const AnswerSheet = ({ userAnswers = {}, testData = [], onRetry, onExit, moduleType = 'reading', serverEvaluation = null, testId = null, attemptId = null }) => {
  const [showCorrect, setShowCorrect] = useState(false);

  const allQuestions = useMemo(() => {
    const questions = [];
    testData.forEach((block) => {
      if (block.type === 'gap_fill') {
        const matches = block.content.match(/\{(\d+)\}/g) || [];
        matches.forEach((m) => {
          const num = m.replace(/\{|\}/g, '');
          const questionId = block.questionIds?.[parseInt(num, 10) - 1] || num;
          const correctAnswer = serverEvaluation?.results?.[num]?.correctAnswer || block.answers?.[num] || '';
          questions.push({ id: num, questionId, correctAnswer, blockId: block.id });
        });
      } else if (block.questions) {
        block.questions.forEach((q) => {
          if (q.numbers && Array.isArray(q.numbers) && q.numbers.length > 0) {
            // Expand multiple choice multiple (e.g. 21, 22) into individual questions
            q.numbers.forEach((num) => {
              const correctAnswer = serverEvaluation?.results?.[String(num)]?.correctAnswer || block.answers?.[String(num)] || '';
              questions.push({ id: String(num), questionId: String(num), correctAnswer, text: q.text, blockId: block.id, isMCM: true });
            });
          } else {
            const correctAnswer = serverEvaluation?.results?.[q.id]?.correctAnswer || block.answers?.[q.id] || '';
            questions.push({ id: q.id, questionId: q.id, correctAnswer, text: q.text, blockId: block.id });
          }
        });
      }
    });

    // Sort questions numerically to prevent unordered display due to text formatting
    questions.sort((a, b) => {
      const numA = parseInt(a.id, 10);
      const numB = parseInt(b.id, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return String(a.id).localeCompare(String(b.id));
    });

    return questions;
  }, [testData, serverEvaluation]);

  const results = useMemo(() => {
    let correct = 0, wrong = 0, unanswered = 0;

    // Use server validation if available (highly accurate), else fallback to client matching
    if (serverEvaluation?.results) {
      const detailed = allQuestions.map((q) => {
        const userAns = userAnswers[q.questionId] || userAnswers[q.id] || '';
        const serverData = serverEvaluation.results[q.questionId] || serverEvaluation.results[q.id];
        
        const isCorrect = serverData?.correct || false;
        const isUnanswered = !userAns || userAns.trim() === '';
        
        if (isUnanswered) { unanswered++; }
        else if (isCorrect) { correct++; } 
        else { wrong++; }

        return { ...q, userAnswer: userAns, isCorrect, isUnanswered };
      });
      return { correct, wrong, unanswered, total: allQuestions.length, detailed };
    }

    // Fallback Client-side matching
    const detailed = allQuestions.map((q) => {
      const userAns = userAnswers[q.questionId] || userAnswers[q.id] || '';
      const correctAns = q.correctAnswer;
      let isCorrect = false;
      const isUnanswered = !userAns || userAns.trim() === '';

      if (isUnanswered) {
        unanswered++;
      } else if (Array.isArray(correctAns)) {
        isCorrect = correctAns.some(ans => ans.toString().trim().toLowerCase() === userAns.toString().trim().toLowerCase());
        if (isCorrect) correct++; else wrong++;
      } else {
        isCorrect = userAns.toString().trim().toLowerCase() === correctAns.toString().trim().toLowerCase();
        if (isCorrect) correct++; else wrong++;
      }
      return { ...q, userAnswer: userAns, isCorrect, isUnanswered };
    });
    return { correct, wrong, unanswered, total: allQuestions.length, detailed };
  }, [allQuestions, userAnswers, serverEvaluation]);

  const bandScore = useMemo(() => {
    // Rely on server band if possible, since it might use half-bands accurately
    if (serverEvaluation?.band) return parseFloat(serverEvaluation.band);

    return moduleType === 'listening'
      ? getListeningBand(results.correct)
      : getReadingBand(results.correct);
  }, [results.correct, moduleType, serverEvaluation]);

  const bandColor = getBandColor(bandScore);
  const bandLabel = getBandLabel(bandScore);
  const percentage = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 48px', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── SCORE HERO CARD ── */}
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
        border: '1px solid #e5e7eb',
        marginBottom: 24,
        background: '#fff',
      }}>
        {/* Gradient top bar */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
          padding: '28px 32px',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', opacity: 0.75, textTransform: 'uppercase', marginBottom: 10 }}>
              {moduleType === 'listening' ? '🎧 Listening' : '📖 Reading'} Test Result
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: '-2px' }}>
                {bandScore.toFixed(1)}
              </span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, opacity: 0.9 }}>Band Score</div>
                <div style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '2px 10px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.20)',
                  fontSize: 12,
                  fontWeight: 600,
                }}>
                  {bandLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Band ring */}
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: bandColor.bg,
            border: `3px solid ${bandColor.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}>
            <Trophy style={{ width: 28, height: 28, color: bandColor.text }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: bandColor.text, marginTop: 2 }}>
              {bandScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #f0f0f0' }}>
          {[
            { icon: <Check style={{ width: 16, height: 16, color: '#10b981' }} />, value: results.correct, label: 'Correct', color: '#059669' },
            { icon: <X style={{ width: 16, height: 16, color: '#ef4444' }} />, value: results.wrong, label: 'Wrong', color: '#dc2626' },
            { icon: <Target style={{ width: 16, height: 16, color: '#6b7280' }} />, value: `${results.correct}/${results.total}`, label: `Score (${percentage}%)`, color: '#374151' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '20px 8px',
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid #f0f0f0' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                {stat.icon}
                <span style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</span>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ padding: '16px 28px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 8, fontWeight: 500 }}>
            <span>Progress</span>
            <span>{results.total - results.unanswered}/{results.total} answered</span>
          </div>
          <div style={{ height: 10, background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', display: 'flex' }}>
              <div style={{ width: `${(results.correct / results.total) * 100}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', transition: 'width 0.6s ease' }} />
              <div style={{ width: `${(results.wrong / results.total) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12 }}>
            {[
              { color: '#10b981', label: 'Correct' },
              { color: '#ef4444', label: 'Wrong' },
              { color: '#d1d5db', label: 'Unanswered' },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#6b7280', fontWeight: 500 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── ANSWER SHEET ── */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        marginBottom: 28,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <BarChart3 style={{ width: 18, height: 18, color: '#2563eb' }} />
            Answer Sheet
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Show Correct Answers</span>
            <button
              onClick={() => setShowCorrect(!showCorrect)}
              style={{
                position: 'relative', display: 'inline-flex',
                height: 24, width: 44,
                alignItems: 'center', borderRadius: 12,
                background: showCorrect ? '#2563eb' : '#d1d5db',
                border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                padding: 0,
              }}
            >
              <span style={{
                display: 'inline-block', height: 18, width: 18, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transform: showCorrect ? 'translateX(22px)' : 'translateX(3px)',
                transition: 'transform 0.2s',
              }} />
            </button>
          </label>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{
            columnWidth: '340px',
            columnGap: '24px',
          }}>
            {results.detailed.map((item) => {
              const bg = item.isCorrect ? '#f0fdf4' : item.isUnanswered ? '#f9fafb' : '#fff5f5';
              const numBg = item.isCorrect ? '#10b981' : item.isUnanswered ? '#e5e7eb' : '#fca5a5';
              const numColor = item.isCorrect ? '#fff' : item.isUnanswered ? '#9ca3af' : '#991b1b';
              const ansColor = item.isCorrect ? '#065f46' : item.isUnanswered ? '#9ca3af' : '#1f2937';

              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  marginBottom: '6px',
                  background: bg,
                  border: `1px solid ${item.isCorrect ? '#bbf7d0' : item.isUnanswered ? '#f3f4f6' : '#fecaca'}`,
                  breakInside: 'avoid',
                  pageBreakInside: 'avoid',
                }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: '50%',
                    background: numBg, color: numColor,
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {item.id}
                  </span>

                  <span style={{ fontWeight: 600, fontSize: 14, color: ansColor, minWidth: 40 }}>
                    {item.isUnanswered ? '—' : item.userAnswer}
                  </span>

                  {!item.isUnanswered && (
                    item.isCorrect
                      ? <Check style={{ width: 15, height: 15, color: '#10b981', flexShrink: 0 }} />
                      : <X style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0 }} />
                  )}

                  {showCorrect && !item.isCorrect && (
                    <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                      →
                      <span style={{ fontWeight: 700, color: '#10b981' }}>
                        {Array.isArray(item.correctAnswer) ? (item.isMCM ? item.correctAnswer.join(' / ') : item.correctAnswer[0]) : item.correctAnswer}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 10,
            border: '2px solid #2563eb', background: '#fff',
            color: '#2563eb', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#2563eb'; }}
        >
          <RotateCcw style={{ width: 16, height: 16 }} />
          Retry Test
        </button>
        {testId && attemptId && (
          <button
            onClick={() => window.location.href = `/dashboard/${moduleType}/${testId}/review/${attemptId}`}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 28px', borderRadius: 10,
              border: '2px solid #10b981', background: '#fff',
              color: '#10b981', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#10b981'; }}
          >
            <Eye style={{ width: 16, height: 16 }} />
            Review Test
          </button>
        )}
        <button
          onClick={onExit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', borderRadius: 10,
            border: '2px solid #2563eb', background: '#2563eb',
            color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
        >
          <LogOut style={{ width: 16, height: 16 }} />
          Back to Tests
        </button>
      </div>
    </div>
  );
};

export default AnswerSheet;
