"use client";

/**
 * letterRange: map_labeling / plan_labeling (listening).
 * Harf diapazoni INSTRUCTION matnidan regex bilan o'qiladi — shuning uchun
 * editor From/To tanlovini instruction ichiga yozadi.
 * Rasm guruh yoki part darajasida bo'lishi kerak.
 */

import AnswerInput from "../primitives/AnswerInput";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";

const ALPHABET = "ABCDEFGHIJKLMNOP".split("");
const RANGE_RE = /([A-Z])\s*[-–]\s*([A-Z])/;

function emptyLabelQuestion() {
  return { number: -1, question: "", answer: "", alternativeAnswers: [] };
}

export default function LetterRangeEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyLabelQuestion);

  const match = String(group.instruction || "").match(RANGE_RE);
  const from = match ? match[1] : "A";
  const to = match ? match[2] : "H";
  const letters = [];
  for (let c = from.charCodeAt(0); c <= to.charCodeAt(0); c++) letters.push(String.fromCharCode(c));

  function setRange(newFrom, newTo) {
    mutateGroup((g) => {
      const instr = String(g.instruction || "");
      if (RANGE_RE.test(instr)) {
        g.instruction = instr.replace(RANGE_RE, `${newFrom}-${newTo}`);
      } else {
        g.instruction = instr
          ? `${instr.replace(/\.?\s*$/, "")}. Choose the correct letter, ${newFrom}-${newTo}.`
          : `Label the map below. Choose the correct letter, ${newFrom}-${newTo}.`;
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-muted-foreground">Harf diapazoni:</label>
        <select
          value={from}
          onChange={(e) => setRange(e.target.value, to)}
          className="px-2 py-1.5 rounded-lg border border-border bg-card text-sm font-bold outline-none"
        >
          {ALPHABET.map((L) => <option key={L} value={L}>{L}</option>)}
        </select>
        <span className="text-muted-foreground">—</span>
        <select
          value={to}
          onChange={(e) => setRange(from, e.target.value)}
          className="px-2 py-1.5 rounded-lg border border-border bg-card text-sm font-bold outline-none"
        >
          {ALPHABET.map((L) => <option key={L} value={L}>{L}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">
          (instruction matniga yoziladi — adapter shundan o'qiydi)
        </span>
      </div>

      {!match && (
        <p className="text-xs text-amber-600">
          Instruction'da hali diapazon yo'q — yuqoridagi tanlov instruction'ga qo'shadi.
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
              <input
                value={q.question ?? q.text ?? ""}
                onChange={(e) => mutateGroup((g) => { g.questions[i].question = e.target.value; })}
                placeholder="Joy nomi (masalan: Oven, Reception...)"
                className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
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
        <AddQuestionButton onClick={add} label="Joy qo'shish" />
      </div>
    </div>
  );
}
