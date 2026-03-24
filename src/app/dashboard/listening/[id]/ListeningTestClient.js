'use client';

import { use, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle, Volume2 } from 'lucide-react';
import { adaptListeningData } from '@/utils/listeningDataAdapter';

import IELTSOptionsModal from '@/components/ielts/IELTSOptionsModal';
import { useIELTSTheme } from '@/hooks/useIELTSTheme';
import { NotesProvider, useNotes } from '@/components/NotesContext';
import NotesSidebar from '@/components/ielts/NotesSidebar';
import HighlightableContent from '@/components/HighlightableContent';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import { usePersistedState } from '@/hooks/usePersistedState';
import { createClient } from '@/utils/supabase/client';


// Data is passed as props from the Server Component


// Inner component that can access the NotesContext
function ListeningTestInner({ id, rawData }) {
  const router = useRouter();
  const { clearNotes } = useNotes();
  const audioPlayerRef = useRef(null);

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

  useDynamicFavicon('/favicon.png');
  const [optionsOpen, setOptionsOpen] = usePersistedState(`opts_listening_${id}`, false);

  // ── Persisted state (survives refresh) ───────────────────────────────────
  const [userAnswers,    setUserAnswers,    clearAnswers]    = usePersistedState(`answers_listening_${id}`,  {});
  const [submitted,      setSubmitted,      clearSubmitted]  = usePersistedState(`submitted_listening_${id}`, false);
  const [activePartIndex,setActivePartIndex,clearActivePart] = usePersistedState(`part_listening_${id}`,     0);
  // isStarted is NOT persisted — browser autoplay policy requires a user gesture each page load
  const [isStarted, setIsStarted] = useState(false);
  // savedAudioPos is read client-side only (after mount) to avoid hydration mismatch
  const [savedAudioPos, setSavedAudioPos] = useState(0);
  const [showConfirm,    setShowConfirm]                     = usePersistedState(`confirm_listening_${id}`,   false);
  
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [serverResult, setServerResult] = useState(null);
  const [savedAttemptId, setSavedAttemptId] = useState(null);
  // ─────────────────────────────────────────────────────────────────────────

  const timerKey = `timer_listening_${id}`;
  const notesKey  = `notes_listening_${id}`;
  const audioKey  = `audio_pos_listening_${id}`;
  const timerMinutes = rawData?.timer || 40;

  // Read saved audio position once on mount (client-only, avoids hydration mismatch)
  useEffect(() => {
    try {
      const s = localStorage.getItem(audioKey);
      if (s) {
        const t = parseFloat(s);
        if (!isNaN(t) && t > 0) setSavedAudioPos(t);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioKey]);

  /**
   * Hard-reset: clears EVERYTHING.
   * Only called on intentional Exit OR timer expiry.
   */
  const clearAllTestData = useCallback(() => {
    // FIRST: Stop audio & its save interval to prevent it from writing back
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAndReset();
    }
    // Timer
    try { localStorage.removeItem(timerKey); } catch { /* */ }
    // Notes/highlights (both context state and localStorage)
    clearNotes();
    try { localStorage.removeItem(notesKey); } catch { /* */ }
    // Answers & progress
    clearAnswers();
    clearSubmitted();
    clearActivePart();
    setIsStarted(false);
    setSavedAudioPos(0);
    try { localStorage.removeItem(`started_listening_${id}`); } catch { /* */ }
    try { localStorage.removeItem(audioKey); } catch { /* */ }
    // Clear all persisted state keys
    try { localStorage.removeItem(`confirm_listening_${id}`); } catch { /* */ }
    try { localStorage.removeItem(`opts_listening_${id}`); } catch { /* */ }
    try { localStorage.removeItem(`cq_listening_${id}`); } catch { /* */ }
    setServerResult(null);
    setEvalError(null);
  }, [clearNotes, timerKey, notesKey, audioKey, clearAnswers, clearSubmitted, clearActivePart, id]);

  // Removed unmount clearAllTestData so refreshing doesn't clear answers

  const allSections = useMemo(() => rawData?.sections || [], [rawData]);

  const parts = useMemo(() => {
    if (!allSections.length) return [];
    const grouped = [];
    let currentLabel = null;
    let currentSections = [];

    allSections.forEach(section => {
      // Prioritize partLabel from adapter, fallback to title regex
      const label = section.partLabel || section.title?.match(/^(Section|Part) \d+/i)?.[0] || (currentLabel || 'Part 1');
      if (label !== currentLabel) {
        if (currentLabel) {
          grouped.push({ label: currentLabel, sections: currentSections });
        }
        currentLabel = label;
        currentSections = [section];
      } else {
        currentSections.push(section);
      }
    });

    if (currentSections.length > 0) {
      grouped.push({ label: currentLabel, sections: currentSections });
    }
    return grouped;
  }, [allSections]);

  useEffect(() => {
    if (activePartIndex >= parts.length && parts.length > 0) setActivePartIndex(0);
  }, [parts.length, activePartIndex]);

  const getBlockQCount = (block) => {
    if (['gap_fill', 'drag_drop_summary', 'flow_chart', 'table'].includes(block.type)) {
      const m = block.content?.match(/\{\d+\}/g);
      return m ? m.length : 0;
    }
    if (block.type === 'checkbox_multiple' && block.questions) {
      // Each sub-question covers multiple question numbers
      return block.questions.reduce((sum, q) => sum + (q.numbers ? q.numbers.length : 1), 0);
    }
    if (block.questions) {
      return block.questions.length;
    }
    return 0;
  };

  const getStartIndex = useCallback((sectionId) => {
    let start = 1;
    for (let i = 0; i < allSections.length; i++) {
      if (allSections[i].id === sectionId) break;
      start += getBlockQCount(allSections[i]);
    }
    return start;
  }, [allSections]);

  const totalQuestions = useMemo(() => {
    return allSections.reduce((sum, b) => sum + getBlockQCount(b), 0);
  }, [allSections]);

  const questionNumbers = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  }, [totalQuestions]);

  const partQuestionRanges = useMemo(() => {
    const ranges = [];
    let cursor = 1;
    parts.forEach(part => {
      const count = part.sections.reduce((s, b) => s + getBlockQCount(b), 0);
      ranges.push({ start: cursor, end: cursor + count - 1 });
      cursor += count;
    });
    return ranges;
  }, [parts]);

  const answeredIds = useMemo(() => {
    return Object.entries(userAnswers)
      .filter(([, v]) => v !== undefined && v !== null && v.toString().trim() !== '')
      .map(([k]) => k);
  }, [userAnswers]);

  const answeredCount = answeredIds.length;

  const [currentQuestion, setCurrentQuestion] = usePersistedState(`cq_listening_${id}`, 1);

  const handleNavigate = useCallback((qNum) => {
    setCurrentQuestion(qNum);
    const el = document.getElementById(`question-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    for (let i = 0; i < partQuestionRanges.length; i++) {
      const r = partQuestionRanges[i];
      if (r && qNum >= r.start && qNum <= r.end) { setActivePartIndex(i); break; }
    }
  }, [partQuestionRanges]);

  const handleNext = currentQuestion < totalQuestions ? () => handleNavigate(currentQuestion + 1) : null;
  const handlePrev = currentQuestion > 1             ? () => handleNavigate(currentQuestion - 1) : null;

  const handleBlockAnswers = useCallback((answersOrId, value) => {
    setUserAnswers((prev) => {
      const answersObj = typeof answersOrId === 'object' && answersOrId !== null
        ? answersOrId
        : { [answersOrId]: value };

      const updated = { ...prev, ...answersObj };
      const newlyAnswered = Object.entries(answersObj)
        .filter(([k, v]) => v !== undefined && v !== null && v.toString().trim() !== '' && !prev[k])
        .map(([k]) => Number(k))
        .filter(Boolean);
      if (newlyAnswered.length > 0) {
        setCurrentQuestion(Math.max(...newlyAnswered));
      }
      return updated;
    });
  }, []);

  // Submit: Fetch eval results
  const handleSubmit = async () => {
    setSubmitted(true);
    setShowConfirm(false);
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch(`/api/tests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers, type: 'listening' }),
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
            test_type: 'listening',
            test_title: rawData?.title || `Listening Test ${id}`,
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

  // Retry from results page: full reset
  const handleRetry = () => {
    clearAllTestData();
  };

  // Exit via button: full reset, navigate away
  const handleExit = useCallback(() => {
    clearAllTestData();
    router.push('/dashboard/listening');
  }, [clearAllTestData, router]);

  // Use ref to always capture latest userAnswers (avoids stale closure in timer callback)
  const userAnswersRef = useRef(userAnswers);
  userAnswersRef.current = userAnswers;

  // Timer expired: auto-submit (evaluate + save)
  const handleTimerExpire = useCallback(async () => {
    const latestAnswers = userAnswersRef.current;
    // Stop audio first
    if (audioPlayerRef.current) {
      audioPlayerRef.current.stopAndReset();
    }
    try { localStorage.removeItem(timerKey); } catch { /* */ }
    
    // Trigger full submit (evaluate + save to DB)
    setSubmitted(true);
    setIsEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch(`/api/tests/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAnswers: latestAnswers, type: 'listening' }),
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
            test_type: 'listening',
            test_title: rawData?.title || `Listening Test ${id}`,
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
  }, [id, totalQuestions, rawData, timerKey, audioPlayerRef]);


  if (!rawData) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#333' }}>Test not found</h2>
        <p className="text-gray-500 mb-4">Listening Test #{id} does not exist.</p>
        <Button onClick={() => router.push('/dashboard/listening')}>Back to Tests</Button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#333' }}>{rawData.title} — Results</h1>
            <Button variant="outline" onClick={handleExit} disabled={isEvaluating}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
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
            <AnswerSheet
              userAnswers={userAnswers}
              testData={allSections}
              onRetry={handleRetry}
              onExit={handleExit}
              moduleType="listening"
              serverEvaluation={serverResult}
              testId={id}
              attemptId={savedAttemptId}
            />
          ) : null}
        </div>
      </div>
    );
  }

  const currentPart = parts[activePartIndex];
  const visibleSections = currentPart ? currentPart.sections : [];

  const baseStyle = getWrapperStyle();
  const wrapperStyle = {
    ...baseStyle,
    fontSize: baseStyle.fontSize ? `calc(${baseStyle.fontSize} * 1.25)` : '20px'
  };

  return (
    <div
      className="ielts-test-view fixed inset-0 z-50 flex flex-col"
      style={{ ...wrapperStyle, background: 'var(--test-bg)', color: 'var(--test-fg)' }}
    >
    {/* ═══ HEADER ═══ */}
    <div style={{ background: 'var(--test-header-bg)', color: 'var(--test-header-fg)', borderBottom: '1px solid var(--test-border)' }} className="flex-none px-6 py-4 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span style={{ color: '#e22d2d' }} className="text-3xl font-black tracking-wider mr-4">IELTS</span>
          <div className="flex flex-col">
            <span style={{ color: 'var(--test-header-fg)' }} className="text-[15px] font-bold leading-tight">{userEmail || 'Test taker ID'}</span>
            <span className="text-[12px] flex items-center mt-0.5 opacity-80">
              <Volume2 className="w-4 h-4 mr-1" /> Audio is playing
            </span>
          </div>
        </div>
        <div className="flex items-center gap-7">
          {isStarted && <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} storageKey={timerKey} />}
          {!isStarted && (
            <div className="text-[20px] font-bold font-mono px-4 py-1.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--test-header-fg)' }}>
              {timerMinutes}:00
            </div>
          )}
          <button className="hover:opacity-100 opacity-70 transition-colors" title="Settings" style={{ color: 'var(--test-header-fg)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button className="hover:opacity-100 opacity-70 transition-colors" title="Notifications" style={{ color: 'var(--test-header-fg)' }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
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
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--test-header-fg, #fff)', padding: '4px' }}
            title="Options"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    {/* ═══ PART INDICATOR ═══ */}
    <div className="flex-none px-6 lg:px-10 pt-6 pb-1" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
      <div
        style={{ background: 'var(--test-strip-bg)', borderColor: 'var(--test-border)' }}
        className="border rounded px-5 py-3"
      >
        <p className="font-bold text-[16px] leading-tight mb-1">{currentPart?.label || 'Part 1'}</p>
        <p className="text-[15px] leading-tight">
          {visibleSections[0]?.questionRange
            ? `Listen and answer questions ${visibleSections[0].questionRange}`
            : 'Listen and answer the questions.'}
        </p>
      </div>
    </div>

    {/* ═══ START OVERLAY ═══ */}
    {!isStarted && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center font-sans"
        style={{ backgroundColor: 'rgba(80, 80, 80, 0.6)' }}
      >
        <div className="flex flex-col items-center text-center" style={{ maxWidth: 560, padding: '0 32px' }}>
          <div style={{ marginBottom: 32 }}>
            <svg width="108" height="108" viewBox="0 0 64 64" fill="white">
              <path d="M32 4C17.64 4 6 15.64 6 30v18a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6V36a6 6 0 0 0-6-6h-3.8C13.08 19.56 21.72 12 32 12s18.92 7.56 19.8 18H48a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6V30C58 15.64 46.36 4 32 4z"/>
            </svg>
          </div>
          {savedAudioPos > 0 ? (
            <>
              <p style={{ color: '#f5f5f5', fontSize: 17, fontWeight: 600, marginBottom: 10 }}>
                Your session was interrupted.
              </p>
              <p style={{ color: '#f5f5f5', fontSize: 15, fontWeight: 400, lineHeight: 1.65, marginBottom: 18, maxWidth: 490 }}>
                The audio will resume from {Math.floor(savedAudioPos / 60)}:{String(Math.floor(savedAudioPos % 60)).padStart(2, '0')} into the recording.
              </p>
            </>
          ) : (
            <p style={{ color: '#f5f5f5', fontSize: 16, fontWeight: 400, lineHeight: 1.65, marginBottom: 18, maxWidth: 490 }}>
              You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
            </p>
          )}
          <p style={{ color: '#f5f5f5', fontSize: 15, fontWeight: 400, marginBottom: 30 }}>
            {savedAudioPos > 0 ? 'Click Resume to continue.' : 'To continue, click Play.'}
          </p>
          <button
            onClick={() => {
              setIsStarted(true);
              if (audioPlayerRef.current && audioPlayerRef.current.playAudio) {
                audioPlayerRef.current.playAudio();
              }
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              backgroundColor: '#0d0d0d', color: '#ffffff',
              border: 'none', borderRadius: 5,
              padding: '11px 30px', fontSize: 16, fontWeight: 600,
              cursor: 'pointer', transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2a2a'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d0d0d'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            {savedAudioPos > 0 ? 'Resume' : 'Play'}
          </button>
        </div>
      </div>
    )}

    {/* ═══ AUDIO PLAYER ═══ */}
    <AudioPlayer
      ref={audioPlayerRef}
      src={rawData.audio || "/audio/sample.mp3"}
      playSignal={isStarted}
      storageKey={audioKey}
    />

    {/* ═══ MAIN CONTENT ═══ */}
    <div className="flex-1 overflow-y-auto pb-24" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
      <div className="w-full px-6 lg:px-10 pt-4 py-8 max-w-[1600px]">
        <HighlightableContent containerId="listening_content">
          {visibleSections.map((block) => {
            const blockStart = getStartIndex(block.id);
            const isSideBySide = block.image && (block.type === 'radio_matrix' || block.type === 'true_false');

            return (
              <div key={block.id} className="mb-14">
                {Array.from({ length: (() => {
                  if (block.type === 'gap_fill') {
                    const m = (block.content || '').match(/\{\d+\}/g);
                    return m ? m.length : 0;
                  }
                  return (block.questions || []).length;
                })() }, (_, i) => (
                  <span key={i} id={`question-${blockStart + i}`} className="block h-0 -mt-4" />
                ))}

                {(block.title || block.instruction) && (
                  <div className="mb-8">
                    {block.title && !block.title.match(/^(Section|Part) \d+/i) && (
                      <h3 className="font-bold mb-1" style={{ fontSize: '1.4em' }}>{block.title}</h3>
                    )}
                    {block.instruction && (
                      <p className="font-bold opacity-80 leading-snug" style={{ fontSize: '1.2em' }}>{block.instruction}</p>
                    )}
                  </div>
                )}

                <div className={isSideBySide ? "flex flex-col lg:flex-row justify-between items-start" : "flex flex-col"}>
                  {block.image && (
                    <div className={isSideBySide ? "lg:w-[47.5%] w-full flex-shrink-0" : "w-full mb-8"}>
                      <img
                        src={block.image}
                        alt="Question visual"
                        className="w-full rounded border border-gray-200 shadow-lg"
                      />
                    </div>
                  )}

                  <div className={isSideBySide ? "lg:w-[47.5%] w-full min-w-0" : "w-full"}>
                    <QuestionRenderer
                      data={block}
                      startIndex={blockStart}
                      onAnswersChange={handleBlockAnswers}
                      userAnswers={userAnswers}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </HighlightableContent>
      </div>
    </div>

    {/* ═══ BOTTOM NAVIGATOR ═══ */}
    <TestNavigator
      parts={parts.map(p => p.label)}
      activePart={activePartIndex}
      onPartChange={setActivePartIndex}
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
              <p className="text-sm opacity-60">
                {answeredCount} of {totalQuestions} answered.
              </p>
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


export default function ListeningTestClient({ id, rawData }) {
  return (
    <NotesProvider testId={`listening_${id}`}>
      <ListeningTestInner id={id} rawData={rawData} />
    </NotesProvider>
  );
}