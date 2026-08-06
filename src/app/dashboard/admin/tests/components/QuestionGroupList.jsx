"use client";

/**
 * Bitta part/passage ichidagi savol guruhlari ro'yxati.
 * mutateContainer(fn) — konteyner draftini mutatsiya qiluvchi callback.
 */

import { useState } from "react";
import { Plus } from "lucide-react";
import QuestionGroupEditor from "./QuestionGroupEditor";
import GroupTypePicker from "./GroupTypePicker";
import { emptyGroup } from "../lib/emptyTemplates";

export default function QuestionGroupList({ container, mutateContainer, module }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const groups = container.questionGroups || [];

  const mutateGroupAt = (gi) => (fn) =>
    mutateContainer((c) => {
      let replacement;
      fn(c.questionGroups[gi], (newGroup) => { replacement = newGroup; });
      if (replacement !== undefined) c.questionGroups[gi] = replacement;
    });

  function moveGroup(gi, dir) {
    mutateContainer((c) => {
      const j = gi + dir;
      if (j < 0 || j >= c.questionGroups.length) return;
      [c.questionGroups[gi], c.questionGroups[j]] = [c.questionGroups[j], c.questionGroups[gi]];
    });
  }

  function deleteGroup(gi) {
    mutateContainer((c) => { c.questionGroups.splice(gi, 1); });
  }

  function addGroup(groupType) {
    mutateContainer((c) => {
      if (!Array.isArray(c.questionGroups)) c.questionGroups = [];
      c.questionGroups.push(emptyGroup(groupType));
    });
    setPickerOpen(false);
  }

  return (
    <div className="space-y-2">
      {groups.map((group, gi) => (
        <QuestionGroupEditor
          key={gi}
          group={group}
          mutateGroup={mutateGroupAt(gi)}
          module={module}
          passageContent={container.content}
          onMoveUp={() => moveGroup(gi, -1)}
          onMoveDown={() => moveGroup(gi, 1)}
          onDelete={() => deleteGroup(gi)}
          canMoveUp={gi > 0}
          canMoveDown={gi < groups.length - 1}
        />
      ))}
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Savol guruhi qo'shish
      </button>
      {pickerOpen && (
        <GroupTypePicker module={module} onSelect={addGroup} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  );
}
