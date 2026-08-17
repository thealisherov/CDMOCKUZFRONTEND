/**
 * Platforma admini uchun Testlarni boshqarish (Test Builder API).
 *   GET  /api/admin/tests — barcha testlar (platforma + markaz), metadata ro'yxati
 *   POST /api/admin/tests — yangi test yaratish
 *
 * Faqat platforma admini (user_metadata.role === 'admin'). Yozuvlar service_role
 * bilan bajariladi (RLS chetlanadi), lekin admin ekani AVVAL tekshiriladi.
 *
 * MUHIM: center_id hech qachon to'g'ridan-to'g'ri yozilmaydi — DB trigger
 * (sync_test_center_id) uni data->>'center' slug'idan hisoblaydi.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { validateTest, hasErrors } from '@/app/dashboard/admin/tests/lib/validators';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Auth talab qilinadi', status: 401 };
  const role = user.user_metadata?.role;
  if (role !== 'admin') return { error: 'Ruxsat yo\'q', status: 403 };
  return { user };
}

const VALID_TYPES = ['listening', 'reading', 'writing', 'full_mock'];

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get('type');
  const centerFilter = searchParams.get('center'); // slug yoki 'platform'
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from('Tests')
    .select('id, test_id, type, data, center_id, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Public pozitsion raqam: type bo'yicha, center_id IS NULL, created_at ASC
  const publicCounters = {};
  const list = (rows || []).map((row) => {
    let publicNumber = null;
    if (!row.center_id) {
      publicCounters[row.type] = (publicCounters[row.type] || 0) + 1;
      publicNumber = publicCounters[row.type];
    }
    const d = row.data || {};
    return {
      id: row.id,
      test_id: row.test_id,
      type: row.type,
      title: d.title || '',
      level: d.level || null,
      testTution: d.testTution || 'free',
      totalQuestions: d.totalQuestions ?? null,
      center: d.center || null,
      center_id: row.center_id,
      created_at: row.created_at,
      publicNumber,
    };
  });

  let filtered = list;
  if (typeFilter && VALID_TYPES.includes(typeFilter)) {
    filtered = filtered.filter((t) => t.type === typeFilter);
  }
  if (centerFilter) {
    if (centerFilter === 'platform') filtered = filtered.filter((t) => !t.center_id);
    else filtered = filtered.filter((t) => t.center === centerFilter);
  }
  if (q) {
    filtered = filtered.filter(
      (t) => t.test_id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q)
    );
  }

  // Yangi testlar tepada ko'rinsin
  filtered = [...filtered].reverse();

  return NextResponse.json({ tests: filtered });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri JSON body" }, { status: 400 });
  }

  const test_id = typeof body.test_id === 'string' ? body.test_id.trim() : '';
  const type = body.type;
  const data = body.data;

  if (!test_id) return NextResponse.json({ error: 'test_id majburiy' }, { status: 400 });
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: `type noto'g'ri: ${type}` }, { status: 400 });
  }

  const issues = validateTest({ test_id, type, data });
  if (hasErrors(issues)) {
    return NextResponse.json(
      { error: 'Validatsiya xatolari bor', issues },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: inserted, error } = await admin
    .from('Tests')
    .insert({ test_id, type, data })
    .select('id, test_id, type, center_id, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `"${test_id}" test_id allaqachon band` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── AUTO-REGISTER: public full mock test ──
  // center_id bo'lmasa (platforma testi) va turi full_mock bo'lsa,
  // avtomatik ravishda full_mock_tests jadvaliga meta-yozuv qo'shiladi
  if (type === 'full_mock' && !inserted.center_id) {
    try {
      const title = data?.title || `IELTS Full Mock Test`;
      await admin.from('full_mock_tests').insert({
        test_row_id: inserted.id,
        title,
        price_uzs: 0,
        price_usd: 0,
        expire_hours: 48,
        is_active: true,
      });
    } catch (fmErr) {
      console.warn('[admin/tests POST] full_mock_tests auto-register failed (non-fatal):', fmErr);
    }
  }

  return NextResponse.json({ test: inserted, issues }, { status: 201 });
}
