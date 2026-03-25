import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/server';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ALL users via admin client
    let usersData = [];
    const { data: publicUsers, error: usersError } = await supabaseAdmin.from('users').select('*');
    
    if (usersError) {
      console.error('[Leaderboard API] users fetch error:', usersError);
      return NextResponse.json({ 
        error: 'Could not fetch users list from database.',
        leaderboard: [],
        currentUser: null 
      }, { status: 500 });
    }

    usersData = publicUsers || [];

    // Filter out admins — only students in leaderboard
    const students = usersData.filter(u => u.role !== 'admin');

    // Fetch all user_stats
    const { data: allStats } = await supabaseAdmin
      .from('user_stats')
      .select('*');

    const statsMap = {};
    (allStats || []).forEach(s => {
      statsMap[s.user_id] = s;
    });

    // Fetch auth users metadata for avatar URLs (Google OAuth, etc.)
    let authAvatarMap = {};
    try {
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (authUsers) {
        authUsers.forEach(au => {
          const meta = au.user_metadata || {};
          if (meta.avatar_url || meta.picture) {
            authAvatarMap[au.id] = meta.avatar_url || meta.picture;
          }
        });
      }
    } catch (e) {
      // If admin.listUsers fails (no service role key), skip
      console.warn('[Leaderboard] Could not fetch auth user metadata for avatars:', e.message);
    }

    // Build leaderboard: ALL students, with stats or defaults
    const leaderboard = students.map(u => {
      const stats = statsMap[u.id] || {};
      return {
        user_id: u.id,
        full_name: u.full_name || u.email?.split('@')[0] || 'Unknown',
        email: u.email,
        avatar_url: u.avatar_url || authAvatarMap[u.id] || null,
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
