"use client";

import { Check, X, Zap, Star, Crown, Sparkles } from "lucide-react";
import { useTranslation } from "@/components/LanguageContext";

export default function Pricing() {
  const { t } = useTranslation();

  const tiers = [
    {
      id: "free",
      name: t("pricing.freeName"),
      badge: null,
      icon: Zap,
      price: "0",
      priceLabel: t("pricing.freeLabel"),
      period: t("pricing.freePeriod"),
      description: t("pricing.freeDesc"),
      accentColor: "oklch(0.52 0.16 145)",
      accentBg: "oklch(0.52 0.16 145 / 0.08)",
      accentBorder: "oklch(0.52 0.16 145 / 0.25)",
      popular: false,
      features: t("pricing.freeFeatures") || [],
      notIncluded: t("pricing.freeNotIncluded") || [],
      buttonText: t("pricing.freeBtn"),
      buttonStyle: "outline",
    },
    {
      id: "monthly",
      name: t("pricing.premiumName"),
      badge: t("pricing.premiumBadge"),
      icon: Star,
      price: "69 000",
      priceLabel: t("pricing.premiumLabel"),
      period: t("pricing.premiumPeriod"),
      description: t("pricing.premiumDesc"),
      accentColor: "oklch(0.48 0.22 270)",
      accentBg: "oklch(0.48 0.22 270 / 0.08)",
      accentBorder: "oklch(0.48 0.22 270 / 0.3)",
      popular: true,
      features: t("pricing.premiumFeatures") || [],
      notIncluded: [],
      buttonText: t("pricing.premiumBtn"),
      buttonStyle: "primary",
    },
    {
      id: "quarterly",
      name: t("pricing.quartName"),
      badge: t("pricing.quartBadge"),
      icon: Crown,
      price: "149 000",
      priceLabel: t("pricing.quartLabel"),
      period: t("pricing.quartPeriod"),
      perMonth: t("pricing.quartPerMonth"),
      description: t("pricing.quartDesc"),
      accentColor: "#e22d2d",
      accentBg: "rgba(226,45,45,0.07)",
      accentBorder: "rgba(226,45,45,0.28)",
      popular: false,
      features: t("pricing.quartFeatures") || [],
      notIncluded: [],
      buttonText: t("pricing.quartBtn"),
      buttonStyle: "red",
    },
  ];

  return (
    <section id="pricing" className="py-24" style={{ background: "var(--background)" }}>
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-2"
            style={{
              background: "oklch(0.48 0.22 270 / 0.08)",
              border: "1px solid oklch(0.48 0.22 270 / 0.22)",
              color: "oklch(0.42 0.2 270)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("pricing.badge")}
          </div>
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl" style={{ color: "var(--foreground)" }}>
            {t("pricing.title")}
          </h2>
          <p className="mx-auto max-w-[560px] text-base" style={{ color: "var(--muted-foreground)" }}>
            {t("pricing.desc")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 max-w-5xl mx-auto items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.id}
                className="relative flex flex-col rounded-2xl transition-all duration-300 group"
                style={{
                  background: tier.popular ? tier.accentBg : "var(--card)",
                  border: `1.5px solid ${tier.popular ? tier.accentBorder : "var(--border)"}`,
                  boxShadow: tier.popular
                    ? `0 8px 40px ${tier.accentBg}, 0 0 0 1px ${tier.accentBorder}`
                    : "0 2px 16px oklch(0 0 0 / 0.05)",
                }}
              >
                {/* Popular badge */}
                {tier.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest text-white whitespace-nowrap"
                    style={{
                      background: tier.accentColor,
                      boxShadow: `0 4px 14px ${tier.accentColor}50`,
                    }}
                  >
                    {tier.badge}
                  </div>
                )}

                <div className="flex flex-col flex-1 p-7 pt-8">
                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: tier.accentBg, border: `1px solid ${tier.accentBorder}` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tier.accentColor }} />
                    </div>
                    <div>
                      <h3 className="text-base font-black" style={{ color: "var(--foreground)" }}>
                        {tier.name}
                      </h3>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {tier.description}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div className="flex items-baseline gap-1 flex-wrap">
                      {tier.price === "0" ? (
                        <span className="text-4xl font-black" style={{ color: tier.accentColor }}>
                          {t("pricing.freeLabel")}
                        </span>
                      ) : (
                        <>
                          <span className="text-3xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>
                            {tier.price}
                          </span>
                          <span className="text-sm font-semibold" style={{ color: "var(--muted-foreground)" }}>
                            UZS
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-foreground)" }}>
                      {tier.period}
                      {tier.perMonth && (
                        <span
                          className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{ background: `${tier.accentColor}15`, color: tier.accentColor }}
                        >
                          {tier.perMonth}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-7">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${tier.accentColor}18` }}
                        >
                          <Check className="w-2.5 h-2.5" style={{ color: tier.accentColor }} />
                        </div>
                        <span style={{ color: "var(--foreground)" }}>{f}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm opacity-40">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "var(--muted)" }}>
                          <X className="w-2.5 h-2.5" style={{ color: "var(--muted-foreground)" }} />
                        </div>
                        <span style={{ color: "var(--muted-foreground)" }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200"
                    style={
                      tier.buttonStyle === "primary"
                        ? {
                            background: `linear-gradient(135deg, ${tier.accentColor}, oklch(0.52 0.2 250))`,
                            color: "#fff",
                            boxShadow: `0 4px 20px ${tier.accentColor}45`,
                          }
                        : tier.buttonStyle === "red"
                        ? {
                            background: "linear-gradient(135deg, #e22d2d, #c41e1e)",
                            color: "#fff",
                            boxShadow: "0 4px 20px rgba(226,45,45,0.35)",
                          }
                        : {
                            background: "transparent",
                            color: tier.accentColor,
                            border: `1.5px solid ${tier.accentColor}`,
                          }
                    }
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="text-center text-xs mt-10" style={{ color: "var(--muted-foreground)" }}>
          {t("pricing.note")}
        </p>
      </div>
    </section>
  );
}
