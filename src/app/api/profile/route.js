import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user stats
    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch test results 
    const { data: testResults } = await supabase
      .from('test_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      user,
      stats: stats || { xp: 0, tests_taken: 0, correct_answers: 0, total_time_seconds: 0, daily_streak: 0, last_active_date: null },
      payments: payments || [],
      testResults: testResults || []
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
