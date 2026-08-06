"use client";

/**
 * Test meta (header) formasi — tur bo'yicha maydonlar.
 */

import UrlInput from "./primitives/UrlInput";

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-indigo-500/30";

export default function TestHeaderForm({ testId, setTestId, type, data, mutateData, centers = [] }) {
  const isFullMock = type === "full_mock";
  const isWriting = type === "writing";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Test ma'lumotlari</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="test_id (unikal DB kaliti)" required>
          <input
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            placeholder='masalan: "Listening Volume 7.1"'
            className={`${inputCls} font-mono`}
          />
        </Field>
        <Field label="Ichki id (data.id)">
          <input
            value={data.id || ""}
            onChange={(e) => mutateData((d) => { d.id = e.target.value; })}
            placeholder='masalan: "Volume Listening 7_1"'
            className={`${inputCls} font-mono`}
          />
        </Field>
      </div>

      <Field label="Sarlavha (title)" required>
        <input
          value={data.title || ""}
          onChange={(e) => mutateData((d) => { d.title = e.target.value; })}
          placeholder="IELTS Listening Mock Test Volume 7 Test 1"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {!isFullMock && (
          <Field label="Vaqt (daqiqa)" required>
            <input
              type="number"
              min={1}
              value={data.timer ?? ""}
              onChange={(e) => mutateData((d) => { d.timer = Number(e.target.value); })}
              className={inputCls}
            />
          </Field>
        )}
        <Field label="Tution" required>
          <select
            value={data.testTution || "free"}
            onChange={(e) => mutateData((d) => { d.testTution = e.target.value; })}
            className={inputCls}
          >
            <option value="free">Bepul (free)</option>
            <option value="paid">Premium (paid)</option>
          </select>
        </Field>
        {!isWriting && (
          <>
            <Field label="Daraja (level)">
              <select
                value={data.level || "medium"}
                onChange={(e) => mutateData((d) => { d.level = e.target.value; })}
                className={inputCls}
              >
                <option value="easy">Oson</option>
                <option value="medium">O'rta</option>
                <option value="hard">Qiyin</option>
              </select>
            </Field>
            <Field label="Test manbasi (testType)">
              <select
                value={data.testType || "volume"}
                onChange={(e) => mutateData((d) => { d.testType = e.target.value; })}
                className={inputCls}
              >
                <option value="volume">Volume</option>
                <option value="authentic_material">Authentic material</option>
                <option value="cambridge_material">Cambridge material</option>
                <option value="practice">Practice</option>
              </select>
            </Field>
          </>
        )}
      </div>

      <Field label={isFullMock ? "O'quv markaz (majburiy — full_mock faqat markaz uchun)" : "O'quv markaz (bo'sh = Platforma testi)"} required={isFullMock}>
        <select
          value={data.center || ""}
          onChange={(e) =>
            mutateData((d) => {
              if (e.target.value) d.center = e.target.value;
              else delete d.center;
            })
          }
          className={inputCls}
        >
          <option value="">— Platforma (markaz yo'q) —</option>
          {centers.map((c) => (
            <option key={c.id || c.slug} value={c.slug}>
              {c.name || c.slug} ({c.slug})
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-muted-foreground">
          center_id ni DB trigger data.center slug'idan avtomatik hisoblaydi.
        </p>
      </Field>

      {type === "listening" && (
        <UrlInput
          label="Audio URL (butun test uchun BITTA fayl)"
          value={data.audio || ""}
          onChange={(v) => mutateData((d) => { d.audio = v; })}
          kind="audio"
          required
        />
      )}

      {!isWriting && !isFullMock && (
        <Field label="Tavsif (description — ro'yxat kartasida ko'rinadi, ixtiyoriy)">
          <textarea
            value={data.description || ""}
            onChange={(e) => mutateData((d) => { d.description = e.target.value; })}
            rows={2}
            className={`${inputCls} resize-y`}
          />
        </Field>
      )}

      {isFullMock && (
        <div className="space-y-3 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground">
            Instruction videolar (ixtiyoriy — bo'sh qolsa global default ishlatiladi)
          </p>
          {["listening", "reading", "writing"].map((k) => (
            <UrlInput
              key={k}
              label={`${k.charAt(0).toUpperCase() + k.slice(1)} video`}
              value={data.instructionVideos?.[k] || ""}
              onChange={(v) =>
                mutateData((d) => {
                  if (!d.instructionVideos) d.instructionVideos = {};
                  if (v.trim()) d.instructionVideos[k] = v;
                  else delete d.instructionVideos[k];
                })
              }
              kind="video"
            />
          ))}
        </div>
      )}
    </div>
  );
}
