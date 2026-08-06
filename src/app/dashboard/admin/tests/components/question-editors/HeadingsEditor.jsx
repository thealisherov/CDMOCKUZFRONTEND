"use client";

/**
 * headings: matching_headings (reading).
 * Sarlavhalar ro'yxati rim raqamli ("i. ...") — questions[0].options da saqlanadi
 * (adapter faqat birinchi savolning options'ini o'qiydi).
 * Har savol: "Paragraph A" + rim raqamli javob.
 */

import AnswerInput from "../primitives/AnswerInput";
import OptionsListEditor from "../primitives/OptionsListEditor";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";

function emptyHeadingQuestion() {
  return { number: -1, question: "", answer: "", alternativeAnswers: [] };
}

function romansFromOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => {
      const m = typeof o === "string" ? o.trim().match(/^([ivxlc]+)[.\s]/i) : null;
      return m ? m[1].toLowerCase() : null;
    })
    .filter(Boolean);
}

export default function HeadingsEditor({ group, mutateGroup, passageContent }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyHeadingQuestion);
  const headings = questions[0]?.options || [];
  const romans = romansFromOptions(headings);

  // Passage'dan paragraf yorliqlarini aniqlash
  const paragraphLabels = [];
  if (passageContent) {
    String(passageContent)
      .split(/\n\n+/)
      .forEach((p) => {
        const m = p.trim().match(/^(?:Paragraph\s+)?([A-Z])(?:\s|$)/);
        if (m && !paragraphLabels.includes(m[1])) paragraphLabels.push(m[1]);
      });
  }

  function setHeadings(opts) {
    mutateGroup((g) => {
      if (!g.questions.length) g.questions.push(emptyHeadingQuestion());
      g.questions[0].options = opts;
    });
  }

  return (
    <div className="space-y-3">
      <OptionsListEditor
        label="Sarlavhalar ro'yxati (List of Headings)"
        options={headings}
        onChange={setHeadings}
        format="roman"
        minCount={3}
      />

      {paragraphLabels.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Passage'da topilgan paragraflar: <span className="font-mono font-bold">{paragraphLabels.join(", ")}</span>
        </p>
      ) : (
        <p className="text-xs text-amber-600">
          Passage matnida "A " yoki "Paragraph A" bilan boshlanadigan paragraflar topilmadi —
          matching_headings ishlashi uchun paragraflar shunday yorliqlanishi kerak.
        </p>
      )}

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
            <div className="flex items-center gap-2">
              {paragraphLabels.length > 0 ? (
                <select
                  value={q.question || ""}
                  onChange={(e) => mutateGroup((g) => { g.questions[i].question = e.target.value; })}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none"
                >
                  <option value="">— paragraf —</option>
                  {paragraphLabels.map((L) => (
                    <option key={L} value={`Paragraph ${L}`}>Paragraph {L}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={q.question || ""}
                  onChange={(e) => mutateGroup((g) => { g.questions[i].question = e.target.value; })}
                  placeholder='masalan: "Paragraph A"'
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              )}
              <AnswerInput
                answer={q.answer}
                onChange={(a) => mutateGroup((g) => { g.questions[i].answer = a; })}
                answerShape="romanNumeral"
                choices={romans}
                compact
              />
            </div>
          </QuestionRow>
        ))}
        <AddQuestionButton onClick={add} label="Paragraf qo'shish" />
      </div>
    </div>
  );
}
