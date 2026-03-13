/**
 * sanitizeTestData.js
 *
 * Strips answer keys from test data before sending to the client browser.
 * Works with BOTH listening (parts[].questionGroups) and
 * reading (passages[].questionGroups) JSON structures.
 *
 * After sanitisation the client receives everything it needs to RENDER
 * questions but NOTHING that reveals correct answers.
 */

/**
 * Deep-clone an object (simple, safe for JSON-serialisable data).
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Remove answer-related fields from a single question object.
 */
function stripQuestion(q) {
  const safe = { ...q }
  delete safe.answer
  delete safe.alternativeAnswers
  delete safe.answers
  return safe
}

/**
 * Sanitise a questionGroup (used in both listening parts and reading passages).
 */
function sanitiseGroup(group) {
  if (!group) return group
  const safe = { ...group }
  if (safe.questions) {
    safe.questions = safe.questions.map(stripQuestion)
  }
  return safe
}

/**
 * Main entry point: sanitise a full test data object.
 * Handles listening format (parts[]) and reading format (passages[]).
 *
 * @param {Object} data  – the raw test JSON (as stored in Supabase `data` column)
 * @returns {Object}     – a deep-copy with all answer fields removed
 */
export function sanitizeTestData(data) {
  if (!data) return data

  const safe = deepClone(data)

  // ── Listening format: parts[].questionGroups ──
  if (safe.parts) {
    safe.parts = safe.parts.map(part => ({
      ...part,
      questionGroups: (part.questionGroups || []).map(sanitiseGroup),
    }))
  }

  // ── Reading format: passages[].questionGroups ──
  if (safe.passages) {
    safe.passages = safe.passages.map(passage => ({
      ...passage,
      questionGroups: (passage.questionGroups || []).map(sanitiseGroup),
    }))
  }

  return safe
}

export default sanitizeTestData
