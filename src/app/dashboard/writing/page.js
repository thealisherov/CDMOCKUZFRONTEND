"use client";

import { writingTests } from "@/data/tests";
import TestListLayout from "@/components/TestListLayout";

export default function WritingPage() {
  return (
    <TestListLayout
      title="Writing"
      description="Practice Task 1 (Academic/General) and Task 2 (Essay)."
      tests={writingTests}
      moduleType="writing"
    />
  );
}
