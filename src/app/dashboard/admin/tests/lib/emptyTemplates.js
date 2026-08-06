/**
 * Bo'sh test skeletlari va fabrikalar — builder "Yangi test" bosilganda shulardan boshlaydi.
 * Maydon nomlari mavjud production testlar (testlar/*.json) bilan 1:1 mos.
 */

export function emptyListeningData() {
  return {
    id: '',
    title: '',
    testFormat: 'full_test',
    testType: 'volume',
    level: 'medium',
    timer: 40,
    totalQuestions: 0,
    testTution: 'free',
    audio: '',
    parts: [emptyPart(1)],
  };
}

export function emptyReadingData() {
  return {
    id: '',
    title: '',
    testFormat: 'full_test',
    testType: 'volume',
    level: 'medium',
    timer: 60,
    totalQuestions: 0,
    testTution: 'free',
    passages: [emptyPassage(1)],
  };
}

export function emptyWritingData() {
  return {
    id: '',
    title: '',
    timer: 60,
    testTution: 'free',
    tasks: [emptyTask(1), emptyTask(2)],
  };
}

export function emptyFullMockData() {
  return {
    id: '',
    title: '',
    testFormat: 'full_mock',
    testType: 'authentic_material',
    level: 'medium',
    center: '',
    sections: {
      listening: {
        title: 'Listening',
        testFormat: 'full_test',
        timer: 40,
        totalQuestions: 0,
        audio: '',
        parts: [emptyPart(1)],
      },
      reading: {
        title: 'Reading',
        testFormat: 'full_test',
        timer: 60,
        totalQuestions: 0,
        passages: [emptyPassage(1)],
      },
      writing: {
        title: 'Writing',
        testFormat: 'full_test',
        timer: 60,
        tasks: [emptyTask(1), emptyTask(2)],
      },
    },
  };
}

export function emptyDataForType(type) {
  switch (type) {
    case 'listening': return emptyListeningData();
    case 'reading': return emptyReadingData();
    case 'writing': return emptyWritingData();
    case 'full_mock': return emptyFullMockData();
    default: return {};
  }
}

export function emptyPart(partNumber) {
  return {
    partNumber,
    questionRange: '',
    image: null,
    questionGroups: [],
  };
}

export function emptyPassage(passageNumber) {
  return {
    passageNumber,
    title: '',
    image: null,
    content: '',
    questionGroups: [],
  };
}

export function emptyTask(taskNumber) {
  return {
    taskNumber,
    title: `Writing Task ${taskNumber}`,
    content: '',
    image: null,
  };
}

export function emptyGroup(groupType) {
  return {
    groupType,
    instruction: '',
    questions: [],
  };
}

export function emptyQuestion() {
  return {
    number: -1, // -1 = "renumber() raqam bersin"; 0/yo'q = jadval header qatori
    question: '',
    answer: '',
    alternativeAnswers: [],
  };
}
