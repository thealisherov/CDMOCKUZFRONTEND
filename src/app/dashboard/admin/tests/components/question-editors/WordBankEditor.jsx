"use client";

/**
 * wordBank: summary_completion_with_options (reading).
 * So'z banki (A-K) — saqlashda HAR savolga nusxalanadi (serialize.js).
 * Har savol: bo'sh joyli gap + harf javob.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import QuestionRow, { AddQuestionButton, questionListActions, lettersFromOptions } from "./QuestionRow";

function emptyBankQuestion() {
  return { number: -1, question: "", answer: "", alternativeAnswers: [] };
}

export default function WordBankEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyBankQuestion);

  // Bank guruhda yoki birinchi savolda bo'lishi mumkin
  const bank = group.options?.length ? group.options : questions[0]?.options || [];
  const letters = lettersFromOptions(bank);

  function setBank(opts) {
    mutateGroup((g) => {
      g.options = opts; // serialize.js har savolga nusxalaydi
    });
  }

  return (
    <div className="space-y-3">
      <OptionsListEditor
        label="So'z banki (saqlashda har savolga avtomatik nusxalanadi)"
        options={bank}
        onChange={setBank}
        format="letter"
        minCount={4}
      />

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
              placeholder="Gap matni... bo'sh joy uchun ______"
            />
            <AnswerInput
              answer={q.answer}
              onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
              answerShape="letter"
              choices={letters}
            />
          </QuestionRow>
        ))}
        <AddQuestionButton onClick={add} />
      </div>
    </div>
  );
}
