import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // fallback but anon will fail on admin endpoints
);

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Missing auth header' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // TEZ YO'L: `admin_list_users()` RPC — auth.users ni bitta indekslangan
    // SQL so'rovi bilan o'qiydi (GoTrue listUsers'dan o'nlab marta tezroq).
    // RPC qaytargan tekis qatorlarni frontend kutayotgan shaklga moslaymiz
    // (u.user_metadata.{...}).
    const { data: rpcUsers, error: rpcError } = await supabaseAdmin.rpc('admin_list_users');

    if (!rpcError && Array.isArray(rpcUsers)) {
      const shaped = rpcUsers.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        user_metadata: {
          full_name: u.full_name,
          avatar_url: u.avatar_url,
          role: u.role,
          premium_until: u.premium_until,
        },
      }));
      return NextResponse.json(shaped);
    }

    // FALLBACK: RPC hali qo'shilmagan bo'lsa (supabase_admin_users_fast.sql
    // ishga tushirilmagan) — eski listUsers usuliga qaytamiz.
    console.warn('[admin/users] admin_list_users RPC unavailable, falling back to listUsers:', rpcError?.message);
    let allUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      allUsers = allUsers.concat(data.users);
      // If we got fewer than perPage, we've reached the last page
      if (data.users.length < perPage) break;
      page++;
    }

    return NextResponse.json(allUsers);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
