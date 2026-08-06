"use client";

/**
 * mcqMultiSpread: multiple_choice_multiple_answer (listening).
 * Options GURUH darajasida; har to'g'ri javobga alohida savol
 * ("First answer:", "Second answer:" ...). Adapter ularni bitta blokka birlashtiradi.
 */

import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import { lettersFromOptions } from "./QuestionRow";

const ORDINALS = ["First", "Second", "Third", "Fourth"];

export default function McqMultiSpreadEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const letters = lettersFromOptions(group.options);

  function setCount(n) {
    mutateGroup((g) => {
      const current = g.questions.length;
      if (n > current) {
        for (let i = current; i < n; i++) {
          g.questions.push({
            number: -1,
            question: `${ORDINALS[i] || `${i + 1}-`} answer:`,
            answer: "",
            alternativeAnswers: [],
          });
        }
      } else {
        g.questions.length = n;
      }
    });
  }

  return (
    <div className="space-y-3">
      <OptionsListEditor
        label="Variantlar (guruh darajasida)"
        options={group.options || []}
        onChange={(opts) => mutateGroup((g) => { g.options = opts; })}
        format="letter"
        minCount={3}
      />

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">
          Nechta javob tanlanadi?
        </label>
        <div className="flex gap-1">
          {[2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                questions.length === n
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-border hover:bg-muted"
              }`}
            >
              {n} ta
            </button>
          ))}
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
              <span className="w-8 h-8 shrink-0 rounded-lg bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                {q.number > 0 ? q.number : "•"}
              </span>
              <span className="text-sm text-muted-foreground flex-1">{q.question}</span>
              <AnswerInput
                answer={q.answer}
                onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
                answerShape="letter"
                choices={letters}
                compact
              />
            </div>
          ))}
          {(() => {
            const chosen = questions.map((q) => q.answer).filter(Boolean);
            const dups = chosen.filter((a, i) => chosen.indexOf(a) !== i);
            return dups.length > 0 ? (
              <p className="text-xs text-red-600">Bir xil harf ikki marta tanlangan: {[...new Set(dups)].join(", ")}</p>
            ) : null;
          })()}
        </div>
      )}
      {questions.length === 0 && (
        <p className="text-xs text-muted-foreground">Yuqorida javoblar sonini tanlang</p>
      )}
    </div>
  );
}
