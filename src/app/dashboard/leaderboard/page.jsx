import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import LeaderboardClient from "./LeaderboardClient";

export default async function LeaderboardPage() {
  let initialData = { leaderboard: [], currentUser: null };

  try {
    const supabase = await createClient();
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Fetch ALL users via admin client
      const { data: publicUsers } = await supabaseAdmin
        .from("users")
        .select("*");

      const students = (publicUsers || []).filter((u) => u.role !== "admin");

      // Fetch all user_stats
      const { data: allStats } = await supabaseAdmin
        .from("user_stats")
        .select("*");

      const statsMap = {};
      (allStats || []).forEach((s) => {
        statsMap[s.user_id] = s;
      });

      // Build leaderboard
      const leaderboard = students.map((u) => {
        const stats = statsMap[u.id] || {};
        return {
          user_id: u.id,
          full_name:
            u.full_name || u.email?.split("@")[0] || "Unknown",
          email: u.email,
          avatar_url: u.avatar_url || null,
          xp: stats.xp || 0,
          tests_taken: stats.tests_taken || 0,
          correct_answers: stats.correct_answers || 0,
          total_time_seconds: stats.total_time_seconds || 0,
          daily_streak: stats.daily_streak || 0,
          isCurrentUser: u.id === user.id,
        };
      });

      // Sort by XP descending
      leaderboard.sort((a, b) => {
        if (b.xp !== a.xp) return b.xp - a.xp;
        if (b.tests_taken !== a.tests_taken)
          return b.tests_taken - a.tests_taken;
        return (a.full_name || "").localeCompare(b.full_name || "");
      });

      // Assign ranks
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      const currentUser = leaderboard.find((e) => e.isCurrentUser);

      initialData = {
        leaderboard,
        currentUser: currentUser || null,
      };
    }
  } catch (err) {
    console.error("[LeaderboardPage] Server fetch error:", err);
  }

  return <LeaderboardClient initialData={initialData} />;
}
