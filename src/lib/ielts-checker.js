/**
 * ielts-checker.js — Reading/Listening (obyektiv) javoblarni tekshirish logikasi.
 *
 * Bu modul avval `api/tests/[id]/check/route.js` ichida bo'lgan funksiyalarning
 * AYNAN o'zi — endi umumiy joyga chiqarildi, chunki O'quv Markaz submit route'i
 * ham xuddi shu tekshiruvni ishlatadi. Writing (AI baholash) bu yerda YO'Q.
 */

// IELTS Listening band score — exact lookup table
export function calculateListeningBand(score) {
  if (score >= 39) return '9.0'
  if (score >= 37) return '8.5'
  if (score >= 35) return '8.0'
  if (score >= 32) return '7.5'
  if (score >= 30) return '7.0'
  if (score >= 26) return '6.5'
  if (score >= 23) return '6.0'
  if (score >= 18) return '5.5'
  if (score >= 16) return '5.0'
  if (score >= 13) return '4.5'
  if (score >= 11) return '4.0'
  if (score >= 8)  return '3.5'
  if (score >= 6)  return '3.0'
  if (score >= 4)  return '2.5'
  return '2.0'
}

// IELTS Reading band score — exact lookup table
export function calculateReadingBand(score) {
  if (score >= 39) return '9.0'
  if (score >= 37) return '8.5'
  if (score >= 35) return '8.0'
  if (score >= 33) return '7.5'
  if (score >= 30) return '7.0'
  if (score >= 27) return '6.5'
  if (score >= 23) return '6.0'
  if (score >= 19) return '5.5'
  if (score >= 15) return '5.0'
  if (score >= 13) return '4.5'
  if (score >= 10) return '4.0'
  if (score >= 8)  return '3.5'
  if (score >= 6)  return '3.0'
  if (score >= 4)  return '2.5'
  return '2.0'
}

// Generic fallback (for unknown types)
export function calculateBand(score, total) {
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
// ─────────────────────────────────────────────────────────────────────────────
export function extractAnswers(data) {
  const answerMap = {}

  const processGroup = (group) => {
    if (!group || !group.questions) return
    const gt = (group.groupType || '')
    const isMultiGroup = gt === 'multiple_choice_multiple' ||
      gt === 'multiple_choice_multiple_answer'

    if (isMultiGroup) {
      const allNums = []
      const allCorrect = []

      group.questions.forEach(q => {
        if (q.numbers && q.answers) {
          q.numbers.forEach(n => allNums.push(n))
          ;(Array.isArray(q.answers) ? q.answers : [q.answers]).forEach(a => allCorrect.push(String(a).trim().toUpperCase()))
        } else if (q.number !== undefined) {
          allNums.push(q.number)
          if (q.answer) allCorrect.push(String(q.answer).trim().toUpperCase())
        }
      })

      allNums.forEach(num => {
        answerMap[String(num)] = {
          answer: allCorrect,
          alternatives: [],
          isMultiGroup: true,
          groupNums: allNums.map(String),
          groupAnswers: allCorrect,
        }
      })
      return
    }

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

export function normalizeHeadingAnswer(ans) {
  if (!ans) return '';
  const match = String(ans).trim().match(/^([ivxlcdmIVXLCDM]+|[a-zA-Z])[.\s):]/);
  if (match) return match[1].toLowerCase();
  return String(ans).trim().toLowerCase();
}

export function isCorrect(userAnswer, correctData) {
  if (!correctData) return false
  const uRaw = String(userAnswer || '').trim()
  if (!uRaw) return false

  const uAnswer = uRaw.toLowerCase()
  const uNormalized = normalizeHeadingAnswer(uRaw)

  const matchesAnswer = (correctRaw) => {
    const cLower = String(correctRaw || '').trim().toLowerCase()
    if (!cLower) return false
    if (uAnswer === cLower) return true
    if (uNormalized === cLower) return true
    const cNormalized = normalizeHeadingAnswer(correctRaw)
    if (uNormalized === cNormalized) return true
    if (uAnswer === cNormalized) return true
    return false
  }

  if (correctData.isMulti && Array.isArray(correctData.answer)) {
    return correctData.answer.some(a => matchesAnswer(a))
  }
  if (matchesAnswer(correctData.answer)) return true
  if (correctData.alternatives && correctData.alternatives.length > 0) {
    return correctData.alternatives.some(alt => matchesAnswer(alt))
  }
  return false
}

/**
 * Reading/Listening testni to'liq baholaydi.
 * @param {Object} data       Test JSON (data ustuni — javoblari BILAN)
 * @param {Object} userAnswers { [qNum]: answer }
 * @param {string} testType   'reading' | 'listening'
 * @returns {{ score, total, band, results }}
 */
export function evaluateObjective(data, userAnswers, testType) {
  const answerMap = extractAnswers(data)
  const total = Object.keys(answerMap).length
  let score = 0
  const results = {}
  const evaluatedGroups = new Set()

  Object.keys(answerMap).forEach(qNum => {
    const correctData = answerMap[qNum]

    if (correctData.isMultiGroup) {
      const groupKey = correctData.groupNums.sort().join(',')
      if (evaluatedGroups.has(groupKey)) return
      evaluatedGroups.add(groupKey)

      const correctSet = correctData.groupAnswers.map(a => String(a).trim().toUpperCase())

      correctData.groupNums.forEach(n => {
        const uAns = String(userAnswers[n] || '').trim().toUpperCase()
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

    const userAnswer = userAnswers[qNum] || ''
    const correct = isCorrect(userAnswer, correctData)
    if (correct) score++
    results[qNum] = {
      correct,
      userAnswer: userAnswer || '',
      correctAnswer: correctData.answer,
    }
  })

  let band
  if (testType === 'listening') band = calculateListeningBand(score)
  else if (testType === 'reading') band = calculateReadingBand(score)
  else band = calculateBand(score, total)

  return { score, total, band, results }
}
