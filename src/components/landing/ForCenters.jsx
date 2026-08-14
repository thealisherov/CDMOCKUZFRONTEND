"use client";

import { useTranslation } from "@/components/LanguageContext";
import {
  GraduationCap,
  Building2,
  BarChart3,
  Users,
  ShieldCheck,
  Send,
  ChevronRight,
  Sparkles,
  Monitor,
  Trophy,
} from "lucide-react";

export default function ForCenters() {
  const { t } = useTranslation();

  const benefits = [
    {
      icon: Monitor,
      color: "oklch(0.48 0.22 270)",
      bg: "oklch(0.48 0.22 270 / 0.08)",
      border: "oklch(0.48 0.22 270 / 0.2)",
    },
    {
      icon: BarChart3,
      color: "#e22d2d",
      bg: "rgba(226,45,45,0.07)",
      border: "rgba(226,45,45,0.2)",
    },
    {
      icon: Users,
      color: "oklch(0.52 0.16 145)",
      bg: "oklch(0.52 0.16 145 / 0.08)",
      border: "oklch(0.52 0.16 145 / 0.2)",
    },
    {
      icon: ShieldCheck,
      color: "oklch(0.55 0.18 250)",
      bg: "oklch(0.55 0.18 250 / 0.08)",
      border: "oklch(0.55 0.18 250 / 0.2)",
    },
  ];

  const benefitTexts = Array.isArray(t("centers.benefits"))
    ? t("centers.benefits")
    : [];

  return (
    <section
      id="for-centers"
      className="py-24 relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.48 0.22 270 / 0.15) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, oklch(0.52 0.16 145 / 0.15) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
            style={{
              background: "oklch(0.52 0.16 145 / 0.08)",
              border: "1px solid oklch(0.52 0.16 145 / 0.22)",
              color: "oklch(0.42 0.14 145)",
            }}
          >
            <Building2 className="w-3.5 h-3.5" />
            {t("centers.badge")}
          </div>
          <h2
            className="text-3xl font-black tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            {t("centers.title")}
          </h2>
          <p
            className="mx-auto max-w-[700px] text-base md:text-lg"
            style={{ color: "var(--muted-foreground)" }}
          >
            {t("centers.desc")}
          </p>
        </div>

        {/* Main CTA Card */}
        <div className="max-w-5xl mx-auto mb-16">
          <div
            className="relative rounded-3xl overflow-hidden transition-all duration-500"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.48 0.22 270 / 0.06) 0%, oklch(0.52 0.16 145 / 0.04) 100%)",
              border: "1.5px solid var(--border)",
              boxShadow: "0 8px 40px oklch(0 0 0 / 0.06)",
            }}
          >
            {/* Inner glow */}
            <div
              className="absolute top-0 right-0 w-[300px] h-[300px] opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.48 0.22 270 / 0.12) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 p-8 md:p-12">
              {/* Left: Illustration / Visual */}
              <div className="lg:w-2/5 flex items-center justify-center">
                <div className="relative">
                  {/* Spinning ring */}
                  <div
                    className="absolute inset-0 w-[220px] h-[220px] border-2 rounded-full animate-[spin_25s_linear_infinite] m-auto"
                    style={{
                      borderColor: "oklch(0.48 0.22 270 / 0.15)",
                      borderStyle: "dashed",
                      top: "-10px",
                      left: "-10px",
                      right: "-10px",
                      bottom: "-10px",
                    }}
                  />

                  {/* Center icon block */}
                  <div
                    className="w-[200px] h-[200px] rounded-[32px] flex flex-col items-center justify-center relative"
                    style={{
                      background: "var(--card)",
                      border: "1.5px solid var(--border)",
                      boxShadow:
                        "0 16px 48px oklch(0 0 0 / 0.08), 0 0 0 1px oklch(0.48 0.22 270 / 0.1)",
                    }}
                  >
                    <div
                      className="absolute -top-3 -right-3 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg animate-bounce"
                      style={{
                        background: "oklch(0.52 0.16 145)",
                      }}
                    >
                      PRO
                    </div>
                    <GraduationCap
                      className="w-14 h-14 mb-3"
                      style={{ color: "oklch(0.48 0.22 270)" }}
                    />
                    <span
                      className="text-2xl font-black tracking-tight"
                      style={{ color: "var(--foreground)" }}
                    >
                      MEGA
                    </span>
                    <span
                      className="text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      IELTS
                    </span>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-4 -left-6 animate-pulse delay-200">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        background: "oklch(0.48 0.22 270 / 0.1)",
                        border: "1px solid oklch(0.48 0.22 270 / 0.2)",
                      }}
                    >
                      <Trophy
                        className="w-5 h-5"
                        style={{ color: "oklch(0.48 0.22 270)", opacity: 0.6 }}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-4 -right-6 animate-pulse delay-500">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{
                        background: "oklch(0.52 0.16 145 / 0.1)",
                        border: "1px solid oklch(0.52 0.16 145 / 0.2)",
                      }}
                    >
                      <Sparkles
                        className="w-5 h-5"
                        style={{
                          color: "oklch(0.52 0.16 145)",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Text + CTA */}
              <div className="lg:w-3/5 space-y-6">
                <h3
                  className="text-2xl md:text-3xl font-black tracking-tight leading-tight"
                  style={{ color: "var(--foreground)" }}
                >
                  {t("centers.ctaTitle")}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {t("centers.ctaDesc")}
                </p>

                {/* Pricing */}
                <div
                  className="inline-flex items-baseline gap-3 px-6 py-4 rounded-2xl"
                  style={{
                    background: "oklch(0.52 0.16 145 / 0.06)",
                    border: "1.5px solid oklch(0.52 0.16 145 / 0.2)",
                  }}
                >
                  <span
                    className="text-3xl md:text-4xl font-black tracking-tight"
                    style={{ color: "oklch(0.52 0.16 145)" }}
                  >
                    299 000
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    UZS
                  </span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(0.52 0.16 145 / 0.1)",
                      color: "oklch(0.42 0.14 145)",
                    }}
                  >
                    {t("centers.priceNote")}
                  </span>
                </div>

                {/* Telegram Admin Button */}
                <a
                  href="https://t.me/megaielts_admin"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="center-telegram-btn"
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 hover:opacity-90 hover:translate-y-[-2px] active:scale-[0.98] group"
                  style={{
                    background: "linear-gradient(135deg, #0088cc, #005580)",
                    boxShadow: "0 8px 24px rgba(0, 136, 204, 0.3)",
                  }}
                >
                  <Send className="w-5 h-5 rotate-[-10deg] group-hover:rotate-0 transition-transform duration-300" />
                  {t("centers.contactBtn")}
                  <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefitTexts.map((benefit, index) => {
            const { icon: Icon, color, bg, border } =
              benefits[index] || benefits[0];
            return (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 hover:translate-y-[-4px]"
                style={{
                  background: "var(--card)",
                  border: `1.5px solid var(--border)`,
                  boxShadow: "0 2px 16px oklch(0 0 0 / 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 36px ${bg}, 0 0 0 1px ${border}`;
                  e.currentTarget.style.borderColor = border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 2px 16px oklch(0 0 0 / 0.04)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h4
                  className="font-bold text-sm mb-1"
                  style={{ color: "var(--foreground)" }}
                >
                  {benefit.title}
                </h4>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {benefit.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
