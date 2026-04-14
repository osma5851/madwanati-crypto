"use client";

import { useEffect, useState } from "react";

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const COIN_MAP: Record<string, { symbol: string; name: string }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  solana: { symbol: "SOL", name: "Solana" },
  binancecoin: { symbol: "BNB", name: "BNB" },
  cardano: { symbol: "ADA", name: "Cardano" },
  ripple: { symbol: "XRP", name: "Ripple" },
  dogecoin: { symbol: "DOGE", name: "Dogecoin" },
  "avalanche-2": { symbol: "AVAX", name: "Avalanche" },
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
          const coin = COIN_MAP[id] || { symbol: id.toUpperCase(), name: id };
          const v = val as { usd: number; usd_24h_change: number };
          return {
            id,
            symbol: coin.symbol,
            name: coin.name,
            price: v.usd,
            change24h: v.usd_24h_change || 0,
          };
        });
        setPrices(parsed);
      } catch {
        // Silently fail
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (prices.length === 0) return null;

  const formatPrice = (p: number) => {
    if (p >= 1000) return `$${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (p >= 1) return `$${p.toFixed(2)}`;
    return `$${p.toFixed(4)}`;
  };

  // Double the items for seamless infinite scroll
  const items = [...prices, ...prices];

  return (
    <div
      className="overflow-hidden border-b"
      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
    >
      <div className="animate-ticker flex items-center gap-6 py-2 px-4 whitespace-nowrap" style={{ width: 'max-content' }}>
        {items.map((coin, i) => (
          <div key={`${coin.id}-${i}`} className="flex items-center gap-2 text-xs">
            <span className="font-bold" style={{ color: 'var(--accent)' }}>{coin.symbol}</span>
            <span style={{ color: 'var(--text-muted)' }}>{formatPrice(coin.price)}</span>
            <span className={coin.change24h >= 0 ? "price-up" : "price-down"}>
              {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
