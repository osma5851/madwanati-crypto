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
    <div className="min-h-screen flex flex-col" style={{ background: '#0f172a' }}>
      <Navbar />
      <CryptoTicker />
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="hero-bg relative py-20 md:py-28 px-4 overflow-hidden">
          {/* Decorative blurs */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-10 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl" style={{ background: '#f59e0b' }} />
            <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#3b82f6' }} />
          </div>

          <div className="relative w-full max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <div className="badge-gold mb-8">
              <span className="w-2 h-2 rounded-full animate-pulse inline-block bg-amber-500" />
              {t("badge")}
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight text-slate-100 w-full">
              {t("title")}
              <span className="block mt-2 gold-text">{t("brand")}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg leading-relaxed max-w-2xl mb-12 text-slate-500">
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
                  <div className="text-3xl font-black gold-text">{stat.value}</div>
                  <div className="text-xs font-medium text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Section */}
        <section style={{ background: '#0f172a' }} className="flex-1">
          <HomeClient articles={allArticles} categories={categories} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
