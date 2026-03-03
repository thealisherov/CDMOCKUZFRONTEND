/**
 * listeningDataAdapter.js
 *
 * Converts the new listening JSON format (with parts[].questionGroups)
 * into the internal format that QuestionRenderer / AnswerSheet expect.
 *
 * New JSON shape:
 *   parts[] → { partNumber, questionRange, image, questionGroups: [{ groupType, instruction, questions, options? }] }
 *
 * Internal shape (what components expect):
 *   sections[] → flat blocks with { id, type, title, instruction, content?, options?, columnOptions?, questions?, answers }
 */

let _blockCounter = 0;

function generateBlockId(groupType, partNumber) {
  _blockCounter++;
  return `part${partNumber}_${groupType}_${_blockCounter}`;
}

/**
 * Map new groupType names to internal component type names.
 */
function mapGroupType(groupType) {
  switch (groupType) {
    case 'note_completion':
    case 'sentence_completion':
    case 'form_completion':
    case 'summary_completion':
      return 'gap_fill';

    case 'multiple_choice':
      return 'true_false'; // radio-style options per question

    case 'map_labeling':
      return 'true_false'; // select letter A-I

    case 'matching':
      return 'true_false'; // select letter from options

    case 'plan_labeling':
      return 'true_false';

    default:
      return groupType;
  }
}

/**
 * Build the gap_fill content string from questions with ______ blanks.
 */
function buildGapFillContent(questions) {
  let content = '';
  questions.forEach((q, idx) => {
    const questionText = q.question.replace(/______/g, `{${q.number}}`);
    content += questionText;
    if (idx < questions.length - 1) {
      content += '\n';
    }
  });
  return content;
}

/**
 * Build answers map: { "1": "answer1", "2": "answer2", ... }
 */
function buildAnswersMap(questions) {
  const answers = {};
  questions.forEach((q) => {
    answers[String(q.number)] = q.answer;
  });
  return answers;
}

/**
 * Extract option letters from full option strings.
 * "A a form of identification" → "A"
 */
function extractOptionLetters(options) {
  if (!options || options.length === 0) return [];
  return options.map((opt) => {
    const match = opt.match(/^([A-Z])[.\s:)]/);
    return match ? match[1] : opt;
  });
}

/**
 * Convert a single questionGroup into an internal block.
 */
function convertQuestionGroup(group, partNumber, partTitle) {
  const internalType = mapGroupType(group.groupType);
  const blockId = generateBlockId(group.groupType, partNumber);
  const answers = buildAnswersMap(group.questions);

  const block = {
    id: blockId,
    type: internalType,
    title: partTitle,
    instruction: group.instruction || '',
    answers,
  };

  switch (group.groupType) {
    case 'note_completion':
    case 'sentence_completion':
    case 'form_completion':
    case 'summary_completion': {
      block.content = buildGapFillContent(group.questions);
      break;
    }

    case 'multiple_choice': {
      // Each question has its own options with full text
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

    case 'map_labeling': {
      // Questions select a letter (A-I) — extract range from instruction or use default
      const letterMatch = group.instruction?.match(/([A-Z])-([A-Z])/);
      let letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      if (letterMatch) {
        const start = letterMatch[1].charCodeAt(0);
        const end = letterMatch[2].charCodeAt(0);
        letters = [];
        for (let c = start; c <= end; c++) {
          letters.push(String.fromCharCode(c));
        }
      }

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = letters;
      break;
    }

    case 'matching': {
      // Options are at group level (e.g. "A the realistic colours", ...)
      const groupOptions = group.options || [];
      const optionLetters = extractOptionLetters(groupOptions);

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = optionLetters;
      // Show full option descriptions
      block.optionDescriptions = groupOptions;
      break;
    }

    default: {
      // Fallback
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = group.questions[0]?.options
        ? extractOptionLetters(group.questions[0].options)
        : ['A', 'B', 'C'];
      break;
    }
  }

  return block;
}

/**
 * Main adapter: transforms the new listening JSON into the internal format.
 *
 * @param {Object} rawData - The new listening JSON
 * @returns {Object} - Transformed data with sections[] = internal blocks
 */
export function adaptListeningData(rawData) {
  if (!rawData) return null;

  // Reset block counter
  _blockCounter = 0;

  // If data already uses old format (sections with type field), return as-is
  if (rawData.sections && rawData.sections[0]?.type) {
    return rawData;
  }

  // Transform parts → flat sections array
  const allSections = [];

  (rawData.parts || []).forEach((part) => {
    const partTitle = `Part ${part.partNumber}`;
    const groups = part.questionGroups || [];

    groups.forEach((group, groupIdx) => {
      const block = convertQuestionGroup(group, part.partNumber, partTitle);

      // For the first group in a part, include the part title
      // For subsequent groups, create a sub-title
      if (groupIdx > 0) {
        block.title = partTitle;
      }

      // Store part image on the block if available
      if (part.image) {
        block.image = part.image;
      }

      allSections.push(block);
    });
  });

  return {
    ...rawData,
    sections: allSections,
  };
}

export default adaptListeningData;
