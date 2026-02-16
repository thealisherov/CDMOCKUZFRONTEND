"use client";

import { readingTests } from "@/data/tests";
import TestListLayout from "@/components/TestListLayout";

export default function ReadingPage() {
  return (
    <TestListLayout
      title="Reading"
      description="Select a test to begin your 60-minute practice session."
      tests={readingTests}
      moduleType="reading"
    />
  );
}
