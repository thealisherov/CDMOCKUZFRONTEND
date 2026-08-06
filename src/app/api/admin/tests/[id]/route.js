/**
 * Bitta testni boshqarish (uuid PK bo'yicha — test_id emas, URL-encoding muammolaridan qochish).
 *   GET    /api/admin/tests/[id] — to'liq row (javoblar bilan — admin kontekst)
 *   PATCH  /api/admin/tests/[id] — test_id/type/data yangilash
 *   DELETE /api/admin/tests/[id] — o'chirish (javobda renumbered flag)
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

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const admin = createAdminClient();
  const { data: row, error } = await admin
    .from('Tests')
    .select('id, test_id, type, data, center_id, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

  return NextResponse.json({ test: row });
}

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Noto'g'ri JSON body" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing, error: fetchErr } = await admin
    .from('Tests')
    .select('id, test_id, type, data')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

  const test_id = typeof body.test_id === 'string' && body.test_id.trim()
    ? body.test_id.trim()
    : existing.test_id;
  const type = body.type ?? existing.type;
  const data = body.data ?? existing.data;

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

  const { data: updated, error } = await admin
    .from('Tests')
    .update({ test_id, type, data })
    .eq('id', id)
    .select('id, test_id, type, center_id, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: `"${test_id}" test_id allaqachon band` }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ test: updated, issues });
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const admin = createAdminClient();

  const { data: row, error: fetchErr } = await admin
    .from('Tests')
    .select('id, type, center_id, created_at')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

  // Renumber xavfi: shu turdagi, platformadagi, KEYINROQ yaratilgan test bormi?
  let renumbered = false;
  if (!row.center_id) {
    const { count } = await admin
      .from('Tests')
      .select('id', { count: 'exact', head: true })
      .eq('type', row.type)
      .is('center_id', null)
      .gt('created_at', row.created_at);
    renumbered = (count || 0) > 0;
  }

  const { error } = await admin.from('Tests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, renumbered });
}
