import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/typing/leaderboard — WPM bo'yicha top typing reytingi
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Foydalanuvchilar ro'yxatini olish
    let usersData = [];
    const { data: publicUsers } = await supabaseAdmin.from('users').select('*');
    usersData = publicUsers || [];

    // Auth metadata avatar xaritasi
    let authUserMap = {};
    try {
      const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      if (authUsers) {
        authUsers.forEach(au => {
          const meta = au.user_metadata || {};
          authUserMap[au.id] = {
            full_name: meta.full_name || meta.name || au.email?.split('@')[0] || 'Student',
            avatar_url: meta.avatar_url || meta.picture || null,
            role: meta.role || 'student'
          };
        });
      }
    } catch (e) {
      console.warn('[Typing Leaderboard] auth.admin.listUsers fallback:', e.message);
    }

    // 2. Barcha typing_attempts ma'lumotlarini olish
    const { data: attempts, error: attemptsErr } = await supabaseAdmin
      .from('typing_attempts')
      .select('user_id, wpm, accuracy, duration_seconds');

    if (attemptsErr && attemptsErr.code === '42P01') {
      return NextResponse.json({ leaderboard: [], currentUser: null });
    }

    // Har bir user bo'yicha eng yaxshi WPM, o'rtacha aniqlik va testlar sonini hisoblash
    const userStats = {};
    (attempts || []).forEach(a => {
      const uid = a.user_id;
      if (!uid) return;

      const wpm = Number(a.wpm) || 0;
      const acc = Number(a.accuracy) || 0;

      if (!userStats[uid]) {
        userStats[uid] = {
          best_wpm: wpm,
          accuracy_sum: acc,
          test_count: 1
        };
      } else {
        if (wpm > userStats[uid].best_wpm) {
          userStats[uid].best_wpm = wpm;
        }
        userStats[uid].accuracy_sum += acc;
        userStats[uid].test_count += 1;
      }
    });

    // Barcha typing qilgan studentlarni shakllantirish
    const leaderboard = [];
    Object.keys(userStats).forEach(uid => {
      const authInfo = authUserMap[uid] || {};
      const pubInfo = usersData.find(u => u.id === uid) || {};

      const role = pubInfo.role || authInfo.role || 'student';
      if (role === 'admin') return; // Adminlar reytingda qatnashmaydi

      const fullName = pubInfo.full_name || authInfo.full_name || 'Student';
      const avatarUrl = pubInfo.avatar_url || authInfo.avatar_url || null;
      const s = userStats[uid];

      leaderboard.push({
        user_id: uid,
        full_name: fullName,
        avatar_url: avatarUrl,
        best_wpm: s.best_wpm,
        avg_accuracy: Math.round((s.accuracy_sum / s.test_count) * 10) / 10,
        tests_completed: s.test_count,
        isCurrentUser: uid === user.id
      });
    });

    // Saralash: best_wpm DESC, avg_accuracy DESC, tests_completed DESC
    leaderboard.sort((a, b) => {
      if (b.best_wpm !== a.best_wpm) return b.best_wpm - a.best_wpm;
      if (b.avg_accuracy !== a.avg_accuracy) return b.avg_accuracy - a.avg_accuracy;
      return b.tests_completed - a.tests_completed;
    });

    // Rank belgilash
    leaderboard.forEach((entry, idx) => {
      entry.rank = idx + 1;
    });

    const currentUser = leaderboard.find(e => e.isCurrentUser) || null;

    return NextResponse.json({
      leaderboard: leaderboard.slice(0, 100),
      currentUser
    });

  } catch (err) {
    console.error('[API /api/typing/leaderboard] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
