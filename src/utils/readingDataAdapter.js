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

    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion':
      return 'flow_chart';

    case 'summary_completion_with_options':
      return 'drag_drop_summary'; // UI uses draggable boxes

    case 'yes_no_not_given':
      return 'true_false';

    case 'matching_sentence_endings':
      return 'match_dropdown'; // Shows a list of options + inline dropdowns

    case 'matching_paragraphs':
      return 'radio_matrix'; // Show a grid with questions as rows and paragraph letters as columns

    case 'multiple_choice_single':
      return 'true_false'; // radio-select from A/B/C/D

    case 'multiple_choice_multiple':
      return 'checkbox_multiple'; // checkbox-select from options

    case 'matching_features': // For things like "Match each sentence to a researcher"
    case 'matching_information':
      return 'match_dropdown';
      
    case 'matching_headings':
      return 'match_headings'; // handled differently by ResizableSplitPane passages -> DropZones

    case 'table':
    case 'table_completion':
      return 'table';

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
    let questionText = q.question.replace(/______/g, `{${q.number}}`);
    // Convert hardcoded arrows to structural newline breaks for FlowChart blocks
    questionText = questionText.replace(/(<br\s*\/?>)?\s*↓\s*(<br\s*\/?>)?/g, '\n');
    content += questionText;
    if (idx < questions.length - 1) {
      content += '\n';
    }
  });
  return content;
}

/**
 * Builds either a standard gap-fill string or a <table> HTML structure
 * if the group is table_completion and contains column separators (|).
 */
function buildTableOrGapContent(group) {
  const isTable = group.groupType === 'table_completion' || group.groupType === 'table';
  
  // If it's already got a table tag, just return gap-fill style parsing
  const hasExistingTable = group.questions.some(q => q.question.includes('<table'));
  if (hasExistingTable || !isTable) {
    return buildGapFillContent(group.questions);
  }

  // Check if any question has the "|" separator
  const hasSeparators = group.questions.some(q => q.question.includes('|'));
  if (hasSeparators) {
    let html = '<table class="ielts-data-table">';
    group.questions.forEach((q, idx) => {
      let rowText = q.question.replace(/______/g, `{${q.number}}`);
      const cols = rowText.split('|').map(c => c.trim());
      
      html += '<tr>';
      cols.forEach(col => {
        const isPotentialHeader = idx === 0 && !/\{\d+\}/.test(rowText);
        const Tag = isPotentialHeader ? 'th' : 'td';
        html += `<${Tag}>${col}</${Tag}>`;
      });
      html += '</tr>';
    });
    html += '</table>';
    return html;
  }

  // Fallback: Smart Grouping for label-based question rows
  return buildSmartTable(group.questions);
}

/**
 * Specifically parses flat lists like "Label: Value" into a structured table.
 */
function buildSmartTable(questions) {
  const rows = [];
  const columnHeaders = new Set();
  
  // First pass: extract all headers and identify logical blocks
  const blocks = [];
  let currentBlock = null;

  questions.forEach((q) => {
    const qText = q.question.replace(/______/g, `{${q.number}}`);
    const pieces = qText.split(/<br\s*\/?>|<li>|<\/li>|<ul>|<\/ul>/).filter(p => {
      const clean = p.replace(/<[^>]*>/g, '').trim();
      return clean !== '' && clean !== '↓';
    });

    const isNewBlock = qText.includes('<b>') || qText.includes('PLAN FOR') || qText.includes('STUDY SYNDICATE');
    
    if (isNewBlock || !currentBlock) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { title: '', pieces: [] };
      const titleMatch = qText.match(/<b>(.*?)<\/b>/);
      if (titleMatch) currentBlock.title = titleMatch[1].split(':')[0].trim();
    }
    
    pieces.forEach(p => {
      currentBlock.pieces.push(p.trim());
      const cleanText = p.replace(/<[^>]*>/g, '').trim();
      if (cleanText.includes(':')) {
        const h = cleanText.split(':')[0].trim();
        columnHeaders.add(h);
      }
    });
  });
  if (currentBlock) blocks.push(currentBlock);

  const headers = Array.from(columnHeaders);
  if (headers.length === 0) return buildGapFillContent(questions);

  let html = '';
  const firstTitle = blocks[0]?.title;
  if (firstTitle && firstTitle.length > 3) {
     html += `<h3 class="text-center font-bold mb-4 uppercase tracking-wide">${firstTitle}</h3>`;
  }

  html += '<table class="ielts-data-table">';
  html += '<tr>';
  headers.forEach(h => html += `<th>${h}</th>`);
  html += '</tr>';

  blocks.forEach(block => {
    const rowData = {};
    block.pieces.forEach(p => {
      const cleanText = p.replace(/<[^>]*>/g, '').trim();
      if (cleanText.includes(':')) {
        const [h, ...rest] = cleanText.split(':');
        const headerName = h.trim();
        const content = rest.join(':').trim();
        rowData[headerName] = content;
      }
    });

    if (Object.keys(rowData).length > 0) {
      html += '<tr>';
      headers.forEach(h => {
        html += `<td>${rowData[h] || ''}</td>`;
      });
      html += '</tr>';
    }
  });

  html += '</table>';
  return html;
}


/**
 * Build answers map from questions array.
 * Returns { "1": "answer1", "2": "answer2", ... }
 */
function buildAnswersMap(questions) {
  const answers = {};
  questions.forEach((q) => {
    if (q.numbers && q.answers) {
      q.numbers.forEach((num) => {
        answers[String(num)] = q.answers; // Store full array for each number
      });
    } else if (q.number) {
      if (q.alternativeAnswers && q.alternativeAnswers.length > 0) {
        answers[String(q.number)] = [q.answer, ...q.alternativeAnswers];
      } else {
        answers[String(q.number)] = q.answer;
      }
    }
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
  if (group.instruction && /flow-?chart/i.test(group.instruction)) {
    group.groupType = 'flow_chart';
  } else if (group.instruction && /table/i.test(group.instruction)) {
    group.groupType = 'table_completion';
  }

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

    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion':
    case 'table':
    case 'table_completion': {
      block.content = buildTableOrGapContent(group);
      const firstQ = group.questions[0];
      if (group.options || firstQ?.options) {
        block.options = group.options || firstQ.options;
      }
      break;
    }

    case 'summary_completion_with_options': {
      block.content = buildGapFillContent(group.questions);

      const firstQ = group.questions[0];
      // Keep full options like "A. popular", "B. artistic" to derive letters
      block.options = firstQ?.options || [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
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
      // the options are provided in the first question
      const firstQ = group.questions[0];
      const optionLetters = firstQ?.options
        ? extractOptionLetters(firstQ.options)
        : [];

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = optionLetters;

      // Store the full option descriptions to show at the top
      block.optionDescriptions = firstQ?.options || [];
      break;
    }

    case 'matching_paragraphs': {
      const paragraphLetters = extractParagraphLetters(passageContent);

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = paragraphLetters; // For legacy fallback
      block.columnOptions = paragraphLetters; // For radio_matrix rendering
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
        id: q.numbers ? q.numbers.join(',') : String(q.number),
        text: q.question,
        fullOptions: q.options || [],
        numbers: q.numbers || [q.number] // explicit array of question numbers
      }));
      block.options = optionLetters;
      block.hasPerQuestionOptions = true;
      break;
    }

    case 'matching_features':
    case 'matching_information': {
      // Sometimes options are provided in the question data (e.g. matching_features with people)
      const firstQ = group.questions[0];
      let optionLetters = group.options || (firstQ?.options ? extractOptionLetters(firstQ.options) : extractParagraphLetters(passageContent));
      
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        text: q.question,
      }));
      block.options = optionLetters;
      
      // If we have full descriptions (e.g. "A James", "B Cooley"), store them
      if (group.options) {
        block.optionDescriptions = group.options;
      } else if (firstQ?.options) {
        block.optionDescriptions = firstQ.options;
      }
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
