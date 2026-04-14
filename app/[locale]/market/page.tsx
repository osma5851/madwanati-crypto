import { getTranslations } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CryptoTicker from "@/components/CryptoTicker";
import TradingViewWidget from "@/components/TradingViewWidget";

export const dynamic = "force-dynamic";

const POPULAR_PAIRS = [
  { symbol: "BINANCE:BTCUSDT", label: "BTC/USDT" },
  { symbol: "BINANCE:ETHUSDT", label: "ETH/USDT" },
  { symbol: "BINANCE:SOLUSDT", label: "SOL/USDT" },
  { symbol: "BINANCE:BNBUSDT", label: "BNB/USDT" },
];

export default async function MarketPage() {
  const t = await getTranslations("nav");

  return (
    <>
      <Navbar />
      <CryptoTicker />
      <main className="flex-1" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #f59e0b, #d97706)' }} />
              <h1 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
                {t("market")}
              </h1>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Live cryptocurrency charts and market data
            </p>
          </div>

          {/* Main Chart */}
          <div className="mb-8">
            <TradingViewWidget symbol="BINANCE:BTCUSDT" height={500} />
          </div>

          {/* Popular Pairs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {POPULAR_PAIRS.slice(1).map((pair) => (
              <div key={pair.symbol}>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--accent)' }}>{pair.label}</h3>
                <TradingViewWidget symbol={pair.symbol} height={300} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
