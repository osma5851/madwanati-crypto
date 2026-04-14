"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-context";

interface Props {
  symbol?: string;
  height?: number;
}

export default function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", height = 400 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme: theme === "dark" ? "dark" : "light",
      style: "1",
      locale: "ar_AE",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    containerRef.current.appendChild(script);
  }, [symbol, theme]);

  return (
    <div dir="ltr" className="rounded-xl overflow-hidden" style={{ border: `1px solid var(--border)`, height }}>
      <div className="tradingview-widget-container" ref={containerRef} style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }} />
      </div>
    </div>
  );
}
