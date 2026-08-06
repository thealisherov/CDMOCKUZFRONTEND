"use client";

/**
 * Jonli preview — student ko'radigan HAQIQIY pipeline orqali:
 *   prepareForSave → adaptListeningData/adaptReadingData → QuestionRenderer.
 * "Javob kaliti" rejimida extractAnswers natijasi ham ko'rsatiladi.
 * Error boundary — adapter xatosi builderni yiqitmasin.
 */

import React, { useMemo, useState } from "react";
import { Eye, Key, AlertTriangle } from "lucide-react";
import QuestionRenderer from "@/components/ielts-questions/QuestionRenderer";
import { adaptListeningData } from "@/utils/listeningDataAdapter";
import adaptReadingData from "@/utils/readingDataAdapter";
import { extractAnswers } from "@/lib/ielts-checker";
import { prepareForSave } from "../lib/serialize";

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch() {}
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-700 dark:text-red-300">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Preview xatosi
          </p>
          <p className="text-xs mt-1 font-mono">{String(this.state.error?.message || this.state.error)}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function getBlockQCount(block) {
  if (block.answers) return Object.keys(block.answers).length;
  if (["gap_fill", "drag_drop_summary", "flow_chart", "table"].includes(block.type)) {
    const m = block.content?.match(/\{\d+\}/g);
    return m ? m.length : 0;
  }
  if (block.type === "checkbox_multiple" && block.questions) {
    return block.questions.reduce((sum, q) => sum + (q.numbers ? q.numbers.length : 1), 0);
  }
  if (block.questions) return block.questions.length;
  return 0;
}

function AnswerKeyTable({ answers }) {
  const entries = Object.entries(answers || {});
  if (!entries.length) return null;
  return (
    <div className="rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 p-3">
      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1">
        <Key className="w-3.5 h-3.5" /> Javoblar kaliti
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
        {entries
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([num, val]) => (
            <div key={num} className="text-xs flex gap-1.5">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 w-6 shrink-0">{num}.</span>
              <span className="truncate" title={val.answer}>
                {val.answer}
                {val.alternatives?.length > 0 && (
                  <span className="text-muted-foreground"> (+{val.alternatives.length})</span>
                )}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}

function ModulePreview({ module, sectionData, showAnswers }) {
  const { blocks, answers, error } = useMemo(() => {
    try {
      if (module === "listening") {
        const adapted = adaptListeningData(JSON.parse(JSON.stringify(sectionData)));
        return { blocks: adapted?.sections || [], answers: extractAnswers(sectionData), error: null };
      }
      const adapted = adaptReadingData(JSON.parse(JSON.stringify(sectionData)));
      const blocks = (adapted?.passages || []).flatMap((p, pi) =>
        (p.questions || []).map((b) => ({ ...b, __passage: pi + 1, __passageTitle: p.title }))
      );
      return { blocks, answers: extractAnswers(sectionData), error: null };
    } catch (e) {
      return { blocks: [], answers: {}, error: e };
    }
  }, [module, sectionData]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/50 p-3 text-xs text-red-700 dark:text-red-300">
        Adapter xatosi: {String(error.message || error)}
      </div>
    );
  }

  let cursor = 1;
  return (
    <div className="space-y-4">
      {showAnswers && <AnswerKeyTable answers={answers} />}
      {blocks.map((block, i) => {
        const startIndex = cursor;
        cursor += getBlockQCount(block);
        return (
          <div key={i} className="rounded-lg border border-border bg-white dark:bg-card p-3">
            {block.__passage && i > 0 && blocks[i - 1].__passage !== block.__passage && (
              <p className="text-xs font-bold text-muted-foreground mb-2">
                Passage {block.__passage}: {block.__passageTitle}
              </p>
            )}
            {block.partLabel && (
              <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">
                {block.partLabel} · {block.questionRange}
              </p>
            )}
            {block.instruction && (
              <p className="text-xs italic text-muted-foreground mb-2">{block.instruction}</p>
            )}
            {block.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={block.image} alt="" className="max-h-72 rounded-md mb-2" />
            )}
            <QuestionRenderer
              data={block}
              startIndex={startIndex}
              userAnswers={{}}
              onAnswersChange={() => {}}
            />
          </div>
        );
      })}
      {blocks.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">Hali savollar yo'q</p>
      )}
    </div>
  );
}

function WritingPreview({ sectionData }) {
  return (
    <div className="space-y-4">
      {(sectionData.tasks || []).map((t, i) => (
        <div key={i} className="rounded-lg border border-border bg-white dark:bg-card p-4 space-y-2">
          <p className="font-bold text-sm">{t.title || `Task ${t.taskNumber}`}</p>
          {String(t.content || "")
            .split(/\n\n+/)
            .map((p, pi) => (
              <p key={pi} className="text-sm leading-relaxed">{p}</p>
            ))}
          {t.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.image} alt="" className="max-h-80 rounded-md" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function PreviewPane({ type, data }) {
  const [showAnswers, setShowAnswers] = useState(true);
  const [mockTab, setMockTab] = useState("listening");

  // Saqlanadigan ko'rinish bilan bir xil (renumber + normalizatsiya)
  const prepared = useMemo(() => {
    try {
      return prepareForSave(type, data);
    } catch {
      return data;
    }
  }, [type, data]);

  const resetKey = useMemo(() => JSON.stringify(prepared).length, [prepared]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
        <Eye className="w-4 h-4 text-indigo-600" />
        <span className="font-bold text-sm">Jonli preview</span>
        <span className="text-[10px] text-muted-foreground">(student ko'radigan render)</span>
        <div className="flex-1" />
        {type !== "writing" && (
          <button
            type="button"
            onClick={() => setShowAnswers((s) => !s)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
              showAnswers ? "bg-emerald-600 text-white border-emerald-600" : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Key className="w-3 h-3" /> Javoblar
          </button>
        )}
      </div>

      {type === "full_mock" && (
        <div className="flex gap-1 mb-3">
          {["listening", "reading", "writing"].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMockTab(k)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mockTab === k ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1">
        <PreviewErrorBoundary resetKey={resetKey}>
          {type === "listening" && (
            <ModulePreview module="listening" sectionData={prepared} showAnswers={showAnswers} />
          )}
          {type === "reading" && (
            <ModulePreview module="reading" sectionData={prepared} showAnswers={showAnswers} />
          )}
          {type === "writing" && <WritingPreview sectionData={prepared} />}
          {type === "full_mock" && (
            <>
              {mockTab === "listening" && prepared.sections?.listening && (
                <ModulePreview module="listening" sectionData={prepared.sections.listening} showAnswers={showAnswers} />
              )}
              {mockTab === "reading" && prepared.sections?.reading && (
                <ModulePreview module="reading" sectionData={prepared.sections.reading} showAnswers={showAnswers} />
              )}
              {mockTab === "writing" && prepared.sections?.writing && (
                <WritingPreview sectionData={prepared.sections.writing} />
              )}
            </>
          )}
        </PreviewErrorBoundary>
      </div>
    </div>
  );
}
