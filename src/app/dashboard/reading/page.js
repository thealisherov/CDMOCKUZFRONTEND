import { createClient } from "@/utils/supabase/server";
import ReadingClient from "./ReadingClient";

export const dynamic = 'force-dynamic';

export default async function ReadingPage() {
  let initialTests = [];

  try {
    const supabase = await createClient();

    const { data: rows } = await supabase
      .from("Tests")
      .select("id, test_id, type, data, created_at")
      .eq("type", "reading")
      .order("created_at", { ascending: true });

    // Check user attempts
    let completedMap = {};
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: attempts } = await supabase
          .from("TestAttempts")
          .select("test_numeric_id, test_type, band_score")
          .eq("user_id", user.id)
          .eq("test_type", "reading");

        if (attempts) {
          attempts.forEach((a) => {
            const key = `reading_${a.test_numeric_id}`;
            if (
              !completedMap[key] ||
              parseFloat(a.band_score) >
                parseFloat(completedMap[key].bestBand || "0")
            ) {
              completedMap[key] = {
                completed: true,
                bestBand: a.band_score,
              };
            }
          });
        }
      }
    } catch {
      /* not logged in */
    }

    initialTests = (rows || []).map((row, index) => {
      const d = row.data || {};
      const numericId = index + 1;
      const attemptInfo = completedMap[`reading_${numericId}`];

      let resolvedTestType = d.testFormat || d.testType;
      let questionsCount = d.totalQuestions || 40;
      let passageNum = 1;

      if (d.passages && Array.isArray(d.passages) && d.passages.length === 1) {
        passageNum = d.passages[0].passageNumber || 1;
        let actualCount = d.passages[0].questionGroups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0);
        questionsCount = actualCount || d.totalQuestions || 13;
        if (!resolvedTestType || resolvedTestType === "full_test") {
          resolvedTestType = `passage_${passageNum}`;
        }
      } else if (!resolvedTestType) {
        resolvedTestType = "full_test";
      }

      let testDesc = d.description || "";
      if (!testDesc) {
        if (resolvedTestType === "full_test") {
          testDesc = "3 Passages · 40 Questions";
        } else if (resolvedTestType.startsWith("passage_")) {
          testDesc = `Passage ${resolvedTestType.split("_")[1]} · ${questionsCount} Questions`;
        } else {
          testDesc = `${resolvedTestType.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} · ${questionsCount} Questions`;
        }
      }

      return {
        id: numericId,
        supabaseId: row.id,
        test_id: row.test_id,
        type: row.type,
        title: d.title || `Test ${index + 1}`,
        description: testDesc,
        duration: d.timer || 60,
        level: d.level || "medium",
        testType: resolvedTestType,
        questions: questionsCount,
        access:
          d.testTution === "paid" || d.access === "paid"
            ? "premium"
            : d.testTution || d.access || "free",
        completed: attemptInfo?.completed || false,
        bestBand: attemptInfo?.bestBand || null,
      };
    });
  } catch (err) {
    console.error("[ReadingPage] Server fetch error:", err);
  }

  return <ReadingClient initialTests={initialTests} />;
}
