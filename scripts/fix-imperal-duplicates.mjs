/**
 * Imperal Hubdan dublikat testlarni o'chiradi:
 * - imperal-full-mock-3 (= imperal-full-mock-1 ning dublikati)
 * - imperal-full-mock-4 (= imperal-full-mock-2 ning dublikati)
 * Keyin qolgan testlarni 3,4,5... deb qayta raqamlaydi
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const DUPLICATES_TO_DELETE = ['imperal-full-mock-3', 'imperal-full-mock-4'];

async function run() {
  // 1) Imperal Hub topamiz
  const { data: centers } = await supabase.from('centers').select('id, name, slug');
  const imperialHub = (centers || []).find(c =>
    c.slug?.toLowerCase().includes('imperal') || c.name?.toLowerCase().includes('imperal')
  );

  if (!imperialHub) { console.error('❌ Imperal Hub topilmadi!'); return; }
  console.log(`✅ Imperal Hub: "${imperialHub.name}"\n`);

  // 2) Dublikatlarni o'chiramiz
  console.log('🗑️  Dublikatlarni o\'chirish...');
  for (const tid of DUPLICATES_TO_DELETE) {
    const { error } = await supabase
      .from('Tests')
      .delete()
      .eq('test_id', tid)
      .eq('center_id', imperialHub.id);

    if (error) {
      console.error(`❌ ${tid} o'chirishda xato: ${error.message}`);
    } else {
      console.log(`✅ O'chirildi: ${tid}`);
    }
  }

  // 3) O'chirishdan keyin qolgan testlarni olamiz (created_at bo'yicha tartibda)
  const { data: remaining } = await supabase
    .from('Tests')
    .select('id, test_id, data, created_at')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock')
    .order('created_at', { ascending: true });

  console.log(`\n📋 Qolgan testlar: ${(remaining || []).length} ta`);
  console.log('\nQayta raqamlash...');

  // 4) Nusxa testlarni (sourceTestId bor) qayta raqamlaymiz
  // Original 2 ta o'z nomida qoladi (imperal-full-mock-1, -2)
  // Nusxalar: 5 -> 3, 6 -> 4, 7 -> 5, ... 13 -> 11
  const originals = (remaining || []).filter(t => !t.data?.sourceTestId);
  const copies = (remaining || []).filter(t => !!t.data?.sourceTestId);

  console.log(`  Originallar (o'zgarishsiz): ${originals.length} ta`);
  originals.forEach(t => console.log(`    - ${t.test_id}: ${t.data?.title}`));

  console.log(`  Nusxalar (qayta raqamlanadi): ${copies.length} ta`);

  let newNum = originals.length + 1; // 3 dan boshlanadi

  for (const copy of copies) {
    const oldTestId = copy.test_id;
    const newTestId = `imperal-full-mock-${newNum}`;
    const newTitle = `Imperal Full Mock Test ${newNum}`;

    if (oldTestId === newTestId) {
      console.log(`  ✓ ${oldTestId} - raqam o'zgarmaydi (${newTitle})`);
      newNum++;
      continue;
    }

    // Yangi test_id va title bilan update
    const newData = { ...copy.data, id: newTestId, title: newTitle };
    const { error } = await supabase
      .from('Tests')
      .update({ test_id: newTestId, data: newData })
      .eq('id', copy.id);

    if (error) {
      console.error(`  ❌ ${oldTestId} -> ${newTestId} yangilashda xato: ${error.message}`);
    } else {
      console.log(`  ✅ ${oldTestId} -> ${newTestId} (${newTitle})`);
    }
    newNum++;
  }

  // 5) Final natija
  console.log('\n📊 Final: Imperal Hubdagi barcha testlar:');
  const { data: finalTests } = await supabase
    .from('Tests')
    .select('test_id, data, created_at')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock')
    .order('created_at', { ascending: true });

  (finalTests || []).forEach((t, i) => {
    const src = t.data?.sourceTestId ? ` (source: ${t.data.sourceTestId})` : ' (original)';
    console.log(`  ${i + 1}. ${t.test_id}: ${t.data?.title}${src}`);
  });

  console.log(`\n✅ Jami ${(finalTests || []).length} ta test Imperal Hubda.`);
}

run().catch(console.error);

