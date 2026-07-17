/**
 * Platforma admini uchun O'quv Markazlarni boshqarish.
 *   GET  /api/admin/centers  — barcha markazlar (parollari bilan — admin ko'radi)
 *   POST /api/admin/centers  — yangi markaz yaratish
 *
 * Faqat platforma admini (user_metadata.role === 'admin'). Yozuvlar service_role
 * bilan bajariladi (RLS chetlanadi), lekin admin ekani AVVAL tekshiriladi.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Auth talab qilinadi', status: 401 };
  const role = user.user_metadata?.role;
  if (role !== 'admin') return { error: 'Ruxsat yo\'q', status: 403 };
  return { user };
}

function slugify(str) {
  return String(str).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('centers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ centers: data || [] });
}

export async function POST(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await request.json();
  const name = (body.name || '').trim();
  const slug = slugify(body.slug || body.name || '');
  const student_login = (body.student_login || '').trim();
  const student_password = (body.student_password || '').trim();
  const admin_login = (body.admin_login || '').trim();
  const admin_password = (body.admin_password || '').trim();

  if (!name || !slug || !student_login || !student_password || !admin_login || !admin_password) {
    return NextResponse.json({ error: 'Barcha majburiy maydonlarni to\'ldiring' }, { status: 400 });
  }
  if (student_login === admin_login) {
    return NextResponse.json({ error: 'O\'quvchi va admin login bir xil bo\'lmasligi kerak' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('centers')
    .insert([{
      name,
      slug,
      image_url: body.image_url || null,
      telegram_channel: (body.telegram_channel || '').trim() || null,
      student_login,
      student_password,
      admin_login,
      admin_password,
      is_active: body.is_active !== false,
      created_by: auth.user.id,
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Bu slug yoki login allaqachon band' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ center: data });
}
