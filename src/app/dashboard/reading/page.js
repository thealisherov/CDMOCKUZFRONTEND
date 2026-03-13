"use client";

import { useState, useEffect } from "react";
import TestListLayout from "@/components/TestListLayout";
import { useTranslation } from "@/components/LanguageContext";

export default function ReadingPage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch("/api/tests?type=reading");
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch (err) {
        console.error("Reading testlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, []);

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
