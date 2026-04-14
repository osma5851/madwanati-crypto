import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, getAllArticles, formatDate, getReadingTime } from "@/lib/articles";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import ArticleContent from "./ArticleContent";
import AiAnalysis from "@/components/AiAnalysis";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: `${article.title} - مدونات الكريبتو`,
    description: article.excerpt,
  };
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

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const t = await getTranslations("articles");
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const allArticles = await getAllArticles();
  const related = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  const cat = CATEGORY_COLORS[article.category] || { bg: "rgba(245,158,11,0.15)", text: "#fcd34d" };
  const readTime = getReadingTime(article.content);

  return (
    <>
      <Navbar />
      <main className="flex-1" style={{ background: '#0f172a' }}>
        <div style={{ background: 'linear-gradient(180deg, #0d1a2d 0%, #0f172a 100%)', borderBottom: '1px solid rgba(30,58,95,0.5)' }}>
          <div className="max-w-4xl mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: '#475569' }}>
              <Link href="/" className="transition-colors duration-200 hover:text-amber-400">{t("backToBlog").split(" ")[0] || "Home"}</Link>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href={`/?category=${article.category}`} className="transition-colors duration-200 hover:text-amber-400">
                {article.category}
              </Link>
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate max-w-xs" style={{ color: '#94a3b8' }}>{article.title}</span>
            </nav>

            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-sm px-3 py-1 rounded-full font-semibold"
                style={{ background: cat.bg, color: cat.text }}
              >
                {article.category}
              </span>
              {article.featured && (
                <span
                  className="text-sm px-3 py-1 rounded-full font-semibold"
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
                >
                  {t("featuredLabel")}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ color: '#f1f5f9' }}>
              {article.title}
            </h1>

            <p className="text-lg leading-relaxed mb-6" style={{ color: '#64748b' }}>{article.excerpt}</p>

            <div
              className="flex flex-wrap items-center gap-4 text-sm pb-6"
              style={{ borderBottom: '1px solid rgba(30,58,95,0.5)', color: '#64748b' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.25)' }}
                >
                  <span className="font-bold text-xs" style={{ color: '#f59e0b' }}>
                    {article.author_name.charAt(0)}
                  </span>
                </div>
                <span>{article.author_name}</span>
              </div>
              <span style={{ color: '#1e3a5f' }}>•</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              <span style={{ color: '#1e3a5f' }}>•</span>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t("readTime", { minutes: readTime })}</span>
              </div>
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?q=${encodeURIComponent(tag)}`}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                    style={{ background: 'rgba(30,58,95,0.5)', color: '#64748b', border: '1px solid rgba(30,58,95,0.6)' }}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div
            className="rounded-2xl p-8 md:p-12"
            style={{ background: '#1e293b', border: '1px solid rgba(30,58,95,0.7)', boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
          >
            <ArticleContent content={article.content} />
          </div>

          {/* AI Analysis */}
          <AiAnalysis
            articleContent={article.content}
            cryptoSymbols={article.crypto_symbols}
          />

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:gap-3 group"
              style={{ color: '#f59e0b' }}
            >
              <svg className="w-4 h-4 rotate-180 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {t("backToBlog")}
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 pb-16">
            <div className="pt-10" style={{ borderTop: '1px solid rgba(30,58,95,0.5)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
                <h2 className="text-2xl font-bold" style={{ color: '#f1f5f9' }}>
                  {t("relatedIn")}{" "}
                  <span style={{ color: '#f59e0b' }}>{article.category}</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {related.map((rel) => (
                  <ArticleCard key={rel.id} article={rel} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
