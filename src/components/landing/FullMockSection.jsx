"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, Clock, ShieldCheck, Award, Sparkles, Headphones, BookOpen, PenTool, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function FullMockSection() {
  const router = useRouter();
  const { t } = useTranslation();
  const [testCount, setTestCount] = useState(0);

  useEffect(() => {
    fetch("/api/fullmock")
      .then(r => r.json())
      .then(d => setTestCount(d.tests?.length || 0))
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: Headphones,
      title: t("fullMock.listeningTitle"),
      desc: t("fullMock.listeningDesc"),
      color: "oklch(0.55 0.22 270)",
      bg: "oklch(0.55 0.22 270 / 0.08)",
      border: "oklch(0.55 0.22 270 / 0.2)",
    },
    {
      icon: BookOpen,
      title: t("fullMock.readingTitle"),
      desc: t("fullMock.readingDesc"),
      color: "oklch(0.52 0.16 145)",
      bg: "oklch(0.52 0.16 145 / 0.08)",
      border: "oklch(0.52 0.16 145 / 0.2)",
    },
    {
      icon: PenTool,
      title: t("fullMock.writingTitle"),
      desc: t("fullMock.writingDesc"),
      color: "oklch(0.65 0.2 40)",
      bg: "oklch(0.65 0.2 40 / 0.08)",
      border: "oklch(0.65 0.2 40 / 0.2)",
    },
  ];

  return (
    <section
      id="full-mock"
      className="py-24 relative overflow-hidden bg-background"
      style={{ background: "var(--background)" }}
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, oklch(0.48 0.22 270 / 0.12), transparent 70%)" }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: "oklch(0.48 0.22 270 / 0.08)",
              border: "1px solid oklch(0.48 0.22 270 / 0.2)",
              color: "oklch(0.48 0.22 270)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("fullMock.badge")}
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground leading-tight">
            {t("fullMock.title1")}{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "linear-gradient(135deg, oklch(0.48 0.22 270), #6366f1, oklch(0.65 0.2 40))",
              }}
            >
              {t("fullMock.titleHighlight")}
            </span>{" "}
            {t("fullMock.title2")}
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t("fullMock.desc")}
          </p>
        </div>

        {/* 3 Section Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative flex flex-col p-6 rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                  boxShadow: "0 2px 16px oklch(0 0 0 / 0.04)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs font-semibold" style={{ color: f.color }}>
                  <CheckCircle2 className="w-4 h-4" /> {t("fullMock.integrated")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Card with CTA */}
        <div
          className="max-w-5xl mx-auto rounded-3xl p-8 sm:p-10 relative overflow-hidden border border-border flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{
            background: "linear-gradient(135deg, oklch(0.48 0.22 270 / 0.05), oklch(0.55 0.2 290 / 0.08))",
          }}
        >
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-bold" style={{ color: "oklch(0.48 0.22 270)" }}>
              <Clock className="w-4 h-4" /> {t("fullMock.accessCode")}
            </div>
            <h4 className="text-xl sm:text-2xl font-bold text-foreground">
              {t("fullMock.tryNow")}
            </h4>
            <p className="text-sm text-muted-foreground max-w-md">
              {testCount > 0 ? `${testCount} ${t("fullMock.testsAvailable")}` : t("fullMock.testsReady")}.
              {" "}{t("fullMock.takeExam")}
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard/fullmock")}
            className="px-8 py-4 rounded-xl text-sm font-black tracking-wide text-white transition-all duration-200 hover:opacity-90 hover:scale-[1.02] shadow-lg flex items-center gap-2 shrink-0"
            style={{
              background: "linear-gradient(135deg, oklch(0.48 0.22 270), #4f46e5)",
              boxShadow: "0 4px 20px oklch(0.48 0.22 270 / 0.35)",
            }}
          >
            <Layers className="w-4 h-4" />
            {t("fullMock.ctaBtn")}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
