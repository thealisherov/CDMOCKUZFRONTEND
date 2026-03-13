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

    // Fetch ALL users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) throw usersError;

    // Filter out admins — only students in leaderboard
    const students = users.filter(u => u.user_metadata?.role !== 'admin');

    // Fetch all user_stats
    const { data: allStats } = await supabaseAdmin
      .from('user_stats')
      .select('*');

    const statsMap = {};
    (allStats || []).forEach(s => {
      statsMap[s.user_id] = s;
    });

    // Build leaderboard: ALL students, with stats or defaults
    const leaderboard = students.map(u => {
      const stats = statsMap[u.id] || {};
      return {
        user_id: u.id,
        full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Unknown',
        email: u.email,
        avatar_url: u.user_metadata?.avatar_url || null,
        xp: stats.xp || 0,
        tests_taken: stats.tests_taken || 0,
        correct_answers: stats.correct_answers || 0,
        total_time_seconds: stats.total_time_seconds || 0,
        daily_streak: stats.daily_streak || 0,
        isCurrentUser: u.id === user.id
      };
    });

    // Sort by XP descending, then by tests_taken, then by name
    leaderboard.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      if (b.tests_taken !== a.tests_taken) return b.tests_taken - a.tests_taken;
      return (a.full_name || '').localeCompare(b.full_name || '');
    });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Find current user's rank
    const currentUser = leaderboard.find(e => e.isCurrentUser);

    return NextResponse.json({
      leaderboard,
      currentUser: currentUser || null,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
