"use client";

/**
 * Test strukturasi editorlari:
 *  - PartsEditor    (listening: parts + audio part rasmlari)
 *  - PassagesEditor (reading: passages + content matn)
 *  - TasksEditor    (writing: 1/2 tasklar)
 * Har biri `section` (data yoki full_mock bo'limi) va `mutateSection(fn)` oladi.
 */

import { Plus } from "lucide-react";
import CollapsibleCard from "./primitives/CollapsibleCard";
import UrlInput from "./primitives/UrlInput";
import QuestionGroupList from "./QuestionGroupList";
import { emptyPart, emptyPassage, emptyTask } from "../lib/emptyTemplates";

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:border-indigo-300 transition-colors flex items-center justify-center gap-2"
    >
      <Plus className="w-4 h-4" /> {label}
    </button>
  );
}

function listOps(mutateSection, key) {
  return {
    move: (i, dir) =>
      mutateSection((s) => {
        const arr = s[key];
        const j = i + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }),
    remove: (i) => mutateSection((s) => { s[key].splice(i, 1); }),
  };
}

export function PartsEditor({ section, mutateSection }) {
  const parts = section.parts || [];
  const { move, remove } = listOps(mutateSection, "parts");

  return (
    <div className="space-y-3">
      {parts.map((part, i) => (
        <CollapsibleCard
          key={i}
          title={`Part ${i + 1}`}
          subtitle={part.questionRange ? `savollar ${part.questionRange}` : ""}
          badge={`P${i + 1}`}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
          onDelete={() => remove(i)}
          canMoveUp={i > 0}
          canMoveDown={i < parts.length - 1}
        >
          <UrlInput
            label="Part rasmi (xarita/plan/diagramma — ixtiyoriy)"
            value={part.image || ""}
            onChange={(v) => mutateSection((s) => { s.parts[i].image = v.trim() ? v : null; })}
            kind="image"
          />
          <QuestionGroupList
            container={part}
            mutateContainer={(fn) => mutateSection((s) => fn(s.parts[i]))}
            module="listening"
          />
        </CollapsibleCard>
      ))}
      {parts.length < 4 && (
        <AddButton
          onClick={() => mutateSection((s) => { s.parts.push(emptyPart(s.parts.length + 1)); })}
          label="Part qo'shish"
        />
      )}
    </div>
  );
}

export function PassagesEditor({ section, mutateSection }) {
  const passages = section.passages || [];
  const { move, remove } = listOps(mutateSection, "passages");

  return (
    <div className="space-y-3">
      {passages.map((passage, i) => {
        const paragraphLabels = [];
        String(passage.content || "")
          .split(/\n\n+/)
          .forEach((p) => {
            const m = p.trim().match(/^(?:Paragraph\s+)?([A-Z])(?:\s|$)/);
            if (m && !paragraphLabels.includes(m[1])) paragraphLabels.push(m[1]);
          });
        return (
          <CollapsibleCard
            key={i}
            title={passage.title || `Passage ${i + 1}`}
            subtitle={passage.questionRange ? `savollar ${passage.questionRange}` : ""}
            badge={`P${i + 1}`}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
            onDelete={() => remove(i)}
            canMoveUp={i > 0}
            canMoveDown={i < passages.length - 1}
          >
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Passage sarlavhasi</label>
              <input
                value={passage.title || ""}
                onChange={(e) => mutateSection((s) => { s.passages[i].title = e.target.value; })}
                placeholder='masalan: "Mungo Lady and Mungo Man"'
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <UrlInput
              label="Passage rasmi (ixtiyoriy)"
              value={passage.image || ""}
              onChange={(v) => mutateSection((s) => { s.passages[i].image = v.trim() ? v : null; })}
              kind="image"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Passage matni (HTML EMAS — paragraflar bo'sh qator bilan)
                </label>
                {paragraphLabels.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    Yorliqli paragraflar: <span className="font-mono font-bold">{paragraphLabels.join(", ")}</span>
                  </span>
                )}
              </div>
              <textarea
                value={passage.content || ""}
                onChange={(e) => mutateSection((s) => { s.passages[i].content = e.target.value; })}
                rows={10}
                spellCheck={false}
                placeholder={"Birinchi paragraf...\n\nIkkinchi paragraf...\n\nmatching_headings uchun: \"A  Matn...\" yoki \"Paragraph A ...\""}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y leading-relaxed"
              />
              {/<[a-z][\s\S]*?>/i.test(passage.content || "") && (
                <p className="mt-1 text-xs text-red-600">
                  Diqqat: content ichida HTML teg bor — faqat oddiy matn ruxsat etiladi!
                </p>
              )}
            </div>
            <QuestionGroupList
              container={passage}
              mutateContainer={(fn) => mutateSection((s) => fn(s.passages[i]))}
              module="reading"
            />
          </CollapsibleCard>
        );
      })}
      {passages.length < 3 && (
        <AddButton
          onClick={() => mutateSection((s) => { s.passages.push(emptyPassage(s.passages.length + 1)); })}
          label="Passage qo'shish"
        />
      )}
    </div>
  );
}

export function TasksEditor({ section, mutateSection }) {
  const tasks = section.tasks || [];

  return (
    <div className="space-y-3">
      {tasks.map((task, i) => (
        <CollapsibleCard
          key={i}
          title={task.title || `Task ${task.taskNumber || i + 1}`}
          badge={`T${task.taskNumber || i + 1}`}
          onDelete={tasks.length > 1 ? () => mutateSection((s) => { s.tasks.splice(i, 1); }) : undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Task raqami</label>
              <select
                value={task.taskNumber || i + 1}
                onChange={(e) => mutateSection((s) => { s.tasks[i].taskNumber = Number(e.target.value); })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none"
              >
                <option value={1}>Task 1 (Task Achievement — grafik/xat)</option>
                <option value={2}>Task 2 (Task Response — esse)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Sarlavha</label>
              <input
                value={task.title || ""}
                onChange={(e) => mutateSection((s) => { s.tasks[i].title = e.target.value; })}
                placeholder="Writing Task 1"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Topshiriq matni (paragraflar bo'sh qator bilan)
            </label>
            <textarea
              value={task.content || ""}
              onChange={(e) => mutateSection((s) => { s.tasks[i].content = e.target.value; })}
              rows={6}
              placeholder={"The chart below shows...\n\nSummarise the information by selecting and reporting the main features."}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
            />
          </div>
          <UrlInput
            label={`Rasm URL ${task.taskNumber === 1 ? "(Task 1 uchun odatda majburiy — grafik/diagramma)" : "(ixtiyoriy)"}`}
            value={task.image || ""}
            onChange={(v) => mutateSection((s) => { s.tasks[i].image = v.trim() ? v : null; })}
            kind="image"
          />
        </CollapsibleCard>
      ))}
      {tasks.length < 2 && (
        <AddButton
          onClick={() => mutateSection((s) => { s.tasks.push(emptyTask(s.tasks.length + 1)); })}
          label="Task qo'shish"
        />
      )}
    </div>
  );
}
