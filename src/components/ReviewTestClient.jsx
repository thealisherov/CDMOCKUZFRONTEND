'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RotateCcw, Play, Pause, Volume2, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestNavigator from '@/components/TestNavigator';
import ResizableSplitPane from '@/components/ResizableSplitPane';
import AnswerSheet from '@/components/ielts-questions/AnswerSheet';
import ReviewRadioMatrix from '@/components/review-questions/ReviewRadioMatrix';
import ReviewMatchDropdown from '@/components/review-questions/ReviewMatchDropdown';
import ReviewTrueFalse from '@/components/review-questions/ReviewTrueFalse';
import ReviewCheckboxMultiple from '@/components/review-questions/ReviewCheckboxMultiple';
import ReviewDragDropSummary from '@/components/review-questions/ReviewDragDropSummary';
import ReviewFlowChart from '@/components/review-questions/ReviewFlowChart';
import ReviewTableCompletion from '@/components/review-questions/ReviewTableCompletion';

// ── Audio Player for Review Mode ───────────────────────────────
function ReviewAudioPlayer({ src }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); } else { audio.play().catch(() => {}); }
    setIsPlaying(!isPlaying);
  };

  const seek = (delta) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + delta));
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * duration;
  };

  const fmt = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (!src) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.06)' }}>
      <audio ref={audioRef} src={src} preload="auto" />
      <button onClick={() => seek(-10)} className="p-1 opacity-60 hover:opacity-100 transition-opacity" title="Back 10s">
        <SkipBack className="w-4 h-4" />
      </button>
      <button onClick={togglePlay} className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: '#1a1a1a', color: '#fff' }}>
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <button onClick={() => seek(10)} className="p-1 opacity-60 hover:opacity-100 transition-opacity" title="Forward 10s">
        <SkipForward className="w-4 h-4" />
      </button>
      <span className="text-xs font-mono min-w-[42px]">{fmt(currentTime)}</span>
      <div className="flex-1 h-2 rounded-full cursor-pointer relative" style={{ background: 'rgba(0,0,0,0.1)' }} onClick={handleSeek}>
        <div className="h-full rounded-full" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%', background: '#1a1a1a', transition: 'width 0.1s' }} />
      </div>
      <span className="text-xs font-mono min-w-[42px]">{fmt(duration)}</span>
      <Volume2 className="w-4 h-4 opacity-50" />
    </div>
  );
}

// ── Main Review Component ──────────────────────────────────────
export default function ReviewTestClient({ testId, attemptId, rawData, moduleType = 'reading' }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCorrect, setShowCorrect] = useState(false);
  const [activePassage, setActivePassage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [showResults, setShowResults] = useState(false);

  // Fetch saved attempt data
  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`)
      .then(r => r.json())
      .then(data => { setAttempt(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [attemptId]);

  const userAnswers = attempt?.user_answers || {};
  const serverResults = attempt?.server_results || {};

  const sections = useMemo(() => {
    if (!rawData) return [];
    if (moduleType === 'reading') return rawData.passages || [];
    return rawData.sections || [];
  }, [rawData, moduleType]);

  const allBlocks = useMemo(() => {
    if (moduleType === 'reading') {
      const blocks = [];
      sections.forEach(p => { if (p.questions) p.questions.forEach(q => blocks.push(q)); });
      return blocks;
    }
    return sections;
  }, [sections, moduleType]);

  const getBlockQCount = (block) => {
    if (!block) return 0;
    if (['gap_fill', 'drag_drop_summary', 'flow_chart', 'table'].includes(block.type)) {
      const content = block.content || '';
      const matches = content.match(/\{\d+\}/g);
      return matches ? matches.length : 0;
    }
    if (block.type === 'checkbox_multiple') {
      return (block.questions || []).reduce((s, q) => s + (q.numbers ? q.numbers.length : 1), 0);
    }
    return block.questions ? block.questions.length : 0;
  };

  const getStartIndex = useCallback((blockIndex) => {
    let start = 1;
    for (let i = 0; i < blockIndex; i++) {
      if (!allBlocks[i]) break;
      start += getBlockQCount(allBlocks[i]);
    }
    return start;
  }, [allBlocks]);

  const totalQuestions = useMemo(() => allBlocks.reduce((s, b) => s + getBlockQCount(b), 0), [allBlocks]);
  const questionNumbers = useMemo(() => Array.from({ length: totalQuestions }, (_, i) => i + 1), [totalQuestions]);

  const partQuestionRanges = useMemo(() => {
    const ranges = [];
    let cursor = 1;
    if (moduleType === 'reading') {
      sections.forEach(p => {
        const count = (p.questions || []).reduce((s, b) => s + getBlockQCount(b), 0);
        ranges.push({ start: cursor, end: cursor + count - 1 });
        cursor += count;
      });
    } else {
      const parts = [];
      let currentLabel = null;
      let currentSections = [];
      sections.forEach(section => {
        const label = section.partLabel || section.title?.match(/^(Section|Part) \d+/i)?.[0] || (currentLabel || 'Part 1');
        if (label !== currentLabel) {
          if (currentLabel) parts.push({ label: currentLabel, sections: currentSections });
          currentLabel = label;
          currentSections = [section];
        } else {
          currentSections.push(section);
        }
      });
      if (currentSections.length > 0) parts.push({ label: currentLabel, sections: currentSections });
      parts.forEach(part => {
        const count = part.sections.reduce((s, b) => s + getBlockQCount(b), 0);
        ranges.push({ start: cursor, end: cursor + count - 1 });
        cursor += count;
      });
    }
    return ranges;
  }, [sections, moduleType]);

  const listeningParts = useMemo(() => {
    if (moduleType !== 'listening') return [];
    const parts = [];
    let currentLabel = null;
    let currentSections = [];
    sections.forEach(section => {
      const label = section.partLabel || section.title?.match(/^(Section|Part) \d+/i)?.[0] || (currentLabel || 'Part 1');
      if (label !== currentLabel) {
        if (currentLabel) parts.push({ label: currentLabel, sections: currentSections });
        currentLabel = label;
        currentSections = [section];
      } else {
        currentSections.push(section);
      }
    });
    if (currentSections.length > 0) parts.push({ label: currentLabel, sections: currentSections });
    return parts;
  }, [sections, moduleType]);

  const answeredIds = useMemo(() => (
    Object.entries(userAnswers)
      .filter(([, v]) => v !== undefined && v !== null && v.toString().trim() !== '')
      .map(([k]) => k)
  ), [userAnswers]);

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
  const handleExit = () => router.push(`/dashboard/${moduleType}`);

  if (loading || !rawData) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="ielts-test-view fixed inset-0 z-50 bg-white overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 min-h-screen">
          <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
            <h1 className="text-xl font-bold" style={{ color: '#333' }}>{rawData.title} — Results</h1>
            <Button variant="outline" onClick={() => setShowResults(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Review
            </Button>
          </div>
          <AnswerSheet
            userAnswers={userAnswers}
            testData={allBlocks}
            onRetry={() => router.push(`/dashboard/${moduleType}/${testId}`)}
            onExit={handleExit}
            moduleType={moduleType}
            serverEvaluation={serverResults}
          />
        </div>
      </div>
    );
  }

  const correctAnswersMap = serverResults?.results || {};

  let currentSectionData, currentBlocks, blockOffset, rangeText;

  if (moduleType === 'reading') {
    currentSectionData = sections[activePassage];
    currentBlocks = currentSectionData?.questions || [];
    blockOffset = 0;
    for (let p = 0; p < activePassage; p++) blockOffset += (sections[p]?.questions?.length || 0);
    const activeRange = partQuestionRanges[activePassage];
    rangeText = activeRange ? `${activeRange.start}–${activeRange.end}` : '';
  } else {
    const currentPart = listeningParts[activePassage];
    currentBlocks = currentPart?.sections || [];
    blockOffset = 0;
    rangeText = partQuestionRanges[activePassage]
      ? `${partQuestionRanges[activePassage].start}–${partQuestionRanges[activePassage].end}`
      : '';
  }

  const getListeningStartIndex = (sectionId) => {
    let start = 1;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].id === sectionId) break;
      start += getBlockQCount(sections[i]);
    }
    return start;
  };

  return (
    <div className="ielts-test-view fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: '#f8f9fa', color: '#1a1a1a' }}>

      {/* ═══ HEADER ═══ */}
      <div className="flex-none px-6 py-3 z-20 flex items-center justify-between" style={{ background: '#1a1a2e', color: '#fff' }}>
        <div className="flex items-center gap-4">
          <button onClick={handleExit} className="flex items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Back to {moduleType === 'reading' ? 'Reading' : 'Listening'} Tests
          </button>
          <div className="h-5 w-px bg-white/20" />
          <span className="text-2xl font-black tracking-wider" style={{ color: '#e22d2d' }}>IELTS</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Show Correct Answers Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-sm font-medium opacity-80">Show Correct Answers</span>
            <button
              onClick={() => setShowCorrect(!showCorrect)}
              style={{
                position: 'relative', display: 'inline-flex',
                height: 24, width: 44,
                alignItems: 'center', borderRadius: 12,
                background: showCorrect ? '#10b981' : 'rgba(255,255,255,0.25)',
                border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                padding: 0,
              }}
            >
              <span style={{
                display: 'inline-block', height: 18, width: 18, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transform: showCorrect ? 'translateX(22px)' : 'translateX(3px)',
                transition: 'transform 0.2s',
              }} />
            </button>
          </label>

          <div className="h-5 w-px bg-white/20" />

          <button
            onClick={() => router.push(`/dashboard/${moduleType}/${testId}`)}
            className="flex items-center gap-1.5 text-sm font-medium opacity-80 hover:opacity-100 transition-opacity"
          >
            <RotateCcw className="w-4 h-4" /> Re-Do test
          </button>

          <button
            onClick={() => setShowResults(true)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            📊 Return results
          </button>
        </div>
      </div>

      {/* ═══ PART INDICATOR ═══ */}
      <div className="flex-none mx-6 mt-3 mb-2 px-5 py-2 rounded-sm" style={{ background: '#eef2f7', border: '1px solid #dde3ea' }}>
        <p className="font-bold text-[13px]">
          {moduleType === 'reading'
            ? (currentSectionData?.passageNumber ? `Part ${currentSectionData.passageNumber}` : `Part ${activePassage + 1}`)
            : (listeningParts[activePassage]?.label || `Part ${activePassage + 1}`)
          }
        </p>
        <p className="text-[13px] mt-0.5 text-gray-600">
          {moduleType === 'reading' ? `Read the text and answer questions ${rangeText}.` : `Listen and answer questions ${rangeText}.`}
        </p>
      </div>

      {/* ═══ AUDIO PLAYER (Listening only) ═══ */}
      {moduleType === 'listening' && (
        <div className="flex-none px-6 mb-2">
          <ReviewAudioPlayer src={rawData.audio || "/audio/sample.mp3"} />
        </div>
      )}

      {/* ═══ SPLIT CONTENT ═══ */}
      <div className="flex-1 overflow-hidden min-h-0 mb-20" style={{ background: '#f8f9fa' }}>
        {moduleType === 'reading' ? (
          <ResizableSplitPane
            left={
              <div className="h-full overflow-y-auto bg-white">
                {currentSectionData?.title && !currentSectionData.title.match(/^(Reading )?Passage \d+/i) && (
                  <div className="px-6 py-4 border-b">
                    <h2 className="font-bold text-[25px]">{currentSectionData.title}</h2>
                  </div>
                )}
                <div className="px-6 pt-6 pb-32">
                  <div className="max-w-none leading-relaxed">
                    {(currentSectionData?.text || currentSectionData?.content || '').split('\n\n').map((paragraph, idx) => (
                      <div key={idx} className="mb-4">
                        <p className="text-[16.5px] font-medium leading-[1.85]" style={{ fontFamily: 'Georgia, serif' }}>
                          {paragraph.trim()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            }
            right={
              <div className="h-full overflow-y-auto bg-white">
                <div className="px-6 pt-6 pb-32">
                  <div className="mb-4">
                    <h3 className="font-bold text-sm">Questions {rangeText}</h3>
                  </div>
                  <div className="space-y-6">
                    {currentBlocks.map((block, blockIndex) => {
                      const blockStartIndex = getStartIndex(blockOffset + blockIndex);
                      return (
                        <div key={block.id} id={`question-${blockStartIndex}`}>
                          {block.instruction && <p className="text-[20px] font-bold mb-3">{block.instruction}</p>}
                          <ReviewQuestionBlock
                            block={block}
                            startIndex={blockStartIndex}
                            userAnswers={userAnswers}
                            correctAnswersMap={correctAnswersMap}
                            showCorrect={showCorrect}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            }
          />
        ) : (
          /* Listening layout - single column */
          <div className="h-full overflow-y-auto bg-white">
            <div className="w-full px-6 lg:px-10 pt-4 py-8 max-w-[1600px]">
              {currentBlocks.map((block) => {
                const blockStart = getListeningStartIndex(block.id);
                return (
                  <div key={block.id} className="mb-14" id={`question-${blockStart}`}>
                    {(block.title || block.instruction) && (
                      <div className="mb-8">
                        {block.title && !block.title.match(/^(Section|Part) \d+/i) && (
                          <h3 className="font-bold text-[26px] mb-1">{block.title}</h3>
                        )}
                        {block.instruction && (
                          <p className="text-[22px] font-bold opacity-80 leading-snug">{block.instruction}</p>
                        )}
                      </div>
                    )}
                    <div className={block.image ? "flex flex-col lg:flex-row justify-between items-start" : "flex flex-col"}>
                      {block.image && (
                        <div className="lg:w-[47.5%] w-full flex-shrink-0">
                          <img src={block.image} alt="Question visual" className="w-full rounded border border-gray-200 shadow-lg" />
                        </div>
                      )}
                      <div className={block.image ? "lg:w-[47.5%] w-full min-w-0" : "w-full"}>
                        <ReviewQuestionBlock
                          block={block}
                          startIndex={blockStart}
                          userAnswers={userAnswers}
                          correctAnswersMap={correctAnswersMap}
                          showCorrect={showCorrect}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══ BOTTOM NAVIGATOR ═══ */}
      <TestNavigator
        parts={moduleType === 'reading'
          ? sections.map((_, i) => `Part ${i + 1}`)
          : listeningParts.map(p => p.label)
        }
        activePart={activePassage}
        onPartChange={setActivePassage}
        questionNumbers={questionNumbers}
        answeredIds={answeredIds}
        partQuestionRanges={partQuestionRanges}
        onSubmit={() => setShowResults(true)}
        currentQuestion={currentQuestion}
        onNext={handleNext}
        onPrev={handlePrev}
        reviewMode={true}
      />
    </div>
  );
}

// ── Review Question Block — dispatches to per-type review components ──
function ReviewQuestionBlock({ block, startIndex, userAnswers, correctAnswersMap, showCorrect }) {
  const props = { data: block, startIndex, userAnswers, correctAnswersMap, showCorrect };

  switch (block.type) {
    case 'gap_fill':
      return <ReviewGapFill {...props} />;
    case 'matrix_match':
    case 'radio_matrix':
      return <ReviewRadioMatrix {...props} />;
    case 'true_false':
    case 'yes_no':
    case 'multiple_choice':
      return <ReviewTrueFalse {...props} />;
    case 'match_dropdown':
      return <ReviewMatchDropdown {...props} />;
    case 'drag_drop_summary':
      return <ReviewDragDropSummary {...props} />;
    case 'flow_chart':
      return <ReviewFlowChart {...props} />;
    case 'table':
      return <ReviewTableCompletion {...props} />;
    case 'checkbox_multiple':
      return <ReviewCheckboxMultiple {...props} />;
    default:
      return <ReviewGenericBlock {...props} />;
  }
}

// ── Review GapFill ──
function ReviewGapFill({ data, userAnswers, correctAnswersMap, showCorrect }) {
  const parse = require('html-react-parser').default;

  const options = {
    replace: (domNode) => {
      if (domNode.type === 'text') {
        const text = domNode.data;
        if (/\{\d+\}/.test(text)) {
          const parts = text.split(/(\{\d+\})/g);
          return (
            <>
              {parts.map((part, index) => {
                const match = part.match(/^\{(\d+)\}$/);
                if (match) {
                  const qId = match[1];
                  const userAns = userAnswers[qId] || '';
                  const serverData = correctAnswersMap[qId];
                  const isCorrect = serverData?.correct || false;
                  const correctAns = serverData?.correctAnswer;
                  const isUnanswered = !userAns || userAns.trim() === '';
                  const borderColor = isUnanswered ? '#ef4444' : isCorrect ? '#10b981' : '#ef4444';
                  const bgColor = isUnanswered ? '#fef2f2' : isCorrect ? '#f0fdf4' : '#fef2f2';

                  return (
                    <span key={index} className="relative inline-flex items-center gap-1 mx-1 align-middle">
                      <input
                        type="text"
                        value={userAns || ''}
                        readOnly
                        className="px-1 py-0 h-[1.3em] text-center border rounded font-semibold text-[inherit]"
                        style={{
                          width: `${Math.max(80, (userAns.length * 10) + 40)}px`,
                          borderColor, background: bgColor,
                          color: isUnanswered ? '#ef4444' : isCorrect ? '#065f46' : '#991b1b',
                        }}
                      />
                      {!isUnanswered && (
                        <span style={{ fontSize: '0.85em', fontWeight: 700, color: isCorrect ? '#10b981' : '#ef4444' }}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                      {showCorrect && !isCorrect && correctAns && (
                        <span className="text-[0.85em] font-bold italic" style={{ color: '#10b981' }}>
                          (✓ {Array.isArray(correctAns) ? correctAns[0] : correctAns})
                        </span>
                      )}
                      {isUnanswered && (
                        <span className="text-[0.75em] font-semibold" style={{ color: '#ef4444' }}>N/A</span>
                      )}
                    </span>
                  );
                }
                return <span key={index}>{part}</span>;
              })}
            </>
          );
        }
      }
    }
  };

  return (
    <div className="mb-8 font-sans">
      <div className="space-y-3 leading-loose text-gray-800">
        <div className="leading-[2.5] [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_li]:mb-2 [&_li]:mt-1">
          {parse(data.content, options)}
        </div>
      </div>
    </div>
  );
}

// ── Fallback Generic Block ──
function ReviewGenericBlock({ data, startIndex, userAnswers, correctAnswersMap, showCorrect }) {
  if (!data.questions) return null;

  return (
    <div className="mb-8 font-sans space-y-4">
      {data.questions.map((q, qIdx) => {
        const globalNum = startIndex + qIdx;
        const qId = String(globalNum);
        const userAns = userAnswers[qId] || '';
        const serverData = correctAnswersMap[qId];
        const isCorrect = serverData?.correct || false;
        const correctAns = serverData?.correctAnswer;
        const isUnanswered = !userAns || userAns.trim() === '';

        return (
          <div key={q.id || qId}
            className="rounded-lg p-4 border"
            style={{
              background: isUnanswered ? '#fef2f2' : isCorrect ? '#f0fdf4' : '#fff5f5',
              borderColor: isUnanswered ? '#fecaca' : isCorrect ? '#bbf7d0' : '#fecaca',
            }}
          >
            <div className="flex gap-3 mb-2">
              <span
                className="inline-flex items-center justify-center w-[2em] h-[2em] rounded-full text-white font-bold text-sm flex-shrink-0"
                style={{ background: isUnanswered ? '#d1d5db' : isCorrect ? '#10b981' : '#ef4444' }}
              >{globalNum}</span>
              {q.text && (
                <div className="flex-1 pt-0.5 text-gray-900 leading-normal" dangerouslySetInnerHTML={{ __html: q.text }} />
              )}
            </div>
            <div className="ml-[3em] text-sm font-semibold" style={{ color: isUnanswered ? '#9ca3af' : isCorrect ? '#065f46' : '#991b1b' }}>
              Your answer: {isUnanswered ? '—' : userAns} {!isUnanswered && (isCorrect ? '✓' : '✗')}
            </div>
            {showCorrect && !isCorrect && correctAns && (
              <div className="ml-[3em] text-sm font-bold italic mt-1" style={{ color: '#10b981' }}>
                ✓ Correct: {Array.isArray(correctAns) ? correctAns.join(' / ') : correctAns}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
