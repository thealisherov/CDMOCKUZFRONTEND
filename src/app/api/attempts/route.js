/**
 * GET /api/attempts  — Foydalanuvchining ishlangan testlarini olish
 * POST /api/attempts — Yangi test natijasini saqlash
 * 
 * Query params (GET):
 *   ?type=reading|listening  — filter by test type
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let query = supabase
      .from('TestAttempts')
      .select('id, test_numeric_id, test_type, test_title, correct_count, total_questions, band_score, time_spent_seconds, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (type) {
      query = query.eq('test_type', type);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return NextResponse.json([]);
      }
      console.error('[API /api/attempts] Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('[API /api/attempts] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      test_numeric_id, test_type, test_title, 
      user_answers, server_results, 
      correct_count, total_questions, band_score,
      time_spent_seconds 
    } = body;

    if (!test_numeric_id || !test_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('TestAttempts')
      .insert([{
        user_id: user.id,
        test_numeric_id,
        test_type,
        test_title: test_title || `Test ${test_numeric_id}`,
        user_answers: user_answers || {},
        server_results: server_results || {},
        correct_count: correct_count || 0,
        total_questions: total_questions || 0,
        band_score: band_score || null,
        time_spent_seconds: time_spent_seconds || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('[API /api/attempts] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // UPDATE OR INSERT user_stats for Leaderboard
    try {
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const earnedXp = 10 + (correct_count || 0) * 2; // For example: 10 XP just for taking it, +2 per correct

      if (existingStats) {
        await supabase.from('user_stats').update({
          tests_taken: (existingStats.tests_taken || 0) + 1,
          correct_answers: (existingStats.correct_answers || 0) + (correct_count || 0),
          xp: (existingStats.xp || 0) + earnedXp,
          total_time_seconds: (existingStats.total_time_seconds || 0) + (time_spent_seconds || 0),
          last_active_date: new Date().toISOString()
        }).eq('user_id', user.id);
      } else {
        await supabase.from('user_stats').insert([{
          user_id: user.id,
          tests_taken: 1,
          correct_answers: correct_count || 0,
          xp: earnedXp,
          total_time_seconds: time_spent_seconds || 0,
          last_active_date: new Date().toISOString(),
          daily_streak: 1
        }]);
      }
    } catch (statsErr) {
      console.error('[API /api/attempts] user_stats error (non-fatal):', statsErr);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[API /api/attempts] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
