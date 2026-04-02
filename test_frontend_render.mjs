import adaptListeningData from './src/utils/listeningDataAdapter.js';
import sanitizeTestData from './src/utils/sanitizeTestData.js';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFrontend() {
  const { data, error } = await supabase
    .from('Tests')
    .select('*')
    .eq('test_id', 'north-star-camping-equipment-customer-order')
    .single();

  if (error || !data) {
     writeFileSync('out.txt', 'DB_ERROR: ' + JSON.stringify(error));
     return;
  }
  
  try {
     const safeData = sanitizeTestData(data.data);
     const adapted = adaptListeningData(safeData);
     writeFileSync('out.txt', 'SUCCESS\n' + JSON.stringify(adapted, null, 2).slice(0, 500));
  } catch (err) {
     writeFileSync('out.txt', 'LOAD_FORMAT_ERROR\n' + err.stack);
  }
}

testFrontend();
