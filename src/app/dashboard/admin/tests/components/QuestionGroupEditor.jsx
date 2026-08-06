"use client";

/**
 * Savol guruhi umumiy ramkasi: instruction (shablonlar bilan), guruh rasmi,
 * so'ng turga mos editor. Editor map qila olmagan guruh — raw JSON kartada.
 */

import { useState } from "react";
import { ChevronDown, Braces } from "lucide-react";
import { GROUP_TYPE_CONFIG, canonicalGroupType } from "../lib/groupTypeConfig";
import { EDITOR_REGISTRY } from "./question-editors";
import UrlInput from "./primitives/UrlInput";
import CollapsibleCard from "./primitives/CollapsibleCard";

function questionCountOf(group) {
  let n = 0;
  (group.questions || []).forEach((q) => {
    if (Array.isArray(q.numbers)) n += q.numbers.length;
    else if (q.number !== 0 && !(q.number == null)) n += 1;
  });
  return n;
}

function rangeOf(group) {
  const nums = [];
  (group.questions || []).forEach((q) => {
    if (Array.isArray(q.numbers)) nums.push(...q.numbers);
    else if (Number.isInteger(q.number) && q.number > 0) nums.push(q.number);
  });
  if (!nums.length) return "";
  return nums.length === 1 ? `${nums[0]}` : `${Math.min(...nums)}–${Math.max(...nums)}`;
}

/** Guruh ichidagi raw JSON fallback editori */
function RawGroupEditor({ group, mutateGroup }) {
  const [text, setText] = useState(() => JSON.stringify(group, null, 2));
  const [error, setError] = useState(null);

  function apply() {
    try {
      const parsed = JSON.parse(text);
      setError(null);
      mutateGroup((g, replace) => replace(parsed));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-amber-600">
        Bu guruh turi vizual editorda qo'llab-quvvatlanmaydi — JSON ko'rinishida tahrirlang.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={12}
        spellCheck={false}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs font-mono outline-none resize-y"
      />
      {error && <p className="text-xs text-red-600">JSON xato: {error}</p>}
      <button
        type="button"
        onClick={apply}
        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
      >
        Qo'llash
      </button>
    </div>
  );
}

export default function QuestionGroupEditor({
  group,
  mutateGroup, // (fn(groupDraft, replaceFn)) => void
  module,
  passageContent, // matching_headings uchun
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}) {
  const [showTemplates, setShowTemplates] = useState(false);
  const canonical = canonicalGroupType(group.groupType);
  const config = canonical ? GROUP_TYPE_CONFIG[canonical] : null;
  const Editor = config ? EDITOR_REGISTRY[config.editorKind] : null;

  const qCount = questionCountOf(group);
  const range = rangeOf(group);

  return (
    <CollapsibleCard
      title={config?.label || group.groupType}
      subtitle={range ? `savollar ${range}` : `${qCount} savol`}
      badge={range || "—"}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onDelete={onDelete}
      canMoveUp={canMoveUp}
      canMoveDown={canMoveDown}
      headerExtra={
        !Editor && (
          <span title="Raw JSON rejimi">
            <Braces className="w-4 h-4 text-amber-500 shrink-0" />
          </span>
        )
      }
    >
      {Editor ? (
        <>
          {/* Instruction */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted-foreground">Instruction (ko'rsatma)</label>
              {config.instructionTemplates?.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTemplates((s) => !s)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                  >
                    Shablonlar <ChevronDown className="w-3 h-3" />
                  </button>
                  {showTemplates && (
                    <div className="absolute right-0 top-6 z-20 w-96 rounded-lg border border-border bg-card shadow-lg p-1">
                      {config.instructionTemplates.map((t, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            mutateGroup((g) => { g.instruction = t.replace("{range}", range || "X-Y"); });
                            setShowTemplates(false);
                          }}
                          className="block w-full text-left px-3 py-2 rounded-md text-xs hover:bg-muted transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <textarea
              value={group.instruction || ""}
              onChange={(e) => mutateGroup((g) => { g.instruction = e.target.value; })}
              rows={2}
              placeholder="Complete the notes below. Write ONE WORD ONLY for each answer."
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30 resize-y"
            />
          </div>

          {/* Guruh rasmi */}
          <UrlInput
            label={`Guruh rasmi (ixtiyoriy${config.requiresImage ? " — bu tur uchun tavsiya etiladi" : ""})`}
            value={group.image || ""}
            onChange={(v) => mutateGroup((g) => { if (v.trim()) g.image = v; else delete g.image; })}
            kind="image"
          />

          <Editor group={group} mutateGroup={mutateGroup} module={module} config={config} passageContent={passageContent} />
        </>
      ) : (
        <RawGroupEditor group={group} mutateGroup={mutateGroup} />
      )}
    </CollapsibleCard>
  );
}
