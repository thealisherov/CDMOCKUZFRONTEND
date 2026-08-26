import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
const envPath = path.resolve(__dirname, "../.env.local");
let supabaseUrl = "";
let serviceRoleKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NEXT_PUBLIC_SUPABASE_URL=")) {
      supabaseUrl = trimmed.replace("NEXT_PUBLIC_SUPABASE_URL=", "").trim();
    } else if (trimmed.startsWith("SUPABASE_SERVICE_ROLE_KEY=")) {
      serviceRoleKey = trimmed.replace("SUPABASE_SERVICE_ROLE_KEY=", "").trim();
    }
  }
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local!");
  process.exit(1);
}

console.log("Connecting to Supabase at:", supabaseUrl);
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const articlesJsonPath = path.resolve(__dirname, "../src/data/articles.json");
if (!fs.existsSync(articlesJsonPath)) {
  console.error("articles.json not found at:", articlesJsonPath);
  process.exit(1);
}

const rawArticles = JSON.parse(fs.readFileSync(articlesJsonPath, "utf-8"));
console.log(`Loaded ${rawArticles.length} articles from articles.json`);

async function uploadArticles() {
  const batchSize = 25;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rawArticles.length; i += batchSize) {
    const batch = rawArticles.slice(i, i + batchSize).map((art) => ({
      order_index: art.order_index,
      slug: art.slug,
      title: art.title,
      category: art.category || "Society",
      level: art.level || "B2 (IELTS 6.5+)",
      read_time: art.read_time || "5 min read",
      is_free: !!art.is_free,
      image_url: art.image_url || null,
      excerpt: art.excerpt || "",
      content: art.content || "",
      vocabulary: art.vocabulary || [],
      exercises: art.exercises || [],
      source: art.source || null,
      updated_at: new Date().toISOString()
    }));

    console.log(`Uploading batch ${Math.floor(i / batchSize) + 1} (${batch.length} articles)...`);

    const { data, error } = await supabase
      .from("articles")
      .upsert(batch, { onConflict: "slug" })
      .select("id, slug, title");

    if (error) {
      console.error(`Error uploading batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      console.log(`  Batch ${Math.floor(i / batchSize) + 1} uploaded successfully (${data?.length || batch.length} records)`);
      successCount += (data?.length || batch.length);
    }
  }

  console.log("\n==========================================");
  console.log(`Upload finished!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors:  ${errorCount}`);
  console.log("==========================================");
}

uploadArticles().catch(console.error);
