"use client";

import { useEffect, useState } from "react";
import { History, Zap, Target, Timer, Clock, Award, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function TypingHistory() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/typing/attempts?limit=50");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Tarixni yuklashda xatolik");
      setAttempts(json.attempts || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground">Typing Mashqlari Tarixi</h3>
          <p className="text-xs text-muted-foreground">
            Barcha topshirilgan typing testlari va tezlik ko&apos;rsatkichlari
          </p>
        </div>
        <span className="text-xs font-semibold text-muted-foreground px-3 py-1 bg-muted rounded-full">
          Jami: {attempts.length} ta mashq
        </span>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card">
          <History className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
          <h4 className="text-base font-bold text-foreground">Mashqlar tarixi bo&apos;sh</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Hali birorta typing testini topshirmadingiz. Yuqoridagi &quot;Mashq qilish&quot; bo&apos;limiga o&apos;ting!
          </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/40 border-b border-border text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Sana</th>
                  <th className="py-3.5 px-3">Tezlik (WPM)</th>
                  <th className="py-3.5 px-3">Aniqlik</th>
                  <th className="py-3.5 px-3">Rejim</th>
                  <th className="py-3.5 px-3">Belgilar</th>
                  <th className="py-3.5 px-4 text-right">Vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-muted-foreground">
                      {new Date(a.created_at).toLocaleString("uz-UZ", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-extrabold text-base text-indigo-600 dark:text-indigo-400">
                        {a.wpm} <span className="text-[10px] font-bold text-muted-foreground">WPM</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {a.accuracy}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                        {a.mode === "time" ? `${a.mode_value}s vaqt` : `${a.mode_value} so'z`}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-muted-foreground font-mono">
                      <span className="text-emerald-600 font-bold">{a.correct_chars}</span> / <span className="text-red-500 font-bold">{a.incorrect_chars}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-muted-foreground">
                      {a.duration_seconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
