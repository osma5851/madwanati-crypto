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
    <div style={{ width: '100%', maxWidth: 1152, margin: '0 auto', padding: '2.5rem 1rem' }}>
      {/* Search & Filter - centered narrow card */}
      <div
        className="card-dark-elevated"
        style={{ maxWidth: 720, margin: '0 auto 2rem auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: '100%' }}>
          <svg
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, color: '#475569', pointerEvents: 'none' }}
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
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

      {/* Results count */}
      {(search || selectedCategory !== allLabel) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {filtered.length === 0
              ? t("articles.noResults")
              : t("articles.found", { count: filtered.length })}
          </p>
          <button
            onClick={() => { setSearch(""); setSelectedCategory(allLabel); }}
            style={{ fontSize: '0.875rem', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t("articles.clearFilters")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            className="card-dark"
            style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}
          >
            <svg style={{ width: 40, height: 40, color: '#475569' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: '#e2e8f0' }}>{t("articles.noResults")}</h3>
          <p style={{ color: '#64748b', maxWidth: 400 }}>{t("articles.noResultsHint")}</p>
        </div>
      ) : (
        <>
          {featuredArticles.length > 0 && !search && selectedCategory === allLabel && (
            <section style={{ marginBottom: 48 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ width: 4, height: 24, borderRadius: 4, background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>{t("articles.featured")}</h2>
                <span className="badge-gold" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>{t("articles.featuredBadge")}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 24, borderRadius: 4, background: 'linear-gradient(180deg, #3b82f6, #1d4ed8)' }} />
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f1f5f9' }}>{t("articles.all")}</h2>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
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
