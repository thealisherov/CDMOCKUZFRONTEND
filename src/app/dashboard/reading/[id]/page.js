'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import HeadingDropZone from '@/components/ielts-questions/HeadingDropZone';
import MatchHeadings from '@/components/ielts-questions/MatchHeadings';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle, Menu } from 'lucide-react';
import ResizableSplitPane from '@/components/ResizableSplitPane';
import HighlightableContent from '@/components/HighlightableContent';
import { adaptReadingData } from '@/utils/readingDataAdapter';

function loadTestData(testId) {
  try {
    const raw = require(`@/data/reading/reading${testId}.json`);
    return adaptReadingData(raw);
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

  const allBlocks = useMemo(() => {
    const blocks = [];
    passages.forEach(p => {
      if (p.questions) p.questions.forEach(q => blocks.push(q));
    });
    return blocks;
  }, [passages]);

  const getBlockQCount = (block) => {
    if (!block) return 0;
    if (block.type === 'gap_fill' || block.type === 'drag_drop_summary') {
      // Count {N} placeholders in content
      const matches = block.content?.match(/\{\d+\}/g);
      return matches ? matches.length : 0;
    } else if (block.type === 'checkbox_multiple') {
      // Each question in checkbox_multiple has a 'numbers' array
      return (block.questions || []).reduce((sum, q) => {
        return sum + (q.numbers ? q.numbers.length : 1);
      }, 0);
    } else if (block.questions) {
      return block.questions.length;
    }
    return 0;
  };

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

  const questionNumbers = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => i + 1);
  }, [totalQuestions]);

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

  const answeredIds = useMemo(() => {
    return Object.entries(userAnswers)
      .filter(([, v]) => v !== undefined && v !== null && v.toString().trim() !== '')
      .map(([k]) => k);
  }, [userAnswers]);

  const answeredCount = answeredIds.length;

  // Current question tracking for navigator highlight + next/prev
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
  const handlePrev = currentQuestion > 1 ? () => handleNavigate(currentQuestion - 1) : null;

  // handleBlockAnswers: accepts either a full answers object (from QuestionRenderer)
  // or an individual (questionId, value) call (from child components directly)
  // When a question is answered for the first time, auto-advance currentQuestion tracker
  const handleBlockAnswers = useCallback((answersOrId, value) => {
    if (typeof answersOrId === 'object' && answersOrId !== null) {
      // Called with whole answers map { "1": "A", "2": "B" }
      setUserAnswers((prev) => {
        const updated = { ...prev, ...answersOrId };
        // Find the highest newly-answered qNum and set it as current
        const newlyAnswered = Object.entries(answersOrId)
          .filter(([k, v]) => v !== undefined && v !== null && v.toString().trim() !== '' && !prev[k])
          .map(([k]) => Number(k))
          .filter(Boolean);
        if (newlyAnswered.length > 0) {
          const highest = Math.max(...newlyAnswered);
          setCurrentQuestion(highest);
        }
        return updated;
      });
    } else {
      // Called with individual questionId and value
      const qNum = Number(answersOrId);
      setUserAnswers((prev) => {
        const isNew = !prev[answersOrId] || prev[answersOrId].toString().trim() === '';
        const hasValue = value !== undefined && value !== null && value.toString().trim() !== '';
        // Auto-advance: when answering a question for the first time, set it as current
        if (isNew && hasValue && qNum) setCurrentQuestion(qNum);
        return { ...prev, [answersOrId]: value };
      });
    }
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

  let blockOffset = 0;
  for (let p = 0; p < activePassage; p++) {
    blockOffset += (passages[p]?.questions?.length || 0);
  }

  const activeRange = partQuestionRanges[activePassage];
  const rangeText = activeRange ? `${activeRange.start}–${activeRange.end}` : '';

  return (
    <div className="ielts-test-view fixed inset-0 z-50 bg-[#f5f5f5] flex flex-col overflow-hidden">

      {/* ═══ HEADER ═══ */}
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

      {/* ═══ PART INDICATOR ═══ */}
      <div className="flex-none bg-[#f2f3f2] border border-gray-200 mx-6 mt-3 mb-2 px-5 py-2 rounded-sm">
        <p className="font-bold text-black text-[13px]">Part {activePassage + 1}</p>
        <p className="text-black text-[13px] mt-0.5">Read the text and answer questions {rangeText}.</p>
      </div>

      {/* ═══ SPLIT SCREEN ═══ */}
      <div className="flex-1 overflow-hidden min-h-0 mb-20 bg-white">
        <ResizableSplitPane
          left={
            <div className="h-full overflow-y-auto bg-white">
              <div className="border-b border-[#e0e0e0] px-6 py-4">
                <h2 className="font-bold text-[#333] text-[25px]">{currentPassage?.title}</h2>
              </div>
              <div className="px-6 pt-6 pb-32">
                <HighlightableContent className="max-w-none leading-relaxed">
                  {(currentPassage?.text || currentPassage?.content || '').split('\n\n').map((paragraph, idx) => {
                    const matchHeadingsBlock = currentBlocks.find(b => b.type === 'match_headings');
                    const paragraphLetter = String.fromCharCode(65 + idx);

                    let headingQ = null;
                    if (matchHeadingsBlock && matchHeadingsBlock.questions) {
                      headingQ = matchHeadingsBlock.questions.find(
                        (q) => q.text.toUpperCase().includes(`PARAGRAPH ${paragraphLetter}`)
                      );
                    }

                    return (
                      <div key={idx} className="mb-4 text-[#333]">
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
                        <p className="text-[16.5px] font-medium leading-[1.85]" style={{ fontFamily: 'Georgia, serif' }}>
                          {paragraph}
                        </p>
                      </div>
                    );
                  })}
                </HighlightableContent>
              </div>
            </div>
          }
          right={
            <div className="h-full overflow-y-auto bg-white">
              <div className="px-6 pt-6 pb-32">
                <div className="mb-4">
                  <h3 className="font-bold text-sm text-[#333]">Questions {rangeText}</h3>
                </div>

                <div className="space-y-6">
                  {currentBlocks.map((block, blockIndex) => {
                    const blockStartIndex = getStartIndex(blockOffset + blockIndex);

                    if (block.type === 'match_headings') {
                      return (
                        <div key={block.id} id={`question-${blockStartIndex}`}>
                          {block.instruction && (
                            <p className="text-[22px] font-bold text-[#555] mb-3">{block.instruction}</p>
                          )}
                          <MatchHeadings
                            data={block}
                            onAnswer={handleBlockAnswers}
                            startIndex={blockStartIndex}
                            userAnswers={userAnswers}
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={block.id} id={`question-${blockStartIndex}`}>
                        {block.instruction && (
                          <p className="text-[22px] font-bold text-[#555] mb-3">{block.instruction}</p>
                        )}
                        <QuestionRenderer
                          data={block}
                          startIndex={blockStartIndex}
                          onAnswersChange={handleBlockAnswers}
                        />
                      </div>
                    );
                  })}
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
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border border-gray-300 text-sm font-medium text-[#333] hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-[#333] text-white text-sm font-semibold hover:bg-[#222]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}