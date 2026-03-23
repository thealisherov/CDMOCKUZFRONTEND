'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import HeadingDropZone from '@/components/ielts-questions/HeadingDropZone';
import MatchHeadings from '@/components/ielts-questions/MatchHeadings';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import ResizableSplitPane from '@/components/ResizableSplitPane';
import HighlightableContent from '@/components/HighlightableContent';
import IELTSOptionsModal from '@/components/ielts/IELTSOptionsModal';
import { useIELTSTheme } from '@/hooks/useIELTSTheme';
import { NotesProvider, useNotes } from '@/components/NotesContext';
import NotesSidebar from '@/components/ielts/NotesSidebar';


// Inner component that can access NotesContext
function ReadingTestInner({ id, rawData }) {
  const router  = useRouter();
  const { clearNotes } = useNotes();

  // Swap favicon while test is open
  useDynamicFavicon('/favicon.png');

  const { contrast, setContrast, textSize, setTextSize, getWrapperStyle } = useIELTSTheme();

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

  const [userAnswers,   setUserAnswers]   = useState({});
  const [submitted,     setSubmitted]     = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [activePassage, setActivePassage] = useState(0);
  const [optionsOpen,   setOptionsOpen]   = useState(false);

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [serverResult, setServerResult] = useState(null);
  const [savedAttemptId, setSavedAttemptId] = useState(null);

  const timerMinutes = rawData?.timer || 60;
  const passages     = rawData?.passages || [];

  const allBlocks = useMemo(() => {
    const blocks = [];
    passages.forEach(p => { if (p.questions) p.questions.forEach(q => blocks.push(q)); });
    return blocks;
  }, [passages]);

  const getBlockQCount = (block) => {
    if (!block) return 0;
    if (['gap_fill', 'drag_drop_summary', 'flow_chart', 'table'].includes(block.type)) {
      const matches = (block.content || '').match(/\{\d+\}/g);
      return matches ? matches.length : 0;
    }
    if (block.type === 'checkbox_multiple') {
      return (block.questions || []).reduce((s, q) => s + (q.numbers ? q.numbers.length : 1), 0);
    }
    return block.questions ? block.questions.length : 0;
  };

  const getStartIndex = useCallback((blockIndex) => {
    let start = 1;
    for (let i = 0; i < blockIndex; i++) {
      if (!allBlocks[i]) break;
      start += getBlockQCount(allBlocks[i]);
    }
    return start;
  }, [allBlocks]);

  const totalQuestions = useMemo(() => allBlocks.reduce((s, b) => s + getBlockQCount(b), 0), [allBlocks]);
  const questionNumbers = useMemo(() => Array.from({ length: totalQuestions }, (_, i) => i + 1), [totalQuestions]);

  const partQuestionRanges = useMemo(() => {
    const ranges = [];
    let cursor = 1;
    passages.forEach(p => {
      const count = (p.questions || []).reduce((s, b) => s + getBlockQCount(b), 0);
      ranges.push({ start: cursor, end: cursor + count - 1 });
      cursor += count;
    });
    return ranges;
  }, [passages]);

  const answeredIds = useMemo(() => (
    Object.entries(userAnswers)
      .filter(([, v]) => v !== undefined && v !== null && v.toString().trim() !== '')
      .map(([k]) => k)
  ), [userAnswers]);

  const answeredCount = answeredIds.length;
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const handleNavigate = useCallback((qNum) => {
    setCurrentQuestion(qNum);
    const el = document.getElementById(`question-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    for (let i = 0; i < partQuestionRanges.length; i++) {
      const r = partQuestionRanges[i];
      if (r && qNum >= r.start && qNum <= r.end) { setActivePassage(i); break; }
    }
  }, [partQuestionRanges]);

  const handleNext = currentQuestion < totalQuestions ? () => handleNavigate(currentQuestion + 1) : null;
  const handlePrev = currentQuestion > 1              ? () => handleNavigate(currentQuestion - 1) : null;

  const handleBlockAnswers = useCallback((answersOrId, value) => {
    if (typeof answersOrId === 'object' && answersOrId !== null) {
      setUserAnswers(prev => ({ ...prev, ...answersOrId }));
    } else {
      setUserAnswers(prev => ({ ...prev, [answersOrId]: value }));
    }
  }, []);

  const timerKey = `timer_reading_${id}`;
  const notesKey = `notes_reading_${id}`;

  /**
   * Hard-reset: clears EVERYTHING.
   * Called on intentional Exit, Retry, or timer expiry.
   */
  const clearAllTestData = useCallback(() => {
    // Timer
    try { localStorage.removeItem(timerKey); } catch { /* */ }
    // Notes/highlights (both context state and localStorage)
    clearNotes();
    try { localStorage.removeItem(notesKey); } catch { /* */ }
    // Answers & progress
    setUserAnswers({});
    setSubmitted(false);
    setActivePassage(0);
    setCurrentQuestion(1);
    setShowConfirm(false);
    setServerResult(null);
    setEvalError(null);
  }, [clearNotes, timerKey, notesKey]);

  const clearAllTestDataRef = useRef(clearAllTestData);
  useEffect(() => {
    clearAllTestDataRef.current = clearAllTestData;
  }, [clearAllTestData]);

  useEffect(() => {
    return () => {
      clearAllTestDataRef.current();
    };
  }, []);

  const handleSubmit = async () => { 
    setSubmitted(true);
    setShowConfirm(false);
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch(`/api/tests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers, type: 'reading' }),
      });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setServerResult(data);

      // Save attempt to Supabase
      try {
        const saveRes = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_numeric_id: Number(id),
            test_type: 'reading',
            test_title: rawData?.title || `Reading Test ${id}`,
            user_answers: userAnswers,
            server_results: data,
            correct_count: data.correct || 0,
            total_questions: data.total || totalQuestions,
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
  const handleRetry = () => { clearAllTestData(); };
  const handleExit  = useCallback(() => { clearAllTestData(); router.push('/dashboard/reading'); }, [clearAllTestData, router]);

  // Use ref to always capture latest userAnswers in timer callback
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // Timer expired: auto-submit answers (evaluate + save to DB)
  const handleTimerEnd = useCallback(async () => {
    const latestAnswers = userAnswersRef.current;
    try { localStorage.removeItem(`timer_reading_${id}`); } catch { /* */ }
    setSubmitted(true);
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch(`/api/tests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers: latestAnswers, type: 'reading' }),
      });
      if (!res.ok) throw new Error('Server returned ' + res.status);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setServerResult(data);

      // Save to Supabase
      try {
        const saveRes = await fetch('/api/attempts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            test_numeric_id: Number(id),
            test_type: 'reading',
            test_title: rawData?.title || `Reading Test ${id}`,
            user_answers: latestAnswers,
            server_results: data,
            correct_count: data.correct || 0,
            total_questions: data.total || totalQuestions,
            band_score: data.band || null,
          }),
        });
        if (saveRes.ok) {
          const savedData = await saveRes.json();
          if (savedData?.id) setSavedAttemptId(savedData.id);
        }
      } catch (saveErr) {
        console.warn('Could not save attempt after timer expire:', saveErr);
      }
    } catch (err) {
      console.error('[TimerExpire] Eval error:', err);
      setEvalError(err.message || 'Evaluation error');
    } finally {
      setIsEvaluating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, totalQuestions, rawData]);

  if (!rawData || rawData.isError) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Test not found</h2>
        <p className="text-gray-500 mb-4">Reading Test #{id} does not exist.</p>
        {rawData?.isError && (
          <pre className="text-left text-xs bg-gray-100 p-2 overflow-auto max-w-lg mb-4 text-red-600">
            {rawData.message}
            {'\n'}
            {rawData.stack}
          </pre>
        )}
        <Button onClick={handleExit}>Back to Tests</Button>
      </div>
    );
  }

  if (submitted) {
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
              <h2 className="text-xl font-bold text-blue-800 mb-2">Evaluating your answers...</h2>
              <p className="text-blue-600 max-w-sm mx-auto">
                Please wait while we cross-check your responses with the correct answers.
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
          ) : serverResult ? (
            <AnswerSheet userAnswers={userAnswers} testData={allBlocks} onRetry={handleRetry} onExit={handleExit} moduleType="reading" serverEvaluation={serverResult} testId={id} attemptId={savedAttemptId} />
          ) : null}
        </div>
      </div>
    );
  }

  const baseStyle = getWrapperStyle();
  const wrapperStyle = {
    ...baseStyle,
    fontSize: baseStyle.fontSize ? `calc(${baseStyle.fontSize} * 1.2)` : '19.2px'
  };
  
  const currentPassage = passages[activePassage];
  const currentBlocks  = currentPassage?.questions || [];
  let blockOffset = 0;
  for (let p = 0; p < activePassage; p++) blockOffset += (passages[p]?.questions?.length || 0);
  const activeRange = partQuestionRanges[activePassage];
  const rangeText   = activeRange ? `${activeRange.start}–${activeRange.end}` : '';

  return (
    <div
      className="ielts-test-view fixed inset-0 z-50 flex flex-col overflow-hidden"
      style={{
        ...wrapperStyle,
        background: 'var(--test-bg)',
        color: 'var(--test-fg)',
      }}
    >
      {/* ═══ HEADER ═══ */}
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

      <div style={{ background: 'var(--test-strip-bg)', color: 'var(--test-strip-fg)', border: '1px solid var(--test-border)' }} className="flex-none mx-6 mt-3 mb-2 px-5 py-2 rounded-sm">
        <p className="font-bold text-[13px]">
          {currentPassage?.passageNumber ? `Part ${currentPassage.passageNumber}` : `Part ${activePassage + 1}`}
        </p>
        <p className="text-[13px] mt-0.5">Read the text and answer questions {rangeText}.</p>
      </div>

      {/* ═══ SPLIT SCREEN ═══ */}
      <div className="flex-1 overflow-hidden min-h-0 mb-20" style={{ background: 'var(--test-bg)' }}>
        <ResizableSplitPane
          left={
            <div className="h-full overflow-y-auto" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
              {currentPassage?.image && (
                <div className="px-6 py-4">
                  <img 
                    src={currentPassage.image} 
                    alt="Passage visual" 
                    loading="lazy" 
                    decoding="async" 
                    className="w-full rounded border border-gray-200 shadow-md" 
                  />
                </div>
              )}
              {currentPassage?.title && !currentPassage.title.match(/^(Reading )?Passage \d+/i) && (
                <div style={{ borderBottom: '1px solid var(--test-border)' }} className="px-6 py-4">
                  <h2 className="font-bold text-[25px]" style={{ color: 'var(--test-fg)' }}>{currentPassage?.title}</h2>
                </div>
              )}

              <div className="px-6 pt-6 pb-32">
                <HighlightableContent className="max-w-none leading-relaxed" containerId="reading_passage">
                  {(currentPassage?.text || currentPassage?.content || '').split('\n\n').map((paragraph, idx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    const matchHeadingsBlock = currentBlocks.find(b => b.type === 'match_headings');
                    
                    // 1. Labelni aniqlash (Section 1, Paragraph A, yoki shunchaki A)
                    const sectionMatch = trimmed.match(/^(Section\s+(\d+|[A-ZIVX]+)|Paragraph\s+([A-Z]|\d+)|([A-Z])(?:\.|\s))\s*([\s\S]*)$/i);
                    
                    let headingQ = null;
                    let displayContent = trimmed;
                    let labelFound = "";

                    if (sectionMatch) {
                      labelFound = (sectionMatch[1] || '').trim().toUpperCase();
                      const contentAfterLabel = sectionMatch[5]?.trim();

                      if (matchHeadingsBlock?.questions) {
                        headingQ = matchHeadingsBlock.questions.find(q => {
                          const qt = q.text.toUpperCase();
                          // "Section 1" deb qidiradi yoki agar rasmdek bo'lsa "1" yoki "A"
                          return qt === labelFound || qt.includes(labelFound);
                        });
                      }

                      // Agar drop zone chiqsa, labelni matndan o'chirib tashlaymiz
                      if (headingQ) {
                        displayContent = contentAfterLabel;
                      }
                    }

                    return (
                      <div key={idx} className="mb-6">
                        {headingQ && (
                          <div className="mb-2">
                            <HeadingDropZone 
                              questionId={headingQ.id} 
                              globalNum={headingQ.id} 
                              onDrop={handleBlockAnswers} 
                              currentAnswer={userAnswers[headingQ.id]} 
                            />
                          </div>
                        )}
                        <p className="font-medium leading-[1.85]" style={{ fontSize: '1em', color: 'var(--test-fg)' }}>
                          {!headingQ && labelFound && (
                            <strong style={{ fontWeight: 900, marginRight: '8px' }}>{sectionMatch[1]}</strong>
                          )}
                          {displayContent}
                        </p>
                      </div>
                    );
                  })}
                </HighlightableContent>
              </div>
            </div>
          }
          right={
            <div className="h-full overflow-y-auto" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
              <div className="px-6 pt-6 pb-32">
                <div className="mb-4">
                  <h3 className="font-bold text-sm">Questions {rangeText}</h3>
                </div>
                <div className="space-y-6">
                  <HighlightableContent containerId="reading_questions">
                    {currentBlocks.map((block, blockIndex) => {
                    const blockStartIndex = getStartIndex(blockOffset + blockIndex);
                    if (block.type === 'match_headings') {
                      return (
                        <div key={block.id} id={`question-${blockStartIndex}`}>
                          {block.instruction && <p className="font-bold mb-3" style={{ fontSize: '1.2em' }}>{block.instruction}</p>}
                          <MatchHeadings data={block} onAnswer={handleBlockAnswers} startIndex={blockStartIndex} userAnswers={userAnswers} />
                        </div>
                      );
                    }
                    return (
                      <div key={block.id} id={`question-${blockStartIndex}`}>
                        {block.instruction && <p className="font-bold mb-3" style={{ fontSize: '1.2em' }}>{block.instruction}</p>}
                        <QuestionRenderer data={block} startIndex={blockStartIndex} onAnswersChange={handleBlockAnswers} userAnswers={userAnswers} layout="stacked" />
                      </div>
                    );
                  })}
                  </HighlightableContent>
                </div>
              </div>
            </div>
          }
        />
      </div>

      {/* ═══ BOTTOM NAVIGATOR ═══ */}
      <TestNavigator
        parts={passages.map((_, i) => `Part ${i + 1}`)}
        activePart={activePassage}
        onPartChange={setActivePassage}
        questionNumbers={questionNumbers}
        answeredIds={answeredIds}
        partQuestionRanges={partQuestionRanges}
        onSubmit={() => setShowConfirm(true)}
        currentQuestion={currentQuestion}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      {/* Submit Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div style={{ background: 'var(--opts-bg)', color: 'var(--opts-fg)', borderColor: 'var(--opts-border)' }} className="rounded-lg p-6 max-w-md mx-4 shadow-xl border">
            <div className="flex items-center gap-3 mb-4">
              <div style={{ background: 'var(--test-strip-bg)' }} className="w-10 h-10 rounded-full flex items-center justify-center">
                <Send className="w-5 h-5" style={{ color: 'var(--test-fg)' }} />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'var(--opts-fg)' }}>Submit Answers?</h3>
                <p className="text-sm opacity-60">{answeredCount} of {totalQuestions} answered.</p>
              </div>
            </div>
            {answeredCount < totalQuestions && (
              <div 
                className="border rounded p-3 mb-4" 
                style={{ 
                  backgroundColor: contrast === 'yellow-on-black' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                  borderColor: contrast === 'yellow-on-black' ? '#ffff00' : '#fbbf24'
                }}
              >
                <p className="text-sm flex items-center gap-2" style={{ color: contrast === 'yellow-on-black' ? '#ffff00' : '#b45309' }}>
                  <AlertTriangle className="w-4 h-4" />
                  {totalQuestions - answeredCount} unanswered question(s).
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


export default function ReadingTestClient({ id, rawData }) {
  return (
    <NotesProvider testId={`reading_${id}`}>
      <ReadingTestInner id={id} rawData={rawData} />
    </NotesProvider>
  );
}