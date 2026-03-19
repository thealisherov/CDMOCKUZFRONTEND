/**
 * POST /api/tests/[id]/check
 *
 * For reading/listening: compares user answers to correct answers.
 * For writing: uses Google Gemini AI to evaluate essays.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// IELTS Listening/Reading band score mapping
function calculateBand(score, total) {
  const percentage = (score / total) * 100
  if (percentage >= 97) return '9.0'
  if (percentage >= 93) return '8.5'
  if (percentage >= 87) return '8.0'
  if (percentage >= 82) return '7.5'
  if (percentage >= 75) return '7.0'
  if (percentage >= 67) return '6.5'
  if (percentage >= 60) return '6.0'
  if (percentage >= 52) return '5.5'
  if (percentage >= 45) return '5.0'
  if (percentage >= 37) return '4.5'
  if (percentage >= 30) return '4.0'
  if (percentage >= 22) return '3.5'
  if (percentage >= 15) return '3.0'
  return '2.5'
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTRACT ANSWERS
// Builds a map: { qNum: { answer, alternatives, isMulti?, groupNums?, groupAnswers? } }
// For multiple_choice_multiple (numbers[] + answers[]), we store group info
// so we can evaluate the full set order-independently.
// ─────────────────────────────────────────────────────────────────────────────
function extractAnswers(data) {
  const answerMap = {}

  const processGroup = (group) => {
    if (!group || !group.questions) return
    const gt = (group.groupType || '')
    const isMultiGroup = gt === 'multiple_choice_multiple' ||
      gt === 'multiple_choice_multiple_answer'

    if (isMultiGroup) {
      // Detect whether this group uses shared answers[] or per-question answer
      // Case A: one question with numbers[] + answers[]
      //   { numbers: [21,22], answers: ['A','C'] }
      // Case B: separate questions each with number + answer (listening style)
      //   { number: 27, answer: 'B' }, { number: 28, answer: 'D' }
      const allNums = []
      const allCorrect = []

      group.questions.forEach(q => {
        if (q.numbers && q.answers) {
          // Case A
          q.numbers.forEach(n => allNums.push(n))
          ;(Array.isArray(q.answers) ? q.answers : [q.answers]).forEach(a => allCorrect.push(String(a).trim().toUpperCase()))
        } else if (q.number !== undefined) {
          // Case B
          allNums.push(q.number)
          if (q.answer) allCorrect.push(String(q.answer).trim().toUpperCase())
        }
      })

      // Store each number with a reference to the full group
      allNums.forEach(num => {
        answerMap[String(num)] = {
          answer: allCorrect,          // full set of correct answers for the group
          alternatives: [],
          isMultiGroup: true,
          groupNums: allNums.map(String),  // all question numbers in this group
          groupAnswers: allCorrect,         // correct answer set (order-irrelevant)
        }
      })
      return
    }

    // Normal questions
    group.questions.forEach(q => {
      if (q.number !== undefined) {
        answerMap[String(q.number)] = {
          answer: q.answer,
          alternatives: q.alternativeAnswers || [],
        }
      }
      if (q.numbers && q.answers) {
        q.numbers.forEach(num => {
          answerMap[String(num)] = {
            answer: q.answers,
            alternatives: [],
            isMulti: true,
          }
        })
      }
    })
  }

  const processAllGroups = (groups) => {
    ;(groups || []).forEach(group => processGroup(group))
  }

  if (data.parts) {
    data.parts.forEach(part => processAllGroups(part.questionGroups))
  }
  if (data.passages) {
    data.passages.forEach(passage => processAllGroups(passage.questionGroups))
  }
  return answerMap
}

// Order-independent set equality check
function setsEqual(setA, setB) {
  if (setA.length !== setB.length) return false
  const a = [...setA].sort()
  const b = [...setB].sort()
  return a.every((v, i) => v === b[i])
}

function isCorrect(userAnswer, correctData) {
  if (!correctData) return false
  const uAnswer = String(userAnswer || '').trim().toLowerCase()
  if (!uAnswer) return false
  if (correctData.isMulti && Array.isArray(correctData.answer)) {
    return correctData.answer.some(a => String(a).trim().toLowerCase() === uAnswer)
  }
  const mainAnswer = String(correctData.answer || '').trim().toLowerCase()
  if (uAnswer === mainAnswer) return true
  if (correctData.alternatives && correctData.alternatives.length > 0) {
    return correctData.alternatives.some(alt =>
      String(alt).trim().toLowerCase() === uAnswer
    )
  }
  return false
}

/**
 * Convert an image URL into a format OpenAI can process.
 */
async function urlToOpenAIImagePart(imageUrl) {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return {
      type: "image_url",
      image_url: {
        url: "data:" + blob.type + ";base64," + buffer.toString('base64')
      }
    }
  } catch(e) {
    console.warn("Could not fetch image for OpenAI:", imageUrl, e)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses a score string and rounds to the nearest IELTS 0.5 increment.
 * Clamps result to [0, 9].
 */
function parseIELTSScore(str) {
  const num = parseFloat((str || "").toString().trim());
  if (isNaN(num)) return 0;
  const clamped = Math.min(9, Math.max(0, num));
  return Math.round(clamped * 2) / 2;
}

/**
 * Rounds a raw average to the nearest IELTS 0.5 band.
 */
function roundToIELTSBand(raw) {
  return Math.round(raw * 2) / 2;
}

// ─────────────────────────────────────────────────────────────
// IELTS STRICT RUBRICS (IMPROVED)
// ─────────────────────────────────────────────────────────────

const RUBRIC_TASK = [
  "Task Achievement / Task Response (STRICT IELTS EXAMINER MODE)",
  "",
  "Band 5:",
  "- Addresses the task partially",
  "- Ideas unclear or repetitive",
  "",
  "Band 6:",
  "- Addresses all parts but development limited",
  "- Ideas lack explanation or examples",
  "",
  "Band 7:",
  "- Clear position throughout",
  "- Ideas supported with explanations/examples",
  "",
  "Band 8:",
  "- Fully developed ideas",
  "- Well-supported arguments",
  "",
  "STRICT RULE:",
  "If ideas lack explanation → max Band 6",
].join("\n")


const RUBRIC_COHERENCE = [
  "Coherence and Cohesion (STRICT)",
  "",
  "Band 5:",
  "- Weak organisation",
  "",
  "Band 6:",
  "- Organisation present but unclear progression",
  "",
  "Band 7:",
  "- Logical organisation and clear progression",
  "",
  "Band 8:",
  "- Smooth logical flow",
  "",
  "STRICT RULE:",
  "If progression unclear → max Band 6",
].join("\n")


const RUBRIC_LEXICAL = [
  "Lexical Resource (STRICT)",
  "",
  "Band 5:",
  "- Limited vocabulary",
  "",
  "Band 6:",
  "- Adequate vocabulary but repetitive",
  "",
  "Band 7:",
  "- Good vocabulary range",
  "",
  "Band 8:",
  "- Wide and precise vocabulary",
  "",
  "STRICT RULE:",
  "If repetition frequent → max Band 6",
].join("\n")


const RUBRIC_GRAMMAR = [
  "Grammatical Range and Accuracy (STRICT)",
  "",
  "Band 5:",
  "- Frequent errors",
  "",
  "Band 6:",
  "- Mix of simple/complex sentences",
  "",
  "Band 7:",
  "- Variety of complex structures",
  "",
  "Band 8:",
  "- Wide range, mostly error-free",
  "",
  "STRICT RULE:",
  "If mostly simple sentences → max Band 6",
].join("\n")


// ─────────────────────────────────────────────────────────────
// UPDATED STRICT PROMPT
// ─────────────────────────────────────────────────────────────

function buildSystemPrompt(mainCriterionLabel) {
  var lines = [];

  lines.push("You are a VERY STRICT certified IELTS examiner.");
  lines.push("");

  lines.push("Band 7+ is difficult.");
  lines.push("Do NOT over-score.");
  lines.push("Most candidates are Band 5.5–6.5.");
  lines.push("");

  lines.push("STRICT LIMITS:");
  lines.push("");

  lines.push("- If ideas lack explanation → max Band 6");
  lines.push("- If vocabulary repetition → max Band 6");
  lines.push("- If grammar errors frequent → max Band 6");
  lines.push("- If mostly simple sentences → max Band 6");
  lines.push("- If organisation weak → max Band 6");
  lines.push("");

  lines.push("----------------");
  lines.push(RUBRIC_TASK);
  lines.push("----------------");
  lines.push(RUBRIC_COHERENCE);
  lines.push("----------------");
  lines.push(RUBRIC_LEXICAL);
  lines.push("----------------");
  lines.push(RUBRIC_GRAMMAR);
  lines.push("----------------");

  lines.push("SCORING:");
  lines.push("Use only IELTS bands (0–9, step 0.5)");
  lines.push("");

  // 🔥 NEW FEEDBACK SYSTEM
  lines.push("FEEDBACK REQUIREMENTS:");
  lines.push("");
  lines.push("Write feedback based on ALL 4 criteria.");
  lines.push("");
  lines.push("For EACH criterion:");
  lines.push("- Explain WHY this score was given");
  lines.push("- Explain HOW to improve to next band");
  lines.push("");

  lines.push("OUTPUT FORMAT EXACTLY:");
  lines.push("");

  lines.push(mainCriterionLabel + ": X.X");
  lines.push("Coherence and Cohesion: X.X");
  lines.push("Lexical Resource: X.X");
  lines.push("Grammatical Range and Accuracy: X.X");
  lines.push("Overall Band Score: X.X");
  lines.push("");

  // 🔥 UPDATED FEEDBACK FORMAT
  lines.push("Feedback:");
  lines.push(mainCriterionLabel + ": <why + how>");
  lines.push("Coherence and Cohesion: <why + how>");
  lines.push("Lexical Resource: <why + how>");
  lines.push("Grammatical Range and Accuracy: <why + how>");
  lines.push("");

  lines.push("Top 3 Corrections:");
  lines.push("1) <title>");
  lines.push("Example: <sentence>");
  lines.push("Why: <reason>");
  lines.push("2) <title>");
  lines.push("Example: <sentence>");
  lines.push("Why: <reason>");
  lines.push("3) <title>");
  lines.push("Example: <sentence>");
  lines.push("Why: <reason>");

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT PARSER
// ─────────────────────────────────────────────────────────────────────────────

function parseGeminiOutput(text) {
  const parsed = {
    TaskAchievement: "0",
    TaskResponse: "0",
    CoherenceAndCohesion: "0",
    LexicalResource: "0",
    GrammaticalRangeAndAccuracy: "0",
    BandScore: "0",
    Feedback: "",
    Corrections: "",
  };

  const lines = text.split("\n").map(function (l) { return l.trim(); });
  const feedbackLines = [];
  const correctionsLines = [];
  
  // State machine
  // 0 = scanning scores
  // 1 = inside Feedback block
  // 2 = inside Corrections block
  let state = 0;
  
  // We track whether we've passed the score block.
  // Score lines appear BEFORE "Feedback:", so once we hit Feedback: we flip state.
  // IMPORTANT: lines like "Task Achievement: 6.5" can also appear inside Feedback block
  // as criterion-specific feedback lines — we only parse them as SCORES while state===0.

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    if (!rawLine) {
      // blank lines inside feedback/corrections are kept as separators
      if (state === 1) feedbackLines.push("");
      continue;
    }

    // Strip markdown bold/italic markers
    const line = rawLine.replace(/\*\*/g, '').replace(/\*/g, '').trim();
    if (!line) continue;

    // ── Detect section headers first (highest priority) ────────────────────
    if (line.match(/^Feedback\s*:/i)) {
      state = 1;
      // Anything after "Feedback:" on the same line is part of feedback
      const colonIdx = line.indexOf(":");
      const after = line.slice(colonIdx + 1).trim();
      if (after) feedbackLines.push(after);
      continue;
    }

    if (line.match(/^Top\s*\d*\s*Corrections\s*:/i) || line.match(/^Top\s*3\s*Corrections/i)) {
      state = 2;
      continue;
    }

    // ── State: inside Corrections ──────────────────────────────────────────
    if (state === 2) {
      correctionsLines.push(rawLine);
      continue;
    }

    // ── State: inside Feedback ─────────────────────────────────────────────
    if (state === 1) {
      feedbackLines.push(rawLine);
      continue;
    }

    // ── State: scanning for scores (state === 0) ───────────────────────────
    // Only parse score lines before we enter Feedback block
    const scoreLine = line.replace(/^-\s*/, '').trim();

    if (scoreLine.match(/^Task\s*Achievement\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.TaskAchievement = val;
    } else if (scoreLine.match(/^Task\s*Response\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.TaskResponse = val;
    } else if (scoreLine.match(/^Coherence\s*(and|&)\s*Cohesion\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.CoherenceAndCohesion = val;
    } else if (scoreLine.match(/^Lexical\s*Resource\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.LexicalResource = val;
    } else if (scoreLine.match(/^Grammatical\s*Range\s*(and|&)?\s*Accuracy\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.GrammaticalRangeAndAccuracy = val;
    } else if (scoreLine.match(/^Overall\s*Band\s*Score\s*:/i)) {
      const val = extractScore(scoreLine);
      if (!isNaN(parseFloat(val))) parsed.BandScore = val;
    }
  }

  // Join feedback lines into readable paragraphs
  // Each criterion line ("Task Achievement: ...") becomes its own paragraph
  const rawFeedback = feedbackLines.join("\n").trim();
  parsed.Feedback = rawFeedback || "No feedback provided.";
  parsed.Corrections = correctionsLines.join("\n").trim();

  return parsed;
}

/** Extracts the numeric part after the first colon on a score line. */
function extractScore(line) {
  const parts = line.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : "0";
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY RESULT  (no essay provided)
// ─────────────────────────────────────────────────────────────────────────────

function buildEmptyResult(index, taskCount) {
  return {
    isTask1: index === 0 && taskCount === 2,
    TaskAchievement: "0.0",
    TaskResponse: "0.0",
    CoherenceAndCohesion: "0.0",
    LexicalResource: "0.0",
    GrammaticalRangeAndAccuracy: "0.0",
    BandScore: "0.0",
    Feedback: "No response provided.",
    Corrections: "",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WRITING TEST CHECKER
// ─────────────────────────────────────────────────────────────────────────────

async function checkWritingTest(userAnswers, testRow) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API kaliti yo'q!" },
      { status: 500 }
    );
  }

  try {
    const results = {};
    const tasks = testRow.data.tasks || [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      // JSON keys become strings after serialize/deserialize, so try both
      const essayText = (userAnswers[String(i)] ?? userAnswers[i] ?? "").toString().trim();

      console.log(`[Writing] Task ${i + 1} essay length: ${essayText.length} chars`);

      // ── Empty response ──────────────────────────────────────────────────
      if (!essayText) {
        results[i] = buildEmptyResult(i, tasks.length);
        console.log(`[Writing] Task ${i + 1}: empty essay, skipping AI`);
        continue;
      }

      const isTask1 = task.taskNumber === 1 || (task.type && task.type === "task1");
      const mainCriterionLabel = isTask1 ? "Task Achievement" : "Task Response";

      // ── Prompt ──────────────────────────────────────────────────────────
      const systemInstruction = buildSystemPrompt(mainCriterionLabel);
      const userPrompt = "Task prompt:\n" + (task.content || "(no task content available)") + "\n\nStudent Essay:\n" + essayText;

      const userContent = [
        { type: "text", text: userPrompt },
      ];

      // Attach image if present
      if (task.image) {
        try {
          const imagePart = await urlToOpenAIImagePart(task.image);
          if (imagePart) userContent.unshift(imagePart);
        } catch (e) {
          console.warn("Image attach failed", e);
        }
      }

      // ── Call OpenAI ──────────────────────────────────────────────────────
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: userContent }
        ],
      });
      const outputText = completion.choices[0].message.content;

      // ── Debug: log what AI returned ──────────────────────────────────────
      console.log(`[Writing] Task ${i + 1} AI raw output:\n`, outputText);

      // ── Parse raw text ──────────────────────────────────────────────────
      const rawParsed = parseGeminiOutput(outputText);
      console.log(`[Writing] Task ${i + 1} parsed:`, rawParsed);

      // ── Convert & validate each criterion (IELTS 0.5 rounding) ──────────
      const ta = parseIELTSScore(rawParsed.TaskAchievement);
      const tr = parseIELTSScore(rawParsed.TaskResponse);
      const cc = parseIELTSScore(rawParsed.CoherenceAndCohesion);
      const lr = parseIELTSScore(rawParsed.LexicalResource);
      const gra = parseIELTSScore(rawParsed.GrammaticalRangeAndAccuracy);

      const mainScore = isTask1 ? ta : tr;

      // ── Band score: average of 4 criteria, rounded to 0.5 ───────────────
      // If AI gave Overall Band Score directly, prefer it; else compute
      const aiOverall = parseIELTSScore(rawParsed.BandScore);
      const computedAvg = (mainScore + cc + lr + gra) / 4;
      const bandScore = aiOverall > 0 ? roundToIELTSBand(aiOverall) : roundToIELTSBand(computedAvg);

      results[i] = {
        isTask1,
        TaskAchievement: isTask1 ? ta.toFixed(1) : "N/A",
        TaskResponse: isTask1 ? "N/A" : tr.toFixed(1),
        CoherenceAndCohesion: cc.toFixed(1),
        LexicalResource: lr.toFixed(1),
        GrammaticalRangeAndAccuracy: gra.toFixed(1),
        BandScore: bandScore.toFixed(1),
        Feedback: rawParsed.Feedback && rawParsed.Feedback.length > 5 ? rawParsed.Feedback : "AI feedback parsing failed. Please try again.",
        Corrections: rawParsed.Corrections || "",
        _rawOutput: process.env.NODE_ENV === 'development' ? outputText : undefined,
      };
    }

    // ── Final overall band ────────────────────────────────────────────────
    const finalOverallBand = calcFinalBand(results, tasks.length);

    return NextResponse.json({
      score: 0,
      total: 0,
      band: finalOverallBand.toFixed(1),
      isWriting: true,
      tasksEvaluation: results,
    });
  } catch (err) {
    console.error("[checkWritingTest] Error:", err);
    return NextResponse.json(
      { error: "Writing testni tekshirishda xatolik: " + (err.message || err) },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FINAL BAND CALCULATION
// Official IELTS weighting: Task 2 counts double when two tasks are present.
// ─────────────────────────────────────────────────────────────────────────────

function calcFinalBand(results, taskCount) {
  const bands = Object.values(results).map(function (r) {
    return parseFloat(r.BandScore) || 0;
  });

  if (bands.length === 0) return 0;

  if (taskCount === 2 && bands.length === 2) {
    const raw = (bands[0] + bands[1] * 2) / 3;
    return roundToIELTSBand(raw);
  }

  const sum = bands.reduce(function (a, b) { return a + b; }, 0);
  return roundToIELTSBand(sum / bands.length);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN POST HANDLER
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { userAnswers, type } = body

    if (!userAnswers || typeof userAnswers !== 'object') {
      return NextResponse.json({ error: 'userAnswers maydoni kerak' }, { status: 400 })
    }

    const supabase = await createClient()
    let testRow = null

    const numericId = Number(id)
    if (!isNaN(numericId) && numericId > 0 && type) {
      const { data: rows, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: true })

      if (!error && rows) {
        testRow = rows[numericId - 1] || null
      }
    }

    if (!testRow) {
      const { data: row, error } = await supabase
        .from('Tests')
        .select('*')
        .eq('test_id', id)
        .single()
      if (!error && row) testRow = row
    }

    if (!testRow) {
      return NextResponse.json({ error: 'Test topilmadi' }, { status: 404 })
    }

    // ── Route to Writing Evaluator if type is 'writing' ──
    if (testRow.type === 'writing' || type === 'writing') {
      return await checkWritingTest(userAnswers, testRow)
    }

    // ── Reading / Listening Evaluation ──
    const answerMap = extractAnswers(testRow.data)
    const total = Object.keys(answerMap).length
    let score = 0
    const results = {}

    // Track which multi-groups have already been evaluated (to avoid double-evaluating)
    const evaluatedGroups = new Set()

    Object.keys(answerMap).forEach(qNum => {
      const correctData = answerMap[qNum]

      // ── Multiple-choice-multiple GROUP evaluation ─────────────────────────
      // Each slot is evaluated INDEPENDENTLY.
      // Correct answer pool = {A, C} → if user picks A → ✅, D → ❌
      // Order doesn't matter: C,A = A,C (both full marks)
      if (correctData.isMultiGroup) {
        const groupKey = correctData.groupNums.sort().join(',')
        if (evaluatedGroups.has(groupKey)) return // already handled
        evaluatedGroups.add(groupKey)

        const correctSet = correctData.groupAnswers.map(a => String(a).trim().toUpperCase())

        correctData.groupNums.forEach(n => {
          const uAns = String(userAnswers[n] || '').trim().toUpperCase()
          // Each answer is correct if it appears in the correct answer pool
          const individualCorrect = uAns !== '' && correctSet.includes(uAns)
          if (individualCorrect) score++
          results[n] = {
            correct: individualCorrect,
            userAnswer: userAnswers[n] || '',
            correctAnswer: correctSet,
            isMultiGroup: true,
          }
        })
        return
      }

      // ── Normal question evaluation ────────────────────────────────────────
      const userAnswer = userAnswers[qNum] || ''
      const correct = isCorrect(userAnswer, correctData)
      if (correct) score++
      results[qNum] = {
        correct,
        userAnswer: userAnswer || '',
        correctAnswer: correctData.isMulti ? correctData.answer : correctData.answer,
      }
    })

    const band = calculateBand(score, total)

    return NextResponse.json({ score, total, band, results })
  } catch (err) {
    console.error('[API /api/tests/[id]/check] Unexpected error:', err)
    return NextResponse.json({ error: 'Server xatoligi: ' + err.message }, { status: 500 })
  }
}
