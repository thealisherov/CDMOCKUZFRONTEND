/**
 * Saqlashdan oldingi normalizatsiya + avtomatik raqamlash.
 *
 * Qoidalar:
 *  - q.number === 0  → jadval header qatori (baholanmaydi, raqam berilmaydi)
 *  - q.numbers[]     → ketma-ket bir nechta raqam oladi (multiple_choice_multiple)
 *  - aks holda       → navbatdagi raqam
 *
 * MUHIM: bu modul obyektlarni chuqur nusxalab ishlaydi va NOMA'LUM kalitlarga
 * tegmaydi — qo'lda yozilgan JSONlar round-trip'da buzilmasligi kerak.
 */

import { canonicalGroupType, GROUP_TYPE_CONFIG } from './groupTypeConfig';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function isHeaderRow(q) {
  return q.number === 0 || (q.number == null && !Array.isArray(q.numbers));
}

/**
 * Bitta modul bo'limini (listening data yoki reading data) raqamlash.
 * Mutatsiya qiladi; savollar sonini qaytaradi.
 */
export function renumberModuleSection(sectionData, module) {
  const containersKey = module === 'listening' ? 'parts' : 'passages';
  const containers = sectionData?.[containersKey];
  if (!Array.isArray(containers)) return 0;

  let next = 1;

  containers.forEach((container, ci) => {
    const startNumber = next;

    // partNumber/passageNumber tartibini tuzatish
    if (module === 'listening') container.partNumber = ci + 1;
    else container.passageNumber = ci + 1;

    const groups = Array.isArray(container.questionGroups) ? container.questionGroups : [];
    groups.forEach((group) => {
      const questions = Array.isArray(group.questions) ? group.questions : [];
      questions.forEach((q) => {
        if (Array.isArray(q.numbers)) {
          const len = q.numbers.length || 1;
          q.numbers = Array.from({ length: len }, (_, i) => next + i);
          next += len;
        } else if (isHeaderRow(q)) {
          // header qator — raqam berilmaydi. `number` yo'q bo'lsa qo'shmaymiz:
          // adapter/checker ikkalasini ham bir xil (baholanmaydigan) deb qaraydi,
          // qo'lda yozilgan JSON esa o'zgarmagan holda qaytadi.
        } else {
          q.number = next;
          next += 1;
        }
      });
    });

    // questionRange faqat listening'da ishlatiladi (adapter block.questionRange);
    // reading passage'larida bu maydon yo'q — qo'shmaymiz, mavjud bo'lsa yangilaymiz.
    if (module === 'listening' || 'questionRange' in container) {
      const endNumber = next - 1;
      container.questionRange = endNumber >= startNumber ? `${startNumber}-${endNumber}` : '';
    }
  });

  const total = next - 1;
  if ('totalQuestions' in sectionData || total > 0) {
    sectionData.totalQuestions = total;
  }
  return total;
}

/** Butun testni raqamlash (turga qarab). Mutatsiya qiladi. */
export function renumberData(type, data) {
  if (type === 'listening') renumberModuleSection(data, 'listening');
  else if (type === 'reading') renumberModuleSection(data, 'reading');
  else if (type === 'full_mock' && data.sections) {
    if (data.sections.listening) renumberModuleSection(data.sections.listening, 'listening');
    if (data.sections.reading) renumberModuleSection(data.sections.reading, 'reading');
    if (Array.isArray(data.sections.writing?.tasks)) {
      data.sections.writing.tasks.forEach((t, i) => { if (t.taskNumber == null) t.taskNumber = i + 1; });
    }
  } else if (type === 'writing' && Array.isArray(data.tasks)) {
    data.tasks.forEach((t, i) => { if (t.taskNumber == null) t.taskNumber = i + 1; });
  }
  return data;
}

/** wordBank (summary_completion_with_options): options'ni HAR savolga nusxalash. */
function propagateWordBankOptions(sectionData, module) {
  const containersKey = module === 'listening' ? 'parts' : 'passages';
  const containers = sectionData?.[containersKey];
  if (!Array.isArray(containers)) return;
  containers.forEach((container) => {
    (container.questionGroups || []).forEach((group) => {
      const canonical = canonicalGroupType(group.groupType);
      if (canonical !== 'summary_completion_with_options') return;
      const questions = Array.isArray(group.questions) ? group.questions : [];
      const source =
        (Array.isArray(group.options) && group.options.length ? group.options : null) ||
        (Array.isArray(questions[0]?.options) && questions[0].options.length ? questions[0].options : null);
      if (!source) return;
      questions.forEach((q) => { q.options = [...source]; });
    });
  });
}

/** Bo'sh ixtiyoriy maydonlarni tozalash (faqat builder boshqaradigan kalitlar). */
function cleanOptionalFields(data) {
  if (typeof data.center === 'string' && data.center.trim() === '') delete data.center;
  if (typeof data.description === 'string' && data.description.trim() === '') delete data.description;
  if (data.instructionVideos && typeof data.instructionVideos === 'object') {
    ['listening', 'reading', 'writing'].forEach((k) => {
      if (typeof data.instructionVideos[k] === 'string' && !data.instructionVideos[k].trim()) {
        delete data.instructionVideos[k];
      }
    });
    if (Object.keys(data.instructionVideos).length === 0) delete data.instructionVideos;
  }
  const cleanImages = (arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      if (typeof item.image === 'string' && item.image.trim() === '') item.image = null;
      (item.questionGroups || []).forEach((g) => {
        if (typeof g.image === 'string' && g.image.trim() === '') delete g.image;
      });
    });
  };
  cleanImages(data.parts);
  cleanImages(data.passages);
  cleanImages(data.tasks);
  if (data.sections) {
    cleanImages(data.sections.listening?.parts);
    cleanImages(data.sections.reading?.passages);
    cleanImages(data.sections.writing?.tasks);
  }
}

/**
 * Saqlash uchun tayyorlash: клон → renumber → wordBank options → tozalash.
 * Asl obyektga TEGMAYDI, yangi data qaytaradi.
 */
export function prepareForSave(type, rawData) {
  const data = deepClone(rawData);
  renumberData(type, data);
  if (type === 'listening') propagateWordBankOptions(data, 'listening');
  else if (type === 'reading') propagateWordBankOptions(data, 'reading');
  else if (type === 'full_mock' && data.sections) {
    propagateWordBankOptions(data.sections.listening, 'listening');
    propagateWordBankOptions(data.sections.reading, 'reading');
  }
  cleanOptionalFields(data);
  return data;
}

/** data shakli bo'yicha turini aniqlash (JSON import uchun). */
export function detectTypeFromData(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.sections && typeof data.sections === 'object') return 'full_mock';
  if (Array.isArray(data.parts)) return 'listening';
  if (Array.isArray(data.passages)) return 'reading';
  if (Array.isArray(data.tasks)) return 'writing';
  return null;
}
