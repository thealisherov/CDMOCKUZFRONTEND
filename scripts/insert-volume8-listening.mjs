import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
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

// ODDIY PLATFORMA testlari (center_id YO'Q). Volume 6/8 bilan bir xil konventsiya:
// type='listening', test_id="Listening Volume 8.N", data.id="Volume Listening 8_N".
const TESTS = [1, 2, 3, 4, 5, 6]
  .map((n) => ({ n, jsonPath: join(__dirname, '..', 'testlar', `volume8-listening-test-${n}.json`) }))
  .filter(({ jsonPath }) => existsSync(jsonPath))
  .map(({ n, jsonPath }) => ({
    testId: `Listening Volume 8.${n}`,
    data: JSON.parse(readFileSync(jsonPath, 'utf-8')),
  }));

async function run() {
  for (const { testId, data } of TESTS) {
    const { data: existing } = await supabase
      .from('Tests').select('id').eq('test_id', testId).maybeSingle();

    let err;
    if (existing) {
      ({ error: err } = await supabase.from('Tests')
        .update({ data, type: 'listening' }).eq('test_id', testId));
      console.log(err ? `❌ ${testId}: ${err.message}` : `✅ Yangilandi: ${testId} — ${data.title}`);
    } else {
      ({ error: err } = await supabase.from('Tests')
        .insert({ test_id: testId, type: 'listening', data }));
      console.log(err ? `❌ ${testId}: ${err.message}` : `✅ Qo'shildi: ${testId} — ${data.title}`);
    }
  }
}

run();
