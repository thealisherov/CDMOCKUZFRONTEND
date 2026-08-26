import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local
const envPath = join(__dirname, '..', '.env.local');
const env = {};
if (existsSync(envPath)) {
  readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val.length) env[key.trim()] = val.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase URL or Key missing in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedArticles() {
  const jsonPath = join(__dirname, '..', 'src', 'data', 'articles.json');
  if (!existsSync(jsonPath)) {
    console.error(`❌ articles.json not found at ${jsonPath}`);
    process.exit(1);
  }

  const articles = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`📦 Loaded ${articles.length} articles from JSON.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  for (const art of articles) {
    const payload = {
      order_index: art.order_index,
      slug: art.slug,
      title: art.title,
      category: art.category,
      level: art.level,
      read_time: art.read_time,
      is_free: art.is_free,
      image_url: art.image_url,
      excerpt: art.excerpt,
      content: art.content,
      vocabulary: art.vocabulary,
      exercises: art.exercises,
      source: art.source,
      updated_at: new Date().toISOString()
    };

    // Check if article with this slug exists
    const { data: existing, error: findErr } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', art.slug)
      .maybeSingle();

    if (findErr) {
      console.error(`❌ Error finding article ${art.slug}:`, findErr.message);
      errorCount++;
      continue;
    }

    if (existing) {
      const { error: updErr } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', existing.id);

      if (updErr) {
        console.error(`❌ Error updating ${art.slug}:`, updErr.message);
        errorCount++;
      } else {
        updatedCount++;
      }
    } else {
      const { error: insErr } = await supabase
        .from('articles')
        .insert(payload);

      if (insErr) {
        console.error(`❌ Error inserting ${art.slug}:`, insErr.message);
        errorCount++;
      } else {
        insertedCount++;
      }
    }
  }

  console.log(`\n==========================================`);
  console.log(`🎉 Seeding Completed!`);
  console.log(`   ➕ Inserted: ${insertedCount}`);
  console.log(`   🔄 Updated:  ${updatedCount}`);
  console.log(`   ❌ Errors:   ${errorCount}`);
  console.log(`==========================================`);
}

seedArticles();
