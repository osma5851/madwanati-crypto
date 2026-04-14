import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, createArticle, searchArticles, getArticlesByCategory } from "@/lib/articles";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  let articles;
  if (query) {
    articles = await searchArticles(query);
  } else if (category) {
    articles = await getArticlesByCategory(category);
  } else {
    articles = await getAllArticles();
  }

  return NextResponse.json({ articles });
}

export async function POST(request: NextRequest) {
  // Check admin session via Supabase auth
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, slug, excerpt, content, category, tags, featured, crypto_symbols } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const article = await createArticle({
      title,
      slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
      excerpt: excerpt || content.substring(0, 150),
      content,
      category: category || "تعليم",
      tags: tags || [],
      author_id: user.id,
      author_name: body.author || "مجهول",
      coverImage: "",
      featured: featured || false,
      crypto_symbols: crypto_symbols || [],
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 });
  }
}
