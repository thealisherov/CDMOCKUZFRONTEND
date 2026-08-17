/**
 * GET /api/fullmock
 * Public full mock testlar ro'yxati (narx, title, duration).
 * Login talab qilmaydi — landing page va dashboard uchun.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Tests jadvalidan barcha public full_mock testlarni olamiz
    const { data: rawTests, error: testErr } = await supabase
      .from('Tests')
      .select('id, test_id, type, data, created_at')
      .eq('type', 'full_mock')
      .is('center_id', null)
      .order('created_at', { ascending: true });

    if (testErr) {
      console.error('[API /api/fullmock] Error fetching Tests:', testErr);
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

    // 3. Har bir testni birlashtiramiz
    const list = (rawTests || []).map((t, idx) => {
      const fm = mocksMap[t.id] || {};
      const d = t.data || {};
      const s = d.sections || {};
      const duration = (s.listening?.timer || 40) + (s.reading?.timer || 60) + (s.writing?.timer || 60);

      const isActive = fm.is_active !== undefined ? fm.is_active : true;
      if (!isActive) return null;

      return {
        id: fm.id || t.id,
        test_row_id: t.id,
        numericId: idx + 1,
        title: fm.title || d.title || `IELTS Full Mock Test #${idx + 1}`,
        price_uzs: fm.price_uzs !== undefined ? fm.price_uzs : (d.price_uzs || 69000),
        price_usd: fm.price_usd !== undefined ? fm.price_usd : (d.price_usd || 5.0),
        expire_hours: fm.expire_hours || d.expire_hours || 48,
        duration: duration || 160,
        created_at: t.created_at,
      };
    }).filter(Boolean);

    return NextResponse.json({ tests: list });
  } catch (err) {
    console.error('[API /api/fullmock] Unexpected error:', err);
    return NextResponse.json({ tests: [] });
  }
}
