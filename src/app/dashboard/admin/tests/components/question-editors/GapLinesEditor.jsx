"use client";

/**
 * gapLines: note/sentence/summary/form_completion.
 * Har savol — bo'sh joyli (______ ) matn + javob.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";
import { emptyQuestion } from "../../lib/emptyTemplates";

function blanksIn(text) {
  return ((text || "").match(/_{3,}/g) || []).length + ((text || "").match(/\{\d+\}/g) || []).length;
}

export default function GapLinesEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyQuestion);

  return (
    <div className="space-y-2">
      {questions.map((q, i) => {
        const blanks = blanksIn(q.question);
        return (
          <QuestionRow
            key={i}
            number={q.number}
            index={i}
            count={questions.length}
            onMove={(dir) => move(i, dir)}
            onDelete={() => remove(i)}
          >
            <RichTextArea
              value={q.question}
              onChange={(v) => mutateGroup((g) => { g.questions[i].question = v; })}
              rows={2}
              placeholder="Matn... bo'sh joy uchun ______ tugmasini bosing"
            />
            {blanks === 0 && (
              <p className="text-xs text-red-600">Bo'sh joy yo'q — "______" qo'shing</p>
            )}
            {blanks > 1 && (
              <p className="text-xs text-amber-600">{blanks} ta bo'sh joy — bitta raqamga bitta bo'sh joy tavsiya etiladi</p>
            )}
            <AnswerInput
              answer={q.answer}
              alternativeAnswers={q.alternativeAnswers || []}
              onChange={(a, alts) =>
                mutateGroup((g) => {
                  g.questions[i].answer = a;
                  g.questions[i].alternativeAnswers = alts;
                })
              }
              answerShape="text"
            />
          </QuestionRow>
        );
      })}
      <AddQuestionButton onClick={add} />
    </div>
  );
}
