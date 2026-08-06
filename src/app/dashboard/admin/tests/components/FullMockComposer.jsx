"use client";

/**
 * full_mock kompozitori: 3 tab (Listening / Reading / Writing),
 * data.sections.{listening|reading|writing} OBYEKTiga yozadi.
 */

import { useState } from "react";
import { Headphones, BookOpen, PenTool } from "lucide-react";
import { PartsEditor, PassagesEditor, TasksEditor } from "./StructureEditor";
import UrlInput from "./primitives/UrlInput";

const TABS = [
  { key: "listening", label: "Listening", icon: Headphones },
  { key: "reading", label: "Reading", icon: BookOpen },
  { key: "writing", label: "Writing", icon: PenTool },
];

export default function FullMockComposer({ data, mutateData }) {
  const [tab, setTab] = useState("listening");
  const sections = data.sections || {};
  const section = sections[tab] || {};

  const mutateSection = (fn) => mutateData((d) => fn(d.sections[tab]));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 rounded-xl border border-border p-1 bg-card">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-4 h-4" /> {label}
            <span className="text-xs opacity-70">
              {key === "writing"
                ? `${sections[key]?.tasks?.length || 0} task`
                : `${sections[key]?.totalQuestions || 0} savol`}
            </span>
          </button>
        ))}
      </div>

      {/* Bo'lim meta */}
      <div className="rounded-xl border border-border bg-card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Bo'lim sarlavhasi</label>
          <input
            value={section.title || ""}
            onChange={(e) => mutateSection((s) => { s.title = e.target.value; })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1">Vaqt (daqiqa)</label>
          <input
            type="number"
            min={1}
            value={section.timer ?? ""}
            onChange={(e) => mutateSection((s) => { s.timer = Number(e.target.value); })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        {tab === "listening" && (
          <div className="sm:col-span-3">
            <UrlInput
              label="Audio URL (butun listening uchun BITTA fayl)"
              value={section.audio || ""}
              onChange={(v) => mutateSection((s) => { s.audio = v; })}
              kind="audio"
              required
            />
          </div>
        )}
      </div>

      {tab === "listening" && <PartsEditor section={section} mutateSection={mutateSection} />}
      {tab === "reading" && <PassagesEditor section={section} mutateSection={mutateSection} />}
      {tab === "writing" && <TasksEditor section={section} mutateSection={mutateSection} />}
    </div>
  );
}
