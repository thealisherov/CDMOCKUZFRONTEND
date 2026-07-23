import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Fetch total users with non-null telegram_id
    const { data: tgUsers, count: totalTgUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, phone, telegram_id, role, created_at', { count: 'exact' })
      .not('telegram_id', 'is', null)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('[Admin Tg Stats] Error fetching users:', usersError);
    }

    // 2. Fetch active sessions count from telegram_auth_sessions
    const { data: sessions, count: totalSessions, error: sessionError } = await supabaseAdmin
      .from('telegram_auth_sessions')
      .select('id, telegram_id, chat_id, status, created_at', { count: 'exact' });

    if (sessionError) {
      console.error('[Admin Tg Stats] Error fetching sessions:', sessionError);
    }

    // Collect all unique chat_ids / telegram_ids available for broadcasting
    const uniqueIds = new Set();
    (tgUsers || []).forEach(u => {
      if (u.telegram_id) uniqueIds.add(u.telegram_id.toString());
    });
    (sessions || []).forEach(s => {
      if (s.chat_id) uniqueIds.add(s.chat_id.toString());
      if (s.telegram_id) uniqueIds.add(s.telegram_id.toString());
    });

    return NextResponse.json({
      totalTelegramUsers: totalTgUsers || tgUsers?.length || 0,
      totalSessions: totalSessions || sessions?.length || 0,
      uniqueBroadcastableUsers: uniqueIds.size,
      users: tgUsers || []
    });
  } catch (error) {
    console.error('[Admin Tg Stats] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
