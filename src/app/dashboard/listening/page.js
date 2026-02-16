"use client";

import { listeningTests } from "@/data/tests";
import TestListLayout from "@/components/TestListLayout";

export default function ListeningPage() {
  return (
    <TestListLayout
      title="Listening"
      description="Select a test. Audio will play automatically once you start."
      tests={listeningTests}
      moduleType="listening"
    />
  );
}
