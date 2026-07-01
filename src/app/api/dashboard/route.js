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

    // Service role — barcha RLS ni chetlab o'tadi
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Barcha ma'lumotlarni parallel ravishda olamiz
    const [userStatsResult, allAttemptsResult, recentAttemptsResult] = await Promise.all([
      supabase
        .from('user_stats')
        .select('tests_taken, xp, daily_streak')
        .eq('user_id', userId)
        .maybeSingle(),

      // Butun tarix — statistika uchun
      supabase
        .from('TestAttempts')
        .select('id, test_type, band_score, correct_count, total_questions')
        .eq('user_id', userId),

      // So'nggi 6 ta urinish — "Continue Practicing" bo'limi uchun
      supabase
        .from('TestAttempts')
        .select('id, test_numeric_id, test_type, test_title, band_score, completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(6),
    ]);

    const allAttempts = allAttemptsResult.data || [];

    // Har xil test turi bo'yicha soni (TestAttempts — haqiqiy manba)
    const breakdown = { listening: 0, reading: 0, writing: 0 };
    allAttempts.forEach((a) => {
      const t = (a.test_type || '').toLowerCase();
      if (t in breakdown) breakdown[t]++;
    });

    // Jami testlar soni
    const totalTests = allAttempts.length;

    // O'rtacha band score (faqat band_score mavjud bo'lganlar uchun)
    let avgBand = '0.0';
    const validScores = allAttempts
      .map((a) => parseFloat(a.band_score))
      .filter((s) => !isNaN(s) && s > 0);
    if (validScores.length > 0) {
      avgBand = (validScores.reduce((acc, s) => acc + s, 0) / validScores.length).toFixed(1);
    }

    // Global rank — XP asosida
    let currentUserRank = '—';
    if (userStatsResult.data) {
      const currentXp = userStatsResult.data.xp || 0;
      const { count } = await supabase
        .from('user_stats')
        .select('user_id', { count: 'exact', head: true })
        .gt('xp', currentXp);
      currentUserRank = (count || 0) + 1;
    }

    return NextResponse.json({
      userStats: {
        ...(userStatsResult.data || {}),
        // tests_taken ni TestAttempts dan hisoblangan to'g'ri qiymat bilan almashtiramiz
        tests_taken: totalTests,
      },
      allAttempts,
      recentAttempts: recentAttemptsResult.data || [],
      rank: currentUserRank,
      breakdown,
      avgBand,
      totalTests,
    });
  } catch (err) {
    console.error('[API /api/dashboard] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
