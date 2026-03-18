"use client";

import Image from "next/image";
import { Zap, Award, Code2, Rss } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function Founders() {
  const { t } = useTranslation();

  const founders = [
    {
      name: "Mukhammadali Khayrulloyev",
      role: t("founders.mkRole"),
      bio: t("founders.mkBio"),
      initials: "MK",
      image: "/MuhammadaliUstoz.webp",
      gradient: "linear-gradient(160deg, #e22d2d 0%, #9b1a1a 100%)",
      glow: "rgba(226,45,45,0.30)",
      badges: [{ icon: Award, text: t("founders.mkBadge") }],
      accentColor: "#e22d2d",
      bgPattern: "radial-gradient(ellipse at 30% 20%, rgba(226,45,45,0.18) 0%, transparent 60%)",
    },
    {
      name: "Abdulaziz Alisherov",
      role: t("founders.aaRole"),
      bio: t("founders.aaBio"),
      initials: "AA",
      image: "/Abdulaziz.webp",
      gradient: "linear-gradient(160deg, oklch(0.55 0.22 270) 0%, oklch(0.35 0.2 260) 100%)",
      glow: "oklch(0.55 0.22 270 / 0.30)",
      badges: [
        { icon: Code2, text: t("founders.aaBadge1") },
        { icon: Rss,   text: t("founders.aaBadge2") },
      ],
      accentColor: "oklch(0.48 0.22 270)",
      bgPattern: "radial-gradient(ellipse at 70% 20%, oklch(0.68 0.22 270 / 0.18) 0%, transparent 60%)",
    },
  ];

  return (
    <section id="founders" className="py-24" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-4 md:px-6">

        {/* ── Header ── */}
        <div className="text-center mb-16 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
            style={{
              background: "oklch(0.55 0.22 270 / 0.08)",
              border: "1px solid oklch(0.55 0.22 270 / 0.2)",
              color: "oklch(0.48 0.22 270)",
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            {t("founders.badge")}
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--foreground)" }}>
            {t("founders.title")}
          </h2>
          <p className="mx-auto max-w-[600px] text-base" style={{ color: "var(--muted-foreground)" }}>
            {t("founders.desc")}
          </p>
        </div>

        {/* ── Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                boxShadow: "0 4px 32px oklch(0 0 0 / 0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 16px 56px ${founder.glow}, 0 0 0 1.5px ${founder.accentColor}50`;
                e.currentTarget.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 32px oklch(0 0 0 / 0.07)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* ── Image / Avatar block ── */}
              <div
                className="relative w-full overflow-hidden flex items-center justify-center"
                style={{
                  height: "280px",
                  background: founder.gradient,
                }}
              >
                {/* bg glow pattern */}
                <div className="absolute inset-0" style={{ background: founder.bgPattern }} />

                {founder.image ? (
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  /* Initials avatar styled like a real photo placeholder */
                  <div className="relative flex flex-col items-center gap-3">
                    <div
                      className="w-28 h-28 rounded-full flex items-center justify-center border-4 border-white/20 backdrop-blur-sm"
                      style={{ background: "rgba(255,255,255,0.12)" }}
                    >
                      <span className="text-white font-black text-5xl select-none tracking-tight">
                        {founder.initials}
                      </span>
                    </div>
                    <span className="text-white/50 text-xs font-medium">Photo coming soon</span>
                  </div>
                )}

                {/* Bottom gradient fade into card */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
                  style={{
                    background: "linear-gradient(to top, var(--card) 0%, transparent 100%)",
                  }}
                />
              </div>

              {/* ── Info block ── */}
              <div className="flex flex-col gap-4 px-7 pb-7 pt-4">
                {/* Name + role */}
                <div>
                  <h3
                    className="text-xl font-black leading-tight"
                    style={{ color: "var(--foreground)" }}
                  >
                    {founder.name}
                  </h3>
                  <p
                    className="text-sm font-semibold mt-1"
                    style={{ color: founder.accentColor }}
                  >
                    {founder.role}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px w-12 rounded-full" style={{ background: `${founder.accentColor}50` }} />

                {/* Bio */}
                <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  {founder.bio}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-auto pt-1">
                  {founder.badges.map((badge, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                      style={{
                        background: `${founder.accentColor}10`,
                        color: founder.accentColor,
                        border: `1px solid ${founder.accentColor}28`,
                      }}
                    >
                      <badge.icon className="w-3 h-3" />
                      {badge.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
