import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import adaptListeningData from '../src/utils/listeningDataAdapter.js';
import adaptReadingData from '../src/utils/readingDataAdapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(__dirname, '..', 'testlar', 'full_mock_istudy_4.json');
const mock4Data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

console.log('--- 1. Testing Structure ---');
console.log('ID:', mock4Data.id);
console.log('Title:', mock4Data.title);
console.log('Center:', mock4Data.center);
console.log('Sections:', Object.keys(mock4Data.sections));

console.log('\n--- 2. Testing Listening Adapter ---');
try {
  const adaptedListening = adaptListeningData(mock4Data.sections.listening);
  console.log(`✅ Listening adapter succeeded! Sections: ${adaptedListening?.sections?.length}, Total questions: ${adaptedListening?.totalQuestions}`);
  
  // Count questions in adapted
  let qCount = 0;
  adaptedListening.sections.forEach((sec, idx) => {
    if (sec.type === 'gap_fill') {
      const blanks = Object.keys(sec.answers || {}).length;
      qCount += blanks;
      console.log(`  Section ${idx + 1} (${sec.type}): ${blanks} questions (keys: ${Object.keys(sec.answers).join(', ')})`);
    } else if (sec.type === 'true_false' || sec.type === 'matrix_match' || sec.type === 'matching') {
      const count = sec.questions?.length || 0;
      qCount += count;
      console.log(`  Section ${idx + 1} (${sec.type}): ${count} questions (ids: ${sec.questions?.map(q => q.id).join(', ')})`);
    }
  });
  console.log(`Total listening questions adapted: ${qCount}`);
} catch (err) {
  console.error('❌ Listening adapter error:', err);
}

console.log('\n--- 3. Testing Reading Adapter ---');
try {
  const adaptedReading = adaptReadingData(mock4Data.sections.reading);
  console.log(`✅ Reading adapter succeeded! Passages: ${adaptedReading?.passages?.length}, Total questions: ${adaptedReading?.totalQuestions}`);
  
  let qCount = 0;
  adaptedReading.passages.forEach((p, pidx) => {
    console.log(`  Passage ${pidx + 1}: "${p.title}" (${p.questions?.length} question blocks)`);
    p.questions.forEach((sec, sidx) => {
      if (sec.type === 'gap_fill') {
        const blanks = Object.keys(sec.answers || {}).length;
        qCount += blanks;
        console.log(`    Block ${sidx + 1} (${sec.type}): ${blanks} questions (keys: ${Object.keys(sec.answers).join(', ')})`);
      } else {
        const count = sec.questions?.length || 0;
        qCount += count;
        console.log(`    Block ${sidx + 1} (${sec.type}): ${count} questions (ids: ${sec.questions?.map(q => q.id).join(', ')})`);
      }
    });
  });
  console.log(`Total reading questions adapted: ${qCount}`);
} catch (err) {
  console.error('❌ Reading adapter error:', err);
}

console.log('\n--- 4. Checking Writing Tasks ---');
console.log(`Writing Tasks: ${mock4Data.sections.writing.tasks.length}`);
mock4Data.sections.writing.tasks.forEach(t => {
  console.log(`  Task ${t.taskNumber}: "${t.title}", Image: ${t.image ? t.image : 'none'}`);
});
