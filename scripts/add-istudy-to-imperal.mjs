/**
 * iStudy barcha full mock testlarini Imperal Hubga ko'chiradi
 * - Mavjud bo'lsa skip qiladi
 * - center_id = Imperal Hub ID
 * - test_id = imperal-full-mock-N (N = 3 dan boshlanadi, 1 va 2 allaqachon bor)
 */

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
  console.log('🚀 iStudy full mock testlarini Imperal Hubga qo\'shish...\n');

  // 1) Imperal Hub markazini topamiz
  const { data: centers, error: centersErr } = await supabase
    .from('centers').select('id, name, slug');
  
  if (centersErr) {
    console.error('❌ Markazlarni olishda xato:', centersErr.message);
    return;
  }

  const imperialHub = (centers || []).find(c => 
    c.slug?.toLowerCase().includes('imperal') || 
    c.name?.toLowerCase().includes('imperal')
  );
  
  if (!imperialHub) {
    console.error('❌ Imperal Hub topilmadi! Avval Admin panelda "Imperal" markazini yarating.');
    return;
  }
  
  console.log(`✅ Imperal Hub topildi: "${imperialHub.name}" (id: ${imperialHub.id})\n`);

  // 2) Imperal Hubda allaqachon mavjud testlarni olamiz
  const { data: existingImperalTests } = await supabase
    .from('Tests')
    .select('id, test_id, data')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock');
  
  const existingImperalCount = (existingImperalTests || []).length;
  const existingSourceIds = new Set(
    (existingImperalTests || [])
      .map(t => t.data?.sourceTestId)
      .filter(Boolean)
  );

  console.log(`📋 Imperal Hubda mavjud testlar soni: ${existingImperalCount}`);
  (existingImperalTests || []).forEach(t => {
    console.log(`   - ${t.test_id}: ${t.data?.title} (source: ${t.data?.sourceTestId || 'yo\'q'})`);
  });
  console.log();

  // 3) iStudy testlarini DB dan olamiz (barcha variantlari)
  const { data: istudyTests, error: istudyErr } = await supabase
    .from('Tests')
    .select('id, test_id, data, center_id')
    .eq('type', 'full_mock')
    .or('test_id.ilike.istudy%,test_id.ilike.iStudy%,test_id.ilike.istudymock%,test_id.ilike.IstudyFullmock%')
    .order('created_at', { ascending: true });
  
  if (istudyErr) {
    console.error('❌ iStudy testlarni olishda xato:', istudyErr.message);
    return;
  }

  console.log(`📚 iStudy testlari DB da: ${(istudyTests || []).length} ta\n`);

  // 4) Qo'shilmagan testlarni aniqlash va qo'shish
  let counter = existingImperalCount + 1;
  let addedCount = 0;
  let skippedCount = 0;

  for (const ist of (istudyTests || [])) {
    // Allaqachon imperal hubga qo'shilganmi?
    if (existingSourceIds.has(ist.test_id) || existingSourceIds.has(ist.id)) {
      console.log(`⏭️  Skip: "${ist.data?.title}" (allaqachon qo'shilgan)`);
      skippedCount++;
      continue;
    }

    const newTestId = `imperal-full-mock-${counter}`;
    const newTitle = `Imperal Full Mock Test ${counter}`;

    // Testning data'sini ko'chiramiz va imperal uchun o'zgartirish kiritamiz
    const newData = {
      ...ist.data,
      id: newTestId,
      title: newTitle,
      center: 'imperal',
      sourceTestId: ist.test_id,   // iStudy original test_id ni saqlaymiz
      sourceCenter: 'istudy',
    };

    console.log(`➕ Qo'shilmoqda: "${ist.data?.title}" -> "${newTitle}" (${newTestId})`);

    // DB da mavjudligini tekshiramiz
    const { data: existing } = await supabase
      .from('Tests')
      .select('id')
      .eq('test_id', newTestId)
      .maybeSingle();

    if (existing) {
      console.log(`   ⚠️  ${newTestId} allaqachon mavjud, update qilinmoqda...`);
      const { error: updateErr } = await supabase
        .from('Tests')
        .update({ data: newData, center_id: imperialHub.id })
        .eq('test_id', newTestId);
      if (updateErr) {
        console.error(`   ❌ Update xatosi: ${updateErr.message}`);
      } else {
        console.log(`   ✅ Yangilandi`);
        addedCount++;
      }
    } else {
      const { error: insertErr } = await supabase
        .from('Tests')
        .insert({
          test_id: newTestId,
          type: 'full_mock',
          center_id: imperialHub.id,
          data: newData,
        });

      if (insertErr) {
        console.error(`   ❌ Insert xatosi: ${insertErr.message}`);
      } else {
        // center_id trigger orqali o'rnatilganini tekshiramiz
        const { data: row } = await supabase
          .from('Tests')
          .select('center_id')
          .eq('test_id', newTestId)
          .maybeSingle();
        
        if (row?.center_id) {
          console.log(`   ✅ Qo'shildi va center_id bog'landi: ${row.center_id}`);
        } else {
          // Qo'lda center_id o'rnatamiz
          await supabase
            .from('Tests')
            .update({ center_id: imperialHub.id })
            .eq('test_id', newTestId);
          console.log(`   ✅ Qo'shildi (center_id qo'lda o'rnatildi)`);
        }
        addedCount++;
      }
    }

    counter++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Tugadi!`);
  console.log(`   Qo'shildi: ${addedCount} ta`);
  console.log(`   Skip qilindi: ${skippedCount} ta`);
  console.log(`\nImperal Hubda endi jami: ${existingImperalCount + addedCount} ta full mock test mavjud.`);
  
  // Final tekshirish
  console.log('\n📊 Final: Imperal Hubdagi barcha testlar:');
  const { data: finalTests } = await supabase
    .from('Tests')
    .select('test_id, data')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock')
    .order('created_at', { ascending: true });
  
  (finalTests || []).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.test_id}: ${t.data?.title}`);
  });
}

run().catch(console.error);

