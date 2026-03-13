import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake'
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user stats
    const { data: stats } = await supabaseAdmin
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Fetch payments
    const { data: payments } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch test results 
    const { data: testResults } = await supabaseAdmin
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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { avatar_url, full_name } = body;

    const updateData = {};
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
    if (full_name !== undefined) updateData.full_name = full_name;

    const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: updateData }
    );

    if (updateError) throw updateError;
    return NextResponse.json(updated.user);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
