"use client";

import { useEffect, useState } from "react";

interface CoinPrice { id: string; symbol: string; price: number; change24h: number; }

const COIN_MAP: Record<string, string> = {
  bitcoin: "BTC", ethereum: "ETH", solana: "SOL", binancecoin: "BNB",
  cardano: "ADA", ripple: "XRP", dogecoin: "DOGE", "avalanche-2": "AVAX",
};

export default function CryptoTicker() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/crypto");
        if (!res.ok) return;
        const { prices: data } = await res.json();
        if (!data) return;
        setPrices(Object.entries(data).map(([id, val]) => {
          const v = val as { usd: number; usd_24h_change: number };
          return { id, symbol: COIN_MAP[id] || id.slice(0, 4).toUpperCase(), price: v.usd, change24h: v.usd_24h_change || 0 };
        }));
      } catch { /* silent */ }
    };
    fetch_();
    const i = setInterval(fetch_, 60000);
    return () => clearInterval(i);
  }, []);

  if (prices.length === 0) return null;

  const fmt = (p: number) => p >= 1000 ? `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : p >= 1 ? `$${p.toFixed(2)}` : `$${p.toFixed(4)}`;

  return (
    <div className="ticker-bar">
      <div className="animate-ticker" style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '6px 16px', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...prices, ...prices].map((coin, i) => (
          <div key={`${coin.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 500 }}>
            <span style={{ color: '#a1a1aa', fontWeight: 700 }}>{coin.symbol}</span>
            <span style={{ color: '#52525b' }}>{fmt(coin.price)}</span>
            <span className={coin.change24h >= 0 ? "price-up" : "price-down"}>
              {coin.change24h >= 0 ? "↑" : "↓"}{Math.abs(coin.change24h).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
