'use client';

import { use, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle, Volume2, Menu, Play } from 'lucide-react';
import { adaptListeningData } from '@/utils/listeningDataAdapter';

import IELTSOptionsModal from '@/components/ielts/IELTSOptionsModal';
import { useIELTSTheme } from '@/hooks/useIELTSTheme';

function loadTestData(testId) {
  try {
    const raw = require(`@/data/listening/listening${testId}.json`);
    return adaptListeningData(raw);
  } catch {
    return null;
  }
}

export default function ListeningTestPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const rawData = loadTestData(id);

  const { contrast, setContrast, textSize, setTextSize, getWrapperStyle } = useIELTSTheme();
  const [optionsOpen, setOptionsOpen] = useState(false);

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);

  const [isStarted, setIsStarted] = useState(false);
  const timerMinutes = rawData?.timer || 40;

  const allSections = useMemo(() => rawData?.sections || [], [rawData]);

  // Group sections into logical parts by their title (e.g. "Part 1", "Part 2")
  const parts = useMemo(() => {
    if (!allSections.length) return [];
    const grouped = [];
    let currentPartLabel = null;
    let currentPartSections = [];

    allSections.forEach(section => {
      const match = section.title?.match(/^(Section|Part) \d+/i);
      const label = match ? match[0] : (currentPartLabel || 'Part 1');
      if (label !== currentPartLabel) {
        if (currentPartLabel) {
          grouped.push({ label: currentPartLabel, sections: currentPartSections });
        }
        currentPartLabel = label;
        currentPartSections = [section];
      } else {
        currentPartSections.push(section);
      }
    });
    if (currentPartSections.length > 0) {
      grouped.push({ label: currentPartLabel, sections: currentPartSections });
    }
    return grouped;
  }, [allSections]);

  useEffect(() => {
    if (activePartIndex >= parts.length && parts.length > 0) setActivePartIndex(0);
  }, [parts.length, activePartIndex]);

  // Get question count for a single section block
  const getBlockQCount = (block) => {
    if (block.type === 'gap_fill') {
      const matches = block.content.match(/\{\d+\}/g);
      return matches ? matches.length : 0;
    } else if (block.questions) {
      return block.questions.length;
    }
    return 0;
  };

  // Calculate global start index by section id
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

  // Question numbers array [1,2,3,...,40]
  const questionNumbers = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  }, [totalQuestions]);

  // Part question ranges for TestNavigator
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

  // Answered IDs
  const answeredIds = useMemo(() => {
    return Object.entries(userAnswers)
      .filter(([, v]) => v !== undefined && v !== null && v.toString().trim() !== '')
      .map(([k]) => k);
  }, [userAnswers]);

  const answeredCount = answeredIds.length;

  // Track current question for navigator highlight + Prev/Next buttons
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const handleNavigate = useCallback((qNum) => {
    setCurrentQuestion(qNum);
    const el = document.getElementById(`question-${qNum}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Auto-switch part if needed
    for (let i = 0; i < partQuestionRanges.length; i++) {
      const r = partQuestionRanges[i];
      if (r && qNum >= r.start && qNum <= r.end) { setActivePartIndex(i); break; }
    }
  }, [partQuestionRanges]);

  const handleNext = currentQuestion < totalQuestions ? () => handleNavigate(currentQuestion + 1) : null;
  const handlePrev = currentQuestion > 1 ? () => handleNavigate(currentQuestion - 1) : null;

  const handleBlockAnswers = useCallback((answers) => {
    setUserAnswers((prev) => {
      const updated = { ...prev, ...answers };
      // Auto-advance currentQuestion when a question is first answered
      const newlyAnswered = Object.entries(answers)
        .filter(([k, v]) => v !== undefined && v !== null && v.toString().trim() !== '' && !prev[k])
        .map(([k]) => Number(k))
        .filter(Boolean);
      if (newlyAnswered.length > 0) {
        setCurrentQuestion(Math.max(...newlyAnswered));
      }
      return updated;
    });
  }, []);

  const handleSubmit = () => { setSubmitted(true); setShowConfirm(false); };
  const handleRetry = () => { setUserAnswers({}); setSubmitted(false); setActivePartIndex(0); };
  const handleExit = () => router.push('/dashboard/listening');
  const handleTimerExpire = () => setSubmitted(true);


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

  // ── RESULT VIEW ──
  if (submitted) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#333' }}>{rawData.title} — Results</h1>
            <Button variant="outline" onClick={handleExit}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </div>
          <AnswerSheet
            userAnswers={userAnswers}
            testData={allSections}
            onRetry={handleRetry}
            onExit={handleExit}
            moduleType="listening"
          />
        </div>
      </div>
    );
  }

  const currentPart = parts[activePartIndex];
  const visibleSections = currentPart ? currentPart.sections : [];

  const wrapperStyle = getWrapperStyle();

  // ── TEST VIEW ──
  return (
    <div
      className="ielts-test-view fixed inset-0 z-50 flex flex-col"
      style={{ ...wrapperStyle, background: 'var(--test-bg)', color: 'var(--test-fg)' }}
    >
      {/* ═══ IELTS HEADER — white bar ═══ */}
      <div style={{ background: 'var(--test-header-bg)', color: 'var(--test-header-fg)', borderBottom: '1px solid var(--test-border)' }} className="flex-none px-6 py-4 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span style={{ color: '#e22d2d' }} className="text-3xl font-black tracking-wider mr-4">IELTS</span>
            <div className="flex flex-col">
              <span style={{ color: 'var(--test-header-fg)' }} className="text-[15px] font-bold leading-tight">Test taker ID</span>
              <span className="text-[12px] flex items-center mt-0.5 opacity-80">
                <Volume2 className="w-4 h-4 mr-1" /> Audio is playing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-7">
            {isStarted && <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} />}
            {!isStarted && <div className="text-[20px] font-bold font-mono px-4 py-1.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--test-header-fg)' }}>{timerMinutes}:00</div>}
            <button className="hover:opacity-100 opacity-70 transition-colors" title="Settings/Network" style={{ color: 'var(--test-header-fg)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button className="hover:opacity-100 opacity-70 transition-colors" title="Notifications" style={{ color: 'var(--test-header-fg)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            {/* Menu / hamburger → opens options */}
            <button
              onClick={() => setOptionsOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--test-header-fg, #fff)', padding: '4px' }}
              title="Options"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PART INDICATOR STRIP — light gray ═══ */}
      <div style={{ background: 'var(--test-strip-bg)', color: 'var(--test-strip-fg)', border: '1px solid var(--test-border)' }} className="flex-none w-full lg:w-1/2 mx-6 mt-3 mb-2 px-5 py-2 rounded-sm">
        <p className="font-bold text-[13px]">{currentPart?.label || 'Part 1'}</p>
        <p className="text-[13px] mt-0.5">
          {visibleSections[0]?.instruction || 'Listen and answer the questions.'}
        </p>
      </div>

      {/* ═══ START OVERLAY ═══ */}
      {!isStarted && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-[2px]" 
          style={{ backgroundColor: 'rgba(50, 50, 50, 0.7)' }}
        >
          <div className="max-w-4xl px-8 text-center flex flex-col items-center">
            {/* Headphones Icon */}
            <div className="mb-6 text-white">
              <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>

            <p className="text-[20px] font-bold leading-relaxed mb-8 text-white">
              You will be listening to an audio clip during this test. You will not be permitted to pause or rewind the audio while answering the questions.
            </p>
            
            <p className="text-[18px] mb-6 font-medium text-white">
              To continue, click Play.
            </p>

            <button 
              onClick={() => setIsStarted(true)}
              className="flex items-center gap-3 px-10 py-3 rounded text-[18px] font-bold shadow-2xl hover:bg-gray-800 transition-all active:scale-95 border border-gray-600"
              style={{ backgroundColor: '#000', color: '#fff' }}
            >
              <Play className="w-6 h-6 fill-current" />
              Play
            </button>
          </div>
        </div>
      )}

      {/* ═══ AUDIO PLAYER (Hidden) ═══ */}
      <AudioPlayer src={rawData.audio || "/audio/sample.mp3"} playSignal={isStarted} />

      {/* ═══ MAIN CONTENT — white background, left aligned ═══ */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ background: 'var(--test-panel-bg)', color: 'var(--test-fg)' }}>
        <div className="w-full lg:w-1/2 px-8 py-4">
          {visibleSections.map((block) => {
              const blockStart = getStartIndex(block.id);
              return (
                <div key={block.id} className="mb-8">
                  {/* Invisible anchor for each question in this block */}
                  {Array.from({ length: (() => {
                    if (block.type === 'gap_fill') {
                      const m = (block.content || '').match(/\{\d+\}/g);
                      return m ? m.length : 0;
                    }
                    return (block.questions || []).length;
                  })() }, (_, i) => (
                    <span key={i} id={`question-${blockStart + i}`} className="block h-0 -mt-4 mb-4" />
                  ))}

                  {/* Section title */}
                  {block.title && (
                    <div className="mb-4">
                      <h3 className="font-bold text-[22px]">{block.title}</h3>
                      {block.instruction && (
                        <p className="text-[22px] font-bold mt-1 opacity-80">{block.instruction}</p>
                      )}
                    </div>
                  )}

                  {/* Image (map, plan, etc.) */}
                  {block.image && (
                    <div className="mb-4">
                      <img src={block.image} alt="Question visual" className="max-w-full rounded border border-gray-200" />
                    </div>
                  )}

                  <QuestionRenderer
                    data={block}
                    startIndex={blockStart}
                    onAnswersChange={handleBlockAnswers}
                  />
                </div>
              );
            })}

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
        onExit={() => router.push('/dashboard/listening')}
        onSubmit={() => setShowConfirm(true)}
        contrast={contrast}
        onContrastChange={setContrast}
        textSize={textSize}
        onTextSizeChange={setTextSize}
      />
    </div>
  );
}
