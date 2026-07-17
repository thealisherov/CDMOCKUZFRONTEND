/**
 * POST /api/centers/login
 * Body: { login, password }
 *
 * O'quv Markazga kirish — Supabase auth YO'Q. Bitta login+parol.
 * Login student_login yoki admin_login ga mos kelishiga qarab sessiya turi
 * ('student' | 'admin') aniqlanadi. Imzolangan cookie o'rnatiladi.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { signCenterSession, CENTER_COOKIE, CENTER_COOKIE_OPTIONS } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { login, password } = await request.json();
    if (!login || !password) {
      return NextResponse.json({ error: 'Login va parol kerak' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const trimmed = String(login).trim();

    // PostgREST `.or()` filtri maxsus belgilardan buzilmasligi uchun himoya
    if (/[,()]/.test(trimmed)) {
      return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    }

    const { data: center, error } = await supabase
      .from('centers')
      .select('id, name, slug, image_url, telegram_channel, is_active, student_login, student_password, admin_login, admin_password')
      .or(`student_login.eq.${trimmed},admin_login.eq.${trimmed}`)
      .maybeSingle();

    if (error || !center) {
      return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    }
    if (!center.is_active) {
      return NextResponse.json({ error: 'Bu markaz vaqtincha faol emas' }, { status: 403 });
    }

    let kind = null;
    if (trimmed === center.student_login && password === center.student_password) {
      kind = 'student';
    } else if (trimmed === center.admin_login && password === center.admin_password) {
      kind = 'admin';
    }

    if (!kind) {
      return NextResponse.json({ error: 'Login yoki parol noto\'g\'ri' }, { status: 401 });
    }

    const token = signCenterSession({
      centerId: center.id,
      slug: center.slug,
      name: center.name,
      telegram: center.telegram_channel || null,
      image: center.image_url || null,
      kind,
    });

    const res = NextResponse.json({
      ok: true,
      kind,
      center: {
        name: center.name,
        slug: center.slug,
        image: center.image_url || null,
        telegram: center.telegram_channel || null,
      },
    });
    res.cookies.set(CENTER_COOKIE, token, CENTER_COOKIE_OPTIONS);
    return res;
  } catch (err) {
    console.error('[centers/login] error:', err);
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}
