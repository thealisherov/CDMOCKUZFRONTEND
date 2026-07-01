import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const authClient = await createServerClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = user.id;

    // Use service role to completely bypass any RLS policies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [userStatsResult, allAttemptsResult, attemptsResult] = await Promise.all([
      supabase.from("user_stats").select("tests_taken, xp, daily_streak").eq("user_id", userId).maybeSingle(),
      supabase.from("TestAttempts").select("band_score").eq("user_id", userId),
      supabase.from("TestAttempts")
        .select("id, test_numeric_id, test_type, test_title, band_score, completed_at")
        .eq("user_id", userId)
        .order("completed_at", { ascending: false })
        .limit(6)
    ]);

    let currentUserRank = "—";
    if (userStatsResult.data) {
      const currentXp = userStatsResult.data.xp || 0;
      const { count } = await supabase
        .from("user_stats")
        .select("user_id", { count: "exact", head: true })
        .gt("xp", currentXp);
      currentUserRank = (count || 0) + 1;
    }

    return NextResponse.json({
      userStats: userStatsResult.data,
      allAttempts: allAttemptsResult.data || [],
      recentAttempts: attemptsResult.data || [],
      rank: currentUserRank
    });
  } catch (err) {
    console.error("[API /api/dashboard] Error:", err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
