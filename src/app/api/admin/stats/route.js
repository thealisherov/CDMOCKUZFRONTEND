import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'fake'
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

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 1. Get total users and premium users
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    if (userError) throw userError;

    const totalUsers = userData.users.length;
    const premiumUsers = userData.users.filter(u => 
      u.user_metadata?.premium_until && new Date(u.user_metadata.premium_until) > new Date()
    ).length;

    // 2. Get payments/revenue
    let query = supabaseAdmin.from('payments').select('*');
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: payments, error: paymentError } = await query;
    if (paymentError) {
        // If table doesn't exist yet, we return 0s instead of failing
        console.error("Stats payment fetch error:", paymentError);
    }

    const revenueUZS = payments?.filter(p => p.currency === 'UZS').reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const revenueUSD = payments?.filter(p => p.currency === 'USD').reduce((sum, p) => sum + Number(p.amount), 0) || 0;

    // 3. Get test statistics
    let testStats = { total: 0, reading: 0, listening: 0, writing: 0, free: 0, premium: 0 };
    try {
      const { data: tests } = await supabaseAdmin
        .from('Tests')
        .select('type, data');
      if (tests) {
        testStats.total = tests.length;
        tests.forEach(t => {
          if (t.type === 'reading') testStats.reading++;
          else if (t.type === 'listening') testStats.listening++;
          else if (t.type === 'writing') testStats.writing++;
          
          const access = t.data?.testTution || t.data?.access || 'free';
          if (access === 'paid') testStats.premium++;
          else testStats.free++;
        });
      }
    } catch { /* Tests table may not exist */ }

    return NextResponse.json({
      totalUsers,
      premiumUsers,
      revenueUZS,
      revenueUSD,
      paymentCount: payments?.length || 0,
      newUsers: 0,
      tests: testStats,
    });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
