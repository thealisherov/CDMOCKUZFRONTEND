/**
 * GET  /api/admin/fullmock/codes?mock_id=xxx — Muayyan test uchun barcha kodlar
 * POST /api/admin/fullmock/codes — Yangi kod yaratish
 *   Body: { mock_id, person_name }
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Auth talab qilinadi', status: 401 };
  if (user.user_metadata?.role !== 'admin') return { error: 'Ruxsat yo\'q', status: 403 };
  return { user };
}

/** 6 ta alfanumerik kod yaratish */
function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // O/0/I/1 chalkash bo'lmasligi uchun olib tashlangan
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const mockId = searchParams.get('mock_id');

  if (!mockId) return NextResponse.json({ error: 'mock_id talab qilinadi' }, { status: 400 });

  const supabase = createAdminClient();
  const { data: codes, error } = await supabase
    .from('full_mock_access_codes')
    .select('*')
    .eq('full_mock_id', mockId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Har bir kodga expire statusini qo'shish
  const now = new Date();
  const list = (codes || []).map(c => ({
    ...c,
    is_expired: now > new Date(c.expires_at),
    status: c.is_used ? 'used' : (now > new Date(c.expires_at) ? 'expired' : 'active'),
  }));

  return NextResponse.json({ codes: list });
}

export async function POST(request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const body = await request.json();
    const { mock_id, person_name } = body;

    if (!mock_id || !person_name?.trim()) {
      return NextResponse.json({ error: 'mock_id va person_name majburiy' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Mock testni topish va expire_hours olish
    let mock = null;
    let targetMockId = mock_id;

    try {
      const { data: fm } = await supabase
        .from('full_mock_tests')
        .select('id, expire_hours')
        .eq('id', mock_id)
        .maybeSingle();

      if (fm) {
        mock = fm;
        targetMockId = fm.id;
      }
    } catch {
      // ignore
    }

    if (!mock) {
      // test_row_id bo'yicha yoki Tests jadvalidan qidiramiz
      try {
        const { data: testRow } = await supabase
          .from('Tests')
          .select('id, data')
          .eq('id', mock_id)
          .maybeSingle();

        if (testRow) {
          const d = testRow.data || {};
          // full_mock_tests ga insert qilib ko'ramiz
          try {
            const { data: createdFm } = await supabase
              .from('full_mock_tests')
              .insert({
                test_row_id: testRow.id,
                title: d.title || 'IELTS Full Mock Test',
                price_uzs: d.price_uzs || 69000,
                price_usd: d.price_usd || 5.0,
                expire_hours: d.expire_hours || 48,
                is_active: true,
              })
              .select('id, expire_hours')
              .maybeSingle();

            if (createdFm) {
              mock = createdFm;
              targetMockId = createdFm.id;
            }
          } catch {
            mock = { id: testRow.id, expire_hours: d.expire_hours || 48 };
          }
        }
      } catch {
        // ignore
      }
    }

    const expireHours = mock?.expire_hours || 48;
    const expiresAt = new Date(Date.now() + expireHours * 60 * 60 * 1000).toISOString();

    // Unikal kod yaratish (takroriy bo'lmasligini tekshirish)
    let code;
    let attempts = 0;
    while (attempts < 10) {
      code = generateCode();
      try {
        const { data: existing } = await supabase
          .from('full_mock_access_codes')
          .select('id')
          .eq('code', code)
          .maybeSingle();
        if (!existing) break;
      } catch {
        break;
      }
      attempts++;
    }

    const { data: inserted, error: insErr } = await supabase
      .from('full_mock_access_codes')
      .insert({
        full_mock_id: targetMockId,
        code,
        person_name: person_name.trim(),
        expires_at: expiresAt,
      })
      .select()
      .maybeSingle();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({
      code: inserted || { code, person_name, expires_at: expiresAt },
      message: `Kod yaratildi: ${code} — ${expireHours} soat amal qiladi`,
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/fullmock/codes] Error:', err);
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  }
}
