"use client";

/**
 * Test Builder qobig'i — butun draft holati shu yerda.
 * update(mutator): data klonlanadi → mutatsiya → renumber (1..N invariant) → setState.
 * Noma'lum kalitlar saqlanadi (klon + joyida mutatsiya, formadan qayta qurilmaydi).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft, Save, Loader2, Braces, LayoutPanelLeft, Eye, EyeOff, Download, History,
} from "lucide-react";
import TestHeaderForm from "./TestHeaderForm";
import { PartsEditor, PassagesEditor, TasksEditor } from "./StructureEditor";
import FullMockComposer from "./FullMockComposer";
import RawJsonEditor from "./RawJsonEditor";
import PreviewPane from "./PreviewPane";
import ValidationPanel from "./ValidationPanel";
import { validateTest, hasErrors } from "../lib/validators";
import { prepareForSave, renumberData } from "../lib/serialize";

const TYPE_LABELS = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  full_mock: "Full Mock",
};

export default function TestBuilder({ initial, mode = "create" }) {
  const router = useRouter();
  const [testId, setTestId] = useState(initial.test_id || "");
  const [data, setData] = useState(() => {
    const d = JSON.parse(JSON.stringify(initial.data || {}));
    renumberData(initial.type, d);
    return d;
  });
  const [centers, setCenters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("visual"); // visual | json
  const [showPreview, setShowPreview] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [draftAvailable, setDraftAvailable] = useState(false);

  const type = initial.type;
  const draftKey = `test-builder-draft-${initial.id || `new-${type}`}`;

  // Markazlar ro'yxati
  useEffect(() => {
    fetch("/api/admin/centers")
      .then((r) => r.json())
      .then((j) => setCenters(j.centers || []))
      .catch(() => {});
  }, []);

  // localStorage draft (crash himoyasi)
  useEffect(() => {
    try {
      if (localStorage.getItem(draftKey)) setDraftAvailable(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistTimer = useRef(null);
  useEffect(() => {
    if (!dirty) return;
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ testId, data, savedAt: Date.now() }));
      } catch {}
    }, 800);
    return () => clearTimeout(persistTimer.current);
  }, [data, testId, dirty, draftKey]);

  function restoreDraft() {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      setTestId(draft.testId || testId);
      setData(draft.data || data);
      setDirty(true);
      setDraftAvailable(false);
      toast.success("Qoralama tiklandi");
    } catch {
      toast.error("Qoralamani o'qib bo'lmadi");
    }
  }

  // Sahifadan chiqishda ogohlantirish
  useEffect(() => {
    const handler = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  /** Yagona mutatsiya kirish nuqtasi: klon → mutator → renumber. */
  const update = useCallback(
    (mutator) => {
      setData((prev) => {
        const next = JSON.parse(JSON.stringify(prev));
        mutator(next);
        renumberData(type, next);
        return next;
      });
      setDirty(true);
    },
    [type]
  );

  // Jonli validatsiya — saqlanadigan ko'rinish ustida
  const issues = useMemo(() => {
    try {
      const prepared = prepareForSave(type, data);
      return validateTest({ test_id: testId || "draft", type, data: prepared });
    } catch (e) {
      return [{ severity: "error", path: "data", message: `Ichki xato: ${e.message}` }];
    }
  }, [type, data, testId]);

  async function handleSave() {
    if (!testId.trim()) {
      toast.error("test_id kiriting");
      return;
    }
    if (hasErrors(issues)) {
      toast.error("Avval validatsiya xatolarini tuzating");
      return;
    }
    setSaving(true);
    try {
      const payload = { test_id: testId.trim(), type, data: prepareForSave(type, data) };
      const url = mode === "edit" ? `/api/admin/tests/${initial.id}` : "/api/admin/tests";
      const res = await fetch(url, {
        method: mode === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.issues?.length) {
          const msg = json.issues
            .filter((i) => i.severity === "error")
            .slice(0, 3)
            .map((i) => i.message)
            .join("; ");
          throw new Error(msg || json.error);
        }
        throw new Error(json.error || "Saqlashda xato");
      }
      setDirty(false);
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      toast.success(mode === "edit" ? "Test yangilandi" : "Test yaratildi");
      if (mode === "create" && json.test?.id) {
        router.replace(`/dashboard/admin/tests/${json.test.id}`);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(prepareForSave(type, data), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(testId || "test").replace(/[^a-zA-Z0-9._-]+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-[1700px] mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => {
            if (dirty && !confirm("Saqlanmagan o'zgarishlar bor. Chiqasizmi?")) return;
            router.push("/dashboard/admin/tests");
          }}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
          title="Orqaga"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-xl font-bold truncate">
            {mode === "edit" ? "Testni tahrirlash" : "Yangi test"}
            <span className="ml-2 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-xs font-bold align-middle">
              {TYPE_LABELS[type]}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {data.title || testId || "..."}
            {dirty && <span className="text-amber-600 font-medium"> • saqlanmagan</span>}
          </p>
        </div>
        <div className="flex-1" />
        {draftAvailable && (
          <button
            onClick={restoreDraft}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
          >
            <History className="w-3.5 h-3.5" /> Qoralamani tiklash
          </button>
        )}
        <button
          onClick={() => setView((v) => (v === "visual" ? "json" : "visual"))}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
            view === "json"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "border-border hover:bg-muted"
          }`}
          title="Vizual / JSON rejim"
        >
          {view === "json" ? <LayoutPanelLeft className="w-3.5 h-3.5" /> : <Braces className="w-3.5 h-3.5" />}
          {view === "json" ? "Vizual" : "JSON"}
        </button>
        {view === "visual" && (
          <button
            onClick={() => setShowPreview((s) => !s)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
            title="Preview panelini yoqish/o'chirish"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Preview
          </button>
        )}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Eksport
        </button>
        <button
          onClick={handleSave}
          disabled={saving || hasErrors(issues)}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Saqlash
        </button>
      </div>

      <ValidationPanel issues={issues} />

      {view === "json" ? (
        <div className="flex-1 min-h-0">
          <RawJsonEditor
            data={prepareForSave(type, data)}
            onApply={(parsed) => {
              setData(() => {
                const next = JSON.parse(JSON.stringify(parsed));
                renumberData(type, next);
                return next;
              });
              setDirty(true);
              toast.success("JSON qo'llandi");
            }}
          />
        </div>
      ) : (
        <div className={`flex-1 min-h-0 grid gap-4 ${showPreview ? "lg:grid-cols-[1fr_minmax(380px,540px)]" : "grid-cols-1"}`}>
          {/* Editor ustuni */}
          <div className="min-w-0 space-y-4 overflow-y-auto pr-1">
            <TestHeaderForm
              testId={testId}
              setTestId={(v) => {
                setTestId(v);
                setDirty(true);
              }}
              type={type}
              data={data}
              mutateData={update}
              centers={centers}
            />
            {type === "listening" && <PartsEditor section={data} mutateSection={update} />}
            {type === "reading" && <PassagesEditor section={data} mutateSection={update} />}
            {type === "writing" && <TasksEditor section={data} mutateSection={update} />}
            {type === "full_mock" && <FullMockComposer data={data} mutateData={update} />}
          </div>

          {/* Preview ustuni */}
          {showPreview && (
            <div className="hidden lg:block rounded-xl border border-border bg-muted/20 p-3 overflow-hidden sticky top-4 max-h-[calc(100vh-2rem)]">
              <PreviewPane type={type} data={data} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
