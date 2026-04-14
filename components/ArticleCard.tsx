import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDate, getReadingTime } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  بيتكوين: "#f7931a",
  إيثيريوم: "#627eea",
  "تمويل لامركزي": "#22c55e",
  NFT: "#c084fc",
  تداول: "#f59e0b",
  "تحليل فني": "#3b82f6",
  "أخبار السوق": "#f43f5e",
  تعليم: "#71717a",
};

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const readTime = getReadingTime(article.content);
  const catColor = CATEGORY_COLORS[article.category] || "#a855f7";

  return (
    <Link href={`/articles/${article.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        className="flux-card card-accent"
        style={{
          padding: '1.25rem',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          ...(featured ? { borderColor: 'rgba(168,85,247,0.3)' } : {}),
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#3f3f46'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = featured ? 'rgba(168,85,247,0.3)' : '#27272a'; }}
      >
        {/* Cover image */}
        {article.coverImage && (
          <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', height: 140 }}>
            <img src={article.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {/* Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4,
            background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}30`,
          }}>
            {article.category}
          </span>
          {featured && article.featured && (
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
              ★ مميز
            </span>
          )}
          {article.tags.slice(0, 2).map((tag) => (
            <span key={tag} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: 4, background: '#18181b', color: '#52525b' }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: featured ? '1.05rem' : '0.95rem', fontWeight: 700,
          lineHeight: 1.4, marginBottom: 8, color: '#fafafa',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h2>

        {/* Excerpt */}
        <p style={{
          fontSize: '0.8rem', lineHeight: 1.6, color: '#52525b', flex: 1, marginBottom: 12,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.excerpt}
        </p>

        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: '#3f3f46', paddingTop: 10, borderTop: '1px solid #1a1a1e' }}>
          <span>{formatDate(article.publishedAt)}</span>
          <span>{readTime} دقائق</span>
        </div>
      </article>
    </Link>
  );
}
