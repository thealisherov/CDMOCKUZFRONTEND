import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Stats, payments va testResults ni PARALLEL tortamiz (ilgari ketma-ket
    // 4 ta round-trip edi — sekin). Rank faqat stats.xp ga bog'liq, shuning
    // uchun u ikkinchi fazada (bitta count so'rovi) hisoblanadi.
    const [statsResult, paymentsResult, testResultsResult] = await Promise.all([
      supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('TestAttempts')
        .select('id, test_type, test_title, correct_count, total_questions, band_score, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(50),
    ]);

    const stats = statsResult.data;
    const payments = paymentsResult.data;
    const testResults = testResultsResult.data;

    // Fetch user rank (based on XP)
    let rank = null;
    if (stats) {
      try {
        const { count } = await supabase
          .from('user_stats')
          .select('user_id', { count: 'exact', head: true })
          .gt('xp', stats.xp || 0);
        rank = (count || 0) + 1;
      } catch (rankErr) {
        console.error('Error fetching user rank in profile API:', rankErr);
      }
    }

    return NextResponse.json({
      user,
      stats: stats || { xp: 0, tests_taken: 0, correct_answers: 0, total_time_seconds: 0, daily_streak: 0, last_active_date: null },
      payments: payments || [],
      testResults: testResults || [],
      rank
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { avatar_url, full_name } = body;

    const updateData = {};
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (full_name !== undefined) updateData.full_name = full_name;

    const { data: updated, error: updateError } = await supabase.auth.updateUser({
      data: updateData
    });

    if (updateError) throw updateError;
    return NextResponse.json(updated.user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
