"use client";

/**
 * mcqMultiCombined: multiple_choice_multiple (reading).
 * BITTA savol obyekti: numbers:[23,24] + answers:['C','D'] + options.
 */

import RichTextArea from "../primitives/RichTextArea";
import OptionsListEditor from "../primitives/OptionsListEditor";
import { lettersFromOptions } from "./QuestionRow";

export default function McqMultiCombinedEditor({ group, mutateGroup }) {
  // Bitta savol bilan ishlaymiz
  const q = group.questions?.[0];

  function ensureQuestion() {
    mutateGroup((g) => {
      if (!g.questions.length) {
        g.questions.push({
          numbers: [0, 0], // renumber to'g'rilaydi
          question: "",
          options: ["A ", "B ", "C ", "D ", "E "],
          answers: [],
        });
      }
    });
  }

  if (!q) {
    return (
      <button
        type="button"
        onClick={ensureQuestion}
        className="w-full py-2 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
      >
        + Savol yaratish
      </button>
    );
  }

  const letters = lettersFromOptions(q.options);
  const count = Array.isArray(q.numbers) ? q.numbers.length : 2;
  const answers = Array.isArray(q.answers) ? q.answers : [];

  function setCount(n) {
    mutateGroup((g) => {
      const qq = g.questions[0];
      qq.numbers = Array.from({ length: n }, (_, i) => qq.numbers?.[i] ?? 0);
      if (Array.isArray(qq.answers) && qq.answers.length > n) qq.answers.length = n;
    });
  }

  function toggleAnswer(letter) {
    mutateGroup((g) => {
      const qq = g.questions[0];
      const cur = Array.isArray(qq.answers) ? [...qq.answers] : [];
      const idx = cur.indexOf(letter);
      if (idx >= 0) cur.splice(idx, 1);
      else if (cur.length < count) cur.push(letter);
      qq.answers = cur.sort();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Savol raqamlari:</span>
        <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold">
          {Array.isArray(q.numbers) && q.numbers[0] > 0 ? q.numbers.join(", ") : "avto"}
        </span>
        <div className="flex gap-1 ml-auto">
          {[2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                count === n ? "bg-indigo-600 text-white border-indigo-600" : "border-border hover:bg-muted"
              }`}
            >
              {n} ta javob
            </button>
          ))}
        </div>
      </div>

      <RichTextArea
        value={q.question}
        onChange={(v) => mutateGroup((g) => { g.questions[0].question = v; })}
        rows={2}
        showBlankButton={false}
        placeholder="Which TWO of the following statements...?"
      />

      <OptionsListEditor
        options={q.options || []}
        onChange={(opts) => mutateGroup((g) => { g.questions[0].options = opts; })}
        format="letter"
        minCount={4}
      />

      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
          To'g'ri javoblar ({answers.length}/{count} tanlandi)
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {letters.map((L) => {
            const selected = answers.includes(L);
            return (
              <button
                key={L}
                type="button"
                onClick={() => toggleAnswer(L)}
                className={`w-9 h-9 rounded-lg text-sm font-bold border transition-colors ${
                  selected
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
              >
                {L}
              </button>
            );
          })}
        </div>
        {answers.length !== count && (
          <p className="mt-1 text-xs text-amber-600">Aynan {count} ta harf tanlanishi kerak</p>
        )}
      </div>
    </div>
  );
}
