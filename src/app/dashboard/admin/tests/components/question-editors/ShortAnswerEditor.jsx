"use client";

/**
 * shortAnswer: short_answer. Savol + qisqa matnli javob.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";
import { emptyQuestion } from "../../lib/emptyTemplates";

export default function ShortAnswerEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyQuestion);

  return (
    <div className="space-y-2">
      {questions.map((q, i) => (
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
            rows={1}
            showBlankButton={false}
            placeholder="Savol matni..."
          />
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
      ))}
      <AddQuestionButton onClick={add} />
    </div>
  );
}
