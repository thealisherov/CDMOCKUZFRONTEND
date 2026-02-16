'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Eye, EyeOff, Trophy, Target, BarChart3 } from 'lucide-react';

/**
 * AnswerSheet — Shows test results after submission.
 *
 * Props:
 *  - userAnswers : Object — { "1": "database", "q2": "rock", ... }
 *  - testData    : Array  — the JSON question blocks (with `answers` field)
 *  - onRetry     : Function — callback to retry the test
 *  - onExit      : Function — callback to exit to test list
 *  - moduleType  : string — "reading" or "listening"
 */
const AnswerSheet = ({ userAnswers = {}, testData = [], onRetry, onExit, moduleType = 'reading' }) => {
  const [showCorrect, setShowCorrect] = useState(false);

  // Build a flat list of all questions with correct answers
  const allQuestions = useMemo(() => {
    const questions = [];

    testData.forEach((block) => {
      if (block.type === 'gap_fill') {
        // Extract question IDs from the content {1}, {2}, etc.
        const matches = block.content.match(/\{(\d+)\}/g) || [];
        matches.forEach((m) => {
          const num = m.replace(/\{|\}/g, '');
          const questionId = block.questionIds?.[parseInt(num, 10) - 1] || num;
          const correctAnswer = block.answers?.[num] || '';
          questions.push({
            id: num,
            questionId,
            correctAnswer,
            blockId: block.id,
          });
        });
      } else if (block.questions) {
        block.questions.forEach((q) => {
          const correctAnswer = block.answers?.[q.id] || '';
          questions.push({
            id: q.id,
            questionId: q.id,
            correctAnswer,
            text: q.text,
            blockId: block.id,
          });
        });
      }
    });

    return questions;
  }, [testData]);

  // Calculate score
  const results = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const detailed = allQuestions.map((q) => {
      const userAns = userAnswers[q.questionId] || userAnswers[q.id] || '';
      const correctAns = q.correctAnswer;

      let isCorrect = false;

      if (!userAns || userAns.trim() === '') {
        unanswered++;
      } else if (Array.isArray(correctAns)) {
        // Multi-answer (like "choose TWO")
        isCorrect = correctAns.includes(userAns);
        if (isCorrect) correct++;
        else wrong++;
      } else {
        // Normalize both for comparison
        isCorrect =
          userAns.toString().trim().toLowerCase() ===
          correctAns.toString().trim().toLowerCase();
        if (isCorrect) correct++;
        else wrong++;
      }

      return {
        ...q,
        userAnswer: userAns,
        isCorrect,
        isUnanswered: !userAns || userAns.trim() === '',
      };
    });

    return { correct, wrong, unanswered, total: allQuestions.length, detailed };
  }, [allQuestions, userAnswers]);

  // Calculate band score (approximate IELTS band from raw score out of 40)
  const bandScore = useMemo(() => {
    const score = results.correct;
    if (moduleType === 'listening') {
      if (score >= 39) return 9.0;
      if (score >= 37) return 8.5;
      if (score >= 35) return 8.0;
      if (score >= 33) return 7.5;
      if (score >= 30) return 7.0;
      if (score >= 27) return 6.5;
      if (score >= 23) return 6.0;
      if (score >= 20) return 5.5;
      if (score >= 16) return 5.0;
      if (score >= 13) return 4.5;
      if (score >= 10) return 4.0;
      if (score >= 6) return 3.5;
      return 3.0;
    } else {
      // Reading (Academic)
      if (score >= 39) return 9.0;
      if (score >= 37) return 8.5;
      if (score >= 35) return 8.0;
      if (score >= 33) return 7.5;
      if (score >= 30) return 7.0;
      if (score >= 27) return 6.5;
      if (score >= 23) return 6.0;
      if (score >= 19) return 5.5;
      if (score >= 15) return 5.0;
      if (score >= 13) return 4.5;
      if (score >= 10) return 4.0;
      if (score >= 6) return 3.5;
      return 3.0;
    }
  }, [results.correct, moduleType]);

  const percentage = Math.round((results.correct / results.total) * 100);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* ── Score Summary Card ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-primary/90 to-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90 uppercase tracking-wider">
                {moduleType === 'listening' ? 'Listening' : 'Reading'} Test Result
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-5xl font-bold">{bandScore.toFixed(1)}</span>
                <span className="text-lg opacity-80">Band Score</span>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Trophy className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {results.correct}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Correct</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <X className="w-4 h-4 text-red-500" />
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                {results.wrong}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Wrong</p>
          </div>
          <div className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">
                {results.correct}/{results.total}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Score ({percentage}%)</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{results.total - results.unanswered}/{results.total} answered</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${(results.correct / results.total) * 100}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${(results.wrong / results.total) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Correct
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Wrong
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-muted" /> Unanswered
            </span>
          </div>
        </div>
      </div>

      {/* ── Answer Sheet ── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header with toggle */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Answer Sheet
          </h3>

          {/* Show Correct Answers Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm text-muted-foreground font-medium">
              Show Correct Answers
            </span>
            <button
              onClick={() => setShowCorrect(!showCorrect)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
                showCorrect ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                  showCorrect ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </label>
        </div>

        {/* Answer Grid */}
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
            {results.detailed.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  item.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/20'
                    : item.isUnanswered
                    ? 'bg-muted/30'
                    : 'bg-red-50 dark:bg-red-950/20'
                )}
              >
                {/* Question number */}
                <span
                  className={cn(
                    'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0',
                    item.isCorrect
                      ? 'bg-emerald-500 text-white'
                      : item.isUnanswered
                      ? 'bg-muted text-muted-foreground'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                  )}
                >
                  {item.id}
                </span>

                {/* User's answer */}
                <span
                  className={cn(
                    'font-semibold text-sm min-w-[40px]',
                    item.isCorrect
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : item.isUnanswered
                      ? 'text-muted-foreground italic'
                      : 'text-foreground'
                  )}
                >
                  {item.isUnanswered ? '—' : item.userAnswer}
                </span>

                {/* Correct / Wrong icon */}
                {!item.isUnanswered && (
                  item.isCorrect ? (
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-500 shrink-0" />
                  )
                )}

                {/* Show correct answer when toggle is ON and answer is wrong */}
                {showCorrect && !item.isCorrect && (
                  <span className="text-sm text-muted-foreground ml-auto">
                    Correct:{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {Array.isArray(item.correctAnswer)
                        ? item.correctAnswer.join(', ')
                        : item.correctAnswer}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-8">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          🔄 Retry Test
        </button>
        <button
          onClick={onExit}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
        >
          📋 Back to Tests
        </button>
      </div>
    </div>
  );
};

export default AnswerSheet;
