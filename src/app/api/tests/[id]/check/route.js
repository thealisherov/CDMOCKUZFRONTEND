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

function extractAnswers(data) {
  const answerMap = {}

  const processQuestions = (questions) => {
    if (!questions) return
    questions.forEach(q => {
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

  if (data.parts) {
    data.parts.forEach(part => {
      (part.questionGroups || []).forEach(group => {
        processQuestions(group.questions)
      })
    })
  }
  if (data.passages) {
    data.passages.forEach(passage => {
      (passage.questionGroups || []).forEach(group => {
        processQuestions(group.questions)
      })
    })
  }
  return answerMap
}

function isCorrect(userAnswer, correctData) {
  if (!userAnswer || !correctData) return false
  const uAnswer = String(userAnswer).trim().toLowerCase()
  if (!uAnswer) return false
  if (correctData.isMulti && Array.isArray(correctData.answer)) {
    return correctData.answer.some(a => String(a).trim().toLowerCase() === uAnswer)
  }
  const mainAnswer = String(correctData.answer).trim().toLowerCase()
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
// IELTS STRICT RUBRICS
// (improved to avoid overscoring)
// ─────────────────────────────────────────────────────────────

const RUBRIC_TASK = [
  "Task Achievement / Task Response (STRICT IELTS EXAMINER MODE)",
  "",
  "Band 5:",
  "- Addresses the task only partially",
  "- Ideas may be unclear or repetitive",
  "",
  "Band 6:",
  "- Addresses all parts of the task but development may be limited",
  "- Ideas are relevant but explanations may be weak",
  "",
  "Band 7:",
  "- Addresses all parts of the task",
  "- Clear position throughout",
  "- Ideas supported with explanation or examples",
  "",
  "Band 8:",
  "- Fully addresses all parts",
  "- Ideas are well-developed and clearly supported",
  "",
  "STRICT RULE:",
  "If ideas lack explanation OR development -> maximum Band 6.",
].join("\n")

const RUBRIC_COHERENCE = [
  "Coherence and Cohesion (STRICT)",
  "",
  "Band 5:",
  "- Organisation weak or unclear",
  "- Paragraphing may be missing",
  "",
  "Band 6:",
  "- Information organised but progression may be unclear",
  "- Paragraphing exists but may be uneven",
  "",
  "Band 7:",
  "- Ideas logically organised",
  "- Clear progression through essay",
  "",
  "Band 8:",
  "- Information logically sequenced",
  "- Cohesion managed effectively",
  "",
  "STRICT RULE:",
  "If paragraphing OR progression is weak -> maximum Band 6.",
].join("\n")

const RUBRIC_LEXICAL = [
  "Lexical Resource (STRICT)",
  "",
  "Band 5:",
  "- Limited vocabulary range",
  "- Frequent word choice errors",
  "",
  "Band 6:",
  "- Adequate vocabulary for the task",
  "- Some attempts at less common words",
  "",
  "Band 7:",
  "- Good vocabulary range",
  "- Some less common lexical items",
  "",
  "Band 8:",
  "- Wide vocabulary range",
  "- Precise word choice",
  "",
  "STRICT RULE:",
  "If vocabulary repetition is frequent -> maximum Band 6.",
].join("\n")

const RUBRIC_GRAMMAR = [
  "Grammatical Range and Accuracy (STRICT)",
  "",
  "Band 5:",
  "- Frequent grammar errors",
  "",
  "Band 6:",
  "- Mix of simple and complex sentences",
  "- Errors occur but meaning clear",
  "",
  "Band 7:",
  "- Variety of complex structures",
  "- Most sentences error-free",
  "",
  "Band 8:",
  "- Wide range of structures",
  "- Very few errors",
  "",
  "STRICT RULE:",
  "If grammar errors appear regularly -> maximum Band 6.",
].join("\n")

// ─────────────────────────────────────────────────────────────
// STRICT EXAMINER PROMPT
// ─────────────────────────────────────────────────────────────

function buildSystemPrompt(mainCriterionLabel) {
  var lines = [];
  lines.push("You are a VERY STRICT certified IELTS examiner.");
  lines.push("");
  lines.push("Evaluate the essay exactly like real IELTS examiners.");
  lines.push("");
  lines.push("Important rules:");
  lines.push("");
  lines.push("- Band 7+ is difficult to achieve.");
  lines.push("- Most candidates are between Band 5.5 and 6.5.");
  lines.push("- Do NOT over-score.");
  lines.push("");
  lines.push("Strict limits:");
  lines.push("");
  lines.push("If ideas lack explanation -> maximum Band 6.");
  lines.push("");
  lines.push("If grammar mistakes appear frequently -> maximum Band 6.");
  lines.push("");
  lines.push("If vocabulary repetition appears -> maximum Band 6.");
  lines.push("");
  lines.push("If paragraphing or organisation weak -> maximum Band 6.");
  lines.push("");
  lines.push("Use the IELTS descriptors below.");
  lines.push("");
  lines.push("----------------");
  lines.push("");
  lines.push(RUBRIC_TASK);
  lines.push("");
  lines.push("----------------");
  lines.push("");
  lines.push(RUBRIC_COHERENCE);
  lines.push("");
  lines.push("----------------");
  lines.push("");
  lines.push(RUBRIC_LEXICAL);
  lines.push("");
  lines.push("----------------");
  lines.push("");
  lines.push(RUBRIC_GRAMMAR);
  lines.push("");
  lines.push("----------------");
  lines.push("");
  lines.push("SCORING INSTRUCTIONS:");
  lines.push("");
  lines.push("Score each criterion from 0.0 to 9.0 using ONLY:");
  lines.push("");
  lines.push("0.0 0.5 1.0 1.5 2.0 2.5 3.0 3.5 4.0 4.5 5.0 5.5 6.0 6.5 7.0 7.5 8.0 8.5 9.0");
  lines.push("");
  lines.push("Do NOT invent numbers like 6.3 or 7.2.");
  lines.push("");
  lines.push("Overall Band Score:");
  lines.push("");
  lines.push("Average the four criteria and round to nearest 0.5.");
  lines.push("");
  lines.push("Feedback:");
  lines.push("");
  lines.push("Write 50-70 words explaining strengths and the main improvement needed.");
  lines.push("");
  lines.push("Then give EXACTLY 3 corrections.");
  lines.push("");
  lines.push("OUTPUT FORMAT EXACTLY:");
  lines.push("");
  lines.push(mainCriterionLabel + ": X.X");
  lines.push("Coherence and Cohesion: X.X");
  lines.push("Lexical Resource: X.X");
  lines.push("Grammatical Range and Accuracy: X.X");
  lines.push("Overall Band Score: X.X");
  lines.push("");
  lines.push("Feedback (50-70 words):");
  lines.push("<paragraph>");
  lines.push("");
  lines.push("Top 3 Corrections:");
  lines.push("");
  lines.push("1) <title>");
  lines.push("Example: <sentence>");
  lines.push("Why: <reason>");
  lines.push("");
  lines.push("2) <title>");
  lines.push("Example: <sentence>");
  lines.push("Why: <reason>");
  lines.push("");
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
  let inFeedback = false;
  let inCorrections = false;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    if (!rawLine) continue;
    
    // Clean markdown characters like ** or leading hyphens for score matching
    const line = rawLine.replace(/\*/g, '').replace(/^- /, '').trim();
    if (!line) continue;

    // ── Score lines ────────────────────────────────────────────────────────
    if (line.match(/^Task\s*Achievement/i)) {
      parsed.TaskAchievement = extractScore(line);
    } else if (line.match(/^Task\s*Response/i)) {
      parsed.TaskResponse = extractScore(line);
    } else if (line.match(/^Coherence\s*(and|&)\s*Cohesion/i)) {
      parsed.CoherenceAndCohesion = extractScore(line);
    } else if (line.match(/^Lexical\s*Resource/i)) {
      parsed.LexicalResource = extractScore(line);
    } else if (line.match(/^Grammatical\s*Range\s*(and|&)\s*Accuracy/i)) {
      parsed.GrammaticalRangeAndAccuracy = extractScore(line);
    } else if (line.match(/^Overall\s*Band\s*Score/i)) {
      parsed.BandScore = extractScore(line);
    }

    // ── Feedback block ─────────────────────────────────────────────────────
    else if (line.match(/^Feedback/i)) {
      inFeedback = true;
      inCorrections = false;
      const colonIdx = rawLine.indexOf(":");
      if (colonIdx > -1) {
        const after = rawLine.slice(colonIdx + 1).trim();
        if (after) feedbackLines.push(after);
      }
    } else if (inFeedback && line.match(/^Top\s*\d*\s*Corrections/i)) {
      inFeedback = false;
      inCorrections = true;
    } else if (inFeedback) {
      feedbackLines.push(rawLine);
    }

    // ── Corrections block ──────────────────────────────────────────────────
    else if (inCorrections) {
      correctionsLines.push(rawLine);
    }
  }

  parsed.Feedback = feedbackLines.join(" ").trim() || "No feedback provided.";
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
      const essayText = (userAnswers[i] || "").toString().trim();

      // ── Empty response ──────────────────────────────────────────────────
      if (!essayText) {
        results[i] = buildEmptyResult(i, tasks.length);
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

      // ── Parse raw text ──────────────────────────────────────────────────
      const rawParsed = parseGeminiOutput(outputText);

      // ── Convert & validate each criterion (IELTS 0.5 rounding) ──────────
      const ta = parseIELTSScore(rawParsed.TaskAchievement);
      const tr = parseIELTSScore(rawParsed.TaskResponse);
      const cc = parseIELTSScore(rawParsed.CoherenceAndCohesion);
      const lr = parseIELTSScore(rawParsed.LexicalResource);
      const gra = parseIELTSScore(rawParsed.GrammaticalRangeAndAccuracy);

      const mainScore = isTask1 ? ta : tr;

      // ── Band score: average of 4 criteria, rounded to 0.5 ───────────────
      const avgRaw = (mainScore + cc + lr + gra) / 4;
      const bandScore = roundToIELTSBand(avgRaw);

      results[i] = {
        isTask1,
        TaskAchievement: isTask1 ? ta.toFixed(1) : "N/A",
        TaskResponse: isTask1 ? "N/A" : tr.toFixed(1),
        CoherenceAndCohesion: cc.toFixed(1),
        LexicalResource: lr.toFixed(1),
        GrammaticalRangeAndAccuracy: gra.toFixed(1),
        BandScore: bandScore.toFixed(1),
        Feedback: rawParsed.Feedback || "No feedback provided.",
        Corrections: rawParsed.Corrections || "",
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

    Object.keys(answerMap).forEach(qNum => {
      const correctData = answerMap[qNum]
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
