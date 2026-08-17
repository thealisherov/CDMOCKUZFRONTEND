import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const supabase = createAdminClient();

    // 1. Markaz testlarini olish
    const { data: centerTests, error: fetchErr } = await supabase
      .from('Tests')
      .select('*')
      .not('center_id', 'is', null)
      .eq('type', 'full_mock')
      .order('created_at', { ascending: true });

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    console.log('[sync-center-tests] Found center tests:', centerTests?.length);

    // Agar center_id bo'yicha topilmasa, data->center bo'yicha ham tekshiramiz
    let candidateTests = centerTests || [];
    if (candidateTests.length === 0) {
      const { data: allFullMocks } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', 'full_mock')
        .order('created_at', { ascending: true });
      candidateTests = allFullMocks || [];
    }

    const createdPublicMocks = [];

    // Birinchi va ikkinchi testlarni olamiz
    const targets = candidateTests.slice(0, 2);

    for (let i = 0; i < targets.length; i++) {
      const src = targets[i];
      const publicTestId = `public-full-mock-${i + 1}`;

      // Mavjudligini tekshiramiz
      const { data: existing } = await supabase
        .from('Tests')
        .select('id, test_id')
        .eq('test_id', publicTestId)
        .is('center_id', null)
        .maybeSingle();

      let testRowId = existing?.id;

      const cleanData = { ...src.data };
      delete cleanData.center; // Markaz belgilarini olib tashlaymiz
      cleanData.title = cleanData.title || `IELTS Full Mock Test #${i + 1}`;
      cleanData.testTution = 'paid';

      if (!existing) {
        const { data: inserted, error: insErr } = await supabase
          .from('Tests')
          .insert({
            test_id: publicTestId,
            type: 'full_mock',
            data: cleanData,
            center_id: null,
          })
          .select('id')
          .single();

        if (insErr) {
          console.error('[sync-center-tests] Insert test error:', insErr);
          continue;
        }
        testRowId = inserted.id;
      } else {
        // Update data
        await supabase
          .from('Tests')
          .update({ data: cleanData, center_id: null })
          .eq('id', existing.id);
      }

      // full_mock_tests jadvaliga kiritish/yangilash
      const { data: existingFm } = await supabase
        .from('full_mock_tests')
        .select('id')
        .eq('test_row_id', testRowId)
        .maybeSingle();

      if (!existingFm) {
        const { data: newFm, error: fmErr } = await supabase
          .from('full_mock_tests')
          .insert({
            test_row_id: testRowId,
            title: cleanData.title,
            price_uzs: 69000,
            price_usd: 5.00,
            expire_hours: 48,
            is_active: true,
          })
          .select()
          .single();

        if (newFm) createdPublicMocks.push(newFm);
      } else {
        createdPublicMocks.push(existingFm);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `${createdPublicMocks.length} ta public full mock test tayyorlandi`,
      publicMocks: createdPublicMocks,
    });
  } catch (err) {
    console.error('[sync-center-tests] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
