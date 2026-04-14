"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Article } from "@/lib/types";
import ArticleCard from "@/components/ArticleCard";

interface HomeClientProps {
  articles: Article[];
  categories: string[];
}

export default function HomeClient({ articles, categories }: HomeClientProps) {
  const t = useTranslations();
  const allLabel = t("search.all");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(allLabel);

  const filtered = useMemo(() => {
    let result = articles;
    if (selectedCategory !== allLabel) {
      result = result.filter((a) => a.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, search, selectedCategory, allLabel]);

  const featuredArticles = useMemo(() => filtered.filter((a) => a.featured), [filtered]);
  const regularArticles = useMemo(() => filtered.filter((a) => !a.featured), [filtered]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      {/* Search & Filter */}
      <div className="card-dark-elevated p-5 mb-8 max-w-3xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search.placeholder")}
              className="search-input"
              dir="auto"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            <button
              onClick={() => setSelectedCategory(allLabel)}
              className={`cat-btn ${selectedCategory === allLabel ? 'cat-btn-active' : 'cat-btn-inactive'}`}
            >
              {allLabel}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cat-btn ${selectedCategory === cat ? 'cat-btn-active' : 'cat-btn-inactive'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {(search || selectedCategory !== allLabel) && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {filtered.length === 0
              ? t("articles.noResults")
              : t("articles.found", { count: filtered.length })}
          </p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(allLabel); }}
            className="text-sm text-amber-500 hover:text-amber-300 transition-colors"
          >
            {t("articles.clearFilters")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5 card-dark">
            <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-200">{t("articles.noResults")}</h3>
          <p className="text-slate-500 max-w-md">{t("articles.noResultsHint")}</p>
        </div>
      ) : (
        <>
          {featuredArticles.length > 0 && !search && selectedCategory === allLabel && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
                <h2 className="text-xl font-bold text-slate-100">{t("articles.featured")}</h2>
                <span className="badge-gold text-xs py-1 px-3">{t("articles.featuredBadge")}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredArticles.map((article, i) => (
                  <div key={article.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
                    <ArticleCard article={article} featured={true} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {(regularArticles.length > 0 || search || selectedCategory !== allLabel) && (
            <section>
              {!search && selectedCategory === allLabel && regularArticles.length > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' }} />
                  <h2 className="text-xl font-bold text-slate-100">{t("articles.all")}</h2>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(search || selectedCategory !== allLabel ? filtered : regularArticles).map((article, i) => (
                  <div key={article.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)}`}>
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
