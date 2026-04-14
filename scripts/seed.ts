/**
 * Seed script: Migrate articles.json data into Supabase
 *
 * Usage: npx tsx scripts/seed.ts
 *
 * Prerequisites:
 * 1. Run scripts/schema.sql in Supabase SQL Editor first
 * 2. Create an admin user in Supabase Authentication dashboard
 * 3. Update their profile role to 'admin' via SQL:
 *    UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://bilwpdjetzgujgmlkujc.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Map old categories to new crypto categories
const CATEGORY_MAP: Record<string, string> = {
  "عام": "تعليم",
  "تقنية": "تحليل فني",
  "تطوير ذاتي": "تعليم",
  "ثقافة": "أخبار السوق",
  "صحة": "تعليم",
  "سفر": "تعليم",
  "أعمال": "تداول",
  "فن": "NFT",
};

async function seed() {
  const dataFile = path.join(process.cwd(), "data", "articles.json");

  if (!fs.existsSync(dataFile)) {
    console.log("No articles.json found, nothing to seed.");
    return;
  }

  const raw = fs.readFileSync(dataFile, "utf-8");
  const articles = JSON.parse(raw);

  console.log(`Found ${articles.length} articles to migrate...`);

  for (const article of articles) {
    const row = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      category: CATEGORY_MAP[article.category] || "تعليم",
      tags: article.tags || [],
      author_name: article.author || "مجهول",
      cover_image: article.coverImage || "",
      featured: article.featured || false,
      published_at: article.publishedAt || new Date().toISOString(),
    };

    const { error } = await supabase.from("articles").insert(row);

    if (error) {
      if (error.code === "23505") {
        console.log(`  Skipped (duplicate slug): ${article.title}`);
      } else {
        console.error(`  Error inserting "${article.title}":`, error.message);
      }
    } else {
      console.log(`  Inserted: ${article.title}`);
    }
  }

  console.log("\nSeed complete!");
  console.log("\nNext steps:");
  console.log("1. Create an admin user in Supabase Auth dashboard");
  console.log("2. Set their role to admin:");
  console.log("   UPDATE profiles SET role = 'admin' WHERE id = '<user-id>';");
}

seed().catch(console.error);
