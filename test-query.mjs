import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) {
    let value = val.join('=').trim().replace(/\\r/g, '');
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key.trim()] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data } = await supabase.from('Tests').select('id, type, data').eq('type', 'reading');
  data.forEach(r => {
    if(r.data && r.data.title && r.data.title.includes('William Gilbert')) {
      console.log(JSON.stringify({ 
        title: r.data.title, 
        passagesType: typeof r.data.passages,
        isArray: Array.isArray(r.data.passages),
        passagesLength: r.data.passages ? r.data.passages.length : 'no passages', 
        testType: r.data.testType, 
        testFormat: r.data.testFormat, 
        questionsCount: r.data.totalQuestions 
      }, null, 2));
    }
  });
}
run();
