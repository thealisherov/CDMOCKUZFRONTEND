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

function loadTestData(testId) {
  try {
    return require(`@/data/listening/listening${testId}.json`);
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

  // Group sections into logical parts
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

  const handlePrevPart = () => { if (activePartIndex > 0) setActivePartIndex(activePartIndex - 1); };
  const handleNextPart = () => { if (activePartIndex < parts.length - 1) setActivePartIndex(activePartIndex + 1); };

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
    <div className="ielts-test-view fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col">
      {/* ═══ IELTS HEADER — dark bar ═══ */}
      <div className="flex-none bg-[#1a1a1a] text-white px-4 py-2 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* IELTS Logo */}
            <span className="bg-[#c00] text-white text-xs font-black px-2 py-0.5 tracking-wider">IELTS</span>
            <span className="text-sm font-medium hidden sm:inline">{rawData.title}</span>
            <span className="text-xs text-gray-400 hidden md:inline">
              <Volume2 className="w-3 h-3 inline mr-1" />Audio is playing
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} />
            <button
              onClick={() => router.push('/dashboard/listening')}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PART INDICATOR STRIP — light gray ═══ */}
      <div className="flex-none bg-[#e8e8e8] border-b border-[#ccc] px-5 py-3">
        <p className="font-bold text-[#333] text-sm">{currentPart?.label || 'Part 1'}</p>
        <p className="text-[#666] text-xs mt-0.5">
          {visibleSections[0]?.instruction || 'Listen and answer the questions.'}
        </p>
      </div>

      {/* ═══ AUDIO PLAYER ═══ */}
      <div className="flex-none bg-white border-b border-[#ddd] px-4 py-2">
        <div className="max-w-3xl mx-auto">
          <AudioPlayer src="/audio/sample.mp3" />
        </div>
      </div>

      {/* ═══ MAIN CONTENT — white background ═══ */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-3xl mx-auto px-5 py-6">
          {visibleSections.map((block) => (
            <div key={block.id} className="mb-8">
              {/* Section title */}
              {block.title && (
                <div className="mb-4">
                  <h3 className="font-bold text-[#333] text-base">{block.title}</h3>
                  {block.instruction && (
                    <p className="text-sm text-[#555] mt-1">{block.instruction}</p>
                  )}
                </div>
              )}

              {/* Legend */}
              {block.legend && block.legend.length > 0 && (
                <div className="mb-4 p-3 bg-[#fafafa] border border-[#e0e0e0] rounded">
                  {block.legend.map((item, i) => (
                    <p key={i} className="text-sm text-[#444] leading-6">{item}</p>
                  ))}
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
        onPrevPage={activePartIndex > 0 ? handlePrevPart : undefined}
        onNextPage={activePartIndex < parts.length - 1 ? handleNextPart : undefined}
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
