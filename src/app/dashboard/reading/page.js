"use client";

import TestListLayout from "@/components/TestListLayout";
import { useTranslation } from "@/components/LanguageContext";
import { useRealtimeTests } from "@/hooks/useRealtimeTests";

export default function ReadingPage() {
  const { t } = useTranslation();
  const { tests, loading } = useRealtimeTests("reading");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <TestListLayout
      title={t("sidebar.reading", { defaultValue: "Reading" })}
      description={t("testList.readingDesc")}
      tests={tests}
      moduleType="reading"
    />
  );
}
