import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper to extract Telegram ID from user record or internal email (tg_<ID>@auth.internal)
function getTelegramIdFromRecord(user) {
  if (user.telegram_id) return user.telegram_id.toString().trim();
  
  const metaTgId = user.user_metadata?.telegram_id || user.raw_user_meta_data?.telegram_id;
  if (metaTgId) return metaTgId.toString().trim();

  if (user.email) {
    const match = user.email.match(/^tg_(\d+)@auth\.internal$/i);
    if (match) return match[1];
  }
  return null;
}

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

    // 1. Fetch all users from public.users table
    const { data: publicUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, phone, telegram_id, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('[Admin Tg Stats] Error fetching public.users:', usersError);
    }

    // 2. Fetch all users from auth.users (to catch all tg_<ID>@auth.internal registrations)
    let authUsers = [];
    try {
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) break;
        authUsers = authUsers.concat(data.users || []);
        if ((data.users || []).length < 1000) hasMore = false;
        else page++;
      }
    } catch (e) {
      console.error('[Admin Tg Stats] Error fetching auth users:', e);
    }

    // 3. Fetch active sessions from telegram_auth_sessions
    const { data: sessions, error: sessionError } = await supabaseAdmin
      .from('telegram_auth_sessions')
      .select('id, telegram_id, chat_id, status, created_at');

    if (sessionError) {
      console.error('[Admin Tg Stats] Error fetching sessions:', sessionError);
    }

    // Map to hold unique Telegram users with metadata
    const tgUserMap = new Map();
    const missingTgIdUpdates = [];

    // Process public.users
    (publicUsers || []).forEach(u => {
      const tgId = getTelegramIdFromRecord(u);
      if (tgId) {
        if (!u.telegram_id) {
          missingTgIdUpdates.push({ id: u.id, telegram_id: tgId });
        }
        tgUserMap.set(tgId, {
          id: u.id,
          full_name: u.full_name || 'Telegram User',
          email: u.email,
          phone: u.phone || '—',
          telegram_id: tgId,
          created_at: u.created_at
        });
      }
    });

    // Process auth.users (in case some are missing from public.users)
    (authUsers || []).forEach(au => {
      const tgId = getTelegramIdFromRecord(au);
      if (tgId && !tgUserMap.has(tgId)) {
        const meta = au.user_metadata || au.raw_user_meta_data || {};
        tgUserMap.set(tgId, {
          id: au.id,
          full_name: meta.full_name || `${meta.first_name || ''} ${meta.last_name || ''}`.trim() || meta.username || 'Telegram User',
          email: au.email,
          phone: meta.phone || '—',
          telegram_id: tgId,
          created_at: au.created_at
        });
      }
    });

    // Process telegram_auth_sessions
    (sessions || []).forEach(s => {
      const tgId = (s.chat_id || s.telegram_id)?.toString().trim();
      if (tgId && !tgUserMap.has(tgId)) {
        tgUserMap.set(tgId, {
          id: s.id,
          full_name: 'Telegram User',
          email: `tg_${tgId}@auth.internal`,
          phone: '—',
          telegram_id: tgId,
          created_at: s.created_at
        });
      }
    });

    // Async sync missing telegram_id column in public.users background
    if (missingTgIdUpdates.length > 0) {
      Promise.all(
        missingTgIdUpdates.map(up =>
          supabaseAdmin.from('users').update({ telegram_id: up.telegram_id }).eq('id', up.id)
        )
      ).catch(e => console.error('[Admin Tg Stats] Error backfilling telegram_ids:', e));
    }

    const uniqueTgUsers = Array.from(tgUserMap.values());

    return NextResponse.json({
      totalTelegramUsers: uniqueTgUsers.length,
      totalSessions: sessions?.length || 0,
      uniqueBroadcastableUsers: uniqueTgUsers.length,
      users: uniqueTgUsers
    });
  } catch (error) {
    console.error('[Admin Tg Stats] Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
