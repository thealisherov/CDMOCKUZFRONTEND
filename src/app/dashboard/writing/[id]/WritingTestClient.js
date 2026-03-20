'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Send, Trophy, Check, X, Target, BarChart3, RotateCcw, LogOut, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Timer from '@/components/Timer';
import ResizableSplitPane from '@/components/ResizableSplitPane';
import HighlightableContent from '@/components/HighlightableContent';
import TestNavigator from '@/components/TestNavigator';
import IELTSOptionsModal from '@/components/ielts/IELTSOptionsModal';
import { useIELTSTheme } from '@/hooks/useIELTSTheme';
import { NotesProvider, useNotes } from '@/components/NotesContext';
import NotesSidebar from '@/components/ielts/NotesSidebar';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import { createClient } from '@/utils/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

/**
 * Word counter
 */
function countWords(text) {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}

const MIN_WORDS = { 1: 150, 2: 250 };

function getBandColor(band) {
  const b = parseFloat(band) || 0;
  if (b >= 8)   return { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }; // emerald
  if (b >= 7)   return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }; // blue
  if (b >= 6)   return { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' }; // violet
  if (b >= 5)   return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' }; // yellow
  if (b >= 4)   return { bg: '#ffedd5', text: '#9a3412', border: '#fdba74' }; // orange
  return      { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };         // red
}

function getBandLabel(band) {
  const b = parseFloat(band) || 0;
  if (b >= 9)   return 'Expert';
  if (b >= 8)   return 'Very Good';
  if (b >= 7)   return 'Good';
  if (b >= 6)   return 'Competent';
  if (b >= 5)   return 'Modest';
  if (b >= 4)   return 'Limited';
  return      'Intermittent';
}

/**
 * Inner component with NotesContext access
 */
function WritingTestInner({ id, rawData, isReviewMode = false, initialEssays = {}, initialEvaluation = null }) {
  const router = useRouter();
  const { clearNotes } = useNotes();

  const { contrast, setContrast, textSize, setTextSize, getWrapperStyle } = useIELTSTheme();
  useDynamicFavicon('/favicon.png');

  // Fetch user email for "Test taker ID"
  const [userEmail, setUserEmail] = useState('');
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data?.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  // Security: Prevent copy, cut, paste, and context menu
  useEffect(() => {
    const preventAction = (e) => e.preventDefault();
    document.addEventListener('copy', preventAction);
    document.addEventListener('cut', preventAction);
    document.addEventListener('paste', preventAction);
    document.addEventListener('contextmenu', preventAction);
    return () => {
      document.removeEventListener('copy', preventAction);
      document.removeEventListener('cut', preventAction);
      document.removeEventListener('paste', preventAction);
      document.removeEventListener('contextmenu', preventAction);
    };
  }, []);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [activeTaskIndex, setActiveTaskIndex] = useState(0);
  const [submitted, setSubmitted] = useState(isReviewMode);
  const [showConfirm, setShowConfirm] = useState(false);
  const [essays, setEssays] = useState(initialEssays);

  // AI Evaluation states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(initialEvaluation);
  const [evalError, setEvalError] = useState(null);
  const [savedAttemptId, setSavedAttemptId] = useState(null);

  const timerKey = `timer_writing_${id}`;
  const notesKey = `notes_writing_${id}`;
  const timerMinutes = rawData?.timer || 60;
  const tasks = rawData?.tasks || [];

  const currentTask = tasks[activeTaskIndex];
  const currentEssay = essays[activeTaskIndex] || '';
  const currentWordCount = countWords(currentEssay);
  const currentMinWords = MIN_WORDS[currentTask?.taskNumber] || 150;

  // Auto-resize textarea
  const textareaRef = useRef(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.max(240, ta.scrollHeight) + 'px';
    }
  }, [currentEssay, activeTaskIndex]);

  // Build parts array for TestNavigator (same structure as reading/listening)
  const parts = useMemo(() => tasks.map(t => t.title || `Part ${t.taskNumber}`), [tasks]);

  // Each "task" has exactly 1 question slot for the navigator
  const questionNumbers = useMemo(() => tasks.map((_, i) => i + 1), [tasks]);

  const partQuestionRanges = useMemo(() =>
    tasks.map((_, i) => ({ start: i + 1, end: i + 1 })),
  [tasks]);

  // Answered = has text written
  const answeredIds = useMemo(() =>
    tasks
      .map((_, i) => countWords(essays[i] || '') > 0 ? String(i + 1) : null)
      .filter(Boolean),
  [tasks, essays]);

  const [currentQuestion, setCurrentQuestion] = useState(1);

  const handleNavigate = useCallback((qNum) => {
    setCurrentQuestion(qNum);
    setActiveTaskIndex(qNum - 1);
  }, []);

  const handleNext = activeTaskIndex < tasks.length - 1 ? () => handleNavigate(currentQuestion + 1) : null;
  const handlePrev = activeTaskIndex > 0 ? () => handleNavigate(currentQuestion - 1) : null;

  const handleEssayChange = useCallback((text) => {
    setEssays(prev => ({ ...prev, [activeTaskIndex]: text }));
  }, [activeTaskIndex]);



  const handleSubmit = async () => { 
    // ── Validate: at least one task must have text ────────────────────────
    const hasAnyEssay = tasks.some((_, i) => countWords(essays[i] || '') > 0);
    if (!hasAnyEssay) {
      toast.error(
        tasks.length > 1
          ? 'Iltimos, kamida bitta task uchun essay yozing!'
          : 'Iltimos, essayingizni yozing!',
        {
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            padding: '14px 20px',
            border: '1px solid #ef4444',
          },
          iconTheme: { primary: '#ef4444', secondary: '#fff' },
        }
      );
      return;
    }

    setSubmitted(true);
    setShowConfirm(false);
    setIsEvaluating(true);
    setEvalError(null);

    try {
      // Send user answers to the secure backend AI endpoint
      const res = await fetch(`/api/tests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers: essays, type: 'writing' }),
      });

      if (!res.ok) {
        throw new Error('Server returned ' + res.status);
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEvaluationResult(data);

      try {
        const saveRes = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_numeric_id: Number(id),
            test_type: 'writing',
            test_title: rawData?.title || `Writing Test ${id}`,
            user_answers: essays,
            server_results: data,
            correct_count: 0,
            total_questions: tasks.length || 0,
            band_score: data.band || null,
          }),
        });
        if (saveRes.ok) {
          const savedData = await saveRes.json();
          if (savedData?.id) setSavedAttemptId(savedData.id);
        }
      } catch (saveErr) {
        console.warn('Could not save attempt:', saveErr);
      }
    } catch (err) {
      console.error(err);
      setEvalError(err.message || 'Baholashda xatolik yuz berdi');
    } finally {
      setIsEvaluating(false);
      try { localStorage.removeItem(timerKey); } catch { /* */ }
    }
  };

  const clearAllTestData = useCallback(() => {
    try { localStorage.removeItem(timerKey); } catch { /* */ }
    clearNotes();
    try { localStorage.removeItem(notesKey); } catch { /* */ }
    setEssays({});
    setSubmitted(false);
    setActiveTaskIndex(0);
    setCurrentQuestion(1);
    setShowConfirm(false);
    setEvaluationResult(null);
    setEvalError(null);
  }, [clearNotes, timerKey, notesKey]);

  const handleRetry = () => { clearAllTestData(); };
  const handleExit = useCallback(() => { clearAllTestData(); router.push('/dashboard/writing'); }, [clearAllTestData, router]);
  // Timer expired: just submit current essays (don't clear first!)
  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;
  const handleTimerEnd = useCallback(() => { handleSubmitRef.current(); }, []);

  // ── NOT FOUND ──
  if (!rawData) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#333' }}>Test not found</h2>
        <p className="text-gray-500 mb-4">Writing Test #{id} does not exist.</p>
        <Button onClick={() => router.push('/dashboard/writing')}>Back to Tests</Button>
      </div>
    );
  }

  // ── SUBMITTED ──
  if (submitted) {
    const totalWords = tasks.reduce((sum, _, idx) => sum + countWords(essays[idx] || ''), 0);
    const bandLabel = getBandLabel(evaluationResult?.band);
    const bandColor = getBandColor(evaluationResult?.band);

    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#333' }}>{rawData.title} — Results</h1>
            <Button variant="outline" onClick={handleExit} disabled={isEvaluating}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          </div>

          {isEvaluating ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-10 mb-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-bold text-blue-800 mb-2">Analyzing your essays...</h2>
              <p className="text-blue-600 max-w-sm mx-auto">
                Our certified IELTS AI Examiner is evaluating your Task Achievement, Coherence, Lexical Resource, and Grammar. This usually takes 10-20 seconds.
              </p>
            </div>
          ) : evalError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
               <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
               <h2 className="text-lg font-bold text-red-800 mb-1">Evaluation Failed</h2>
               <p className="text-red-600">{evalError}</p>
               <div className="flex gap-3 justify-center mt-6">
                 <Button variant="outline" onClick={handleSubmit} className="h-12 px-8">Try Again</Button>
                 <Button onClick={handleExit} className="h-12 px-8">Back to Dashboard</Button>
               </div>
            </div>
          ) : evaluationResult ? (
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '0px 16px 48px', fontFamily: 'Inter, system-ui, sans-serif' }}>
              
              {/* ── SCORE HERO CARD ── */}
              <div style={{
                borderRadius: 20, overflow: 'hidden',
                boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
                border: '1px solid #e5e7eb',
                marginBottom: 24,
                background: '#fff',
              }}>
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
                      ✍️ Writing Test Result
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                      <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: '-2px' }}>
                        {parseFloat(evaluationResult.band).toFixed(1)}
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
                      {parseFloat(evaluationResult.band).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ padding: '20px 8px', textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                      <Check style={{ width: 16, height: 16, color: '#10b981' }} />
                      <span style={{ fontSize: 26, fontWeight: 800, color: '#059669' }}>{tasks.length}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Tasks Completed</p>
                  </div>
                  <div style={{ padding: '20px 8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                      <FileText style={{ width: 16, height: 16, color: '#3b82f6' }} />
                      <span style={{ fontSize: 26, fontWeight: 800, color: '#1d4ed8' }}>{totalWords}</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>Total Words Written</p>
                  </div>
                </div>
              </div>

              {/* ── ANSWER SHEET (ESSAY EVALUATION) ── */}
              <div style={{
                background: '#fff',
                borderRadius: 20,
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                marginBottom: 28,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  padding: '16px 24px', borderBottom: '1px solid #f0f0f0',
                  background: '#fafafa',
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                    <MessageSquare style={{ width: 18, height: 18, color: '#2563eb' }} />
                    Examiner Feedback
                  </h3>
                </div>

                <div>
                  {tasks.map((task, idx) => {
                    const essay = essays[idx] || '';
                    const wc = countWords(essay);
                    const min = MIN_WORDS[task.taskNumber] || 150;
                    const evalData = evaluationResult?.tasksEvaluation?.[idx];
                    
                    return (
                      <div key={idx} style={{ borderBottom: idx === tasks.length - 1 ? 'none' : '4px solid #f3f4f6' }}>
                        <div style={{ padding: '16px 24px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                          <h4 style={{ fontWeight: 700, fontSize: 16, color: '#111827', margin: 0 }}>{task.title}</h4>
                          <span style={{ fontSize: 13, fontFamily: 'monospace', padding: '4px 12px', borderRadius: 20, background: wc >= min ? '#d1fae5' : '#fee2e2', color: wc >= min ? '#065f46' : '#991b1b', fontWeight: 600 }}>
                            {wc} / {min}+ words
                          </span>
                        </div>

                        {evalData && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', borderBottom: '1px solid #f0f0f0' }}>
                            <div style={{ padding: '24px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                               <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Task Band Score</span>
                               <span style={{ fontSize: 48, fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>{evalData.BandScore || '0.0'}</span>
                            </div>
                            <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 24px', background: '#fff' }}>
                               <div>
                                 <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Task {task.taskNumber === 1 ? 'Achievement' : 'Response'}</div>
                                 <div style={{ fontWeight: 700, fontSize: 20, color: '#0f172a' }}>{task.taskNumber === 1 ? evalData.TaskAchievement : evalData.TaskResponse}</div>
                               </div>
                               <div>
                                 <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Coherence & Cohesion</div>
                                 <div style={{ fontWeight: 700, fontSize: 20, color: '#0f172a' }}>{evalData.CoherenceAndCohesion}</div>
                               </div>
                               <div>
                                 <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Lexical Resource</div>
                                 <div style={{ fontWeight: 700, fontSize: 20, color: '#0f172a' }}>{evalData.LexicalResource}</div>
                               </div>
                               <div>
                                 <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Grammatical Range</div>
                                 <div style={{ fontWeight: 700, fontSize: 20, color: '#0f172a' }}>{evalData.GrammaticalRangeAndAccuracy || evalData.GrammaticalRange}</div>
                               </div>
                            </div>
                          </div>
                        )}

                        {evalData?.Feedback && (
                          <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #fef3c7',
                            background: evalData.Feedback === 'No response provided.'
                              ? '#f8fafc'
                              : evalData.Feedback.startsWith('AI feedback parsing')
                              ? '#fff7ed'
                              : '#fffbeb',
                          }}>
                            <h5 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 12px 0', color: '#92400e', fontSize: 14 }}>
                              Examiner Comments
                            </h5>
                            {/* No essay written */}
                            {evalData.Feedback === 'No response provided.' ? (
                              <p style={{ fontSize: 14, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>
                                No essay was submitted for this task.
                              </p>
                            ) : evalData.Feedback.startsWith('AI feedback parsing') ? (
                              /* Parsing failed */
                              <p style={{ fontSize: 14, color: '#b45309', fontWeight: 600, margin: 0 }}>
                                ⚠️ {evalData.Feedback}
                              </p>
                            ) : (
                              /* Real feedback — criterion-by-criterion */
                              <div style={{ fontSize: 14, lineHeight: 1.7, color: '#78350f' }}>
                                {evalData.Feedback.split('\n').map((line, li) => {
                                  if (!line.trim()) return <br key={li} />;
                                  const criterionMatch = line.match(/^(Task\s*(Achievement|Response)|Coherence.*Cohesion|Lexical\s*Resource|Grammatical.*Accuracy)\s*:/i);
                                  if (criterionMatch) {
                                    const colonIdx = line.indexOf(':');
                                    const label = line.slice(0, colonIdx);
                                    const rest = line.slice(colonIdx + 1).trim();
                                    return (
                                      <p key={li} style={{ margin: '0 0 10px 0' }}>
                                        <span style={{ fontWeight: 700, color: '#92400e' }}>{label}:</span>
                                        {rest ? ' ' + rest : ''}
                                      </p>
                                    );
                                  }
                                  return <p key={li} style={{ margin: '0 0 8px 0', fontWeight: 500 }}>{line}</p>;
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ padding: '24px', background: '#fff' }}>
                          <h5 style={{ fontWeight: 700, color: '#334155', margin: '0 0 12px 0', fontSize: 14 }}>Your Essay</h5>
                          {essay ? (
                            <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.8, color: '#1e293b', background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap' }}>
                              {essay}
                            </div>
                          ) : (
                            <div style={{ fontStyle: 'italic', color: '#94a3b8', background: '#f8fafc', padding: 20, borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                              No response written.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── ACTION BUTTONS ── */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={handleRetry}
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
                <button
                  onClick={handleExit}
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
                  Back to Dashboard
                </button>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    );
  }

  // ── MAIN TEST UI ──
  const baseStyle = getWrapperStyle();
  const wrapperStyle = {
    ...baseStyle,
    fontSize: baseStyle.fontSize ? `calc(${baseStyle.fontSize} * 1.2)` : '19.2px'
  };

  return (
    <div
      className="ielts-test-view fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{ ...wrapperStyle, background: 'var(--test-bg)', color: 'var(--test-fg)' }}
    >
      {/* ═══ HEADER — IDENTICAL to Reading ═══ */}
      <div style={{ background: 'var(--test-header-bg)', color: 'var(--test-header-fg)', borderBottom: '1px solid var(--test-border)' }} className="flex-none px-4 py-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span style={{ color: '#e22d2d', fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>IELTS</span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>{userEmail || 'Test taker ID'}</span>
          </div>
          <div className="flex items-center gap-6">
            <Timer initialMinutes={timerMinutes} onExpire={handleTimerEnd} storageKey={timerKey} />
            {/* Wifi */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.8 }}>
              <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
            {/* Bell */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.8 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {/* Notes Toggle */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('TOGGLE_NOTES_SIDEBAR'))}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--test-header-fg)', padding: '4px' }}
              title="Notes"
            >
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
            </button>
            {/* Menu */}
            <button
              onClick={() => setOptionsOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--test-header-fg)', padding: '4px' }}
              title="Options"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PART INDICATOR — IDENTICAL to Reading ═══ */}
      <div style={{ background: 'var(--test-strip-bg)', color: 'var(--test-strip-fg)', border: '1px solid var(--test-border)' }} className="flex-none mx-6 mt-3 mb-2 px-5 py-2 rounded-sm">
        <p className="font-bold text-[13px]">
          Part {currentTask?.taskNumber || activeTaskIndex + 1}
        </p>
        <p className="text-[13px] mt-0.5">
          {currentTask?.taskNumber === 1
            ? 'You should spend about 20 minutes on this task. Write at least 150 words.'
            : 'You should spend about 40 minutes on this task. Write at least 250 words.'
          }
        </p>
      </div>

      {/* ═══ SPLIT SCREEN — IDENTICAL to Reading ═══ */}
      <div className="flex-1 overflow-hidden min-h-0 mb-20" style={{ background: 'var(--test-bg)' }}>
        <ResizableSplitPane
          left={
            <div className="h-full overflow-y-auto" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
              <div className="px-6 pt-6 pb-32">
                <HighlightableContent className="max-w-none leading-relaxed" containerId="writing_prompt">
                  {/* Task instruction text */}
                  {currentTask?.content && currentTask.content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-[16.5px] font-medium leading-[1.85] mb-4" style={{ fontFamily: 'Georgia, serif', color: 'var(--test-fg)' }}>
                      {paragraph}
                    </p>
                  ))}

                  {/* Task image (chart/diagram for Task 1) */}
                  {currentTask?.image && (
                    <div className="mt-6 mb-6">
                      <img
                        src={currentTask.image}
                        alt="Task visual"
                        className="w-full max-w-[550px] rounded border border-gray-200 shadow-sm"
                      />
                    </div>
                  )}
                </HighlightableContent>
              </div>
            </div>
          }
          right={
            <div className="h-full overflow-y-auto" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
              <div className="px-4 pt-4 pb-32">
                {/* Bordered textarea box — resizable vertically, min-height matches screenshot */}
                <textarea
                  ref={textareaRef}
                  className="w-full p-4 outline-none leading-relaxed text-[28px]"
                  style={{
                    background: 'var(--test-panel-bg)',
                    color: 'var(--test-fg)',
                    fontFamily: 'Georgia, serif',
                    border: '1px solid #999',
                    minHeight: '240px',
                    resize: 'none',
                    overflow: 'hidden',
                    display: 'block',
                  }}
                  placeholder="Start typing your essay here..."
                  value={currentEssay}
                  onChange={(e) => handleEssayChange(e.target.value)}
                  spellCheck="true"
                />
                {/* Word count — below textarea, scrolls with content */}
                <div className="flex justify-end mt-2 pr-1">
                  <span className="text-[13px]" style={{ color: 'var(--test-fg)', opacity: 0.7 }}>
                    Words: {currentWordCount}
                  </span>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ═══ BOTTOM NAVIGATOR — IDENTICAL to Reading/Listening ═══ */}
      <TestNavigator
        parts={parts}
        activePart={activeTaskIndex}
        onPartChange={(idx) => { setActiveTaskIndex(idx); setCurrentQuestion(idx + 1); }}
        questionNumbers={questionNumbers}
        answeredIds={answeredIds}
        partQuestionRanges={partQuestionRanges}
        onSubmit={() => setShowConfirm(true)}
        currentQuestion={currentQuestion}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {/* ═══ Submit Modal — IDENTICAL to Reading/Listening ═══ */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div style={{ background: 'var(--opts-bg)', color: 'var(--opts-fg)', borderColor: 'var(--opts-border)' }} className="rounded-lg p-6 max-w-md mx-4 shadow-xl border">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ background: 'var(--test-strip-bg)' }} className="w-10 h-10 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5" style={{ color: 'var(--test-fg)' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--opts-fg)' }}>Submit Essay?</h3>
                <p className="text-sm opacity-60">
                  {tasks.map((t, i) => `${t.title}: ${countWords(essays[i] || '')} words`).join(' · ')}
                </p>
              </div>
            </div>
            {tasks.some((t, i) => countWords(essays[i] || '') < (MIN_WORDS[t.taskNumber] || 150)) && (
              <div
                className="border rounded p-3 mb-4"
                style={{
                  backgroundColor: contrast === 'yellow-on-black' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  borderColor: contrast === 'yellow-on-black' ? '#ffff00' : '#fbbf24'
                }}
              >
                <p className="text-sm flex items-center gap-2" style={{ color: contrast === 'yellow-on-black' ? '#ffff00' : '#b45309' }}>
                  <AlertTriangle className="w-4 h-4" />
                  Some tasks are below the minimum word count.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border text-sm font-medium transition-colors"
                style={{ borderColor: 'var(--opts-border)', backgroundColor: 'transparent', color: 'var(--opts-fg)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--test-header-bg)', color: 'var(--test-header-fg)', border: '1px solid var(--test-border)' }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Options Modal */}
      <IELTSOptionsModal
        isOpen={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        onExit={handleExit}
        onSubmit={() => setShowConfirm(true)}
        contrast={contrast}
        onContrastChange={setContrast}
        textSize={textSize}
        onTextSizeChange={setTextSize}
      />
      <NotesSidebar />
    </div>
  );
}


export default function WritingTestClient({ id, rawData, isReviewMode = false, initialEssays = {}, initialEvaluation = null }) {
  return (
    <NotesProvider testId={`writing_${id}`}>
      <Toaster position="top-center" />
      <WritingTestInner 
        id={id} 
        rawData={rawData} 
        isReviewMode={isReviewMode} 
        initialEssays={initialEssays} 
        initialEvaluation={initialEvaluation} 
      />
    </NotesProvider>
  );
}
