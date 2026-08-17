/**
 * POST /api/fullmock/submit
 * Body: { code_id, mock_id, person_name, answers, timeSpent }
 *
 * Full mock javoblarini yuborish:
 *  - Listening/Reading avtomatik tekshiriladi
 *  - Writing AI (OpenAI) orqali tekshiriladi
 *  - Natija full_mock_submissions ga yoziladi
 *  - Kod is_used = true bo'ladi
 *  - Natija foydalanuvchiga qaytariladi (PDF uchun)
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { evaluateObjective } from '@/lib/ielts-checker';
import { countWords } from '@/utils/word-count';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const maxDuration = 120; // Writing AI uchun ko'proq vaqt

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

// ── IELTS Writing AI Evaluation ──
function parseIELTSScore(str) {
  const num = parseFloat((str || '').toString().trim());
  if (isNaN(num)) return 0;
  return Math.round(Math.min(9, Math.max(0, num)) * 2) / 2;
}

function roundToIELTSBand(raw) {
  return Math.round(raw * 2) / 2;
}

function buildWritingPrompt(isTask1) {
  const mainLabel = isTask1 ? 'Task Achievement' : 'Task Response';
  return [
    'You are a VERY STRICT certified IELTS examiner.',
    'Band 7+ is difficult. Do NOT over-score.',
    'Most candidates are Band 5.5–6.5.',
    '',
    'SCORING: Use only IELTS bands (0–9, step 0.5)',
    '',
    'OUTPUT FORMAT EXACTLY:',
    `${mainLabel}: X.X`,
    'Coherence and Cohesion: X.X',
    'Lexical Resource: X.X',
    'Grammatical Range and Accuracy: X.X',
    'Overall Band Score: X.X',
    '',
    'Feedback:',
    `${mainLabel}: <why + how to improve>`,
    'Coherence and Cohesion: <why + how>',
    'Lexical Resource: <why + how>',
    'Grammatical Range and Accuracy: <why + how>',
    '',
    'Top 3 Corrections:',
    '1) <title>',
    'Example: <sentence>',
    'Why: <reason>',
    '2) <title>',
    'Example: <sentence>',
    'Why: <reason>',
    '3) <title>',
    'Example: <sentence>',
    'Why: <reason>',
  ].join('\n');
}

function parseWritingOutput(text) {
  const parsed = {
    TaskAchievement: '0', TaskResponse: '0',
    CoherenceAndCohesion: '0', LexicalResource: '0',
    GrammaticalRangeAndAccuracy: '0', BandScore: '0',
    Feedback: '', Corrections: '',
  };

  const lines = text.split('\n').map(l => l.trim());
  const feedbackLines = [];
  const correctionsLines = [];
  let state = 0;

  for (const rawLine of lines) {
    if (!rawLine) { if (state === 1) feedbackLines.push(''); continue; }
    const line = rawLine.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    if (!line) continue;

    if (line.match(/^Feedback\s*:/i)) { state = 1; const after = line.slice(line.indexOf(':') + 1).trim(); if (after) feedbackLines.push(after); continue; }
    if (line.match(/^Top\s*\d*\s*Corrections\s*:/i)) { state = 2; continue; }
    if (state === 2) { correctionsLines.push(rawLine); continue; }
    if (state === 1) { feedbackLines.push(rawLine); continue; }

    const s = line.replace(/^-\s*/, '').trim();
    const extract = (l) => { const p = l.split(':'); return p.length > 1 ? p.slice(1).join(':').trim() : '0'; };

    if (s.match(/^Task\s*Achievement\s*:/i)) parsed.TaskAchievement = extract(s);
    else if (s.match(/^Task\s*Response\s*:/i)) parsed.TaskResponse = extract(s);
    else if (s.match(/^Coherence/i)) parsed.CoherenceAndCohesion = extract(s);
    else if (s.match(/^Lexical/i)) parsed.LexicalResource = extract(s);
    else if (s.match(/^Grammatical/i)) parsed.GrammaticalRangeAndAccuracy = extract(s);
    else if (s.match(/^Overall\s*Band/i)) parsed.BandScore = extract(s);
  }

  parsed.Feedback = feedbackLines.join('\n').trim() || 'No feedback provided.';
  parsed.Corrections = correctionsLines.join('\n').trim();
  return parsed;
}

async function evaluateWritingTask(task, essayText, isTask1) {
  if (!essayText || essayText.length < 10) {
    return {
      isTask1,
      TaskAchievement: '0.0', TaskResponse: '0.0',
      CoherenceAndCohesion: '0.0', LexicalResource: '0.0',
      GrammaticalRangeAndAccuracy: '0.0', BandScore: '0.0',
      Feedback: 'No response provided.', Corrections: '',
    };
  }

  const systemPrompt = buildWritingPrompt(isTask1);
  const userPrompt = `Task prompt:\n${task.content || '(no task content)'}\n\nStudent Essay:\n${essayText}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const raw = parseWritingOutput(completion.choices[0].message.content);
  const ta = parseIELTSScore(raw.TaskAchievement);
  const tr = parseIELTSScore(raw.TaskResponse);
  const cc = parseIELTSScore(raw.CoherenceAndCohesion);
  const lr = parseIELTSScore(raw.LexicalResource);
  const gra = parseIELTSScore(raw.GrammaticalRangeAndAccuracy);
  const mainScore = isTask1 ? ta : tr;
  const aiOverall = parseIELTSScore(raw.BandScore);
  const computedAvg = (mainScore + cc + lr + gra) / 4;
  const band = aiOverall > 0 ? roundToIELTSBand(aiOverall) : roundToIELTSBand(computedAvg);

  return {
    isTask1,
    TaskAchievement: isTask1 ? ta.toFixed(1) : 'N/A',
    TaskResponse: isTask1 ? 'N/A' : tr.toFixed(1),
    CoherenceAndCohesion: cc.toFixed(1),
    LexicalResource: lr.toFixed(1),
    GrammaticalRangeAndAccuracy: gra.toFixed(1),
    BandScore: band.toFixed(1),
    Feedback: raw.Feedback,
    Corrections: raw.Corrections,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { code_id, mock_id, person_name, answers, timeSpent } = body;

    if (!code_id || !mock_id || !person_name) {
      return NextResponse.json({ error: 'Majburiy maydonlar to\'ldirilmagan' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Kodni tekshirish
    const { data: codeRow, error: codeErr } = await supabase
      .from('full_mock_access_codes')
      .select('*, full_mock_tests(*)')
      .eq('id', code_id)
      .single();

    if (codeErr || !codeRow) {
      return NextResponse.json({ error: 'Kod topilmadi' }, { status: 404 });
    }

    if (codeRow.is_used) {
      return NextResponse.json({ error: 'Bu kod allaqachon ishlatilgan' }, { status: 403 });
    }

    const now = new Date();
    if (now > new Date(codeRow.expires_at)) {
      return NextResponse.json({ error: 'Kodning muddati tugagan' }, { status: 403 });
    }

    // Test ma'lumotlarini olish (javoblari bilan)
    const mockTest = codeRow.full_mock_tests;
    const { data: testRow } = await supabase
      .from('Tests')
      .select('id, type, data')
      .eq('id', mockTest.test_row_id)
      .single();

    if (!testRow) {
      return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 });
    }

    const testData = testRow.data || {};
    const sec = testData.sections || {};
    const userAnswers = answers || {};

    // ── Listening/Reading tekshirish ──
    const la = userAnswers.listening || {};
    const ra = userAnswers.reading || {};
    const wa = userAnswers.writing || {};

    const lRes = sec.listening ? evaluateObjective(sec.listening, la, 'listening') : { score: 0, total: 0, band: null };
    const rRes = sec.reading ? evaluateObjective(sec.reading, ra, 'reading') : { score: 0, total: 0, band: null };

    // ── Writing AI tekshirish ──
    let writingResults = {};
    let writingBand = null;
    const writingAnswers = [];

    if (sec.writing?.tasks) {
      const tasks = sec.writing.tasks;
      for (let i = 0; i < tasks.length; i++) {
        const essayText = (wa[String(i)] ?? wa[i] ?? '').toString().trim();
        const isTask1 = tasks[i].taskNumber === 1 || i === 0;

        writingAnswers.push({
          taskNumber: tasks[i].taskNumber || i + 1,
          title: tasks[i].title || `Task ${i + 1}`,
          text: essayText,
          wordCount: countWords(essayText),
        });

        try {
          writingResults[i] = await evaluateWritingTask(tasks[i], essayText, isTask1);
        } catch (aiErr) {
          console.error(`[fullmock/submit] Writing AI task ${i} error:`, aiErr);
          writingResults[i] = {
            isTask1, BandScore: '0.0', Feedback: 'AI tekshirishda xatolik yuz berdi.',
            TaskAchievement: '0.0', TaskResponse: '0.0',
            CoherenceAndCohesion: '0.0', LexicalResource: '0.0',
            GrammaticalRangeAndAccuracy: '0.0', Corrections: '',
          };
        }
      }

      // Writing overall band
      const wBands = Object.values(writingResults).map(r => parseFloat(r.BandScore) || 0);
      if (wBands.length === 2) {
        writingBand = roundToIELTSBand((wBands[0] + wBands[1] * 2) / 3);
      } else if (wBands.length > 0) {
        writingBand = roundToIELTSBand(wBands.reduce((a, b) => a + b, 0) / wBands.length);
      }
    }

    // ── Overall Band ──
    const bands = [
      lRes.band ? parseFloat(lRes.band) : null,
      rRes.band ? parseFloat(rRes.band) : null,
      writingBand,
    ].filter(b => b !== null && !isNaN(b));
    const overallBand = bands.length > 0 ? roundToIELTSBand(bands.reduce((a, b) => a + b, 0) / bands.length) : null;

    // ── Bazaga saqlash ──
    const submissionRow = {
      full_mock_id: mock_id,
      access_code_id: code_id,
      person_name: String(person_name).trim(),
      user_answers: userAnswers,
      server_results: {
        listening: lRes,
        reading: rRes,
      },
      listening_band: lRes.band ? parseFloat(lRes.band) : null,
      reading_band: rRes.band ? parseFloat(rRes.band) : null,
      listening_correct: lRes.score || 0,
      reading_correct: rRes.score || 0,
      writing_answers: writingAnswers,
      writing_results: writingResults,
      writing_band: writingBand,
      overall_band: overallBand,
      time_spent_seconds: timeSpent || null,
    };

    const { data: submission, error: insErr } = await supabase
      .from('full_mock_submissions')
      .insert([submissionRow])
      .select('id')
      .single();

    if (insErr) {
      console.error('[fullmock/submit] insert error:', insErr);
      return NextResponse.json({ error: 'Natijani saqlashda xatolik' }, { status: 500 });
    }

    // Kodni is_used = true qilish
    await supabase
      .from('full_mock_access_codes')
      .update({ is_used: true, used_at: new Date().toISOString() })
      .eq('id', code_id);

    return NextResponse.json({
      ok: true,
      submission_id: submission.id,
      title: testData.title || 'IELTS Full Mock Test',
      person_name: submissionRow.person_name,
      time_spent_seconds: timeSpent || null,
      created_at: new Date().toISOString(),
      results: {
        listening: {
          score: lRes.score,
          total: lRes.total,
          band: lRes.band,
          results: lRes.results || {},
        },
        reading: {
          score: rRes.score,
          total: rRes.total,
          band: rRes.band,
          results: rRes.results || {},
        },
        writing: {
          tasksEvaluation: writingResults,
          band: writingBand !== null && writingBand !== undefined ? Number(writingBand).toFixed(1) : '0.0',
          tasks: writingAnswers,
        },
        overall_band: overallBand !== null && overallBand !== undefined ? Number(overallBand).toFixed(1) : '0.0',
      },
    });
  } catch (err) {
    console.error('[API /api/fullmock/submit] error:', err);
    return NextResponse.json({ error: 'Server xatoligi: ' + err.message }, { status: 500 });
  }
}
