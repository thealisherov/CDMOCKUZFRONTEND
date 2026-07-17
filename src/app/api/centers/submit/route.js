/**
 * POST /api/centers/submit
 * Body: { type, testNumericId, name, surname, answers, timeSpent }
 *
 * O'quvchi testni topshiradi (student sessiyasi shart).
 *  - listening/reading -> avtomatik tekshiriladi (evaluateObjective)
 *  - writing           -> xom holda saqlanadi (o'qituvchi qo'lda tekshiradi)
 * Natija center_submissions ga card sifatida yoziladi. Javob: { ok, telegram }.
 * O'quvchiga ball/javob QAYTARILMAYDI (natija telegram kanalida e'lon qilinadi).
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getCenterSession } from '@/lib/center-session';
import { evaluateObjective } from '@/lib/ielts-checker';
import { countWords } from '@/utils/word-count';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const session = await getCenterSession('student');
    if (!session) return NextResponse.json({ error: 'Sessiya topilmadi' }, { status: 401 });

    // Preview (admin sinovi) — hech narsa saqlamaymiz, faqat yakuniy ekranni qaytaramiz
    if (session.preview) {
      return NextResponse.json({ ok: true, preview: true, telegram: session.telegram || null, centerName: session.name });
    }

    const body = await request.json();
    const { type, testNumericId, name, surname, answers, timeSpent } = body;

    if (!type || !testNumericId || !name || !surname) {
      return NextResponse.json({ error: 'Majburiy maydonlar to\'ldirilmagan' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Test markazga tegishli ekanini tekshirib, JSON (javoblari bilan) ni olamiz
    const { data: rows, error } = await supabase
      .from('Tests')
      .select('id, type, data')
      .eq('center_id', session.centerId)
      .eq('type', type)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[centers/submit] fetch error:', error);
      return NextResponse.json({ error: 'Testni olishda xatolik' }, { status: 500 });
    }
    const testRow = rows?.[Number(testNumericId) - 1];
    if (!testRow) return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });

    const testData = testRow.data || {};
    const userAnswers = answers || {};

    const row = {
      center_id: session.centerId,
      test_id: testRow.id,
      test_numeric_id: Number(testNumericId),
      test_title: testData.title || `Test ${testNumericId}`,
      test_type: type,
      student_name: String(name).trim(),
      student_surname: String(surname).trim(),
      user_answers: userAnswers,
      time_spent_seconds: timeSpent || null,
    };

    const buildWriting = (writingData, wAnswers) => {
      const tasks = writingData?.tasks || [];
      return tasks.map((t, i) => {
        const text = (wAnswers[String(i)] ?? wAnswers[i] ?? '').toString();
        return {
          taskNumber: t.taskNumber || i + 1,
          title: t.title || `Task ${t.taskNumber || i + 1}`,
          text,
          wordCount: countWords(text),
        };
      });
    };

    if (type === 'full_mock') {
      // answers = { listening:{}, reading:{}, writing:{} }
      const sec = testData.sections || {};
      const la = userAnswers.listening || {};
      const ra = userAnswers.reading || {};
      const wa = userAnswers.writing || {};

      const lRes = sec.listening ? evaluateObjective(sec.listening, la, 'listening') : { score: 0, total: 0, band: null, results: {} };
      const rRes = sec.reading ? evaluateObjective(sec.reading, ra, 'reading') : { score: 0, total: 0, band: null, results: {} };

      row.user_answers = userAnswers;
      row.writing_answers = buildWriting(sec.writing, wa);
      row.server_results = {
        listening: lRes,
        reading: rRes,
        writing: { taskCount: row.writing_answers.length },
      };
      row.correct_count = lRes.score + rRes.score;
      row.total_questions = lRes.total + rRes.total;
      row.band_score = null; // umumiy band writing tekshirilgach hisoblanadi
    } else if (type === 'writing') {
      const tasks = testData.tasks || [];
      row.writing_answers = buildWriting(testData, userAnswers);
      row.total_questions = tasks.length;
      row.band_score = null;          // o'qituvchi qo'yadi
      row.server_results = {};
    } else {
      const { score, total, band, results } = evaluateObjective(testData, userAnswers, type);
      row.correct_count = score;
      row.total_questions = total;
      row.band_score = band ? Number(band) : null;
      row.server_results = { score, total, band, results };
    }

    const { error: insErr } = await supabase.from('center_submissions').insert([row]);
    if (insErr) {
      console.error('[centers/submit] insert error:', insErr);
      return NextResponse.json({ error: 'Saqlashda xatolik' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, telegram: session.telegram || null, centerName: session.name });
  } catch (err) {
    console.error('[centers/submit] error:', err);
    return NextResponse.json({ error: 'Server xatoligi' }, { status: 500 });
  }
}
