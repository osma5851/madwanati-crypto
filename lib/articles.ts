import { createClient } from "./supabase/server";
import { Article, ArticleInput } from "./types";

// Map database row to Article interface
function mapRow(row: Record<string, unknown>): Article {
  return {
    id: row.id as string,
    title: row.title as string,
    title_en: (row.title_en as string) || undefined,
    slug: row.slug as string,
    excerpt: (row.excerpt as string) || "",
    excerpt_en: (row.excerpt_en as string) || undefined,
    content: row.content as string,
    content_en: (row.content_en as string) || undefined,
    category: row.category as string,
    tags: (row.tags as string[]) || [],
    author_id: (row.author_id as string) || undefined,
    author_name: (row.author_name as string) || "مجهول",
    publishedAt: row.published_at as string,
    coverImage: (row.cover_image as string) || "",
    featured: (row.featured as boolean) || false,
    crypto_symbols: (row.crypto_symbols as string[]) || undefined,
  };
}

export async function getAllArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export async function getArticleById(id: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export async function getFeaturedArticles(): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("featured", true)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const supabase = await createClient();
  const q = query.trim();
  if (!q) return getAllArticles();

  // Use ilike for flexible text search across multiple fields
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .or(
      `title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%,category.ilike.%${q}%`
    )
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getArticlesByCategory(category: string): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("category", category)
    .order("published_at", { ascending: false });

  if (error || !data) return [];
  return data.map(mapRow);
}

export async function createArticle(input: ArticleInput): Promise<Article> {
  const supabase = await createClient();

  const row = {
    title: input.title,
    title_en: input.title_en || null,
    slug: input.slug,
    excerpt: input.excerpt,
    excerpt_en: input.excerpt_en || null,
    content: input.content,
    content_en: input.content_en || null,
    category: input.category,
    tags: input.tags,
    author_id: input.author_id || null,
    author_name: input.author_name || "مجهول",
    cover_image: input.coverImage || "",
    featured: input.featured ?? false,
    crypto_symbols: input.crypto_symbols || [],
    published_at: input.publishedAt || new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("articles")
    .insert(row)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create article");
  }
  return mapRow(data);
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<Article | null> {
  const supabase = await createClient();

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (input.title !== undefined) updates.title = input.title;
  if (input.title_en !== undefined) updates.title_en = input.title_en;
  if (input.slug !== undefined) updates.slug = input.slug;
  if (input.excerpt !== undefined) updates.excerpt = input.excerpt;
  if (input.excerpt_en !== undefined) updates.excerpt_en = input.excerpt_en;
  if (input.content !== undefined) updates.content = input.content;
  if (input.content_en !== undefined) updates.content_en = input.content_en;
  if (input.category !== undefined) updates.category = input.category;
  if (input.tags !== undefined) updates.tags = input.tags;
  if (input.author_name !== undefined) updates.author_name = input.author_name;
  if (input.coverImage !== undefined) updates.cover_image = input.coverImage;
  if (input.featured !== undefined) updates.featured = input.featured;
  if (input.crypto_symbols !== undefined) updates.crypto_symbols = input.crypto_symbols;

  const { data, error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

export async function deleteArticle(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  return !error;
}

// Re-export utilities for server-side convenience
export { formatDate, getReadingTime, generateSlug } from "./utils";
