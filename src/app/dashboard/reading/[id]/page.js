'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle, Menu } from 'lucide-react';

function loadTestData(testId) {
  try {
    return require(`@/data/reading/reading${testId}.json`);
  } catch {
    return null;
  }
}

export default function ReadingTestPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const rawData = loadTestData(id);

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activePassage, setActivePassage] = useState(0);

  const timerMinutes = rawData?.timer || 60;
  const passages = rawData?.passages || [];

  // Flatten all blocks
  const allBlocks = useMemo(() => {
    const blocks = [];
    passages.forEach(p => { if (p.questions) p.questions.forEach(q => blocks.push(q)); });
    return blocks;
  }, [rawData]);

  // Get question count for a block
  const getBlockQCount = (block) => {
    if (block.type === 'gap_fill') {
      const matches = block.content.match(/\{\d+\}/g);
      return matches ? matches.length : 0;
    } else if (block.questions) {
      return block.questions.length;
    }
    return 0;
  };

  // Global start index for a block by flat index
  const getStartIndex = useCallback((blockIndex) => {
    let start = 1;
    for (let i = 0; i < blockIndex; i++) {
      if (!allBlocks[i]) break;
      start += getBlockQCount(allBlocks[i]);
    }
    return start;
  }, [allBlocks]);

  const totalQuestions = useMemo(() => {
    return allBlocks.reduce((s, b) => s + getBlockQCount(b), 0);
  }, [allBlocks]);

  // Question numbers [1..40]
  const questionNumbers = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  }, [totalQuestions]);

  // Part (passage) question ranges
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
  const handleRetry = () => { setUserAnswers({}); setSubmitted(false); setActivePassage(0); };
  const handleExit = () => router.push('/dashboard/reading');
  const handleTimerExpire = () => setSubmitted(true);


  if (!rawData) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#333' }}>Test not found</h2>
        <p className="text-gray-500 mb-4">Reading Test #{id} does not exist.</p>
        <Button onClick={() => router.push('/dashboard/reading')}>Back to Tests</Button>
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
            testData={allBlocks}
            onRetry={handleRetry}
            onExit={handleExit}
            moduleType="reading"
          />
        </div>
      </div>
    );
  }

  const currentPassage = passages[activePassage];
  const currentBlocks = currentPassage?.questions || [];

  // Block offset for current passage
  let blockOffset = 0;
  for (let p = 0; p < activePassage; p++) {
    blockOffset += (passages[p]?.questions?.length || 0);
  }

  // Get question range text for current passage (e.g., "1–13")
  const activeRange = partQuestionRanges[activePassage];
  const rangeText = activeRange ? `${activeRange.start}–${activeRange.end}` : '';

  // ── TEST VIEW ──
  return (
    <div className="ielts-test-view fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col overflow-hidden">
      {/* ═══ IELTS HEADER — dark bar ═══ */}
      <div className="flex-none bg-[#1a1a1a] text-white px-4 py-2 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="bg-[#c00] text-white text-xs font-black px-2 py-0.5 tracking-wider">IELTS</span>
            <span className="text-sm font-medium hidden sm:inline">{rawData.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} />
            <button
              onClick={() => router.push('/dashboard/reading')}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ PART INDICATOR — light gray strip ═══ */}
      <div className="flex-none bg-[#e8e8e8] border-b border-[#ccc] px-5 py-3">
        <p className="font-bold text-[#333] text-sm">Part {activePassage + 1}</p>
        <p className="text-[#666] text-xs mt-0.5">Read the text and answer questions {rangeText}.</p>
      </div>

      {/* ═══ SPLIT SCREEN — passage left | questions right ═══ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 pb-17">
        {/* Left — Passage */}
        <div className="flex-1 md:w-1/2 overflow-y-auto bg-white border-r border-[#ddd]">
          {/* Passage title */}
          <div className="sticky top-0 z-10 bg-white border-b border-[#e0e0e0] px-6 py-3">
            <h2 className="font-bold text-[#333] text-base">{currentPassage?.title}</h2>
          </div>
          <div className="px-6 py-5">
            <div className="max-w-none leading-relaxed">
              {currentPassage?.text?.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-[0.95rem] leading-[1.85] text-[#333]" style={{ fontFamily: 'Georgia, serif' }}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Questions */}
        <div className="flex-1 md:w-1/2 overflow-y-auto bg-white">
          <div className="px-6 py-5">
            {/* Questions header */}
            <div className="mb-4">
              <h3 className="font-bold text-sm text-[#333]">Questions {rangeText}</h3>
            </div>

            <div className="space-y-6">
              {currentBlocks.map((block, idx) => (
                <div key={block.id}>
                  {/* Block instruction */}
                  {block.instruction && (
                    <p className="text-sm text-[#555] mb-3">{block.instruction}</p>
                  )}
                  <QuestionRenderer
                    data={block}
                    startIndex={getStartIndex(blockOffset + idx)}
                    onAnswersChange={handleBlockAnswers}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM NAVIGATOR — IELTS style dark ═══ */}
      <TestNavigator
        parts={passages.map((_, i) => `Part ${i + 1}`)}
        activePart={activePassage}
        onPartChange={setActivePassage}
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
                <p className="text-sm text-gray-500">{answeredCount} of {totalQuestions} answered.</p>
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
