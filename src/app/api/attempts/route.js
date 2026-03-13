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

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('[API /api/attempts] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
