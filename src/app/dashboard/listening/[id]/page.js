'use client';

import { use, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';

// Dynamically load test data by ID — no need to edit this file when adding new tests!
// Just add a new JSON file: src/data/listening/listening{N}.json
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

  const testData = loadTestData(id);

  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Calculate global start index for each block
  const getStartIndex = useCallback(
    (blockIndex) => {
      if (!testData) return 1;
      let start = 1;
      for (let i = 0; i < blockIndex; i++) {
        const block = testData[i];
        if (block.type === 'gap_fill') {
          const matches = block.content.match(/\{\d+\}/g);
          start += matches ? matches.length : 0;
        } else if (block.questions) {
          start += block.questions.length;
        }
      }
      return start;
    },
    [testData]
  );

  // Total question count
  const totalQuestions = useMemo(() => {
    if (!testData) return 0;
    let count = 0;
    testData.forEach((block) => {
      if (block.type === 'gap_fill') {
        const matches = block.content.match(/\{\d+\}/g);
        count += matches ? matches.length : 0;
      } else if (block.questions) {
        count += block.questions.length;
      }
    });
    return count;
  }, [testData]);

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
  };

  const handleExit = () => {
    router.push('/dashboard/listening');
  };

  const handleTimerExpire = () => {
    setSubmitted(true);
  };

  if (!testData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Test not found</h2>
        <p className="text-muted-foreground mb-4">
          Listening Test #{id} does not exist.
        </p>
        <Button onClick={() => router.push('/dashboard/listening')}>
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
          <h1 className="text-xl font-bold">Listening Test #{id} — Results</h1>
          <Button variant="outline" onClick={handleExit}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <AnswerSheet
          userAnswers={userAnswers}
          testData={testData}
          onRetry={handleRetry}
          onExit={handleExit}
          moduleType="listening"
        />
      </div>
    );
  }

  // ── TEST VIEW ──
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 border-b pb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/listening')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Listening Test #{id}</h1>
            <p className="text-xs text-muted-foreground">
              {answeredCount}/{totalQuestions} answered
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Question progress pills */}
          <div className="hidden lg:flex items-center gap-1">
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
                  className={`w-6 h-6 rounded text-[10px] font-bold flex items-center justify-center transition-all ${
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

          <Timer initialMinutes={40} onExpire={handleTimerExpire} />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => router.push('/dashboard/listening')}
          >
            Exit
          </Button>
          <Button size="sm" onClick={() => setShowConfirm(true)}>
            <Send className="w-4 h-4 mr-1" />
            Submit
          </Button>
        </div>
      </div>

      {/* Audio Player */}
      <div className="mb-4 sticky top-0 z-10">
        <AudioPlayer src="/audio/sample.mp3" />
      </div>

      {/* Questions (scrollable) */}
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
          {testData.map((block, idx) => (
            <QuestionRenderer
              key={block.id}
              data={block}
              startIndex={getStartIndex(idx)}
              onAnswersChange={handleBlockAnswers}
            />
          ))}
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
