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
    <>
      <Navbar />
      <CryptoTicker />
      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative py-24 px-4 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d1a2d 0%, #0f172a 50%, #1a1f35 100%)' }}
        >
          {/* Decorative background elements */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            aria-hidden="true"
          >
            <div
              className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #f59e0b, transparent)', filter: 'blur(60px)' }}
            />
            <div
              className="absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-5"
              style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', filter: 'blur(80px)' }}
            />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Top badge */}
            <div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm mb-8 font-medium"
              style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.25)',
                color: '#fcd34d',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse inline-block" style={{ background: '#f59e0b' }} />
              {t("badge")}
            </div>

            {/* Main heading */}
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight" style={{ color: '#f1f5f9' }}>
              {t("title")}
              <span
                className="block mt-1"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #fcd34d, #d97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t("brand")}
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: '#64748b' }}>
              {t("subtitle")}
            </p>

            {/* Stats */}
            <div
              className="inline-flex items-center gap-0 rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(30,58,95,0.7)', background: 'rgba(30,41,59,0.6)', backdropFilter: 'blur(10px)' }}
            >
              {[
                { value: stats.total, label: t("stats.articles") },
                { value: stats.categories, label: t("stats.categories") },
                { value: stats.featured, label: t("stats.featured") },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="px-8 py-5 text-center"
                  style={{
                    borderRight: i < 2 ? '1px solid rgba(30,58,95,0.7)' : 'none',
                  }}
                >
                  <div
                    className="text-3xl font-black mb-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #fcd34d)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#64748b' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Client Part (Search + Filter + Articles) */}
        <HomeClient articles={allArticles} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
