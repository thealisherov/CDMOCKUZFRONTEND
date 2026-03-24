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

    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion':
      return 'flow_chart';

    case 'multiple_choice':
    case 'multiple_choice_single_answer':
      return 'true_false'; // radio-style options per question

    case 'multiple_choice_multiple':
    case 'multiple_choice_multiple_answer':
      return 'checkbox_multiple'; // checkbox-style options for multiple answers

    case 'map_labeling':
      return 'radio_matrix'; // select letter A-I in a grid

    case 'matching':
      return 'match_dropdown'; // select letter from options

    case 'plan_labeling':
      return 'true_false';

    case 'table_completion':
      return 'table';

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
    // Attempt to build a structural table from |
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

  // Fallback: Smart Grouping for label-based question rows (e.g. Test 8 style)
  return buildSmartTable(group.questions);
}

/**
 * Specifically parses flat lists like "Label: Value" into a structured table.
 * Ideal for Test 8 Part 2/3 style JSONs.
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
      // Extract title if <b> exists
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

  // Second pass: group pieces into rows based on headers
  let html = '';
  // Show table title if exists
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
 * Build answers map: { "1": "answer1", "2": "answer2", ... }
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
  // Preserve the original groupType before any instruction-based overrides
  const originalType = group.groupType;
  const knownCompletionTypes = [
    'note_completion', 'sentence_completion', 'form_completion', 'summary_completion',
  ];

  if (group.instruction && /flow-?chart/i.test(group.instruction)) {
    group.groupType = 'flow_chart';
  } else if (
    group.instruction && /table/i.test(group.instruction) &&
    !knownCompletionTypes.includes(originalType) &&
    group.questions.some(q => q.question.includes('|'))
  ) {
    // Only override to table_completion if:
    // 1. The original type is NOT a known completion type (note/sentence/form/summary)
    // 2. The questions actually contain pipe separators indicating tabular data
    group.groupType = 'table_completion';
  }

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
    case 'summary_completion':
    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion':
    case 'table_completion': {
      block.content = buildTableOrGapContent(group);
      // Flowchart can optionally have options (drag and drop)
      if (['flowchart_completion', 'flowchart', 'flow_chart'].includes(group.groupType)) {
        const firstQ = group.questions[0];
        if (group.options || firstQ?.options) {
          block.options = group.options || extractOptionLetters(firstQ.options);
          block.fullOptions = group.options || firstQ.options;
        }
      }
      break;
    }

    case 'multiple_choice':
    case 'multiple_choice_single_answer': {
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

    case 'multiple_choice_multiple':
    case 'multiple_choice_multiple_answer': {
      const firstQ = group.questions[0];

      // Options can be per-question OR at group level.
      const hasPerQOptions = firstQ?.options && firstQ.options.length > 0;
      const groupOptions   = group.options || [];
      const sourceOptions  = hasPerQOptions ? firstQ.options : groupOptions;
      const optionLetters  = extractOptionLetters(sourceOptions);

      const isSpread = group.questions.every(q => q.number !== undefined && !q.numbers);

      if (isSpread && !hasPerQOptions) {
        // Merge into a single "21-22" styled question matching the Reading test layout
        const allNumbers = group.questions.map(q => q.number);
        block.questions = [{
          id: allNumbers.join(','),
          text: group.instruction || group.questions.map(q => q.question).join('<br/>'),
          fullOptions: groupOptions,
          numbers: allNumbers,
        }];
        // Clear block.instruction so it doesn't render twice (since it's now the question text)
        block.instruction = '';
      } else {
        block.questions = group.questions.map((q) => ({
          id:          q.numbers ? q.numbers.join(',') : String(q.number),
          text:        q.question,
          // Prefer per-question options, fall back to group-level options
          fullOptions: hasPerQOptions ? (q.options || []) : groupOptions,
          numbers:     q.numbers || [q.number],
        }));
      }

      block.options              = optionLetters;
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
        text: q.text || q.question, // handle both keys for flexibility
      }));
      block.columnOptions = letters;
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

      // Part title handling: only show title for the first group
      if (groupIdx > 0) {
        block.title = null;
      }
      
      // Store part-level info for UI rendering
      block.partLabel = partTitle;
      block.questionRange = part.questionRange || '';

      // Group-level image has priority
      if (group.image) {
        block.image = group.image;
      } else if (part.image) {
        // If part image exists, and we have a map or plan group, attach it there 
        // to render side-by-side. Otherwise default to the first group.
        const hasMapGroup = groups.some(g => ['map_labeling', 'plan_labeling'].includes(g.groupType));
        if (hasMapGroup) {
          if (['map_labeling', 'plan_labeling'].includes(group.groupType)) {
            block.image = part.image;
          }
        } else if (groupIdx === 0) {
          block.image = part.image;
        }
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
