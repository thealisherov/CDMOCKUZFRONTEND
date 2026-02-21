'use client';

import React, { useState } from 'react';
import { QuestionRenderer } from '@/components/ielts-questions';
import Timer from '@/components/Timer';
import ResizableLayout from '@/components/ResizableLayout';

// ─────────────────────────────────────────────────────
// Sample Reading Passage (left panel)
// ─────────────────────────────────────────────────────
const SAMPLE_PASSAGE = {
  title: 'The History of Glass',
  paragraphs: [
    {
      label: 'A',
      text: `Since the dawn of history, glass has been one of the most versatile and widely used materials known to mankind. Archaeological evidence suggests that the first glass objects, mainly beads, were made around 3500 BC in Mesopotamia and Egypt. The discovery of glass-blowing around 1st century BC revolutionized the industry, making glass vessels accessible to ordinary people for the first time.`,
    },
    {
      label: 'B',
      text: `The Romans were particularly adept at glassmaking. They developed new techniques such as mosaic glass, cast glass, and cut glass. Roman glass was traded across the empire and has been found as far away as Scandinavia and China. The art of stained glass reached its peak during the Gothic period, when European cathedrals were adorned with magnificent coloured windows depicting biblical scenes.`,
    },
    {
      label: 'C',
      text: `In the modern era, glass has found countless applications beyond its traditional use in windows and containers. Fibre optics, made from ultra-pure glass, carry information at the speed of light and form the backbone of the internet. Scientists have also developed "smart glass," which can change its transparency in response to electrical signals, offering energy-saving solutions for buildings.`,
    },
    {
      label: 'D',
      text: `Despite being one of the oldest manufactured materials, glass continues to be at the forefront of technological innovation. Researchers are currently exploring the use of glass in medical implants, solar panels, and even flexible electronics. The material's unique combination of transparency, chemical inertness, and recyclability ensures it will remain indispensable for centuries to come.`,
    },
  ],
};

// ─────────────────────────────────────────────────────
// Sample Question Data (JSON-driven)
// ─────────────────────────────────────────────────────
const SAMPLE_QUESTIONS = [
  {
    id: 'block_1',
    type: 'gap_fill',
    instruction:
      'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.',
    content:
      'The earliest glass objects were made around {1} in Mesopotamia and Egypt. The invention of {2} made glass vessels available to the general public. The Romans developed techniques including mosaic glass, cast glass, and {3}.',
    questionIds: ['q1', 'q2', 'q3'],
  },
  {
    id: 'block_2',
    type: 'matrix_match',
    instruction:
      'Which paragraph contains the following information? Write the correct letter, A-D.',
    columnOptions: ['A', 'B', 'C', 'D'],
    questions: [
      { id: 'q4', text: 'a reference to the use of glass in telecommunications' },
      { id: 'q5', text: 'how glass production became a mass-market activity' },
      { id: 'q6', text: 'examples of artistic uses of glass' },
      { id: 'q7', text: 'future applications of glass technology' },
    ],
  },
  {
    id: 'block_3',
    type: 'true_false',
    instruction:
      'Do the following statements agree with the information given in the reading passage? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.',
    options: ['TRUE', 'FALSE', 'NOT GIVEN'],
    questions: [
      { id: 'q8', text: 'Glass beads were the first glass objects ever made.' },
      { id: 'q9', text: 'Roman glassware was only found within the Roman Empire.' },
      { id: 'q10', text: 'Smart glass can alter its opacity using electricity.' },
      {
        id: 'q11',
        text: 'Glass is now being researched for use in flexible electronic devices.',
      },
    ],
  },
  {
    id: 'block_4',
    type: 'multiple_choice',
    instruction: 'Choose the correct letter, A, B, C, or D.',
    options: ['A', 'B', 'C', 'D'],
    questions: [
      {
        id: 'q12',
        text: 'What does the writer say about fibre optics?',
      },
      {
        id: 'q13',
        text: 'What is the main idea of the final paragraph?',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────
// TestPage Component — Split-screen CD IELTS layout
// ─────────────────────────────────────────────────────
export default function TestPage() {
  const [allAnswers, setAllAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Compute global start index for each block
  const getStartIndex = (blockIndex) => {
    let start = 1;
    for (let i = 0; i < blockIndex; i++) {
      const block = SAMPLE_QUESTIONS[i];
      if (block.type === 'gap_fill') {
        const matches = block.content.match(/\{\d+\}/g);
        start += matches ? matches.length : 0;
      } else if (block.questions) {
        start += block.questions.length;
      }
    }
    return start;
  };

  const handleBlockAnswers = (blockId, answers) => {
    setAllAnswers((prev) => ({
      ...prev,
      ...answers,
    }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Test Complete</h1>
            <p className="text-muted-foreground">Here are your results.</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Your Answers</h2>
            <div className="grid grid-cols-2 gap-4">
               {Array.from({ length: 13 }, (_, i) => {
                 const num = i + 1;
                 const ans = allAnswers[`q${num}`];
                 return (
                   <div key={num} className="flex items-center justify-between p-2 rounded bg-muted/50">
                     <span className="font-mono text-sm font-bold text-muted-foreground">Q{num}</span>
                     <span className={`text-sm font-medium ${ans ? 'text-foreground' : 'text-red-500'}`}>
                       {ans || 'No Answer'}
                     </span>
                   </div>
                 );
               })}
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Take Test Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 md:px-6 h-14">
          {/* Left: Logo / Test info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-none">
                IELTS Academic Reading
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Practice Test 1 — Passage 1
              </p>
            </div>
          </div>

          {/* Center: Question Navigator */}
          <div className="hidden md:flex items-center gap-1">
            {Array.from({ length: 13 }, (_, i) => {
              const num = i + 1;
              const isAnswered = !!allAnswers[`q${num}`];
              return (
                <button
                  key={num}
                  className={`
                    w-7 h-7 rounded text-xs font-semibold transition-all
                    ${
                      isAnswered
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }
                  `}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Right: Timer / Submit */}
          <div className="flex items-center gap-3">
            <div className="bg-muted px-2 py-1 rounded-md">
              <Timer initialMinutes={60} onExpire={handleSubmit} />
            </div>
            <button
              onClick={handleSubmit}
              className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* ── Split Screen Layout ── */}
      <ResizableLayout
        leftContent={
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
              {/* Passage title */}
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                {SAMPLE_PASSAGE.title}
              </h2>

              {/* Paragraphs */}
              <div className="space-y-5">
                {SAMPLE_PASSAGE.paragraphs.map((para) => (
                  <div key={para.label} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center text-sm font-bold mt-0.5">
                      {para.label}
                    </span>
                    <p className="text-foreground/85 text-[0.92rem] leading-relaxed">
                      {para.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        rightContent={
          <div className="p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Section header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 rounded-full bg-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Questions 1–13
                </h2>
              </div>

              {/* Render all question blocks */}
              {SAMPLE_QUESTIONS.map((block, idx) => (
                <QuestionRenderer
                  key={block.id}
                  data={block}
                  startIndex={getStartIndex(idx)}
                  onAnswersChange={(answers) =>
                    handleBlockAnswers(block.id, answers)
                  }
                />
              ))}

              {/* Debug: Show current answers */}
              <details className="mt-8 rounded-lg border border-border bg-card p-4">
                <summary className="text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  🔍 Debug: View Current Answers
                </summary>
                <pre className="mt-3 text-xs bg-muted p-3 rounded-md overflow-x-auto text-foreground/70 font-mono">
                  {JSON.stringify(allAnswers, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        }
      />
    </div>
  );
}
