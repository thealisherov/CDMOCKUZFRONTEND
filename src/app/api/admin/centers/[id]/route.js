/**
 * PATCH  /api/admin/centers/[id] — markazni tahrirlash
 * DELETE /api/admin/centers/[id] — markazni o'chirish (uning testlari ham CASCADE o'chadi)
 * Faqat platforma admini.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Auth talab qilinadi', status: 401 };
  if (user.user_metadata?.role !== 'admin') return { error: 'Ruxsat yo\'q', status: 403 };
  return { user };
}

const EDITABLE = [
  'name', 'image_url', 'telegram_channel', 'is_active',
  'student_login', 'student_password', 'admin_login', 'admin_password',
];

export async function PATCH(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const body = await request.json();
  const update = {};
  for (const key of EDITABLE) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'O\'zgartirish yo\'q' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('centers')
    .update(update)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug yoki login band' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ center: data });
}

export async function DELETE(request, { params }) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const admin = createAdminClient();
  const { error } = await admin.from('centers').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
