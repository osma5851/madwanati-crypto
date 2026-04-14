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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#09090b' }}>
      <Navbar />
      <CryptoTicker />
      <main style={{ flex: 1 }}>
        {/* Hero */}
        <section className="hero-bg" style={{ padding: '5rem 1rem 4rem', overflow: 'hidden' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

            <div className="badge-primary" style={{ marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {t("badge")}
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, color: '#fafafa', marginBottom: 16, letterSpacing: '-0.02em' }}>
              {t("title")}
              <span className="gold-text" style={{ display: 'block', marginTop: 8 }}>{t("brand")}</span>
            </h1>

            <p style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)', lineHeight: 1.7, maxWidth: 560, color: '#71717a', marginBottom: 40 }}>
              {t("subtitle")}
            </p>

            <div className="stats-box">
              {[
                { value: stats.total, label: t("stats.articles") },
                { value: stats.categories, label: t("stats.categories") },
                { value: stats.featured, label: t("stats.featured") },
              ].map((stat) => (
                <div key={stat.label} className="stats-item">
                  <div className="gold-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{stat.value}</div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 500, color: '#52525b', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: '#09090b' }}>
          <HomeClient articles={allArticles} categories={categories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
