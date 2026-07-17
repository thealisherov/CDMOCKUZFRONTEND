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

// Full mock JSON ni fayldan o'qiymiz
const jsonPath = join(__dirname, '..', 'testlar', 'full_mock_istudy_1.json');
const testData = JSON.parse(readFileSync(jsonPath, 'utf-8'));

const TEST_ID = testData.id;          // "istudy-full-mock-1"
const CENTER_SLUG = testData.center;  // "istudy"

async function run() {
  // 1) Markaz mavjudligini tekshiramiz (trigger center_id ni shu slug orqali to'ldiradi)
  const { data: center } = await supabase
    .from('centers').select('id, name').eq('slug', CENTER_SLUG).maybeSingle();

  if (!center) {
    console.log(`⚠️  DIQQAT: slug="${CENTER_SLUG}" markaz topilmadi.`);
    console.log(`   Avval Admin Panel → Centers dan "${CENTER_SLUG}" markazini yarating, keyin bu scriptni qayta ishga tushiring.`);
    console.log(`   (Aks holda test yuklanadi, lekin center_id NULL bo'lib, markazda ko'rinmaydi.)`);
  } else {
    console.log(`✔️  Markaz topildi: ${center.name} (${CENTER_SLUG})`);
  }

  // 2) Insert yoki update
  const { data: existing } = await supabase
    .from('Tests').select('id').eq('test_id', TEST_ID).maybeSingle();

  let err;
  if (existing) {
    ({ error: err } = await supabase.from('Tests')
      .update({ data: testData, type: 'full_mock' }).eq('test_id', TEST_ID));
    console.log(err ? `❌ ${err.message}` : `✅ Yangilandi: ${testData.title}`);
  } else {
    ({ error: err } = await supabase.from('Tests')
      .insert({ test_id: TEST_ID, type: 'full_mock', data: testData }));
    console.log(err ? `❌ ${err.message}` : `✅ Qo'shildi: ${testData.title}`);
  }
  if (err) return;

  // 3) center_id to'g'ri o'rnatilganini tasdiqlaymiz
  const { data: row } = await supabase
    .from('Tests').select('center_id').eq('test_id', TEST_ID).maybeSingle();
  if (row?.center_id) {
    console.log(`✅ center_id o'rnatildi: ${row.center_id} — test "${CENTER_SLUG}" markazida ko'rinadi.`);
  } else {
    console.log(`⚠️  center_id NULL — test markazda ko'rinmaydi. Markazni yaratib, scriptni qayta ishga tushiring.`);
  }
}

run();
