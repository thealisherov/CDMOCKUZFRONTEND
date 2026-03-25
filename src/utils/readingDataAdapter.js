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
    case 'sentence_completion':
    case 'note_completion':
      return 'gap_fill';

    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion':
      return 'flow_chart';

    case 'summary_completion_with_options':
      return 'drag_drop_summary'; // UI uses draggable boxes

    case 'yes_no_not_given':
    case 'true_false_not_given':
      return 'true_false';

    case 'matching_sentence_endings':
      return 'match_dropdown'; // Shows a list of options + inline dropdowns

    case 'matching_paragraphs':
      return 'radio_matrix'; // Show a grid with questions as rows and paragraph letters as columns

    case 'multiple_choice_single':
      return 'true_false'; // radio-select from A/B/C/D

    case 'multiple_choice_multiple':
      return 'checkbox_multiple'; // checkbox-select from options

    case 'matching': // Generic matching
    case 'matching_drag':
    case 'matching_features': 
    case 'matching_information':
      return 'radio_matrix'; 

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
 * Helper to replace underscores (and optional preceding question numbers) with {N}.
 * Matches 3 or more underscores to support 3, 6, 10 underscore blanks.
 */
function replaceGapPlaceholders(questionStr, qNumber) {
  if (!questionStr) return '';
  // Remove the question number if it immediately precedes the underscores
  // E.g., "<b>11</b> ______" -> "{11}", "11. _________" -> "{11}"
  const numRegex = new RegExp(`(?:<(?:b|strong)[^>]*>\\s*)?0*${qNumber}(?:\\s*<\\/(?:b|strong)>)?\\s*[\\.\\)]?\\s*_{3,}`, 'gi');
  let result = questionStr.replace(numRegex, `{${qNumber}}`);
  // Replace any remaining sequences of 3 or more underscores
  return result.replace(/_{3,}/g, `{${qNumber}}`);
}

/**
 * Build the gap_fill content string for summary_completion questions.
 * E.g. questions with blanks {1}, {2}, etc.
 */
function buildGapFillContent(questions) {
  // Combine the questions into a single content block with {N} placeholders
  let content = '';
  questions.forEach((q, idx) => {
    // Replace the blank indicator with the numbered placeholder
    let questionText = replaceGapPlaceholders(q.question, q.number);
    // Convert hardcoded arrows to structural newline breaks for FlowChart blocks
    questionText = questionText.replace(/(<br\s*\/?>)?\s*↓\s*(<br\s*\/?>)?/g, '\n');
    content += questionText;
    if (idx < questions.length - 1) {
      // Check if the question already ends with an HTML block tag (br, /ul, /li, /p, etc.)
      // If so, no extra separator is needed. Otherwise join with a space for flowing text.
      const endsWithBlock = /<\/(ul|ol|li|p|div|table|tr|td|th)>\s*$|<br\s*\/?>\s*$/i.test(questionText);
      content += endsWithBlock ? '' : ' ';
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
      if (q.question.trim() === '#hidden#' || q.question.trim() === '') return;
      let rowText = replaceGapPlaceholders(q.question, q.number);
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

  // Fallback 1: Convert structural lists into 2-column tables First!
  const listTable = tryBuildListTable(group.questions);
  if (listTable) {
    const missingPlaceholder = group.questions.some(q => !listTable.includes(`{${q.number}}`));
    if (!missingPlaceholder) return listTable;
  }

  // Fallback 2: Smart Grouping for label-based question rows without <ul>
  const smartTable = buildSmartTable(group.questions);
  if (smartTable) {
    const missingPlaceholder = group.questions.some(q => !smartTable.includes(`{${q.number}}`));
    if (!missingPlaceholder) return smartTable;
  }

  // Ultimate fallback
  return buildGapFillContent(group.questions);
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
    const qText = replaceGapPlaceholders(q.question, q.number);
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
  if (headers.length === 0) return null;

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
 * Attempt to build a 2-column table from a text containing <ul> lists.
 * This handles the common IELTS "Notes/Table Completion" where notes are bulleted under categories.
 */
function tryBuildListTable(questions) {
  let content = buildGapFillContent(questions);
  
  if (!content.includes('<ul')) return null;

  // Extract possible title at the very beginning
  let title = '';
  const titleMatch = content.match(/^\s*<b>(.*?)<\/b>(?:<br\s*\/?>\s*)*/i);
  if (titleMatch) {
    title = titleMatch[1];
    content = content.replace(titleMatch[0], '').trim();
  }

  const parts = [];
  let htmlIter = content;
  while (true) {
     const startIdx = htmlIter.indexOf('<ul');
     if (startIdx === -1) {
        if (htmlIter) parts.push(htmlIter, '');
        break;
     }
     const preamble = htmlIter.substring(0, startIdx);
     htmlIter = htmlIter.substring(startIdx);
     
     let open = 0;
     let endIdx = -1;
     let i = 0;
     while (i < htmlIter.length) {
        if (htmlIter.substring(i, i+3).toLowerCase() === '<ul') {
           open++;
           i += 3;
        } else if (htmlIter.substring(i, i+5).toLowerCase() === '</ul>') {
           open--;
           if (open === 0) {
              endIdx = i + 5;
              break;
           }
           i += 5;
        } else {
           i++;
        }
     }
     if (endIdx === -1) {
        parts.push(preamble, htmlIter); 
        break;
     }
     
     const ulContent = htmlIter.substring(0, endIdx); 
     const match = ulContent.match(/^<ul[^>]*>(.*)<\/ul>$/is);
     const inner = match ? match[1] : ulContent;
     parts.push(preamble, inner);
     htmlIter = htmlIter.substring(endIdx);
  }

  if (parts.length < 2 || (parts.length === 2 && !parts[1])) return null; // No list found

  let html = '';
  if (title && title.length > 3) {
    html += `<h3 class="text-center font-bold mb-4 uppercase tracking-wide">${title}</h3>`;
  }
  
  html += '<table class="ielts-data-table">';
  
  for (let i = 0; i < parts.length; i += 2) {
    let preamble = parts[i].trim();
    let listContent = parts[i+1];
    
    if (!preamble && !listContent) continue;
    
    let col1 = preamble;
    let col2Text = '';
    
    // Clean up trailing <br/> from preamble
    col1 = col1.replace(/(<br\s*\/?>\s*)+$/, '').trim();
    
    // Heuristic: If preamble has ". " and ":", the part after ". " might be the header for the list in column 2.
    if (col1.includes('. ') && col1.includes(':')) {
       const lastDotIdx = col1.lastIndexOf('. ');
       if (lastDotIdx > 0) {
          const possibleIntro = col1.substring(lastDotIdx + 2).trim();
          if (possibleIntro.includes(':') || possibleIntro.toLowerCase().includes('for example')) {
             col1 = col1.substring(0, lastDotIdx + 1).trim();
             col2Text = possibleIntro;
          }
       }
    }
    
    html += '<tr>';
    
    const isCol1ShortLabel = col1.length > 0 && ((col1.length < 50 && !col1.includes('{')) || col1.trim().endsWith(':'));
    const col1Html = isCol1ShortLabel ? `<b>${col1}</b>` : col1;
    
    if (col2Text || listContent) {
       html += `<td style="vertical-align: top; width: 35%;">${col1Html}</td>`;
       html += `<td style="vertical-align: top; width: 65%;">`;
       if (col2Text) {
           const isCol2ShortLabel = (col2Text.length < 50 && !col2Text.includes('{')) || col2Text.trim().endsWith(':');
           const col2Html = isCol2ShortLabel ? `<b>${col2Text}</b>` : col2Text;
           html += `<div style="margin-bottom: 8px;">${col2Html}</div>`;
       }
       if (listContent) html += `<ul>${listContent}</ul>`;
       html += `</td>`;
    } else {
       // Just a single column row
       html += `<td colspan="2" style="vertical-align: top;">${col1Html}</td>`;
    }
    
    html += '</tr>';
  }
  
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
  return options.map((opt) => {
    // Matches A. or i. or vii.
    const match = opt.match(/^([A-Z|a-z|ivx]+)[.\s:)]/i);
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
    case 'summary_completion':
    case 'sentence_completion':
    case 'note_completion': {
      block.content = buildGapFillContent(group.questions);
      break;
    }

    case 'flowchart':
    case 'flow_chart':
    case 'flowchart_completion': {
      let content = buildGapFillContent(group.questions);
      // convert list formats or explicitly broken lines to flow chart steps
      if (content.includes('<li') || content.includes('<br')) {
        content = content.replace(/<\/?ul[^>]*>/gi, '');
        content = content.replace(/<li[^>]*>/gi, '').replace(/<\/li>/gi, '\n');
        content = content.replace(/<br\s*\/?>\s*<br\s*\/?>/gi, '\n');
        content = content.replace(/<br\s*\/?>/gi, '\n');
        content = content.split('\n').map(s => s.trim()).filter(Boolean).join('\n');
      }
      block.content = content;
      const firstQ = group.questions[0];
      if (group.options || firstQ?.options) {
        block.options = group.options || firstQ.options;
      }
      break;
    }

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
        number: q.number,
        text: q.question,
      }));
      break;
    }

    case 'yes_no_not_given': {
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
        text: q.question,
      }));
      block.options = ['YES', 'NO', 'NOT GIVEN'];
      break;
    }

    case 'true_false_not_given': {
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
        text: q.question,
      }));
      block.options = ['TRUE', 'FALSE', 'NOT GIVEN'];
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
        number: q.number,
        text: q.question,
      }));
      block.options = optionLetters;

      // Store the full option descriptions to show at the top
      block.optionDescriptions = firstQ?.options || [];
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

    case 'matching':
    case 'matching_drag':
    case 'matching_features':
    case 'matching_information':
    case 'matching_paragraphs': {
      const firstQ = group.questions[0];
      const rawOptions = group.options || firstQ?.options || [];

      // Determine if questions are Paragraphs (Matching Headings style) or Items (Matching Info style)
      const isParagraphsAsQuestions = group.questions.some(q => q.question.toUpperCase().includes('PARAGRAPH'));

      let colLetters = [];
      if (isParagraphsAsQuestions && rawOptions.length > 0) {
        // If questions are Paragraphs, columns should be the Headings (i, ii, iii)
        colLetters = extractOptionLetters(rawOptions);
      } else {
        // Otherwise, columns are usually Paragraphs / Features (A, B, C)
        colLetters = rawOptions.length > 0
          ? extractOptionLetters(rawOptions)
          : extractParagraphLetters(passageContent) || ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      }

      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
        text: q.question,
      }));

      block.options = colLetters;
      block.columnOptions = colLetters; 

      // Build legend if options contain descriptive text
      if (rawOptions.length > 0) {
        const legendObj = {};
        rawOptions.forEach((opt) => {
          const m = opt.match(/^([A-Z|a-z|ivx]+)[.\s:)]\s*(.+)/i);
          if (m) legendObj[m[1]] = m[2].trim();
        });
        
        if (Object.keys(legendObj).length > 0) {
          block.legend = legendObj;
        } else {
          block.optionDescriptions = rawOptions;
        }
      }

      if (group.legendTitle) block.legendTitle = group.legendTitle;
      break;
    }

    case 'matching_headings': {
      // Heading options come from the first question's options
      const firstQ = group.questions[0];
      block.headings = firstQ?.options || [];
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
        text: q.question,
      }));
      break;
    }

    case 'short_answer':
    case 'short_answers': {
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
        text: q.question,
      }));
      break;
    }

    default: {
      // Fallback: try to build as true_false
      block.questions = group.questions.map((q) => ({
        id: String(q.number),
        number: q.number,
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
