import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isUserPremium } from '@/lib/premium-guard';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/typing/status — foydalanuvchining bugungi limitlari va typing statistikasi
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const isPremium = isUserPremium(user);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStartISO = today.toISOString();

    const FREE_LIMIT = 3;

    // Parallel ravishda: bugungi urinishlar soni + umumiy urinishlar statistikasi
    const [todayCountRes, allAttemptsRes] = await Promise.all([
      supabaseAdmin
        .from('typing_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStartISO),
      supabaseAdmin
        .from('typing_attempts')
        .select('wpm, raw_wpm, accuracy, duration_seconds')
        .eq('user_id', user.id)
    ]);

    const attemptsToday = todayCountRes.count || 0;
    const remainingToday = isPremium ? 999 : Math.max(0, FREE_LIMIT - attemptsToday);

    const allAttempts = allAttemptsRes.data || [];
    const validAttempts = allAttempts.filter(a => Number(a.wpm) > 0 || Number(a.accuracy) > 0);
    const totalAttempts = allAttempts.length;

    let bestWpm = 0;
    let avgWpm = 0;
    let avgAccuracy = 0;

    if (validAttempts.length > 0) {
      bestWpm = Math.max(...validAttempts.map(a => Number(a.wpm) || 0));
      const totalWpmSum = validAttempts.reduce((acc, a) => acc + (Number(a.wpm) || 0), 0);
      avgWpm = Math.round(totalWpmSum / validAttempts.length);
      const totalAccSum = validAttempts.reduce((acc, a) => acc + (Number(a.accuracy) || 0), 0);
      avgAccuracy = Math.round((totalAccSum / validAttempts.length) * 10) / 10;
    }

    return NextResponse.json({
      isPremium,
      dailyLimit: isPremium ? -1 : FREE_LIMIT,
      attemptsToday,
      remainingToday,
      totalAttempts,
      bestWpm,
      avgWpm,
      avgAccuracy
    });

  } catch (err) {
    console.error('[API /api/typing/status] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
