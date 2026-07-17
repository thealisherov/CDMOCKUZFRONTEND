/**
 * Full Mock instruction videolari — GLOBAL.
 *
 * Bu videolar HAR BIR full_mock test uchun avtomatik chiqadi (JSON ga yozish
 * shart emas). Bugun yoki ertaga qanday full_mock yuklansa ham, test
 * ishlanayotganda har bo'lim oldidan mos video ko'rsatiladi.
 *
 * Agar kelajakda biror testga boshqa video kerak bo'lsa, JSON ichida
 * "instructionVideos": { listening, reading, writing } berib override qilса
 * bo'ladi (getMockVideos shu holatni ham qo'llaydi).
 */
export const MOCK_INSTRUCTION_VIDEOS = {
  listening: 'https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/IELTS%20Listening%20Test%20Instruction.mp4',
  reading:   'https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/IELTS%20Reading%20Test%20Instruction.mp4',
  writing:   'https://pub-e1b4bb7172ab47648a4ad3899784693e.r2.dev/IELTS%20Writing%20Test%20Instruction.mp4',
};

/** Test JSON dagi override bilan birlashtirilgan videolar. */
export function getMockVideos(data) {
  const override = data?.instructionVideos || {};
  return {
    listening: override.listening || MOCK_INSTRUCTION_VIDEOS.listening,
    reading:   override.reading   || MOCK_INSTRUCTION_VIDEOS.reading,
    writing:   override.writing   || MOCK_INSTRUCTION_VIDEOS.writing,
  };
}

/** Full mock bo'limlari — HAR DOIM shu tartibda. */
export const MOCK_SECTION_ORDER = ['listening', 'reading', 'writing'];
