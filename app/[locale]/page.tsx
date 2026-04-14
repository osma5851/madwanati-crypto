import { getAllArticles, getFeaturedArticles } from "@/lib/articles";
import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CryptoTicker from "@/components/CryptoTicker";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("hero");
  const allArticles = await getAllArticles();
  const featuredArticles = await getFeaturedArticles();
  const categories = [...new Set(allArticles.map((a) => a.category))];
  const stats = {
    total: allArticles.length,
    categories: categories.length,
    featured: featuredArticles.length,
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0f172a' }}>
      <Navbar />
      <CryptoTicker />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero Section */}
        <section className="hero-bg" style={{ position: 'relative', padding: '5rem 1rem', overflow: 'hidden' }}>
          {/* Decorative blurs */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true">
            <div style={{ position: 'absolute', top: 40, right: 40, width: 288, height: 288, borderRadius: '50%', opacity: 0.1, filter: 'blur(60px)', background: '#f59e0b' }} />
            <div style={{ position: 'absolute', bottom: 40, left: 40, width: 384, height: 384, borderRadius: '50%', opacity: 0.1, filter: 'blur(80px)', background: '#3b82f6' }} />
          </div>

          <div style={{ position: 'relative', maxWidth: 896, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Badge */}
            <div className="badge-gold" style={{ marginBottom: '2rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', display: 'inline-block', background: '#f59e0b', animation: 'pulse 2s infinite' }} />
              {t("badge")}
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.75rem)', fontWeight: 900, marginBottom: '1.25rem', lineHeight: 1.2, color: '#f1f5f9', width: '100%' }}>
              {t("title")}
              <span className="gold-text" style={{ display: 'block', marginTop: '0.5rem' }}>{t("brand")}</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.125rem)', lineHeight: 1.8, maxWidth: 640, marginBottom: '3rem', color: '#64748b' }}>
              {t("subtitle")}
            </p>

            {/* Stats */}
            <div className="stats-box">
              {[
                { value: stats.total, label: t("stats.articles") },
                { value: stats.categories, label: t("stats.categories") },
                { value: stats.featured, label: t("stats.featured") },
              ].map((stat) => (
                <div key={stat.label} className="stats-item">
                  <div className="gold-text" style={{ fontSize: '1.875rem', fontWeight: 900 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section style={{ flex: 1, background: '#0f172a' }}>
          <HomeClient articles={allArticles} categories={categories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
