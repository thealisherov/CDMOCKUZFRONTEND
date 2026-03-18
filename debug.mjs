import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

import { sanitizeTestData } from './src/utils/sanitizeTestData.js';
import { adaptReadingData } from './src/utils/readingDataAdapter.js';

async function run() {
  const { data, error } = await supabase.from('Tests').select('*').eq('type', 'reading');
  if (error) { console.error(error); return; }
  
  if (!data || data.length === 0) { console.log("No data"); return; }
  
  const rawData = data[0].data;
  console.log("Got raw data with", rawData.passages ? rawData.passages.length : 0, "passages");
  
  try {
    const safeData = sanitizeTestData(rawData);
    console.log("sanitizeTestData passed");
    const adapted = adaptReadingData(safeData);
    console.log("adaptReadingData passed");
  } catch (e) {
    console.error("ERROR!!", e);
  }
}
run();
