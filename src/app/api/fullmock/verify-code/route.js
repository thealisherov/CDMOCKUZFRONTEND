/**
 * POST /api/fullmock/verify-code
 * Body: { code }
 * 
 * Kirish kodini tekshiradi:
 *  - Kod mavjudmi?
 *  - Expire bo'lmaganmi (48 soat)?
 *  - Ishlatilmaganmi (yoki hali ishlatilmagan)?
 * 
 * Muvaffaqiyatli bo'lsa test ma'lumotlarini qaytaradi.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { sanitizeTestData } from '@/utils/sanitizeTestData';
import { adaptReadingData } from '@/utils/readingDataAdapter';
import { adaptListeningData } from '@/utils/listeningDataAdapter';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const code = (body.code || '').toString().trim().toUpperCase();

    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Kod noto\'g\'ri formatda' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Kodni topish
    const { data: codeRow, error: codeErr } = await supabase
      .from('full_mock_access_codes')
      .select('*, full_mock_tests(*)')
      .eq('code', code)
      .single();

    if (codeErr || !codeRow) {
      return NextResponse.json({ error: 'Kod topilmadi. Iltimos, to\'g\'ri kiriting.' }, { status: 404 });
    }

    // Expire tekshirish
    const now = new Date();
    const expiresAt = new Date(codeRow.expires_at);
    if (now > expiresAt) {
      return NextResponse.json({
        error: 'Kodning amal qilish muddati tugagan.',
        expired: true,
        expires_at: codeRow.expires_at,
      }, { status: 403 });
    }

    // Ishlatilganligini tekshirish — allaqachon natija yuborilgan bo'lsa
    if (codeRow.is_used) {
      return NextResponse.json({
        error: 'Bu kod allaqachon ishlatilgan.',
        used: true,
      }, { status: 403 });
    }

    const mockTest = codeRow.full_mock_tests;
    if (!mockTest || !mockTest.is_active) {
      return NextResponse.json({ error: 'Bu test hozirda mavjud emas.' }, { status: 404 });
    }

    // Test ma'lumotlarini olish
    const { data: testRow, error: testErr } = await supabase
      .from('Tests')
      .select('id, type, data')
      .eq('id', mockTest.test_row_id)
      .single();

    if (testErr || !testRow) {
      return NextResponse.json({ error: 'Test ma\'lumotlari topilmadi.' }, { status: 404 });
    }

    // Ma'lumotlarni sanitize qilish (javoblarni olib tashlash)
    const d = testRow.data || {};
    const sec = d.sections || {};

    const sections = {
      listening: sec.listening ? adaptListeningData(sanitizeTestData(sec.listening)) : null,
      reading: sec.reading ? adaptReadingData(sanitizeTestData(sec.reading)) : null,
      writing: sec.writing || null,
    };

    // Kodni "ishlatilmoqda" deb belgilaymiz (used_at)
    // Lekin is_used ni faqat submit bo'lganda true qilamiz
    if (!codeRow.used_at) {
      await supabase
        .from('full_mock_access_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('id', codeRow.id);
    }

    return NextResponse.json({
      ok: true,
      code_id: codeRow.id,
      mock_id: mockTest.id,
      test_row_id: testRow.id,
      person_name: codeRow.person_name,
      title: mockTest.title || d.title || 'IELTS Full Mock',
      sections,
      expires_at: codeRow.expires_at,
    });
  } catch (err) {
    console.error('[API /api/fullmock/verify-code] error:', err);
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}
