/**
 * POST /api/tests/[id]/check
 *
 * For reading/listening: compares user answers to correct answers.
 * For writing: uses Google Gemini AI to evaluate essays.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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
 * Convert an image URL into a format Gemini can process.
 */
async function urlToGenerativePart(imageUrl) {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return {
      inlineData: {
        data: buffer.toString('base64'),
        mimeType: blob.type
      }
    }
  } catch(e) {
    console.warn("Could not fetch image for Gemini:", imageUrl, e)
    return null
  }
}

/**
 * Handle Writing Test using Gemini AI
 */
async function checkWritingTest(userAnswers, testRow) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Gemini API kaliti yo\'q!' }, { status: 500 })
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
    const results = {}
    let totalBandSum = 0
    let validBandCount = 0

    const tasks = testRow.data.tasks || []

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i]
      const essayText = userAnswers[i] || ""
      
      if (!essayText.trim()) {
        results[i] = {
          TaskAchievement: "0.0",
          TaskResponse: "0.0",
          CoherenceAndCohesion: "0.0",
          LexicalResource: "0.0",
          GrammaticalRange: "0.0",
          BandScore: "0.0",
          Feedback: "No response provided."
        }
        continue;
      }

      let systemInstruction = "";
      if (task.taskNumber === 1) {
        systemInstruction = `You are a certified IELTS examiner.

Evaluate the student's IELTS Writing Task 1 (Chart type).

Score using the official IELTS criteria:

Task Achievement
Coherence and Cohesion
Lexical Resource
Grammatical Range and Accuracy

Instructions:

Score each criterion from 0 to 9

Calculate the overall band score

Write feedback of about 50 words

Evaluate strictly like a real IELTS examiner

Return the result ONLY in this format:

Task Achievement: X.X
Coherence and Cohesion: X.X
Lexical Resource: X.X
Grammatical Range and Accuracy: X.X
Overall Band Score: X.X

Feedback (about 50 words):
Your feedback here.`
      } else {
        systemInstruction = `You are a certified IELTS examiner.

Evaluate the student's IELTS Writing Task 2 essay.

Essay Type: Agree or Disagree Essay.

Score the essay according to official IELTS criteria:

Task Response
Coherence and Cohesion
Lexical Resource
Grammatical Range and Accuracy

Instructions:

Score each criterion from 0 to 9

Calculate the overall band score

Write feedback of about 50 words

Be objective and strict

Return the result ONLY in this format:

Task Response: X.X
Coherence and Cohesion: X.X
Lexical Resource: X.X
Grammatical Range and Accuracy: X.X
Overall Band Score: X.X

Feedback (about 50 words):
Your feedback here.`
      }

      const userPrompt = `
Task Question:
${task.content}

Student Essay:
${essayText}
`
      const contentParts = [userPrompt];
      
      // If Task 1 and there is an image, provide it to AI
      if (task.image) {
        const imagePart = await urlToGenerativePart(task.image);
        if (imagePart) contentParts.unshift(imagePart);
      }

      // We use systemInstructions natively or inline
      const geminiPrompt = `${systemInstruction}\n\n${userPrompt}`;

      const finalContent = [];
      if (task.image) {
         const imagePart = await urlToGenerativePart(task.image);
         if (imagePart) finalContent.push(imagePart);
      }
      finalContent.push({ text: geminiPrompt });

      const result = await model.generateContent(finalContent);
      const outputText = result.response.text();

      // Parse the outputText
      const parsed = {
        TaskAchievement: "0.0",
        TaskResponse: "0.0",
        CoherenceAndCohesion: "0.0",
        LexicalResource: "0.0",
        GrammaticalRange: "0.0",
        BandScore: "0.0",
        Feedback: ""
      }

      const lines = outputText.split('\n');
      let isFeedback = false;
      let feedbackLines = [];

      for (let line of lines) {
        const t = line.trim();
        if (t.startsWith('Task Achievement:')) parsed.TaskAchievement = t.split(':')[1].trim();
        else if (t.startsWith('Task Response:')) parsed.TaskResponse = t.split(':')[1].trim();
        else if (t.startsWith('Coherence and Cohesion:')) parsed.CoherenceAndCohesion = t.split(':')[1].trim();
        else if (t.startsWith('Lexical Resource:')) parsed.LexicalResource = t.split(':')[1].trim();
        else if (t.startsWith('Grammatical Range and Accuracy:')) parsed.GrammaticalRange = t.split(':')[1].trim();
        else if (t.startsWith('Overall Band Score:')) parsed.BandScore = t.split(':')[1].trim();
        else if (t.startsWith('Feedback')) {
          isFeedback = true;
          // grab the rest of the line if there is text after colon
          if (t.includes(':') && t.split(':')[1].trim()) {
            feedbackLines.push(t.split(':')[1].trim());
          }
        } else if (isFeedback) {
          if (t) feedbackLines.push(t);
        }
      }
      
      parsed.Feedback = feedbackLines.join(" ").trim() || "No feedback provided by AI.";
      results[i] = parsed;
      
      if (parseFloat(parsed.BandScore) > 0) {
        totalBandSum += parseFloat(parsed.BandScore);
        validBandCount++;
      }
    }

    let finalOverallBand = 0;
    if (validBandCount > 0) {
      if (tasks.length === 2 && validBandCount === 2) {
        // Officially, Task 2 is worth twice as much as Task 1
        // Usually: (Task 1 + 2 * Task 2) / 3   Or average. For simplicity, average here.
        const t1Score = parseFloat(results[0]?.BandScore) || 0;
        const t2Score = parseFloat(results[1]?.BandScore) || 0;
        // IELTS rounding: Round to nearest half band
        let rawAvg = (t1Score + (t2Score * 2)) / 3;
        finalOverallBand = Math.round(rawAvg * 2) / 2;
      } else {
        finalOverallBand = Math.round((totalBandSum / validBandCount) * 2) / 2;
      }
    }

    return NextResponse.json({
      score: 0,
      total: 0,
      band: finalOverallBand.toFixed(1),
      isWriting: true,
      tasksEvaluation: results
    })
  } catch (err) {
    console.error('[API /api/tests/[id]/check] Writing verification error:', err)
    return NextResponse.json({ error: 'Writing testni tekshirishda xatolik yuz berdi: ' + err.message }, { status: 500 })
  }
}

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
