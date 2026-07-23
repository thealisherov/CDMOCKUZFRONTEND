import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake'
);

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
    if (!authHeader) return NextResponse.json({ error: 'Missing auth header' }, { status: 401 });
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || user?.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 1. Get total users and premium users.
    let totalUsers = 0;
    let premiumUsers = 0;
    const { data: counts, error: countsError } = await supabaseAdmin.rpc('admin_user_counts');

    if (!countsError && counts) {
      totalUsers = counts.total || 0;
      premiumUsers = counts.premium || 0;
    } else {
      let allUsers = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw error;
        allUsers = allUsers.concat(data.users);
        if (data.users.length < 1000) hasMore = false;
        else page++;
      }
      totalUsers = allUsers.length;
      premiumUsers = allUsers.filter(u =>
        u.user_metadata?.premium_until && new Date(u.user_metadata.premium_until) > new Date()
      ).length;
    }

    // 2. Get payments/revenue
    let query = supabaseAdmin.from('payments').select('*');
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: payments, error: paymentError } = await query;
    if (paymentError) {
      console.error("Stats payment fetch error:", paymentError);
    }

    const revenueUZS = payments?.filter(p => p.currency === 'UZS').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const revenueUSD = payments?.filter(p => p.currency === 'USD').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // 3. Get Telegram users count (scans both telegram_id and tg_<ID>@auth.internal)
    let telegramUsers = 0;
    try {
      const tgIdSet = new Set();
      const { data: pUsers } = await supabaseAdmin.from('users').select('telegram_id, email');
      (pUsers || []).forEach(u => {
        const tid = getTelegramIdFromRecord(u);
        if (tid) tgIdSet.add(tid);
      });
      telegramUsers = tgIdSet.size;
    } catch (e) {
      console.warn("Error fetching telegram users count:", e);
    }

    // 4. Get test statistics
    let testStats = { total: 0, reading: 0, listening: 0, writing: 0, free: 0, premium: 0 };
    try {
      const { data: tests } = await supabaseAdmin
        .from('Tests')
        .select('type, tution:data->>testTution, access:data->>access')
        .is('center_id', null);
      if (tests) {
        testStats.total = tests.length;
        tests.forEach(t => {
          if (t.type === 'reading') testStats.reading++;
          else if (t.type === 'listening') testStats.listening++;
          else if (t.type === 'writing') testStats.writing++;

          const access = t.tution || t.access || 'free';
          if (access === 'paid') testStats.premium++;
          else testStats.free++;
        });
      }
    } catch { /* Tests table may not exist */ }

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      telegramUsers,
      revenueUZS,
      revenueUSD,
      paymentCount: payments?.length || 0,
      newUsers: 0,
      tests: testStats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
