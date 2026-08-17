import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      env[key] = val;
    }
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const jsonPath = path.resolve(__dirname, '../typing_texts_30.json');
const TYPING_TEXTS = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

async function seed() {
  console.log(`Starting to seed ${TYPING_TEXTS.length} English typing texts...`);

  // Check if table exists
  const { data: existing, error: checkError } = await supabase
    .from('typing_texts')
    .select('id, title')
    .limit(5);

  if (checkError) {
    console.error('Error querying typing_texts table:', checkError.message);
    if (checkError.code === '42P01') {
      console.log('\n[INFO]: Table typing_texts does not exist yet in Supabase. Please copy and execute supabase_typing.sql in your Supabase SQL Editor.');
    }
    process.exit(1);
  }

  console.log('typing_texts table exists. Inserting texts...');

  const formatted = TYPING_TEXTS.map(t => ({
    title: t.title,
    content: t.content,
    language: 'en',
    category: t.category,
    difficulty: t.difficulty,
    word_count: t.content.trim().split(/\s+/).filter(Boolean).length,
    is_active: true
  }));

  const { data, error } = await supabase
    .from('typing_texts')
    .insert(formatted)
    .select();

  if (error) {
    console.error('Error inserting typing texts:', error.message);
    process.exit(1);
  }

  console.log(`\n[SUCCESS]: Successfully inserted ${data.length} typing texts into Supabase!`);
}

seed().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
