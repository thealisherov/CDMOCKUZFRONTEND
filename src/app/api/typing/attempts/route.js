import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { isUserPremium } from '@/lib/premium-guard';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/typing/attempts — foydalanuvchining so'nggi urinishlari
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const { data, error } = await supabaseAdmin
      .from('typing_attempts')
      .select('*, typing_texts(title, language, category, difficulty)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ attempts: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ attempts: data || [] });
  } catch (err) {
    console.error('[API /api/typing/attempts GET] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST /api/typing/attempts — yangi urinish natijasini saqlash + Free limit + XP + Badges
export async function POST(request) {
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

    // 1. FREE USER LIMIT TEKSHIRUVI (Kuniga 3 tagacha)
    let attemptsToday = 0;
    try {
      const { count } = await supabaseAdmin
        .from('typing_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('created_at', todayStartISO);

      attemptsToday = count || 0;
    } catch (countErr) {
      console.warn('[typing/attempts] Count error:', countErr.message);
    }

    const FREE_LIMIT = 3;
    if (!isPremium && attemptsToday >= FREE_LIMIT) {
      return NextResponse.json({
        error: 'DAILY_LIMIT_REACHED',
        message: 'Kunlik bepul mashqlar limiti (3 ta) tugadi. Cheksiz mashq qilish uchun Premium tarifga o\'ting!',
        limit: FREE_LIMIT,
        attemptsToday,
        remainingToday: 0
      }, { status: 403 });
    }

    // 2. Request body ma'lumotlarini qabul qilish
    const body = await request.json();
    const {
      text_id = null,
      mode = 'time',
      mode_value = 30,
      wpm = 0,
      raw_wpm = 0,
      accuracy = 0,
      correct_chars = 0,
      incorrect_chars = 0,
      duration_seconds = 0
    } = body;

    const parsedWpm = Math.min(300, Math.max(0, Math.round(Number(wpm) || 0)));
    const parsedRawWpm = Math.min(300, Math.max(0, Math.round(Number(raw_wpm) || 0)));
    const parsedAccuracy = Math.min(100, Math.max(0, Math.round((Number(accuracy) || 0) * 10) / 10));
    const parsedDuration = Math.max(1, Math.round(Number(duration_seconds) || 0));
    const parsedCorrect = Number(correct_chars) || 0;
    const parsedIncorrect = Number(incorrect_chars) || 0;

    // Bekor qilingan yoki juda qisqa urinishlarni (0 WPM va < 5 harf) bazaga yozmaymiz
    if (parsedWpm === 0 && parsedCorrect < 5) {
      return NextResponse.json({
        skipped: true,
        message: 'Juda qisqa urinish saqlanmadi',
        remainingToday: isPremium ? 999 : Math.max(0, FREE_LIMIT - attemptsToday)
      });
    }

    // 3. XP hisoblash (typing_attempts jadvalida saqlanadi, umumiy user_stats ga tegmaydi)
    const speedBonus = Math.floor(parsedWpm / 10) * 2;
    const accuracyBonus = parsedAccuracy >= 98 ? 10 : (parsedAccuracy >= 95 ? 5 : 0);
    const earnedXp = Math.max(5, 10 + speedBonus + accuracyBonus);

    // 4. typing_attempts jadvaliga kiritish (xp_earned bilan birga)
    const { data: attemptData, error: attemptError } = await supabaseAdmin
      .from('typing_attempts')
      .insert([{
        user_id: user.id,
        text_id: text_id || null,
        mode,
        mode_value: Number(mode_value) || 30,
        wpm: parsedWpm,
        raw_wpm: parsedRawWpm,
        accuracy: parsedAccuracy,
        correct_chars: parsedCorrect,
        incorrect_chars: parsedIncorrect,
        duration_seconds: parsedDuration,
        xp_earned: earnedXp
      }])
      .select()
      .single();

    if (attemptError) {
      console.error('[API /api/typing/attempts POST] Insert error:', attemptError);
      return NextResponse.json({ error: attemptError.message }, { status: 500 });
    }

    // Daily streak va umumiy user_stats ni bu yerda yangilamaymiz (Umumiy leaderboarddan ajratilgan)
    let newDailyStreak = 1;

    // 5. BADGELARNI TEKSHIRISH VA BERISH
    let newlyEarnedBadges = [];
    try {
      // Mavjud barcha badgelar
      const { data: allBadges } = await supabaseAdmin.from('typing_badges').select('*');
      // Foydalanuvchi allaqachon olgan badgelar
      const { data: userBadges } = await supabaseAdmin.from('user_typing_badges').select('badge_id').eq('user_id', user.id);
      const ownedBadgeIds = new Set((userBadges || []).map(b => b.badge_id));

      if (allBadges && allBadges.length > 0) {
        for (const badge of allBadges) {
          if (ownedBadgeIds.has(badge.id)) continue;

          let isQualified = false;
          const code = badge.code;

          if (code === 'first_blood') {
            isQualified = true;
          } else if (code === 'speed_starter_40' && parsedWpm >= 40) {
            isQualified = true;
          } else if (code === 'speed_demon_60' && parsedWpm >= 60) {
            isQualified = true;
          } else if (code === 'speed_demon_80' && parsedWpm >= 80) {
            isQualified = true;
          } else if (code === 'speed_master_100' && parsedWpm >= 100) {
            isQualified = true;
          } else if (code === 'accuracy_king' && parsedAccuracy === 100 && (Number(correct_chars) >= 40 || parsedDuration >= 15)) {
            isQualified = true;
          } else if (code === 'accuracy_pro' && parsedAccuracy >= 98 && Number(correct_chars) >= 30) {
            isQualified = true;
          } else if (code === 'marathon_120' && mode === 'time' && Number(mode_value) === 120) {
            isQualified = true;
          } else if (code === 'century_club' && mode === 'words' && Number(mode_value) === 100) {
            isQualified = true;
          } else if (code === 'streak_7' && newDailyStreak >= 7) {
            isQualified = true;
          }

          if (isQualified) {
            const { error: insertBadgeErr } = await supabaseAdmin
              .from('user_typing_badges')
              .insert([{ user_id: user.id, badge_id: badge.id }]);

            if (!insertBadgeErr) {
              newlyEarnedBadges.push(badge);
            }
          }
        }
      }
    } catch (badgeErr) {
      console.error('[API /api/typing/attempts] Badge check error:', badgeErr);
    }

    const remainingToday = isPremium ? 999 : Math.max(0, FREE_LIMIT - (attemptsToday + 1));

    return NextResponse.json({
      success: true,
      attempt: attemptData,
      earnedXp,
      newlyEarnedBadges,
      remainingToday,
      isPremium
    }, { status: 201 });

  } catch (err) {
    console.error('[API /api/typing/attempts POST] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
