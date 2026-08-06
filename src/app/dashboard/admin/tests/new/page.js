"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Headphones, BookOpen, PenTool, Layers, ArrowLeft } from "lucide-react";
import TestBuilder from "../components/TestBuilder";
import { emptyDataForType } from "../lib/emptyTemplates";

const TYPES = [
  {
    key: "listening",
    label: "Listening",
    icon: Headphones,
    desc: "4 part, 40 savol, bitta audio URL",
    cls: "text-sky-600 bg-sky-50 dark:bg-sky-950",
  },
  {
    key: "reading",
    label: "Reading",
    icon: BookOpen,
    desc: "3 passage, 40 savol",
    cls: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
  },
  {
    key: "writing",
    label: "Writing",
    icon: PenTool,
    desc: "Task 1 (grafik) + Task 2 (esse), AI baholash",
    cls: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  },
  {
    key: "full_mock",
    label: "Full Mock",
    icon: Layers,
    desc: "L + R + W birga — faqat o'quv markazlar uchun",
    cls: "text-purple-600 bg-purple-50 dark:bg-purple-950",
  },
];

export default function NewTestPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [type, setType] = useState(null);

  useEffect(() => {
    if (user && user.user_metadata?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.user_metadata?.role !== "admin") return null;

  if (type) {
    return (
      <TestBuilder
        key={type}
        initial={{ id: null, test_id: "", type, data: emptyDataForType(type) }}
        mode="create"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard/admin/tests")}
          className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Yangi test</h1>
          <p className="text-sm text-muted-foreground">Test turini tanlang</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TYPES.map(({ key, label, icon: Icon, desc, cls }) => (
          <button
            key={key}
            onClick={() => setType(key)}
            className="text-left rounded-2xl border border-border bg-card p-5 hover:border-indigo-400 hover:shadow-md transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${cls}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="font-bold group-hover:text-indigo-600 transition-colors">{label}</div>
            <div className="text-xs text-muted-foreground mt-1">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
