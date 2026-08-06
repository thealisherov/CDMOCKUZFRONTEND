/**
 * Test Builder yadrosi: har bir groupType uchun konfiguratsiya.
 *
 * MUHIM: `module` maydoni adapterlar (listeningDataAdapter / readingDataAdapter)
 * qaysi turlarni render qila olishiga asoslangan — noto'g'ri modulga qo'yilgan
 * tur studentga "⚠ Unknown question type" bo'lib ko'rinadi.
 *
 * editorKind — ~20 turni ~11 umumiy editorga yig'adi:
 *   gapLines        — bo'sh joyli matn qatorlari (______)
 *   flowChart       — flow-chart qadamlari (ixtiyoriy word bank)
 *   tableRows       — | bilan ajratilgan jadval qatorlari
 *   mcqSingle       — bitta javobli test (A/B/C/D)
 *   mcqMultiSpread  — guruh options + har raqamga alohida savol (listening)
 *   mcqMultiCombined— numbers:[..] + answers:[..] bitta savolda (reading)
 *   matchList       — moslashtirish: stem + harf javob (dropdown/matrix)
 *   letterRange     — xarita/plan belgilash (harf diapazoni instruction'da)
 *   tfng            — TRUE/FALSE/NOT GIVEN (options SAQLANMAYDI)
 *   headings        — sarlavha moslashtirish (rim raqamlar, drag)
 *   wordBank        — so'z banki bilan summary (options HAR savolda)
 *   shortAnswer     — qisqa javob
 */

export const GROUP_TYPE_CONFIG = {
  // ===== Ikkala modulda ishlaydi =====
  note_completion: {
    label: "Note Completion",
    description: "Eslatmalarni to'ldirish (______ bo'sh joylar)",
    module: 'both',
    editorKind: 'gapLines',
    optionsAt: 'none',
    answerShape: 'text',
    instructionTemplates: [
      'Complete the notes below. Write ONE WORD ONLY for each answer.',
      'Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.',
      'Complete the notes below. Write NO MORE THAN TWO WORDS for each answer.',
    ],
  },
  sentence_completion: {
    label: 'Sentence Completion',
    description: "Gaplarni to'ldirish (______ bo'sh joylar)",
    module: 'both',
    editorKind: 'gapLines',
    optionsAt: 'none',
    answerShape: 'text',
    instructionTemplates: [
      'Complete the sentences below. Write ONE WORD ONLY for each answer.',
      'Complete the sentences below. Write NO MORE THAN TWO WORDS for each answer.',
      'Complete the sentences below. Write NO MORE THAN THREE WORDS from the passage for each answer.',
    ],
  },
  summary_completion: {
    label: 'Summary Completion',
    description: "Xulosani to'ldirish (so'z banki YO'Q)",
    module: 'both',
    editorKind: 'gapLines',
    optionsAt: 'none',
    answerShape: 'text',
    instructionTemplates: [
      'Complete the summary below. Write ONE WORD ONLY from the passage for each answer.',
      'Complete the summary below. Write NO MORE THAN TWO WORDS from the passage for each answer.',
    ],
  },
  table_completion: {
    label: 'Table Completion',
    description: "Jadvalni to'ldirish (| ustun ajratkich, #hidden# qo'llab-quvvatlanadi)",
    module: 'both',
    editorKind: 'tableRows',
    optionsAt: 'none',
    answerShape: 'text',
    supportsHiddenMarker: true,
    supportsHeaderRow: true,
    instructionTemplates: [
      'Complete the table below. Write ONE WORD ONLY for each answer.',
      'Complete the table below. Write NO MORE THAN TWO WORDS for each answer.',
      'Complete the table below. Write ONE WORD AND/OR A NUMBER for each answer.',
    ],
  },
  flowchart_completion: {
    label: 'Flow-chart Completion',
    description: "Jarayon sxemasi (options bilan — drag, optionssiz — yozma)",
    module: 'both',
    editorKind: 'flowChart',
    optionsAt: 'question',
    optionsOptional: true,
    optionsFormat: 'letterPrefixed',
    answerShape: 'textOrLetter',
    instructionTemplates: [
      'Complete the flow-chart below. Write ONE WORD ONLY for each answer.',
      'Complete the flow-chart below. Choose the correct letter, A-H.',
    ],
  },
  short_answer: {
    label: 'Short Answer',
    description: "Savollarga qisqa javob yozish",
    module: 'both',
    editorKind: 'shortAnswer',
    optionsAt: 'none',
    answerShape: 'text',
    instructionTemplates: [
      'Answer the questions below. Write NO MORE THAN TWO WORDS for each answer.',
      'Answer the questions below. Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.',
    ],
  },

  // ===== Faqat LISTENING =====
  form_completion: {
    label: 'Form Completion',
    description: "Formani to'ldirish (______ bo'sh joylar)",
    module: 'listening',
    editorKind: 'gapLines',
    optionsAt: 'none',
    answerShape: 'text',
    instructionTemplates: [
      'Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.',
    ],
  },
  multiple_choice: {
    label: 'Multiple Choice (A/B/C)',
    description: "Bitta to'g'ri javobli test — Listening",
    module: 'listening',
    editorKind: 'mcqSingle',
    optionsAt: 'question',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Choose the correct answer, A, B or C.',
      'Choose the correct letter, A, B or C.',
    ],
  },
  multiple_choice_multiple_answer: {
    label: 'Multiple Choice (TWO answers)',
    description: "Ikki/uch javob tanlash — guruh options + har raqamga alohida savol",
    module: 'listening',
    editorKind: 'mcqMultiSpread',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Which TWO ...? Choose TWO letters, A-E.',
    ],
  },
  matching: {
    label: 'Matching',
    description: "Moslashtirish (Listening: dropdown, Reading: jadval)",
    module: 'both',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'What does the speaker say about each ...? Choose the correct answer from the box.',
      'Match each statement with the correct person, A-D.',
    ],
  },
  map_labeling: {
    label: 'Map Labeling',
    description: "Xaritani belgilash (rasm + harf diapazoni)",
    module: 'listening',
    editorKind: 'letterRange',
    optionsAt: 'none',
    answerShape: 'letter',
    requiresImage: true,
    instructionTemplates: [
      'Label the map below. Choose the correct letter, A-H, next to questions {range}.',
    ],
  },
  plan_labeling: {
    label: 'Plan Labeling',
    description: "Planni belgilash (rasm + harf diapazoni)",
    module: 'listening',
    editorKind: 'letterRange',
    optionsAt: 'none',
    answerShape: 'letter',
    requiresImage: true,
    instructionTemplates: [
      'Label the plan below. Choose the correct letter, A-J, next to questions {range}.',
    ],
  },

  // ===== Faqat READING =====
  multiple_choice_single: {
    label: 'Multiple Choice (A/B/C/D)',
    description: "Bitta to'g'ri javobli test — Reading",
    module: 'reading',
    editorKind: 'mcqSingle',
    optionsAt: 'question',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Choose the correct letter, A, B, C or D.',
    ],
  },
  multiple_choice_multiple: {
    label: 'Multiple Choice (TWO answers)',
    description: "Ikki javob tanlash — numbers:[..] + answers:[..] bitta savolda",
    module: 'reading',
    editorKind: 'mcqMultiCombined',
    optionsAt: 'question',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letters',
    instructionTemplates: [
      'Which TWO of the following statements are true? Choose TWO letters, A-E.',
    ],
  },
  matching_features: {
    label: 'Matching Features',
    description: "Xususiyatlarni moslashtirish (radio jadval + legend)",
    module: 'reading',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    supportsLegendTitle: true,
    allowRepeatNote: true,
    instructionTemplates: [
      'Match each statement with the correct person, A-E. NB You may use any letter more than once.',
    ],
  },
  matching_information: {
    label: 'Matching Information',
    description: "Ma'lumotni paragraflar bilan moslashtirish",
    module: 'reading',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    allowRepeatNote: true,
    instructionTemplates: [
      'Which paragraph contains the following information? Write the correct letter, A-G. NB You may use any letter more than once.',
    ],
  },
  matching_paragraphs: {
    label: 'Matching Paragraphs',
    description: "Paragraf tanlash (radio jadval)",
    module: 'reading',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Which paragraph contains the following information? Write the correct letter, A-F.',
    ],
  },
  classification: {
    label: 'Classification',
    description: "Tasniflash (radio jadval + legend)",
    module: 'reading',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    supportsLegendTitle: true,
    instructionTemplates: [
      'Classify the following statements. Write the correct letter, A-C.',
    ],
  },
  matching_sentence_endings: {
    label: 'Matching Sentence Endings',
    description: "Gap oxirlarini moslashtirish (dropdown)",
    module: 'reading',
    editorKind: 'matchList',
    optionsAt: 'group',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Complete each sentence with the correct ending, A-F, below.',
    ],
  },
  matching_headings: {
    label: 'Matching Headings',
    description: "Paragraf sarlavhalari (rim raqamlar i, ii, iii — drag & drop)",
    module: 'reading',
    editorKind: 'headings',
    optionsAt: 'question',
    optionsFormat: 'romanPrefixed',
    answerShape: 'romanNumeral',
    instructionTemplates: [
      'The reading passage has seven paragraphs, A-G. Choose the correct heading for each paragraph from the list of headings below. Write the correct number, i-x.',
    ],
  },
  true_false_not_given: {
    label: 'True / False / Not Given',
    description: "TRUE/FALSE/NOT GIVEN (options saqlanmaydi — avtomatik)",
    module: 'reading',
    editorKind: 'tfng',
    optionsAt: 'none',
    hardcodedOptions: ['TRUE', 'FALSE', 'NOT GIVEN'],
    answerShape: 'choice',
    instructionTemplates: [
      'Do the following statements agree with the information given in the reading passage? Write TRUE, FALSE or NOT GIVEN.',
    ],
  },
  yes_no_not_given: {
    label: 'Yes / No / Not Given',
    description: "YES/NO/NOT GIVEN (options saqlanmaydi — avtomatik)",
    module: 'reading',
    editorKind: 'tfng',
    optionsAt: 'none',
    hardcodedOptions: ['YES', 'NO', 'NOT GIVEN'],
    answerShape: 'choice',
    instructionTemplates: [
      "Do the following statements agree with the claims of the writer? Write YES, NO or NOT GIVEN.",
    ],
  },
  summary_completion_with_options: {
    label: 'Summary Completion (word bank)',
    description: "Xulosa + so'z banki (drag & drop; options har savolda takrorlanadi)",
    module: 'reading',
    editorKind: 'wordBank',
    optionsAt: 'question',
    optionsFormat: 'letterPrefixed',
    answerShape: 'letter',
    instructionTemplates: [
      'Complete the summary using the list of words, A-K, below.',
    ],
  },
};

/** Modul uchun ruxsat etilgan groupType'lar ro'yxati. */
export function groupTypesForModule(module) {
  return Object.entries(GROUP_TYPE_CONFIG)
    .filter(([, cfg]) => cfg.module === 'both' || cfg.module === module)
    .map(([key, cfg]) => ({ key, ...cfg }));
}

/** Adapterlar taniydigan muqobil nomlar (mavjud testlarni ochishda normalizatsiya uchun). */
export const GROUP_TYPE_ALIASES = {
  flowchart: 'flowchart_completion',
  flow_chart: 'flowchart_completion',
  table: 'table_completion',
  short_answers: 'short_answer',
  multiple_choice_single_answer: 'multiple_choice', // listening alias
  matching_drag: 'matching_features', // reading radio_matrix oilasi
};

/** groupType'ni kanonik nomga keltirish (config kaliti qaytadi yoki null). */
export function canonicalGroupType(groupType) {
  if (GROUP_TYPE_CONFIG[groupType]) return groupType;
  const alias = GROUP_TYPE_ALIASES[groupType];
  return alias && GROUP_TYPE_CONFIG[alias] ? alias : null;
}

/**
 * Modul uchun groupType yaroqliligini tekshirish.
 * ESLATMA: listening'da 'multiple_choice_multiple' adapteri checkbox_multiple'ga map qiladi
 * (listeningDataAdapter.js:41-43), lekin kanonik listening turi multiple_choice_multiple_answer.
 */
export function isGroupTypeValidForModule(groupType, module) {
  // Adapter darajasidagi haqiqiy whitelist (aliaslar bilan):
  const LISTENING_OK = new Set([
    'note_completion', 'sentence_completion', 'form_completion', 'summary_completion',
    'flowchart', 'flow_chart', 'flowchart_completion',
    'multiple_choice', 'multiple_choice_single_answer',
    'multiple_choice_multiple', 'multiple_choice_multiple_answer',
    'map_labeling', 'plan_labeling', 'matching',
    'table_completion', 'table',
    'short_answer', 'short_answers',
  ]);
  const READING_OK = new Set([
    'note_completion', 'sentence_completion', 'summary_completion',
    'flowchart', 'flow_chart', 'flowchart_completion',
    'summary_completion_with_options',
    'yes_no_not_given', 'true_false_not_given',
    'matching_sentence_endings', 'matching_paragraphs',
    'multiple_choice_single', 'multiple_choice_multiple',
    'matching', 'matching_drag', 'matching_features', 'matching_information', 'classification',
    'matching_headings',
    'table', 'table_completion',
    'short_answer', 'short_answers',
  ]);
  if (module === 'listening') return LISTENING_OK.has(groupType);
  if (module === 'reading') return READING_OK.has(groupType);
  return false;
}
