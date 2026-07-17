/**
 * GET /api/centers/tests
 *
 * Joriy markaz sessiyasidagi markazning testlari (metadata, savollarsiz).
 * Pozitsiya (id) markaz ICHIDA created_at bo'yicha hisoblanadi — platformadan
 * mustaqil, shuning uchun markaz testlari platforma raqamlashiga ta'sir qilmaydi.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCenterSession } from '@/lib/center-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCenterSession();
  if (!session) return NextResponse.json({ error: 'Sessiya topilmadi' }, { status: 401 });

  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from('Tests')
    .select('id, test_id, type, data, created_at')
    .eq('center_id', session.centerId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[centers/tests] error:', error);
    return NextResponse.json({ error: 'Testlarni olishda xatolik' }, { status: 500 });
  }

  // Pozitsiya har bir TYPE ichida alohida hisoblanadi (platforma bilan bir xil mantiq),
  // shunda /markaz/test/[type]/[id] URL'i to'g'ri testni topadi.
  const perType = {};
  const list = (rows || []).map((row) => {
    const d = row.data || {};
    perType[row.type] = (perType[row.type] || 0) + 1;
    const numericId = perType[row.type];

    let resolvedTestType = d.testFormat || d.testType || 'full_test';
    let questionsCount = d.totalQuestions || (row.type === 'writing' ? 2 : 40);
    let duration = d.timer || (row.type === 'listening' ? 40 : 60);
    let desc = d.description || '';

    if (row.type === 'full_mock') {
      const s = d.sections || {};
      duration = (s.listening?.timer || 40) + (s.reading?.timer || 60) + (s.writing?.timer || 60);
      questionsCount = 82; // 40 L + 40 R + 2 W
      resolvedTestType = 'full_mock';
      if (!desc) desc = 'Listening + Reading + Writing · to\'liq mock';
    } else if (row.type === 'reading' && Array.isArray(d.passages) && d.passages.length === 1) {
      const actual = d.passages[0].questionGroups?.reduce((a, g) => a + (g.questions?.length || 0), 0);
      questionsCount = actual || questionsCount;
    }

    if (!desc) {
      desc = row.type === 'listening' ? '4-Section Listening · 40 Questions'
        : row.type === 'writing' ? 'Task 1 & Task 2 · 2 Tasks'
        : '3 Passages · 40 Questions';
    }

    return {
      id: numericId,
      supabaseId: row.id,
      type: row.type,
      title: d.title || `Test ${numericId}`,
      description: desc,
      duration,
      level: d.level || 'medium',
      testType: resolvedTestType,
      questions: questionsCount,
    };
  });

  return NextResponse.json({
    center: { name: session.name, slug: session.slug, telegram: session.telegram || null },
    kind: session.kind,
    preview: session.preview || false,
    tests: list,
  });
}
