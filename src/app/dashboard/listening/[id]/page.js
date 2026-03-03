'use client';

import { use, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle, Volume2, Menu } from 'lucide-react';
import { adaptListeningData } from '@/utils/listeningDataAdapter';

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

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activePartIndex, setActivePartIndex] = useState(0);

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

  const handleBlockAnswers = useCallback((answers) => {
    setUserAnswers((prev) => ({ ...prev, ...answers }));
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

  // ── TEST VIEW ──
  return (
    <div className="ielts-test-view fixed inset-0 z-50 bg-white flex flex-col">
      {/* ═══ IELTS HEADER — white bar ═══ */}
      <div className="flex-none bg-white text-gray-900 border-b border-gray-200 px-6 py-3 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[#e22d2d] text-2xl font-black tracking-wider mr-4">IELTS</span>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 leading-tight">Test taker ID</span>
              <span className="text-[11px] text-gray-600 flex items-center mt-0.5">
                <Volume2 className="w-3 h-3 mr-1" /> Audio is playing
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-gray-700">
            <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} />
            <button className="hover:text-black transition-colors" title="Settings/Network">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button className="hover:text-black transition-colors" title="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <button
              onClick={() => router.push('/dashboard/listening')}
              className="hover:text-black transition-colors"
              title="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PART INDICATOR STRIP — light gray ═══ */}
      <div className="flex-none bg-[#f3f4f3] border border-gray-200 w-full lg:w-1/2 mx-6 mt-4 px-6 py-4 rounded-sm">
        <p className="font-bold text-gray-900 text-[14px]">{currentPart?.label || 'Part 1'}</p>
        <p className="text-gray-800 text-[13px] mt-1">
          {visibleSections[0]?.instruction || 'Listen and answer the questions.'}
        </p>
      </div>

      {/* ═══ AUDIO PLAYER ═══ */}
      <div className="flex-none bg-white px-6 py-2 hidden">
        <div className="w-full lg:w-1/2">
          <AudioPlayer src="/audio/sample.mp3" />
        </div>
      </div>

      {/* ═══ MAIN CONTENT — white background, left aligned ═══ */}
      <div className="flex-1 overflow-y-auto pb-24 bg-white">
        <div className="w-full lg:w-1/2 px-8 py-4">
          {visibleSections.map((block) => (
            <div key={block.id} className="mb-8">
              {/* Section title */}
              {block.title && (
                <div className="mb-4">
                  <h3 className="font-bold text-[#333] text-[15px]">{block.title}</h3>
                  {block.instruction && (
                    <p className="text-[13px] text-[#555] mt-1">{block.instruction}</p>
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
                startIndex={getStartIndex(block.id)}
                onAnswersChange={handleBlockAnswers}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ BOTTOM NAVIGATOR — IELTS style ═══ */}
      <TestNavigator
        parts={parts.map(p => p.label)}
        activePart={activePartIndex}
        onPartChange={setActivePartIndex}
        questionNumbers={questionNumbers}
        answeredIds={answeredIds}
        partQuestionRanges={partQuestionRanges}
        onSubmit={() => setShowConfirm(true)}
      />

      {/* Submit Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                <Send className="w-5 h-5 text-[#333]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#333]">Submit Answers?</h3>
                <p className="text-sm text-gray-500">
                  {answeredCount} of {totalQuestions} answered.
                </p>
              </div>
            </div>
            {answeredCount < totalQuestions && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {totalQuestions - answeredCount} unanswered question(s).
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-[#333] hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmit} className="px-4 py-2 rounded bg-[#333] text-white text-sm font-semibold hover:bg-[#222]">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
