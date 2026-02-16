'use client';

import { use, useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Timer from '@/components/Timer';
import { Button } from '@/components/ui/button';
import AudioPlayer from '@/components/AudioPlayer';
import { QuestionRenderer } from '@/components/ielts-questions';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import TestNavigator from '@/components/TestNavigator';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';

// Dynamically load test data by ID
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

  // Timer is from JSON (in minutes)
  const timerMinutes = rawData?.timer || 40;

  // Sections are the flat question blocks
  const allSections = useMemo(() => {
    return rawData?.sections || [];
  }, [rawData]);

  // Group sections into Logical Parts (e.g., "Section 1", "Section 2")
  const parts = useMemo(() => {
    if (!allSections.length) return [];

    const grouped = [];
    let currentPartLabel = null;
    let currentPartSections = [];

    allSections.forEach(section => {
      // Extract "Section X" or "Part X" from title
      const match = section.title?.match(/^(Section|Part) \d+/i);
      const label = match ? match[0] : (currentPartLabel || "Part 1");

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

  // Ensure activePartIndex is valid if parts change
  useEffect(() => {
    if (activePartIndex >= parts.length && parts.length > 0) {
      setActivePartIndex(0);
    }
  }, [parts.length, activePartIndex]);

  // Calculate global start index for questions
  const getStartIndex = useCallback(
    (sectionId) => {
      let start = 1;
      // Iterate through all previous sections across all parts to find the cumulative count
      for (let i = 0; i < allSections.length; i++) {
        const sec = allSections[i];
        if (sec.id === sectionId) break;

        if (sec.type === 'gap_fill') {
          const matches = sec.content.match(/\{\d+\}/g);
          start += matches ? matches.length : 0;
        } else if (sec.questions) {
          start += sec.questions.length;
        }
      }
      return start;
    },
    [allSections]
  );

  // Total question count
  const totalQuestions = useMemo(() => {
    let count = 0;
    allSections.forEach((block) => {
      if (block.type === 'gap_fill') {
        const matches = block.content.match(/\{\d+\}/g);
        count += matches ? matches.length : 0;
      } else if (block.questions) {
        count += block.questions.length;
      }
    });
    return count;
  }, [allSections]);

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
    setActivePartIndex(0);
  };

  const handleExit = () => {
    router.push('/dashboard/listening');
  };

  const handleTimerExpire = () => {
    setSubmitted(true);
  };

  if (!rawData) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center text-center">
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
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h1 className="text-xl font-bold">{rawData.title} — Results</h1>
            <Button variant="outline" onClick={handleExit}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
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
  // If no parts (empty test), fallback
  const visibleSections = currentPart ? currentPart.sections : [];

  // ── TEST VIEW ──
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex-none bg-background/95 backdrop-blur border-b z-20 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard/listening')}
              className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">{rawData.title}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {answeredCount}/{totalQuestions} answered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Question progress pills (hidden on small screens) */}
            <div className="hidden xl:flex items-center gap-0.5 mr-4">
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
              onClick={() => router.push('/dashboard/listening')}
              className="hidden sm:flex"
            >
              Exit
            </Button>
            <Button size="sm" onClick={() => setShowConfirm(true)}>
              <Send className="w-4 h-4 mr-1" />
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Player - Fixed below header */}
      <div className="flex-none bg-muted/30 border-b px-4 py-2">
        <div className="max-w-3xl mx-auto">
           <AudioPlayer src="/audio/sample.mp3" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-muted/5 pb-24">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {visibleSections.map((block) => (
            <div key={block.id} className="bg-card border border-border rounded-xl p-6 shadow-sm">
              {/* Section Header */}
              <div className="mb-6 border-b pb-4">
                 <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                      {currentPart?.label || "Part"}
                    </span>
                 </div>
                 {block.title && (
                    <h3 className="text-lg font-semibold text-foreground">
                      {block.title}
                    </h3>
                  )}
                  {block.instruction && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {block.instruction}
                    </p>
                  )}
              </div>

              {/* Legend (for matching questions) */}
              {block.legend && block.legend.length > 0 && (
                <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">Reference Options</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {block.legend.map((item, i) => (
                      <span key={i} className="text-sm text-foreground/80 bg-background px-2 py-1 rounded border border-border/50">{item}</span>
                    ))}
                  </div>
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

      {/* Bottom Navigator */}
      <TestNavigator
        parts={parts.map(p => p.label)}
        activePart={activePartIndex}
        onPartChange={setActivePartIndex}
      />

      {/* Submit Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in duration-200">
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
