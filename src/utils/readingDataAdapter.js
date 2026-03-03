/**
 * readingDataAdapter.js
 *
 * Converts the new reading JSON format (with passages[].questionGroups)
 * into the internal format that QuestionRenderer / AnswerSheet expect.
 *
 * New JSON shape:
 *   passages[].questionGroups[] → { groupType, instruction, questions: [{ number, question, answer, options? }] }
 *
 * Internal shape (what components expect):
 *   passages[].questions[] → blocks with { id, type, instruction, content?, options?, columnOptions?, questions?, answers }
 */

let _blockCounter = 0;

function generateBlockId(groupType) {
  _blockCounter++;
  return `block_${groupType}_${_blockCounter}`;
}

/**
 * Map new groupType names to internal component type names.
 */
function mapGroupType(groupType) {
  switch (groupType) {
    case 'summary_completion':
      return 'gap_fill';

    case 'summary_completion_with_options':
      return 'multiple_choice'; // each question = select from word list

    case 'yes_no_not_given':
      return 'true_false';

    case 'matching_sentence_endings':
      return 'true_false'; // radio-select from options per question

    case 'matching_paragraphs':
      return 'true_false'; // radio-select letter

    case 'multiple_choice_single':
      return 'true_false'; // radio-select from A/B/C/D

    case 'multiple_choice_multiple':
      return 'true_false'; // radio-select from options

    case 'matching_information':
      return 'true_false';
      
    case 'matching_headings':
      return 'match_headings'; // handled differently by ResizableSplitPane passages -> DropZones

    default:
      return groupType;
  }
}

/**
 * Build the gap_fill content string for summary_completion questions.
 * E.g. questions with blanks {1}, {2}, etc.
 */
function buildGapFillContent(questions) {
  // Combine the questions into a single content block with {N} placeholders
  let content = '';
  questions.forEach((q, idx) => {
    // Replace the blank indicator (______) with the numbered placeholder
    const questionText = q.question.replace(/______/g, `{${q.number}}`);
    content += questionText;
    if (idx < questions.length - 1) {
      content += '\n';
    }
  });
  return content;
}

/**
 * Build answers map from questions array.
 * Returns { "1": "answer1", "2": "answer2", ... }
 */
function buildAnswersMap(questions) {
  const answers = {};
  questions.forEach((q) => {
    answers[String(q.number)] = q.answer;
  });
  return answers;
}

/**
 * Extract unique option letters from full option strings.
 * E.g. ["A. something", "B. other"] → ["A", "B"]
 * Or ["A optimists have...", "B long life..."] → ["A", "B", ...]
 */
function extractOptionLetters(options) {
  if (!options || options.length === 0) return [];
  // Check if options start with a letter pattern like "A.", "A ", "A:"
  return options.map((opt) => {
    const match = opt.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : opt;
  });
}

/**
 * Get all unique paragraph letters from passage content (A, B, C, etc.)
 */
function extractParagraphLetters(passageContent) {
  if (!passageContent) return [];
  const matches = passageContent.match(/^[A-Z]\s/gm);
  if (!matches) {
    // Try to find patterns like "\n\nA " in the content
    const altMatches = passageContent.match(/(?:^|\n\n)([A-Z])\s/g);
    if (altMatches) {
      return [...new Set(altMatches.map(m => m.trim().charAt(0)))];
    }
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  }
  return [...new Set(matches.map(m => m.trim()))];
}

/**
 * Convert a single questionGroup to an internal block.
 */
function convertQuestionGroup(group, passageContent) {
  const internalType = mapGroupType(group.groupType);
  const blockId = generateBlockId(group.groupType);
  const answers = buildAnswersMap(group.questions);

  const block = {
    id: blockId,
    type: internalType,
    instruction: group.instruction || '',
    answers,
  };

  switch (group.groupType) {
    case 'summary_completion': {
      block.content = buildGapFillContent(group.questions);
      break;
    }

    case 'summary_completion_with_options': {
      // Render as TrueFalse with per-question options
      // Each question selects from the same word list
      const firstQ = group.questions[0];
      const optionLetters = firstQ?.options
        ? extractOptionLetters(firstQ.options)
        : [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = optionLetters;
      // Show the full word list above the questions
      block.optionDescriptions = firstQ?.options || [];
      break;
    }

    case 'yes_no_not_given': {
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = ['YES', 'NO', 'NOT GIVEN'];
      break;
    }

    case 'matching_sentence_endings': {
      // Each question has its own options list (same options shared)
      const firstQ = group.questions[0];
      const optionLetters = firstQ?.options
        ? extractOptionLetters(firstQ.options)
        : [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = optionLetters;

      // Also store the full option descriptions for display
      block.optionDescriptions = firstQ?.options || [];
      break;
    }

    case 'matching_paragraphs': {
      const paragraphLetters = extractParagraphLetters(passageContent);

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = paragraphLetters;
      break;
    }

    case 'multiple_choice_single': {
      // Each question has its own options
      const firstQ = group.questions[0];
      const optionLetters = firstQ?.options
        ? extractOptionLetters(firstQ.options)
        : [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
        // Store full options for display
        fullOptions: q.options || [],
      }));
      block.options = optionLetters;

      // Store full options on the block level too for display
      block.hasPerQuestionOptions = true;
      break;
    }

    case 'multiple_choice_multiple': {
      const firstQ = group.questions[0];
      const optionLetters = firstQ?.options
        ? extractOptionLetters(firstQ.options)
        : [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
        fullOptions: q.options || [],
      }));
      block.options = optionLetters;
      block.hasPerQuestionOptions = true;
      break;
    }

    case 'matching_information': {
      const paragraphLetters = extractParagraphLetters(passageContent);

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = paragraphLetters;
      break;
    }

    default: {
      // Fallback: try to build as true_false
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = group.questions[0]?.options
        ? extractOptionLetters(group.questions[0].options)
        : ['TRUE', 'FALSE', 'NOT GIVEN'];
      break;
    }
  }

  return block;
}

/**
 * Main adapter: transforms the new reading JSON into the internal format.
 *
 * @param {Object} rawData - The new reading JSON
 * @returns {Object} - Transformed data with passages[].questions = internal blocks
 */
export function adaptReadingData(rawData) {
  if (!rawData) return null;

  // Reset block counter for each test
  _blockCounter = 0;

  // If data already uses old format (passages[].questions with type field), return as-is
  const firstPassage = rawData.passages?.[0];
  if (firstPassage?.questions && firstPassage.questions[0]?.type) {
    return rawData;
  }

  // Transform passages
  const adaptedPassages = (rawData.passages || []).map((passage) => {
    const groups = passage.questionGroups || [];
    const internalBlocks = groups.map((group) =>
      convertQuestionGroup(group, passage.content)
    );

    return {
      ...passage,
      // Keep 'content' as passage text (used by the page for display)
      // Add 'questions' array = the internal block format for QuestionRenderer
      questions: internalBlocks,
      // Keep text alias for backward compat
      text: passage.content || passage.text,
    };
  });

  return {
    ...rawData,
    passages: adaptedPassages,
  };
}

export default adaptReadingData;
