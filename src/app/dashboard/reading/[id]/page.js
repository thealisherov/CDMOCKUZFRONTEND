'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import { ArrowLeft, Send, AlertTriangle, BookOpen } from 'lucide-react';

// Dynamically load test data by ID
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

  // Timer is from JSON (in minutes)
  const timerMinutes = rawData?.timer || 60;

  // Flatten all question blocks from passages for calculations
  const allBlocks = useMemo(() => {
    if (!rawData?.passages) return [];
    const blocks = [];
    rawData.passages.forEach((p) => {
      if (p.questions) {
        p.questions.forEach((q) => blocks.push(q));
      }
    });
    return blocks;
  }, [rawData]);

  // Calculate global start index for each block
  const getStartIndex = useCallback(
    (blockIndex) => {
      let start = 1;
      for (let i = 0; i < blockIndex; i++) {
        const block = allBlocks[i];
        if (!block) break;
        if (block.type === 'gap_fill') {
          const matches = block.content.match(/\{\d+\}/g);
          start += matches ? matches.length : 0;
        } else if (block.questions) {
          start += block.questions.length;
        }
      }
      return start;
    },
    [allBlocks]
  );

  // Total question count
  const totalQuestions = useMemo(() => {
    let count = 0;
    allBlocks.forEach((block) => {
      if (block.type === 'gap_fill') {
        const matches = block.content.match(/\{\d+\}/g);
        count += matches ? matches.length : 0;
      } else if (block.questions) {
        count += block.questions.length;
      }
    });
    return count;
  }, [allBlocks]);

  // Count answered questions
  const answeredCount = useMemo(() => {
    return Object.values(userAnswers).filter(
      (v) => v !== undefined && v !== null && v.toString().trim() !== ''
    ).length;
  }, [userAnswers]);

  const handleBlockAnswers = useCallback((answers) => {
    setUserAnswers((prev) => ({ ...prev, ...answers }));
  }, []);

  const handleSubmit = () => {
    setSubmitted(true);
    setShowConfirm(false);
  };

  const handleRetry = () => {
    setUserAnswers({});
    setSubmitted(false);
    setActivePassage(0);
  };

  const handleExit = () => {
    router.push('/dashboard/reading');
  };

  const handleTimerExpire = () => {
    setSubmitted(true);
  };

  if (!rawData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Test not found</h2>
        <p className="text-muted-foreground mb-4">
          Reading Test #{id} does not exist.
        </p>
        <Button onClick={() => router.push('/dashboard/reading')}>
          Back to Tests
        </Button>
      </div>
    );
  }

  // ── RESULT VIEW ──
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-8rem)]">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <h1 className="text-xl font-bold">{rawData.title} — Results</h1>
          <Button variant="outline" onClick={handleExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
    );
  }

  const passages = rawData.passages || [];
  const currentPassage = passages[activePassage];

  // Get question blocks for current passage
  const currentBlocks = currentPassage?.questions || [];

  // Calculate the global block offset for the current passage
  let blockOffset = 0;
  for (let p = 0; p < activePassage; p++) {
    blockOffset += (passages[p]?.questions?.length || 0);
  }

  // ── TEST VIEW ──
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3 border-b pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/reading')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">{rawData.title}</h1>
            <p className="text-xs text-muted-foreground">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Question progress pills */}
          <div className="hidden xl:flex items-center gap-0.5">
            {Array.from({ length: totalQuestions }, (_, i) => {
              const num = i + 1;
              const qId = num.toString();
              const isAnswered =
                userAnswers[qId] !== undefined &&
                userAnswers[qId] !== null &&
                userAnswers[qId].toString().trim() !== '';
              return (
                <span
                  key={num}
                  className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center transition-all ${
                    isAnswered
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {num}
                </span>
              );
            })}
          </div>

          <Timer initialMinutes={timerMinutes} onExpire={handleTimerExpire} />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => router.push('/dashboard/reading')}
          >
            Exit
          </Button>
          <Button size="sm" onClick={() => setShowConfirm(true)}>
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Passage tabs */}
      <div className="flex items-center gap-2 mb-3 border-b pb-2 overflow-x-auto">
        {passages.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => setActivePassage(idx)}
            className={`px-4 py-1.5 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activePassage === idx
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            Passage {idx + 1}
          </button>
        ))}
      </div>

      {/* Split-screen: Passage (left) | Questions (right) */}
      <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
        {/* Left Panel — Passage text */}
        <div className="w-1/2 overflow-y-auto border border-border rounded-lg bg-card">
          <div className="sticky top-0 z-10 bg-primary/5 dark:bg-primary/10 border-b border-border px-5 py-3">
            <h2 className="font-bold text-foreground text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {currentPassage?.title}
            </h2>
          </div>
          <div className="p-5">
            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed text-foreground/90">
              {currentPassage?.text?.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4 text-[0.92rem] leading-[1.8]">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel — Questions */}
        <div className="w-1/2 overflow-y-auto pr-1">
          <div className="space-y-5 pb-8">
            {currentBlocks.map((block, idx) => (
              <QuestionRenderer
                key={block.id}
                data={block}
                startIndex={getStartIndex(blockOffset + idx)}
                onAnswersChange={handleBlockAnswers}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Submit Answers?</h3>
                <p className="text-sm text-muted-foreground">
                  You have answered {answeredCount} out of {totalQuestions} questions.
                </p>
              </div>
            </div>

            {answeredCount < totalQuestions && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  You have {totalQuestions - answeredCount} unanswered question(s).
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Submit Answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
