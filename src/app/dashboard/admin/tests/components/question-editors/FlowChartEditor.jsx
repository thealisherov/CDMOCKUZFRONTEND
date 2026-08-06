"use client";

/**
 * flowChart: flowchart_completion.
 * Har savol = bitta qadam (box). Options bilan — drag word bank (javob harf),
 * optionssiz — yozma javob (______ bo'sh joy kerak).
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import QuestionRow, { AddQuestionButton, questionListActions, lettersFromOptions } from "./QuestionRow";
import { emptyQuestion } from "../../lib/emptyTemplates";

export default function FlowChartEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyQuestion);

  const bank = questions[0]?.options || [];
  const hasBank = bank.length > 0;
  const letters = lettersFromOptions(bank);

  function setBank(opts) {
    mutateGroup((g) => {
      // Flow-chart'da options har savolda takrorlanadi (word bank rejimi)
      g.questions.forEach((q) => {
        if (opts.length) q.options = [...opts];
        else delete q.options;
      });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-muted-foreground">Rejim:</label>
        <button
          type="button"
          onClick={() => setBank(hasBank ? [] : ["A ", "B ", "C ", "D "])}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            hasBank ? "bg-indigo-600 text-white border-indigo-600" : "border-border hover:bg-muted"
          }`}
        >
          {hasBank ? "Word bank (drag & drop)" : "Yozma javob"}
        </button>
        <span className="text-xs text-muted-foreground">
          {hasBank ? "— javoblar harf bilan" : "— har qadam ______ bo'sh joy bilan"}
        </span>
      </div>

      {hasBank && (
        <OptionsListEditor
          label="Variantlar (har savolga nusxalanadi)"
          options={bank}
          onChange={setBank}
          format="letter"
        />
      )}

      <div className="space-y-2">
        {questions.map((q, i) => (
          <div key={i}>
            <QuestionRow
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
                placeholder={hasBank ? "Qadam matni... ______ joyiga harf sudraladi" : "Qadam matni... ______ bo'sh joy bilan"}
              />
              {hasBank ? (
                <AnswerInput
                  answer={q.answer}
                  onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
                  answerShape="letter"
                  choices={letters}
                />
              ) : (
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
              )}
            </QuestionRow>
            {i < questions.length - 1 && (
              <div className="text-center text-muted-foreground text-lg leading-none py-0.5">↓</div>
            )}
          </div>
        ))}
        <AddQuestionButton onClick={add} label="Qadam qo'shish" />
      </div>
    </div>
  );
}
