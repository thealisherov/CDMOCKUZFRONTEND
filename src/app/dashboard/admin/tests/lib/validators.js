/**
 * Test Builder validatsiya dvigateli.
 * Sof funksiya — UI (jonli panel) ham, API (saqlashdan oldin) ham import qiladi.
 *
 * validateTest({ test_id, type, data }) => [{ severity: 'error'|'warning', path, message }]
 * severity 'error'  — saqlash bloklanadi (API 400 qaytaradi)
 * severity 'warning'— saqlashga ruxsat, lekin ko'rsatiladi
 */

import { GROUP_TYPE_CONFIG, canonicalGroupType, isGroupTypeValidForModule } from './groupTypeConfig';

// Yalang'och harf ("A") ham qabul qilinadi — xaritali matching shu formatda (volume6 test 6)
const LETTER_PREFIX_RE = /^[A-Z]([\s.):]|$)/;
const ROMAN_PREFIX_RE = /^([ivxlc]+)[.\s]/i;
const URL_RE = /^https?:\/\/\S+$/i;
const LETTER_RANGE_RE = /([A-Z])\s*[-–]\s*([A-Z])/;

function err(path, message) {
  return { severity: 'error', path, message };
}
function warn(path, message) {
  return { severity: 'warning', path, message };
}

function isUrl(v) {
  return typeof v === 'string' && URL_RE.test(v.trim());
}

function checkUrlField(issues, path, value, label, { required = false } = {}) {
  const v = typeof value === 'string' ? value.trim() : value;
  if (!v) {
    if (required) issues.push(err(path, `${label} majburiy (http(s) URL).`));
    return;
  }
  if (!isUrl(v)) issues.push(err(path, `${label} yaroqli http(s) URL emas: "${String(v).slice(0, 60)}"`));
}

/** Savol matnidan bo'sh joylar sonini hisoblash: ______ + {N} */
function countBlanks(text) {
  if (typeof text !== 'string') return 0;
  const underscoreBlanks = (text.match(/_{3,}/g) || []).length;
  const placeholders = (text.match(/\{\d+\}/g) || []).length;
  return underscoreBlanks + placeholders;
}

/** Options ro'yxatidan harflarni ajratib olish: "A ..." / "A. ..." → 'A' */
function extractOptionLetters(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => {
      const m = typeof o === 'string' ? o.trim().match(/^([A-Z])([\s.):]|$)/) : null;
      return m ? m[1] : null;
    })
    .filter(Boolean);
}

function extractRomanNumerals(options) {
  if (!Array.isArray(options)) return [];
  return options
    .map((o) => {
      const m = typeof o === 'string' ? o.trim().match(ROMAN_PREFIX_RE) : null;
      return m ? m[1].toLowerCase() : null;
    })
    .filter(Boolean);
}

/**
 * Bitta modul bo'limini (listening yoki reading data'sini) tekshirish.
 * containers: parts[] yoki passages[]; module: 'listening'|'reading'
 */
function validateModuleSection(issues, module, sectionData, basePath, { expectedTotal } = {}) {
  const containersKey = module === 'listening' ? 'parts' : 'passages';
  const containers = sectionData?.[containersKey];

  if (!Array.isArray(containers) || containers.length === 0) {
    issues.push(err(`${basePath}.${containersKey}`, module === 'listening'
      ? "Kamida bitta part bo'lishi kerak."
      : "Kamida bitta passage bo'lishi kerak."));
    return;
  }

  if (module === 'listening') {
    checkUrlField(issues, `${basePath}.audio`, sectionData.audio, 'Audio URL', { required: true });
  }

  // Raqamlar ketma-ketligini yig'ish
  const allNumbers = [];

  containers.forEach((container, ci) => {
    const cPath = `${basePath}.${containersKey}[${ci}]`;

    if (module === 'reading') {
      const content = container.content ?? container.text;
      if (!content || !String(content).trim()) {
        issues.push(err(`${cPath}.content`, `Passage ${ci + 1}: matn (content) bo'sh.`));
      } else if (/<[a-z][\s\S]*?>/i.test(content)) {
        issues.push(err(`${cPath}.content`, `Passage ${ci + 1}: content ichida HTML teg bor — faqat oddiy matn, paragraflar bo'sh qator (\\n\\n) bilan ajratiladi.`));
      }
      if (!container.title || !String(container.title).trim()) {
        issues.push(warn(`${cPath}.title`, `Passage ${ci + 1}: sarlavha (title) bo'sh.`));
      }
    }

    if (container.image) checkUrlField(issues, `${cPath}.image`, container.image, `${module === 'listening' ? 'Part' : 'Passage'} ${ci + 1} rasmi`);

    const groups = container.questionGroups;
    if (!Array.isArray(groups) || groups.length === 0) {
      issues.push(err(`${cPath}.questionGroups`, `${module === 'listening' ? 'Part' : 'Passage'} ${ci + 1}: kamida bitta savol guruhi kerak.`));
      return;
    }

    groups.forEach((group, gi) => {
      const gPath = `${cPath}.questionGroups[${gi}]`;
      validateGroup(issues, module, group, gPath, container, allNumbers);
    });
  });

  // 1..N uzluksizlik
  const scored = allNumbers.filter((n) => Number.isInteger(n) && n > 0);
  const sorted = [...scored].sort((a, b) => a - b);
  const dups = sorted.filter((n, i) => i > 0 && sorted[i - 1] === n);
  if (dups.length) {
    issues.push(err(`${basePath}`, `Savol raqamlari takrorlangan: ${[...new Set(dups)].join(', ')}`));
  }
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i + 1) {
      issues.push(err(`${basePath}`, `Savol raqamlari 1..N uzluksiz emas: kutilgan ${i + 1}, topilgan ${sorted[i]}. (Bir nechta komponent pozitsion raqamlashga tayanadi — uzilish javoblarni siljitadi!)`));
      break;
    }
  }
  // O'sish tartibi (guruhlar ketma-ketligi bo'yicha)
  for (let i = 1; i < scored.length; i++) {
    if (scored[i] < scored[i - 1]) {
      issues.push(err(`${basePath}`, `Savol raqamlari guruhlar tartibida o'smayapti (${scored[i - 1]} dan keyin ${scored[i]}). Guruhlarni raqam tartibida joylashtiring.`));
      break;
    }
  }

  const total = expectedTotal ?? sectionData?.totalQuestions;
  if (total != null && Number(total) !== scored.length) {
    issues.push(err(`${basePath}.totalQuestions`, `totalQuestions=${total}, lekin haqiqiy savollar soni ${scored.length}.`));
  }

  return scored.length;
}

function validateGroup(issues, module, group, gPath, container, allNumbers) {
  const rawType = group.groupType;
  if (!rawType) {
    issues.push(err(`${gPath}.groupType`, "groupType ko'rsatilmagan."));
    return;
  }

  if (!isGroupTypeValidForModule(rawType, module)) {
    issues.push(err(`${gPath}.groupType`, `"${rawType}" turi ${module} modulida qo'llab-quvvatlanMAYDI — studentga "Unknown question type" bo'lib ko'rinadi.`));
    return;
  }

  const canonical = canonicalGroupType(rawType);
  const cfg = canonical ? GROUP_TYPE_CONFIG[canonical] : null;

  if (!group.instruction || !String(group.instruction).trim()) {
    issues.push(warn(`${gPath}.instruction`, `${rawType}: instruction bo'sh.`));
  }

  if (group.image) checkUrlField(issues, `${gPath}.image`, group.image, 'Guruh rasmi');

  const questions = Array.isArray(group.questions) ? group.questions : [];
  if (questions.length === 0) {
    issues.push(err(`${gPath}.questions`, `${rawType}: savollar yo'q.`));
    return;
  }

  // ==== Listening adapter instruction-override ogohlantirishlari ====
  if (module === 'listening') {
    const instr = String(group.instruction || '');
    const isFlow = /flow-?chart/i.test(instr);
    const flowFamily = ['flowchart', 'flow_chart', 'flowchart_completion'].includes(rawType);
    if (isFlow && !flowFamily) {
      issues.push(warn(`${gPath}.instruction`, `Instruction'da "flow-chart" bor — adapter bu guruhni flow_chart sifatida render qiladi (groupType: ${rawType} e'tiborsiz qoladi).`));
    }
    const isCompletion = /^(note|sentence|form|summary)_completion$/.test(rawType);
    const hasPipe = questions.some((q) => typeof q.question === 'string' && q.question.includes('|'));
    if (/table/i.test(instr) && !isCompletion && rawType !== 'table_completion' && hasPipe) {
      issues.push(warn(`${gPath}.instruction`, `Instruction'da "table" + savollarda "|" bor — adapter guruhni table_completion sifatida render qilishi mumkin.`));
    }
  }

  // ==== groupType-ga xos tekshiruvlar ====
  const kind = cfg?.editorKind;

  // tfng: options saqlanmasligi kerak
  if (kind === 'tfng') {
    if (Array.isArray(group.options) && group.options.length) {
      issues.push(err(`${gPath}.options`, `${rawType}: options SAQLANMAYDI — adapter TRUE/FALSE/NOT GIVEN ni o'zi qo'shadi.`));
    }
    questions.forEach((q, qi) => {
      if (Array.isArray(q.options) && q.options.length) {
        issues.push(err(`${gPath}.questions[${qi}].options`, `${rawType}: savol darajasida ham options saqlanmaydi.`));
      }
    });
  }

  // Guruh darajasida options majburiy turlar
  if (kind === 'mcqMultiSpread' || (kind === 'matchList' && module === 'listening')) {
    const opts = group.options;
    if (!Array.isArray(opts) || opts.length < 2) {
      issues.push(err(`${gPath}.options`, `${rawType}: guruh darajasida options ro'yxati majburiy (kamida 2 ta).`));
    }
  }

  // matchList (reading): options guruhda YOKI birinchi savolda bo'lishi kerak
  if (kind === 'matchList' && module === 'reading') {
    const groupOpts = Array.isArray(group.options) && group.options.length >= 2;
    const firstQOpts = Array.isArray(questions[0]?.options) && questions[0].options.length >= 2;
    if (!groupOpts && !firstQOpts && rawType !== 'matching_paragraphs' && rawType !== 'matching_information') {
      issues.push(err(`${gPath}.options`, `${rawType}: options guruh darajasida yoki birinchi savolda bo'lishi shart.`));
    }
  }

  // Options format tekshiruvi
  const checkOptionsFormat = (opts, oPath) => {
    if (!Array.isArray(opts)) return;
    if (cfg?.optionsFormat === 'letterPrefixed') {
      opts.forEach((o, oi) => {
        if (typeof o === 'string' && o.trim() && !LETTER_PREFIX_RE.test(o.trim())) {
          issues.push(err(`${oPath}[${oi}]`, `Option "${o.slice(0, 40)}" harf prefiksi bilan boshlanishi kerak: "A ..." yoki "A. ..."`));
        }
      });
    }
    if (cfg?.optionsFormat === 'romanPrefixed') {
      opts.forEach((o, oi) => {
        if (typeof o === 'string' && o.trim() && !ROMAN_PREFIX_RE.test(o.trim())) {
          issues.push(err(`${oPath}[${oi}]`, `Sarlavha "${o.slice(0, 40)}" rim raqami bilan boshlanishi kerak: "i. ..." / "ii. ..."`));
        }
      });
    }
  };
  checkOptionsFormat(group.options, `${gPath}.options`);
  questions.forEach((q, qi) => checkOptionsFormat(q.options, `${gPath}.questions[${qi}].options`));

  // wordBank: options HAR savolda takrorlanishi shart
  if (kind === 'wordBank') {
    questions.forEach((q, qi) => {
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push(err(`${gPath}.questions[${qi}].options`, `summary_completion_with_options: options HAR BIR savolda takrorlanishi shart (adapter faqat questions[0].options ni o'qiydi, lekin format shuni talab qiladi).`));
      }
    });
  }

  // letterRange (map/plan): instruction'da harf diapazoni bo'lishi shart
  let rangeLetters = null;
  if (kind === 'letterRange') {
    const m = String(group.instruction || '').match(LETTER_RANGE_RE);
    if (!m) {
      issues.push(err(`${gPath}.instruction`, `${rawType}: instruction ichida harf diapazoni bo'lishi shart (masalan "A-H") — adapter uni regex bilan o'qiydi.`));
    } else {
      rangeLetters = [];
      for (let c = m[1].charCodeAt(0); c <= m[2].charCodeAt(0); c++) rangeLetters.push(String.fromCharCode(c));
    }
    const img = group.image || container?.image;
    if (!img) {
      issues.push(warn(`${gPath}.image`, `${rawType}: xarita/plan rasmi yo'q (guruh yoki part darajasida image URL kiriting).`));
    }
  }

  // matching_headings: paragraf yorliqlari passage bilan mos kelishi
  if (kind === 'headings' && container?.content) {
    const paragraphs = String(container.content).split(/\n\n+/);
    const labels = new Set();
    paragraphs.forEach((p) => {
      const m = p.trim().match(/^(?:Paragraph\s+)?([A-Z])(?:\s|$)/);
      if (m) labels.add(m[1]);
    });
    questions.forEach((q, qi) => {
      const qm = String(q.question || '').match(/Paragraph\s+([A-Z])/i) || String(q.question || '').trim().match(/^([A-Z])$/);
      if (qm && labels.size > 0 && !labels.has(qm[1].toUpperCase())) {
        issues.push(warn(`${gPath}.questions[${qi}].question`, `matching_headings: "${q.question}" — passage'da "${qm[1]}" bilan boshlanadigan paragraf topilmadi (paragraflar "A " yoki "Paragraph A" bilan boshlanishi kerak).`));
      }
    });
  }

  // ==== Savollarni tekshirish ====
  const availableLetters = extractOptionLetters(group.options);
  const availableRomans = kind === 'headings' ? extractRomanNumerals(questions[0]?.options) : [];

  questions.forEach((q, qi) => {
    const qPath = `${gPath}.questions[${qi}]`;
    const qText = q.question ?? q.text ?? '';
    const isHeaderRow = !(Number.isInteger(q.number) && q.number > 0) && !Array.isArray(q.numbers);
    const isHidden = String(qText).trim() === '#hidden#';

    // #hidden# faqat table_completion da
    if (isHidden && kind !== 'tableRows') {
      issues.push(err(`${qPath}.question`, `#hidden# faqat table_completion ichida ishlatiladi.`));
    }

    // Raqamlarni yig'ish
    if (Array.isArray(q.numbers)) {
      if (kind !== 'mcqMultiCombined') {
        issues.push(warn(`${qPath}.numbers`, `numbers[] odatda faqat multiple_choice_multiple uchun ishlatiladi.`));
      }
      q.numbers.forEach((n) => allNumbers.push(n));
      const answers = q.answers;
      if (!Array.isArray(answers) || answers.length !== q.numbers.length) {
        issues.push(err(`${qPath}.answers`, `answers[] uzunligi numbers[] bilan teng bo'lishi kerak (${q.numbers.length} ta harf).`));
      } else {
        const qLetters = extractOptionLetters(q.options).length ? extractOptionLetters(q.options) : availableLetters;
        answers.forEach((a, ai) => {
          if (qLetters.length && !qLetters.includes(String(a).trim().toUpperCase())) {
            issues.push(err(`${qPath}.answers[${ai}]`, `Javob "${a}" mavjud options harflari ichida emas (${qLetters.join(', ')}).`));
          }
        });
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        issues.push(err(`${qPath}.options`, `multiple_choice_multiple: savolda options ro'yxati bo'lishi shart.`));
      }
      return; // numbers-savol uchun qolgan tekshiruvlar shart emas
    }

    if (isHeaderRow) {
      if (kind !== 'tableRows') {
        issues.push(warn(`${qPath}.number`, `Raqamsiz savol (header qator) faqat table_completion da ma'noga ega.`));
      } else if (countBlanks(qText) > 0) {
        issues.push(err(`${qPath}.question`, `Jadval header qatorida bo'sh joy ({N} yoki ______) bo'lmasligi kerak.`));
      }
      return;
    }

    allNumbers.push(q.number);

    // Savol matni
    if (!isHidden && !String(qText).trim() && kind !== 'mcqMultiSpread') {
      issues.push(err(`${qPath}.question`, `Savol ${q.number}: matn bo'sh.`));
    }

    // Bo'sh joy tekshiruvi (gap turlari)
    if ((kind === 'gapLines' || (kind === 'flowChart' && !(Array.isArray(q.options) && q.options.length))) && !isHidden) {
      const blanks = countBlanks(qText);
      if (blanks === 0) {
        issues.push(err(`${qPath}.question`, `Savol ${q.number}: bo'sh joy topilmadi — kamida bitta "______" (3+ pastki chiziq) bo'lishi kerak.`));
      } else if (blanks > 1) {
        issues.push(warn(`${qPath}.question`, `Savol ${q.number}: ${blanks} ta bo'sh joy bor, lekin bitta raqam. Har bitta raqamga bitta bo'sh joy tavsiya etiladi.`));
      }
    }
    if (kind === 'tableRows' && !isHidden) {
      const blanks = countBlanks(qText);
      if (blanks === 0) {
        issues.push(err(`${qPath}.question`, `Savol ${q.number}: jadval qatorida bo'sh joy yo'q ("______" yoki "{${q.number}}").`));
      }
    }

    // Javob tekshiruvi
    const answer = q.answer;
    if (answer == null || String(answer).trim() === '') {
      issues.push(err(`${qPath}.answer`, `Savol ${q.number}: javob (answer) bo'sh.`));
    } else {
      const a = String(answer).trim();
      if (cfg?.answerShape === 'letter') {
        const qLetters = extractOptionLetters(q.options).length ? extractOptionLetters(q.options) : availableLetters;
        const validLetters = rangeLetters || qLetters;
        if (validLetters && validLetters.length && !validLetters.includes(a.toUpperCase())) {
          issues.push(err(`${qPath}.answer`, `Savol ${q.number}: javob "${a}" ruxsat etilgan harflar ichida emas (${validLetters.join(', ')}).`));
        }
      }
      if (kind === 'tfng' && cfg?.hardcodedOptions) {
        if (!cfg.hardcodedOptions.includes(a.toUpperCase())) {
          issues.push(err(`${qPath}.answer`, `Savol ${q.number}: javob "${a}" emas — faqat ${cfg.hardcodedOptions.join(' / ')}.`));
        }
      }
      if (kind === 'headings') {
        if (!/^[ivxlc]+$/i.test(a)) {
          issues.push(err(`${qPath}.answer`, `Savol ${q.number}: matching_headings javobi rim raqami bo'lishi kerak ("ii", "iv" ...).`));
        } else if (availableRomans.length && !availableRomans.includes(a.toLowerCase())) {
          issues.push(err(`${qPath}.answer`, `Savol ${q.number}: "${a}" sarlavhalar ro'yxatida yo'q (${availableRomans.join(', ')}).`));
        }
      }
      if (cfg?.answerShape === 'text' && (!Array.isArray(q.alternativeAnswers) || q.alternativeAnswers.length === 0)) {
        // faqat ko'p so'zli/harfli matn javoblarga eslatma
        if (/[a-z]{3,}/i.test(a)) {
          issues.push(warn(`${qPath}.alternativeAnswers`, `Savol ${q.number}: alternativeAnswers bo'sh — ko'plik/variant yozilishlarni qo'shish tavsiya etiladi.`));
        }
      }
    }

    // mcqSingle: har savolda options
    if (kind === 'mcqSingle' && (!Array.isArray(q.options) || q.options.length < 2)) {
      issues.push(err(`${qPath}.options`, `Savol ${q.number}: multiple choice savolida options ro'yxati bo'lishi shart.`));
    }
  });

  // Jadval ustunlari izchilligi
  if (kind === 'tableRows') {
    const colCounts = questions
      .map((q) => (typeof q.question === 'string' && q.question.includes('|') ? q.question.split('|').length : null))
      .filter((n) => n != null);
    if (colCounts.length > 1 && new Set(colCounts).size > 1) {
      issues.push(warn(`${gPath}.questions`, `Jadval qatorlarida ustunlar soni har xil (${[...new Set(colCounts)].join(', ')}) — jadval qiyshiq chiqishi mumkin.`));
    }
  }
}

/** Header (umumiy meta) tekshiruvi. */
function validateHeader(issues, type, data) {
  if (!data.title || !String(data.title).trim()) issues.push(err('data.title', 'Test sarlavhasi (title) majburiy.'));
  if (!data.id || !String(data.id).trim()) issues.push(warn('data.id', "data.id bo'sh — test ichki identifikatori tavsiya etiladi."));
  // full_mock'da timer bo'limlar ichida (sections.*.timer) — yuqori darajada tekshirilmaydi
  if (type !== 'full_mock') {
    const timer = Number(data.timer);
    if (!Number.isFinite(timer) || timer <= 0) issues.push(err('data.timer', 'timer (daqiqa) musbat son bo\'lishi kerak.'));
  }
  if (data.testTution && !['free', 'paid', 'premium'].includes(data.testTution)) {
    issues.push(err('data.testTution', `testTution "free" | "paid" bo'lishi kerak (topildi: "${data.testTution}").`));
  }
  if (type !== 'writing') {
    if (data.level && !['easy', 'medium', 'hard'].includes(data.level)) {
      issues.push(warn('data.level', `level odatda easy|medium|hard (topildi: "${data.level}").`));
    }
  }
  if (data.center != null && typeof data.center === 'string' && data.center.trim() === '') {
    issues.push(warn('data.center', 'center bo\'sh string — platforma testi uchun maydonni umuman olib tashlang.'));
  }
}

function validateWritingTasks(issues, tasks, basePath) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    issues.push(err(`${basePath}.tasks`, "Kamida bitta writing task bo'lishi kerak."));
    return;
  }
  tasks.forEach((t, ti) => {
    const tPath = `${basePath}.tasks[${ti}]`;
    if (![1, 2].includes(t.taskNumber)) {
      issues.push(err(`${tPath}.taskNumber`, `taskNumber 1 yoki 2 bo'lishi shart (AI baholash mezonini belgilaydi).`));
    }
    if (!t.content || !String(t.content).trim()) {
      issues.push(err(`${tPath}.content`, `Task ${t.taskNumber || ti + 1}: topshiriq matni (content) bo'sh.`));
    }
    if (t.image) checkUrlField(issues, `${tPath}.image`, t.image, `Task ${t.taskNumber || ti + 1} rasmi`);
    if (t.taskNumber === 1 && !t.image) {
      issues.push(warn(`${tPath}.image`, `Task 1 odatda grafik/diagramma rasmi bilan keladi — image URL kiritilmagan.`));
    }
  });
}

/**
 * Asosiy kirish nuqtasi.
 */
export function validateTest({ test_id, type, data }) {
  const issues = [];

  if (!test_id || !String(test_id).trim()) {
    issues.push(err('test_id', 'test_id majburiy (masalan "Listening Volume 7.1").'));
  }
  if (!['listening', 'reading', 'writing', 'full_mock'].includes(type)) {
    issues.push(err('type', `type noto'g'ri: "${type}".`));
    return issues;
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    issues.push(err('data', "data JSON obyekt bo'lishi kerak."));
    return issues;
  }

  validateHeader(issues, type, data);

  // Tur va struktura mosligi
  if (type === 'listening') {
    if (!Array.isArray(data.parts)) issues.push(err('data.parts', 'listening testida parts[] massivi bo\'lishi shart.'));
    else validateModuleSection(issues, 'listening', data, 'data');
    if (data.passages || data.tasks || data.sections) issues.push(warn('data', 'listening testida passages/tasks/sections bo\'lmasligi kerak.'));
  } else if (type === 'reading') {
    if (!Array.isArray(data.passages)) issues.push(err('data.passages', 'reading testida passages[] massivi bo\'lishi shart.'));
    else validateModuleSection(issues, 'reading', data, 'data');
    if (data.parts || data.tasks || data.sections) issues.push(warn('data', 'reading testida parts/tasks/sections bo\'lmasligi kerak.'));
  } else if (type === 'writing') {
    validateWritingTasks(issues, data.tasks, 'data');
    if (data.parts || data.passages || data.sections) issues.push(warn('data', 'writing testida parts/passages/sections bo\'lmasligi kerak.'));
  } else if (type === 'full_mock') {
    const s = data.sections;
    if (!s || typeof s !== 'object' || Array.isArray(s)) {
      issues.push(err('data.sections', 'full_mock: sections OBYEKT bo\'lishi shart — {listening:{...}, reading:{...}, writing:{...}} (massiv EMAS).'));
    } else {
      const keys = Object.keys(s);
      ['listening', 'reading', 'writing'].forEach((k) => {
        if (!s[k]) issues.push(err(`data.sections.${k}`, `full_mock: sections.${k} bo'limi majburiy.`));
      });
      keys.forEach((k) => {
        if (!['listening', 'reading', 'writing'].includes(k)) {
          issues.push(warn(`data.sections.${k}`, `Noma'lum bo'lim "${k}" — faqat listening/reading/writing ishlatiladi.`));
        }
      });
      ['listening', 'reading', 'writing'].forEach((k) => {
        if (!s[k]) return;
        const t = Number(s[k].timer);
        if (!Number.isFinite(t) || t <= 0) {
          issues.push(err(`data.sections.${k}.timer`, `sections.${k}.timer (daqiqa) musbat son bo'lishi kerak.`));
        }
      });
      if (s.listening) validateModuleSection(issues, 'listening', s.listening, 'data.sections.listening');
      if (s.reading) validateModuleSection(issues, 'reading', s.reading, 'data.sections.reading');
      if (s.writing) validateWritingTasks(issues, s.writing.tasks, 'data.sections.writing');
    }
    if (!data.center || !String(data.center).trim()) {
      issues.push(err('data.center', "full_mock faqat o'quv markaz uchun — center (markaz slug) majburiy."));
    }
    const iv = data.instructionVideos;
    if (iv && typeof iv === 'object') {
      ['listening', 'reading', 'writing'].forEach((k) => {
        if (iv[k]) checkUrlField(issues, `data.instructionVideos.${k}`, iv[k], `${k} instruction video`);
      });
      const missing = ['listening', 'reading', 'writing'].filter((k) => !iv[k]);
      if (missing.length && missing.length < 3) {
        issues.push(warn('data.instructionVideos', `instructionVideos to'liq emas (${missing.join(', ')} yo'q) — global default videolar ishlatiladi.`));
      }
    }
  }

  return issues;
}

/** Faqat error'lar bormi? (API saqlashni bloklash uchun) */
export function hasErrors(issues) {
  return issues.some((i) => i.severity === 'error');
}
