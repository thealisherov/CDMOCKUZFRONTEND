/**
 * GET /api/tests
 *
 * Returns a list of tests (metadata only, NO question data).
 *
 * Query params:
 *   ?type=listening   → filter by test type
 *   ?type=reading
 *   ?type=writing
 *
 * Response shape:
 *   [{ id, test_id, type, title, description, duration, level, testType, questions, access, totalQuestions }]
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'listening' | 'reading' | 'writing' | null

    const supabase = await createClient()

    let query = supabase
      .from('Tests')
      .select('id, test_id, type, data, created_at')
      .is('center_id', null)
      .order('created_at', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: rows, error } = await query

    if (error) {
      console.error('[API /api/tests] Supabase error:', error)
      return NextResponse.json({ error: 'Ma\'lumotlarni olishda xatolik' }, { status: 500 })
    }

    // ── Check user attempts for "completed" status ──
    let completedMap = {}; // { "reading_1": { completed: true, bestBand: "7.0" }, ... }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let attemptsQuery = supabase
          .from('TestAttempts')
          .select('test_numeric_id, test_type, band_score')
          .eq('user_id', user.id);
        
        if (type) {
          attemptsQuery = attemptsQuery.eq('test_type', type);
        }

        const { data: attempts } = await attemptsQuery;
        if (attempts) {
          attempts.forEach(a => {
            const key = `${a.test_type}_${a.test_numeric_id}`;
            if (!completedMap[key] || parseFloat(a.band_score) > parseFloat(completedMap[key].bestBand || '0')) {
              completedMap[key] = { completed: true, bestBand: a.band_score };
            }
          });
        }
      }
    } catch { /* user not logged in — skip */ }

    // Extract only metadata from the JSONB `data` column — never send questions/answers
    const testList = (rows || []).map((row, index) => {
      const d = row.data || {}
      const numericId = index + 1;
      const attemptInfo = completedMap[`${row.type}_${numericId}`];

      let resolvedTestType = d.testFormat || d.testType;
      let questionsCount = d.totalQuestions || (row.type === 'writing' ? 2 : 40);
      let passageNum = 1;

      if (row.type === 'reading' && d.passages && Array.isArray(d.passages) && d.passages.length === 1) {
        passageNum = d.passages[0].passageNumber || 1;
        let actualCount = d.passages[0].questionGroups?.reduce((acc, g) => acc + (g.questions?.length || 0), 0);
        questionsCount = actualCount || d.totalQuestions || 13;
        if (!resolvedTestType || resolvedTestType === 'full_test') {
          resolvedTestType = `passage_${passageNum}`;
        }
      } else if (!resolvedTestType) {
        resolvedTestType = 'full_test';
      }

      let testDesc = d.description || "";
      if (!testDesc) {
        if (resolvedTestType === 'full_test') {
          testDesc = row.type === 'listening' ? '4-Section Listening · 40 Questions' 
           : row.type === 'writing' ? 'Task 1 & Task 2 · 2 Tasks' 
           : '3 Passages · 40 Questions';
        } else if (resolvedTestType.startsWith('passage_')) {
          testDesc = `Passage ${resolvedTestType.split('_')[1]} · ${questionsCount} Questions`;
        } else if (resolvedTestType.startsWith('section_')) {
          testDesc = `Section ${resolvedTestType.split('_')[1]} · ${questionsCount} Questions`;
        } else if (resolvedTestType.startsWith('task_')) {
          testDesc = `Task ${resolvedTestType.split('_')[1]} · ${questionsCount} Tasks`;
        } else {
          testDesc = `${resolvedTestType.replace('_', ' ').replace(/\\b\\w/g, l => l.toUpperCase())} · ${questionsCount} Questions`;
        }
      }

      return {
        id: numericId,                                // numeric ID for URL (position-based)
        supabaseId: row.id,                           // uuid (internal)
        test_id: row.test_id,                         // e.g. "listening-test-1-clarence-house"
        type: row.type,
        title: d.title || `Test ${index + 1}`,
        description: testDesc,
        duration: d.timer || (row.type === 'listening' ? 40 : 60),
        level: d.level || 'medium',
        testType: resolvedTestType,
        questions: questionsCount,
        access: (d.testTution === 'paid' || d.access === 'paid') ? 'premium' : (d.testTution || d.access || 'free'),
        completed: attemptInfo?.completed || false,
        bestBand: attemptInfo?.bestBand || null,
      }
    })

    return NextResponse.json(testList)
  } catch (err) {
    console.error('[API /api/tests] Unexpected error:', err)
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 })
  }
}
