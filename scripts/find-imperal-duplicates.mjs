/**
 * Imperal Hubdagi dublikat testlarni aniqlaydi va o'chiradi
 * - imperal-full-mock-1 va -2 originallar - ularni saqlaymiz
 * - Yangi qo'shilgan (sourceTestId bor) testlardan dublikatlarni topamiz
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

async function run() {
  // 1) Imperal Hub topamiz
  const { data: centers } = await supabase.from('centers').select('id, name, slug');
  const imperialHub = (centers || []).find(c => c.slug?.toLowerCase().includes('imperal') || c.name?.toLowerCase().includes('imperal'));
  
  if (!imperialHub) { console.error('❌ Imperal Hub topilmadi!'); return; }
  console.log(`✅ Imperal Hub: "${imperialHub.name}" (${imperialHub.id})\n`);

  // 2) Barcha Imperal testlarni olamiz
  const { data: allTests } = await supabase
    .from('Tests')
    .select('id, test_id, data, created_at')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock')
    .order('created_at', { ascending: true });

  console.log('=== Imperal Hubdagi barcha testlar ===');
  (allTests || []).forEach((t, i) => {
    const src = t.data?.sourceTestId || '—';
    const srcCenter = t.data?.sourceCenter || '—';
    console.log(`${i+1}. ${t.test_id}`);
    console.log(`   title: ${t.data?.title}`);
    console.log(`   source: ${src} (${srcCenter})`);
    console.log(`   created_at: ${t.created_at}`);
    console.log();
  });

  // 3) Original 2 testni topamiz (sourceTestId yo'q = original)
  const originals = (allTests || []).filter(t => !t.data?.sourceTestId);
  const copies = (allTests || []).filter(t => !!t.data?.sourceTestId);

  console.log(`📌 Originallar (sourceTestId yo'q): ${originals.length} ta`);
  originals.forEach(t => console.log(`   - ${t.test_id}: ${t.data?.title}`));

  console.log(`\n📋 Nusxalar (sourceTestId bor): ${copies.length} ta`);
  copies.forEach(t => console.log(`   - ${t.test_id}: ${t.data?.title} (source: ${t.data?.sourceTestId})`));

  // 4) Original testlarning mazmunini ko'rib dublikat nusxalarni topamiz
  // iStudy testlarini DB dan olamiz
  const { data: istudyTests } = await supabase
    .from('Tests')
    .select('id, test_id, data')
    .eq('type', 'full_mock')
    .or('test_id.ilike.istudy%,test_id.ilike.iStudy%,test_id.ilike.istudymock%,test_id.ilike.IstudyFullmock%');

  console.log('\n=== Original testlar bilan taqqoslash ===');

  const toDelete = [];

  for (const orig of originals) {
    // Original testning audio yoki biror unikal maydoni bilan nusxani topamiz
    const origAudio = orig.data?.sections?.listening?.audio;
    const origTitle = orig.data?.title;

    console.log(`\nOriginal: ${orig.test_id} - "${origTitle}"`);
    console.log(`  Listening audio: ${origAudio ? origAudio.substring(0, 60) + '...' : 'yo\'q'}`);

    // Bu original bilan mos keladigan nusxani topamiz
    for (const copy of copies) {
      const copySource = copy.data?.sourceTestId;
      // Nusxaning source iStudy testini topamiz
      const sourceIst = (istudyTests || []).find(ist => ist.test_id === copySource || ist.id === copySource);
      
      if (sourceIst) {
        const srcAudio = sourceIst.data?.sections?.listening?.audio;
        if (origAudio && srcAudio && origAudio === srcAudio) {
          console.log(`  🔴 DUBLIKAT topildi: ${copy.test_id} (source: ${copySource})`);
          console.log(`     Source audio: ${srcAudio ? srcAudio.substring(0, 60) + '...' : 'yo\'q'}`);
          toDelete.push(copy);
        }
      }
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`O'chirilishi kerak: ${toDelete.length} ta test`);
  toDelete.forEach(t => console.log(`  - ${t.test_id}: ${t.data?.title}`));
}

run().catch(console.error);

