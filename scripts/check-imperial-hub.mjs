import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// .env.local ni o'qish
const envPath = join(__dirname, '..', '.env.local');
const env = {};
readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val.length) env[key.trim()] = val.join('=').trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // 1) Barcha markazlarni ko'rsatamiz
  const { data: centers, error: centersErr } = await supabase
    .from('centers').select('id, name, slug').order('name');
  
  console.log('Centers Error:', centersErr);
  console.log('Centers:', JSON.stringify(centers, null, 2));

  // 2) imperial hub ni topamiz (slug yoki name orqali)
  const imperialHub = (centers || []).find(c => 
    c.slug?.toLowerCase().includes('imperial') || 
    c.name?.toLowerCase().includes('imperial')
  );
  
  console.log('\nImperial Hub:', JSON.stringify(imperialHub, null, 2));

  // 3) Supabasedagi barcha full_mock testlarini ko'ramiz
  const { data: tests, error: testsErr } = await supabase
    .from('Tests')
    .select('id, test_id, type, center_id, created_at, data')
    .eq('type', 'full_mock')
    .order('created_at', { ascending: true });

  console.log('\nTests Error:', testsErr);
  console.log('\nFull Mock Tests in DB:');
  (tests || []).forEach(t => {
    console.log(`  - test_id: ${t.test_id}, center_id: ${t.center_id}, title: ${t.data?.title}`);
  });

  // 4) istudy full mock testlarni ko'rsatamiz
  const istudyTests = (tests || []).filter(t => t.test_id?.includes('istudy'));
  console.log('\niStudy tests in DB:', istudyTests.map(t => t.test_id));

  // 5) imperial hub testlarini ko'ramiz
  if (imperialHub) {
    const imperialTests = (tests || []).filter(t => t.center_id === imperialHub.id);
    console.log('\nImperial Hub tests:', imperialTests.map(t => t.test_id));
  }
}

run().catch(console.error);

