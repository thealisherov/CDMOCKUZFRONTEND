"use client";

import TestListLayout from "@/components/TestListLayout";
import { useTranslation } from "@/components/LanguageContext";
import { useRealtimeTests } from "@/hooks/useRealtimeTests";

export default function ListeningClient({ initialTests = [] }) {
  const { t } = useTranslation();
  const { tests, loading } = useRealtimeTests("listening", initialTests);

  if (loading && initialTests.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <TestListLayout
      title={t("sidebar.listening", { defaultValue: "Listening" })}
      description={t("testList.listeningDesc")}
      tests={tests}
      moduleType="listening"
    />
  );
}
