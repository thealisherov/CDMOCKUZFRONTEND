const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('tests_dump.json', 'utf8'));
  const types = new Set();
  
  data.forEach(t => {
    if (!t.data) return;
    const blocks = t.data.parts || t.data.passages || [];
    blocks.forEach(b => {
      (b.questionGroups || []).forEach(g => {
        if (g.groupType) types.add(g.groupType);
        if (JSON.stringify(g.questions).includes('<table')) {
           console.log('Found <table> in questions string, test ID:', t.id);
        }
      });
    });
  });

  console.log('Group Types:', Array.from(types));
} catch (e) {
  console.error(e);
}
