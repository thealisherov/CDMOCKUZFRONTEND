"use client";

/**
 * tfng: true_false_not_given / yes_no_not_given (reading).
 * Options SAQLANMAYDI — adapter o'zi qo'shadi. Javob — 3-lik tanlov.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";

function emptyStatement() {
  return { number: -1, question: "", answer: "", alternativeAnswers: [] };
}

export default function TfngEditor({ group, mutateGroup, config }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyStatement);
  const choices = config?.hardcodedOptions || ["TRUE", "FALSE", "NOT GIVEN"];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {choices.join(" / ")} variantlari studentga avtomatik ko'rsatiladi — bu yerda faqat
        bayonot va to'g'ri javob kiritiladi.
      </p>
      {questions.map((q, i) => (
        <QuestionRow
          key={i}
          number={q.number}
          index={i}
          count={questions.length}
          onMove={(dir) => move(i, dir)}
          onDelete={() => remove(i)}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <RichTextArea
                value={q.question}
                onChange={(v) => mutateGroup((g) => { g.questions[i].question = v; })}
                rows={1}
                showBlankButton={false}
                showHtmlButtons={false}
                placeholder="Bayonot matni..."
              />
            </div>
            <AnswerInput
              answer={q.answer}
              onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
              answerShape="choice"
              choices={choices}
              compact
            />
          </div>
        </QuestionRow>
      ))}
      <AddQuestionButton onClick={add} label="Bayonot qo'shish" />
    </div>
  );
}
