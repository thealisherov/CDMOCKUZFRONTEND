"use client";

/**
 * mcqSingle: multiple_choice (listening A/B/C) va multiple_choice_single (reading A-D).
 * Har savolda o'z options ro'yxati, javob — harf.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import QuestionRow, { AddQuestionButton, questionListActions, lettersFromOptions } from "./QuestionRow";

function emptyMcqQuestion() {
  return { number: -1, question: "", options: ["A ", "B ", "C "], answer: "", alternativeAnswers: [] };
}

export default function McqSingleEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyMcqQuestion);

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
          <OptionsListEditor
            options={q.options || []}
            onChange={(opts) => mutateGroup((g) => { g.questions[i].options = opts; })}
            format="letter"
          />
          <AnswerInput
            answer={q.answer}
            onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
            answerShape="letter"
            choices={lettersFromOptions(q.options)}
          />
        </QuestionRow>
      ))}
      <AddQuestionButton onClick={add} />
    </div>
  );
}
