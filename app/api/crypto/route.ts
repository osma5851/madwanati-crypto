import { NextResponse } from "next/server";

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

interface PriceCache {
  data: Record<string, CoinGeckoPrice> | null;
  timestamp: number;
}

const cache: PriceCache = { data: null, timestamp: 0 };
const CACHE_TTL = 60_000; // 60 seconds

const COINS = "bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin,avalanche-2";

export async function GET() {
  const now = Date.now();

  // Return cached data if still fresh
  if (cache.data && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({ prices: cache.data, cached: true });
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${COINS}&vs_currencies=usd&include_24hr_change=true`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      // Return stale cache if available
      if (cache.data) {
        return NextResponse.json({ prices: cache.data, cached: true, stale: true });
      }
      return NextResponse.json({ error: "Failed to fetch prices" }, { status: 502 });
    }

    const data = await res.json();
    cache.data = data;
    cache.timestamp = now;

    return NextResponse.json({ prices: data, cached: false });
  } catch {
    if (cache.data) {
      return NextResponse.json({ prices: cache.data, cached: true, stale: true });
    }
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
