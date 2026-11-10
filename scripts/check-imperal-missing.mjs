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
  // 1) Imperal Hub markazini topamiz
  const { data: centers } = await supabase
    .from('centers').select('id, name, slug');
  
  const imperialHub = (centers || []).find(c => 
    c.slug?.toLowerCase().includes('imperal') || 
    c.name?.toLowerCase().includes('imperal')
  );
  
  console.log('Imperal Hub:', JSON.stringify(imperialHub, null, 2));

  if (!imperialHub) {
    console.log('❌ Imperal Hub topilmadi!');
    return;
  }

  // 2) Imperal Hubda mavjud testlarni ko'ramiz
  const { data: imperialTests } = await supabase
    .from('Tests')
    .select('id, test_id, data')
    .eq('center_id', imperialHub.id)
    .eq('type', 'full_mock');
  
  console.log('\nImperal Hubdagi mavjud testlar:');
  (imperialTests || []).forEach(t => {
    console.log(`  - ${t.test_id}: ${t.data?.title}`);
  });

  // 3) iStudy testlarini DB dan olamiz
  const { data: istudyTests } = await supabase
    .from('Tests')
    .select('id, test_id, data, center_id')
    .eq('type', 'full_mock')
    .or('test_id.ilike.istudy%,test_id.ilike.iStudy%,test_id.ilike.istudymock%,test_id.ilike.IstudyFullmock%')
    .order('created_at', { ascending: true });
  
  console.log('\niStudy testlari DB da:');
  (istudyTests || []).forEach(t => {
    console.log(`  - ${t.test_id}: ${t.data?.title}`);
  });

  const existingImperalIds = new Set((imperialTests || []).map(t => t.test_id));
  const existingImperalCount = (imperialTests || []).length;

  console.log('\n--- Qo\'shilishi kerak bo\'lgan testlar ---');
  let counter = existingImperalCount + 1;
  
  for (const ist of (istudyTests || [])) {
    const newTestId = `imperal-full-mock-${counter}`;
    
    // Agar bu istudy test uchun imperal test allaqachon yaratilgan bo'lsa, skip
    // (istudy source ID ni tekshirish uchun data.sourceId ni ishlatamiz)
    const alreadyExists = (imperialTests || []).find(t => 
      t.data?.sourceTestId === ist.test_id || 
      t.data?.sourceTestId === ist.id
    );
    
    if (alreadyExists) {
      console.log(`  ⏭️  Skip: ${ist.test_id} -> allaqachon ${alreadyExists.test_id} sifatida bor`);
      continue;
    }

    console.log(`  ➕ Qo'shiladi: ${ist.test_id} (${ist.data?.title}) -> ${newTestId} (Imperal Full Mock Test ${counter})`);
    counter++;
  }
}

run().catch(console.error);

