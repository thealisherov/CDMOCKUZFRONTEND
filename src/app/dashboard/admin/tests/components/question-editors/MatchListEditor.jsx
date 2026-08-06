"use client";

/**
 * matchList: matching oilasi (listening dropdown / reading radio matrix, sentence endings...).
 * Guruh darajasida options + har savolda stem + harf javob.
 */

import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import RichTextArea from "../primitives/RichTextArea";
import QuestionRow, { AddQuestionButton, questionListActions, lettersFromOptions } from "./QuestionRow";

function emptyMatchQuestion() {
  return { number: -1, question: "", answer: "", alternativeAnswers: [] };
}

export default function MatchListEditor({ group, mutateGroup, config }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyMatchQuestion);

  // Options guruhda YOKI birinchi savolda bo'lishi mumkin (mavjud testlar bilan moslik)
  const optionsOnFirstQ = !group.options?.length && questions[0]?.options?.length;
  const options = group.options?.length ? group.options : questions[0]?.options || [];
  const letters = lettersFromOptions(options);

  function setOptions(opts) {
    mutateGroup((g) => {
      if (optionsOnFirstQ && g.questions[0]) g.questions[0].options = opts;
      else g.options = opts;
    });
  }

  return (
    <div className="space-y-3">
      {config?.supportsLegendTitle && (
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">
            Legend sarlavhasi (ixtiyoriy)
          </label>
          <input
            value={group.legendTitle || ""}
            onChange={(e) => mutateGroup((g) => { g.legendTitle = e.target.value; })}
            placeholder='masalan: "List of Researchers"'
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
      )}

      <OptionsListEditor
        label={`Variantlar ro'yxati${optionsOnFirstQ ? " (birinchi savolda saqlangan)" : " (guruh darajasida)"}`}
        options={options}
        onChange={setOptions}
        format="letter"
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
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <RichTextArea
                  value={q.question}
                  onChange={(v) => mutateGroup((g) => { g.questions[i].question = v; })}
                  rows={1}
                  showBlankButton={false}
                  showHtmlButtons={false}
                  placeholder="Savol/gap matni..."
                />
              </div>
              <AnswerInput
                answer={q.answer}
                onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
                answerShape="letter"
                choices={letters}
                compact
              />
            </div>
          </QuestionRow>
        ))}
        <AddQuestionButton onClick={add} />
      </div>
    </div>
  );
}
