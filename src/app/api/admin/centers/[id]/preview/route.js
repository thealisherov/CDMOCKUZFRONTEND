/**
 * GET /api/admin/centers/[id]/preview
 *
 * Platforma admini uchun: markaz testlarini o'quvchi sifatida SINAB ko'rish.
 * Vaqtinchalik "preview" o'quvchi sessiyasi (cookie) o'rnatadi va /markaz/tests
 * ga yo'naltiradi. preview=true bo'lgani uchun topshiriq bazaga SAQLANMAYDI.
 * Faqat platforma admini (role='admin') chaqira oladi.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { signCenterSession, CENTER_COOKIE, CENTER_COOKIE_OPTIONS } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 });
  }

  const { id } = await params;
  const admin = createAdminClient();
  const { data: center } = await admin
    .from('centers')
    .select('id, name, slug, image_url, telegram_channel')
    .eq('id', id)
    .maybeSingle();

  if (!center) {
    return NextResponse.json({ error: 'Markaz topilmadi' }, { status: 404 });
  }

  const asRole = new URL(request.url).searchParams.get('as') === 'admin' ? 'admin' : 'student';

  const token = signCenterSession({
    centerId: center.id,
    slug: center.slug,
    name: center.name,
    telegram: center.telegram_channel || null,
    image: center.image_url || null,
    kind: asRole,
    preview: true, // student: submit saqlamaydi; admin: shunchaki panelni ko'rish
  });

  const dest = asRole === 'admin' ? '/markaz/panel' : '/markaz/tests';
  const res = NextResponse.redirect(new URL(dest, request.url));
  res.cookies.set(CENTER_COOKIE, token, CENTER_COOKIE_OPTIONS);
  return res;
}
