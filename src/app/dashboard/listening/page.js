import { createClient } from "@/utils/supabase/server";
import ListeningClient from "./ListeningClient";

export default async function ListeningPage() {
  let initialTests = [];

  try {
    const supabase = await createClient();

    const { data: rows } = await supabase
      .from("Tests")
      .select("id, test_id, type, data, created_at")
      .eq("type", "listening")
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
          .eq("test_type", "listening");

        if (attempts) {
          attempts.forEach((a) => {
            const key = `listening_${a.test_numeric_id}`;
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
      const attemptInfo = completedMap[`listening_${numericId}`];
      return {
        id: numericId,
        supabaseId: row.id,
        test_id: row.test_id,
        type: row.type,
        title: d.title || `Test ${index + 1}`,
        description:
          d.testFormat === "full_test" || (!d.testFormat && (!d.testType || d.testType === "full_test"))
            ? "4-Section Listening · 40 Questions"
            : d.description || `${(d.testFormat || d.testType || "Part").replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} · ${d.totalQuestions || 10} Questions`,
        duration: d.timer || 40,
        level: d.level || "medium",
        testType: d.testFormat || d.testType || "full_test",
        questions: d.totalQuestions || 40,
        access:
          d.testTution === "paid" || d.access === "paid"
            ? "premium"
            : d.testTution || d.access || "free",
        completed: attemptInfo?.completed || false,
        bestBand: attemptInfo?.bestBand || null,
      };
    });
  } catch (err) {
    console.error("[ListeningPage] Server fetch error:", err);
  }

  return <ListeningClient initialTests={initialTests} />;
}
