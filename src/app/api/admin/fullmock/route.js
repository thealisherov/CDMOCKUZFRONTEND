/**
 * GET  /api/admin/fullmock — Barcha full mock testlar + kodlar soni
 * PATCH /api/admin/fullmock — Narx, expire_hours, is_active tahrirlash
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return { error: 'Auth talab qilinadi', status: 401 };
    
    // Check metadata and users table
    const metaRole = user.user_metadata?.role;
    if (metaRole === 'admin') return { user };

    const adminClient = createAdminClient();
    const { data: dbUser } = await adminClient.from('users').select('role').eq('id', user.id).single();
    if (dbUser?.role === 'admin') return { user };

    // Superadmin emails check
    const email = user.email?.toLowerCase() || '';
    if (email.includes('aziz0826')) return { user };

    return { error: 'Ruxsat yo\'q', status: 403 };
  } catch (err) {
    console.error('[requireAdmin] Error:', err);
    return { error: 'Auth xatosi', status: 401 };
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const supabase = createAdminClient();

    // 1. Tests jadvalidan barcha public full_mock testlarni olamiz
    const { data: rawTests, error: testErr } = await supabase
      .from('Tests')
      .select('id, test_id, type, data, created_at')
      .eq('type', 'full_mock')
      .is('center_id', null)
      .order('created_at', { ascending: true });

    if (testErr) {
      console.error('[admin/fullmock GET] Error fetching Tests:', testErr);
      return NextResponse.json({ tests: [] });
    }

    // 2. full_mock_tests jadvalidan sozlamalarni olamiz
    let mocksMap = {};
    try {
      const { data: mocks } = await supabase
        .from('full_mock_tests')
        .select('*');

      (mocks || []).forEach(m => {
        if (m.test_row_id) mocksMap[m.test_row_id] = m;
        mocksMap[m.id] = m;
      });
    } catch {
      // ignore
    }

    // 3. Kodlar sonini hisoblash
    let codeCounts = {};
    let activeCodeCounts = {};
    try {
      const { data: codes } = await supabase
        .from('full_mock_access_codes')
        .select('full_mock_id, is_used, expires_at');

      const now = new Date();
      (codes || []).forEach(c => {
        const mid = c.full_mock_id;
        codeCounts[mid] = (codeCounts[mid] || 0) + 1;
        const isExpired = now > new Date(c.expires_at);
        if (!c.is_used && !isExpired) {
          activeCodeCounts[mid] = (activeCodeCounts[mid] || 0) + 1;
        }
      });
    } catch {
      // ignore
    }

    // 4. Birlashtirish
    const list = (rawTests || []).map((t, idx) => {
      const fm = mocksMap[t.id] || {};
      const d = t.data || {};
      const actualId = fm.id || t.id;

      const totalCodes = (codeCounts[actualId] || 0) + (codeCounts[t.id] && codeCounts[t.id] !== codeCounts[actualId] ? codeCounts[t.id] : 0);
      const activeCodes = (activeCodeCounts[actualId] || 0) + (activeCodeCounts[t.id] && activeCodeCounts[t.id] !== activeCodeCounts[actualId] ? activeCodeCounts[t.id] : 0);

      return {
        id: actualId,
        test_row_id: t.id,
        numericId: idx + 1,
        title: fm.title || d.title || `IELTS Full Mock Test #${idx + 1}`,
        price_uzs: fm.price_uzs !== undefined ? fm.price_uzs : (d.price_uzs || 69000),
        price_usd: fm.price_usd !== undefined ? fm.price_usd : (d.price_usd || 5.0),
        expire_hours: fm.expire_hours || d.expire_hours || 48,
        is_active: fm.is_active !== undefined ? fm.is_active : true,
        codes_total: totalCodes,
        codes_active: activeCodes,
        created_at: t.created_at,
      };
    });

    return NextResponse.json({ tests: list });
  } catch (err) {
    console.error('[admin/fullmock GET] Error:', err);
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { id, price_uzs, price_usd, expire_hours, is_active, title } = body;

    if (!id) return NextResponse.json({ error: 'id majburiy' }, { status: 400 });

    const supabase = createAdminClient();
    const updates = { updated_at: new Date().toISOString() };

    if (price_uzs !== undefined) updates.price_uzs = Number(price_uzs);
    if (price_usd !== undefined) updates.price_usd = Number(price_usd);
    if (expire_hours !== undefined) updates.expire_hours = Number(expire_hours);
    if (is_active !== undefined) updates.is_active = Boolean(is_active);
    if (title !== undefined) updates.title = String(title);

    let updatedTest = null;

    // 1. full_mock_tests jadvalida id yoki test_row_id bo'yicha update qilib ko'ramiz
    try {
      const { data: byId } = await supabase
        .from('full_mock_tests')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (byId) {
        updatedTest = byId;
      } else {
        const { data: byRowId } = await supabase
          .from('full_mock_tests')
          .update(updates)
          .eq('test_row_id', id)
          .select()
          .maybeSingle();

        if (byRowId) updatedTest = byRowId;
      }
    } catch {
      // ignore
    }

    // 2. Tests jadvalidagi data ustunini ham yangilaymiz (agar id Tests jadvalidan bo'lsa)
    try {
      const { data: testRow } = await supabase
        .from('Tests')
        .select('id, data')
        .eq('id', id)
        .maybeSingle();

      if (testRow) {
        const data = testRow.data || {};
        if (title !== undefined) data.title = String(title);
        if (price_uzs !== undefined) data.price_uzs = Number(price_uzs);
        if (price_usd !== undefined) data.price_usd = Number(price_usd);
        if (expire_hours !== undefined) data.expire_hours = Number(expire_hours);

        await supabase
          .from('Tests')
          .update({ data })
          .eq('id', testRow.id);

        if (!updatedTest) {
          // full_mock_tests ga insert qilib ko'ramiz
          try {
            const { data: insertedFm } = await supabase
              .from('full_mock_tests')
              .insert({
                test_row_id: testRow.id,
                title: data.title || 'IELTS Full Mock Test',
                price_uzs: price_uzs !== undefined ? Number(price_uzs) : 69000,
                price_usd: price_usd !== undefined ? Number(price_usd) : 5.0,
                expire_hours: expire_hours !== undefined ? Number(expire_hours) : 48,
                is_active: is_active !== undefined ? Boolean(is_active) : true,
              })
              .select()
              .maybeSingle();

            if (insertedFm) updatedTest = insertedFm;
          } catch {
            // ignore
          }
        }
      }
    } catch (testUpdateErr) {
      console.warn('[PATCH /api/admin/fullmock] Tests update warning:', testUpdateErr);
    }

    return NextResponse.json({
      ok: true,
      test: updatedTest || { id, ...updates },
    });
  } catch (err) {
    console.error('[PATCH /api/admin/fullmock] Error:', err);
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
