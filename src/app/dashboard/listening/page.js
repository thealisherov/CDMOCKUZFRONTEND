"use client";

import { useState, useEffect } from "react";
import TestListLayout from "@/components/TestListLayout";
import { useTranslation } from "@/components/LanguageContext";

export default function ListeningPage() {
  const { t } = useTranslation();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTests() {
      try {
        const res = await fetch("/api/tests?type=listening");
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch (err) {
        console.error("Listening testlarni yuklashda xatolik:", err);
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
      title={t("sidebar.listening", { defaultValue: "Listening" })}
      description={t("testList.listeningDesc")}
      tests={tests}
      moduleType="listening"
    />
  );
}
