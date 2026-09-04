import { createClient } from "@/utils/supabase/server";
import { getCachedReadingTests } from "@/utils/cachedTests";
import ReadingClient from "./ReadingClient";

export const dynamic = 'force-dynamic';

export default async function ReadingPage() {
  let initialTests = [];

  try {
    const supabase = await createClient();

    // Fetch cached tests list and auth user in parallel
    const [baseTests, userResult] = await Promise.all([
      getCachedReadingTests(),
      supabase.auth.getUser().catch(() => ({ data: { user: null } })),
    ]);

    const user = userResult?.data?.user;
    let completedMap = {};

    if (user) {
      try {
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
      } catch (err) {
        console.error("[ReadingPage] Error fetching attempts:", err);
      }
    }

    initialTests = (baseTests || []).map((test) => {
      const attemptInfo = completedMap[`reading_${test.id}`];
      return {
        ...test,
        completed: attemptInfo?.completed || false,
        bestBand: attemptInfo?.bestBand || null,
      };
    });

    // Newest-added tests first (numeric #id stays position-based for routing)
    initialTests.reverse();
  } catch (err) {
    console.error("[ReadingPage] Server fetch error:", err);
  }

  return <ReadingClient initialTests={initialTests} />;
}
