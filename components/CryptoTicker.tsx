"use client";

import { useEffect, useState } from "react";

interface CoinPrice {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

const COIN_MAP: Record<string, string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  binancecoin: "BNB",
  cardano: "ADA",
  ripple: "XRP",
  dogecoin: "DOGE",
  "avalanche-2": "AVAX",
};

export default function CryptoTicker() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/crypto");
        if (!res.ok) return;
        const { prices: data } = await res.json();
        if (!data) return;

        const parsed: CoinPrice[] = Object.entries(data).map(([id, val]) => {
          const v = val as { usd: number; usd_24h_change: number };
          return {
            id,
            symbol: COIN_MAP[id] || id.toUpperCase().slice(0, 4),
            price: v.usd,
            change24h: v.usd_24h_change || 0,
          };
        });
        setPrices(parsed);
      } catch { /* silent */ }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (prices.length === 0) return null;

  const fmt = (p: number) =>
    p >= 1000 ? `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}` :
    p >= 1 ? `$${p.toFixed(2)}` : `$${p.toFixed(4)}`;

  const items = [...prices, ...prices];

  return (
    <div className="ticker-bar">
      <div className="animate-ticker flex items-center gap-8 py-2.5 px-4 whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((coin, i) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-2 text-xs font-medium">
            <span className="text-amber-400 font-bold">{coin.symbol}</span>
            <span className="text-slate-400">{fmt(coin.price)}</span>
            <span className={coin.change24h >= 0 ? "price-up" : "price-down"}>
              {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
