"use client";

import Pricing from "@/components/landing/Pricing";
import { useTranslation } from "@/components/LanguageContext";

export default function PremiumPage() {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col py-6">
      <div className="mb-4 pl-4 md:pl-0">
        <h1 className="text-3xl font-black" style={{ color: 'var(--foreground)' }}>
          {t("premiumPage.title")}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {t("premiumPage.subtitle")}
        </p>
      </div>

      <div className="flex-1 w-full rounded-3xl overflow-y-auto" style={{ background: 'var(--background)' }}>
        <Pricing />
      </div>
    </div>
  );
}
