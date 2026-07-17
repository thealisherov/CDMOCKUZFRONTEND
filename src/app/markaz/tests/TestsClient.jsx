"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Headphones, BookOpen, PenLine, Loader2, LogOut, ArrowRight, Clock, ListChecks, Layers
} from "lucide-react";

const TYPE_META = {
  listening: { icon: Headphones, label: "Listening", iconBg: "bg-blue-50 text-blue-600", accent: "text-blue-600" },
  reading:   { icon: BookOpen,   label: "Reading",   iconBg: "bg-green-50 text-green-600", accent: "text-green-600" },
  writing:   { icon: PenLine,    label: "Writing",   iconBg: "bg-purple-50 text-purple-600", accent: "text-purple-600" },
  full_mock: { icon: Layers,     label: "Full Mock", iconBg: "bg-indigo-50 text-indigo-600", accent: "text-indigo-600" },
};

export default function TestsClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(null);
  const [tests, setTests] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    fetch("/api/centers/tests", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) { router.replace("/markaz"); return; }
        const d = await r.json();
        if (d.kind === "admin") { router.replace("/markaz/panel"); return; }
        setCenter(d.center);
        setTests(d.tests || []);
        setIsPreview(!!d.preview);
      })
      .catch(() => router.replace("/markaz"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = async () => {
    await fetch("/api/centers/logout", { method: "POST" });
    router.replace("/markaz");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
          {center?.image
            ? <img src={center.image} alt="" className="w-12 h-12 rounded-xl object-cover border" />
            : <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center"><Building2 className="w-6 h-6 text-white" /></div>}
          <div>
            <h1 className="text-xl font-bold text-slate-800">{center?.name}</h1>
            <p className="text-sm text-slate-500">Mavjud testlar</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 px-3 py-2 rounded-lg hover:bg-white">
          <LogOut className="w-4 h-4" /> Chiqish
        </button>
      </div>

      {isPreview && (
        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-700">
          <b>Sinov rejimi (admin preview)</b> — bu sessiyada ishlangan testlar natijasi <b>saqlanmaydi</b>.
          O'quvchi sifatida haqiqiy topshirish uchun "Chiqish" qilib, o'quvchi login bilan qayta kiring.
        </div>
      )}

      {tests.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <ListChecks className="w-10 h-10 mx-auto mb-3 opacity-40" />
          Hozircha test yo'q.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tests.map((t) => {
            const meta = TYPE_META[t.type] || TYPE_META.reading;
            const Icon = meta.icon;
            return (
              <button
                key={`${t.type}-${t.id}`}
                onClick={() => router.push(`/markaz/test/${t.type}/${t.id}`)}
                className="group text-left bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-indigo-200 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-semibold uppercase tracking-wide ${meta.accent}`}>{meta.label}</span>
                </div>
                <h3 className="font-semibold text-slate-800 leading-snug">{t.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {t.duration} daqiqa</span>
                  <span className="text-indigo-600 flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all">
                    Boshlash <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
