import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
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

async function checkRouteLogic() {
  const { data: rows, error } = await supabase
    .from('Tests')
    .select('id, test_id, type, data, created_at')
    .eq('type', 'listening')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error("DB Error:", error);
    return;
  }
  
  const testList = (rows || []).map((row, index) => {
      const d = row.data || {}
      const numericId = index + 1;
      return {
        id: numericId,                                
        test_id: row.test_id,                         
        title: d.title || `Test ${index + 1}`,
        testType: d.testFormat || d.testType || 'full_test',
        access: (d.testTution === 'paid' || d.access === 'paid') ? 'premium' : (d.testTution || d.access || 'free'),
      }
  });

  console.log(`Found ${testList.length} listening tests.`);
  console.log("Last 5 tests:");
  console.log(testList.slice(-5));
  
  const target = testList.find(t => t.test_id.includes('north') || t.test_id.includes('North'));
  console.log("\nTarget test in API logic:", target);
}

checkRouteLogic();
