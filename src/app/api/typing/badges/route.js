import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// GET /api/typing/badges — foydalanuvchining typing badgelari va barcha mavjud badgelar
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const [allBadgesRes, userBadgesRes] = await Promise.all([
      supabaseAdmin.from('typing_badges').select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('user_typing_badges').select('badge_id, earned_at').eq('user_id', user.id)
    ]);

    const allBadges = allBadgesRes.data || [];
    const userBadgesMap = {};
    (userBadgesRes.data || []).forEach(ub => {
      userBadgesMap[ub.badge_id] = ub.earned_at;
    });

    const badgesWithStatus = allBadges.map(badge => ({
      ...badge,
      unlocked: Boolean(userBadgesMap[badge.id]),
      earned_at: userBadgesMap[badge.id] || null
    }));

    return NextResponse.json({
      badges: badgesWithStatus,
      totalBadges: allBadges.length,
      unlockedCount: Object.keys(userBadgesMap).length
    });

  } catch (err) {
    console.error('[API /api/typing/badges] Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
