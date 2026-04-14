import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDate, getReadingTime } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  بيتكوين:         { bg: "rgba(247,147,26,0.15)",  text: "#f7931a" },
  إيثيريوم:        { bg: "rgba(98,126,234,0.15)",  text: "#627eea" },
  "تمويل لامركزي": { bg: "rgba(34,197,94,0.15)",   text: "#86efac" },
  NFT:             { bg: "rgba(167,139,250,0.15)", text: "#c4b5fd" },
  تداول:           { bg: "rgba(245,158,11,0.15)",  text: "#fcd34d" },
  "تحليل فني":     { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd" },
  "أخبار السوق":   { bg: "rgba(244,63,94,0.15)",   text: "#fda4af" },
  تعليم:           { bg: "rgba(100,116,139,0.15)", text: "#94a3b8" },
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const readTime = getReadingTime(article.content);
  const cat = CATEGORY_COLORS[article.category] || { bg: "rgba(245,158,11,0.15)", text: "#fcd34d" };

  if (featured) {
    return (
      <Link href={`/articles/${article.slug}`} className="group block h-full">
        <div
          className="rounded-2xl p-7 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 card-accent"
          style={{
            background: 'linear-gradient(135deg, #1e3a5f 0%, #162032 100%)',
            border: '1px solid rgba(245,158,11,0.25)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-xs px-3 py-1 rounded-full font-semibold"
              style={{ background: cat.bg, color: cat.text }}
            >
              {article.category}
            </span>
            <span
              className="text-xs px-3 py-1 rounded-full font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.4)' }}
            >
              ★ مميز
            </span>
          </div>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-3 leading-tight line-clamp-2 flex-shrink-0 transition-colors duration-200"
            style={{ color: '#f1f5f9' }}
          >
            <span className="group-hover:text-amber-400 transition-colors duration-200">{article.title}</span>
          </h2>

          {/* Excerpt */}
          <p className="text-sm leading-relaxed line-clamp-3 flex-1 mb-5" style={{ color: '#94a3b8' }}>
            {article.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs" style={{ color: '#64748b' }}>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {readTime} دقائق
            </span>
          </div>

          {/* Bottom arrow indicator */}
          <div className="mt-4 flex items-center gap-1 text-xs font-medium transition-all duration-200 group-hover:gap-2" style={{ color: '#f59e0b' }}>
            <span>اقرأ المقال</span>
            <svg className="w-3.5 h-3.5 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/articles/${article.slug}`} className="group block h-full">
      <article
        className="rounded-2xl p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-1 card-accent gold-glow-hover"
        style={{
          background: '#1e293b',
          border: '1px solid rgba(30,58,95,0.8)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
        }}
      >
        {/* Category + Tags */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: cat.bg, color: cat.text }}
          >
            {article.category}
          </span>
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(30,58,95,0.6)', color: '#64748b' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 className="text-base font-bold mb-2 leading-tight line-clamp-2 flex-shrink-0 transition-colors duration-200 group-hover:text-amber-400" style={{ color: '#e2e8f0' }}>
          {article.title}
        </h2>

        {/* Excerpt */}
        <p className="text-sm leading-relaxed flex-1 line-clamp-3 mb-4" style={{ color: '#64748b' }}>
          {article.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs pt-3" style={{ borderTop: '1px solid rgba(30,58,95,0.8)', color: '#475569' }}>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(article.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{readTime} دقائق</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
