"use client";

/**
 * tableRows: table_completion.
 * Har savol = jadval qatori ("|" ustun ajratkich).
 *  - Header qator: number = 0, javobsiz, bo'sh joysiz
 *  - #hidden#: bir katakdagi ikkinchi bo'sh joy uchun ({N} bilan birga)
 * Jonli jadval preview pastda.
 */

import RichTextArea from "../primitives/RichTextArea";
import AnswerInput from "../primitives/AnswerInput";
import QuestionRow, { AddQuestionButton, questionListActions } from "./QuestionRow";
import { emptyQuestion } from "../../lib/emptyTemplates";

export default function TableRowsEditor({ group, mutateGroup }) {
  const questions = group.questions || [];
  const { add, remove, move } = questionListActions(mutateGroup, emptyQuestion);

  function addHeaderRow() {
    mutateGroup((g) => {
      g.questions.unshift({ number: 0, question: "Ustun 1 | Ustun 2 | Ustun 3", answer: "" });
    });
  }

  const previewRows = questions
    .filter((q) => String(q.question || "").trim() && q.question !== "#hidden#")
    .map((q) => String(q.question).split("|").map((c) => c.trim()));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={addHeaderRow}
          className="px-3 py-1.5 rounded-lg border border-dashed border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          + Header qator (sarlavha)
        </button>
      </div>

      {questions.map((q, i) => {
        const isHeader = q.number === 0 || (q.number == null && !q.answer);
        const isHidden = String(q.question || "").trim() === "#hidden#";
        return (
          <QuestionRow
            key={i}
            number={isHeader ? null : q.number}
            index={i}
            count={questions.length}
            onMove={(dir) => move(i, dir)}
            onDelete={() => remove(i)}
          >
            {isHeader ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Header qator</span>
                <RichTextArea
                  value={q.question}
                  onChange={(v) => mutateGroup((g) => { g.questions[i].question = v; })}
                  rows={1}
                  showBlankButton={false}
                  showHtmlButtons={false}
                  showTableButtons
                  placeholder="Ustun 1 | Ustun 2 | Ustun 3"
                />
              </div>
            ) : (
              <>
                <RichTextArea
                  value={q.question}
                  onChange={(v) => mutateGroup((g) => { g.questions[i].question = v; })}
                  rows={1}
                  showTableButtons
                  placeholder={`Katak | Katak | ______ yoki {${q.number > 0 ? q.number : "N"}}`}
                />
                {isHidden && (
                  <p className="text-xs text-muted-foreground">
                    Yashirin qator — javob oldingi qatordagi {"{"}
                    {q.number > 0 ? q.number : "N"}
                    {"}"} bo'sh joyiga tegishli
                  </p>
                )}
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
              </>
            )}
          </QuestionRow>
        );
      })}
      <AddQuestionButton onClick={add} label="Qator qo'shish" />

      {previewRows.length > 0 && (
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-xs">
            <tbody>
              {previewRows.map((cells, ri) => (
                <tr key={ri} className="border-b border-border/50 last:border-0">
                  {cells.map((c, ci) => (
                    <td
                      key={ci}
                      className={`px-2 py-1.5 border-r border-border/50 last:border-0 ${ri === 0 ? "font-semibold bg-muted/50" : ""}`}
                      dangerouslySetInnerHTML={{
                        __html: c
                          .replace(/_{3,}/g, '<span style="border-bottom:1.5px solid currentColor;padding:0 16px;opacity:.5"></span>')
                          .replace(/\{(\d+)\}/g, '<b style="color:#6366f1">[$1]</b>'),
                      }}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
